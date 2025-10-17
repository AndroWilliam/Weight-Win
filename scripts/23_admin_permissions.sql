-- ============================================================================
-- Admin Permissions Extension
-- Adds granular admin permissions and helper RPC functions for the Users table
-- ============================================================================

-- 1. Create admin_permissions table ------------------------------------------------
CREATE TABLE IF NOT EXISTS public.admin_permissions (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  can_manage_invitations BOOLEAN NOT NULL DEFAULT FALSE,
  last_password_reset_requested_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_by UUID REFERENCES auth.users(id)
);

-- Ensure Row Level Security
ALTER TABLE public.admin_permissions ENABLE ROW LEVEL SECURITY;

-- RLS policies (admins only)
DROP POLICY IF EXISTS "admin_permissions_select" ON public.admin_permissions;
CREATE POLICY "admin_permissions_select" ON public.admin_permissions
  FOR SELECT
  TO authenticated
  USING (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "admin_permissions_modify" ON public.admin_permissions;
CREATE POLICY "admin_permissions_modify" ON public.admin_permissions
  FOR ALL
  TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

-- 2. Helper function to upsert admin permission rows ------------------------------
CREATE OR REPLACE FUNCTION public.ensure_admin_permissions_row(target_user UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.admin_permissions (user_id)
  VALUES (target_user)
  ON CONFLICT (user_id) DO NOTHING;
END;
$$;

GRANT EXECUTE ON FUNCTION public.ensure_admin_permissions_row(UUID) TO authenticated;

-- 3. Fetch admin permissions for a user -------------------------------------------
CREATE OR REPLACE FUNCTION public.get_admin_permissions(target_user UUID)
RETURNS TABLE (
  user_id UUID,
  is_admin BOOLEAN,
  can_manage_invitations BOOLEAN,
  last_password_reset_requested_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Not authorized' USING ERRCODE = '42501';
  END IF;

  PERFORM public.ensure_admin_permissions_row(target_user);

  RETURN QUERY
  SELECT
    target_user,
    EXISTS (SELECT 1 FROM public.admins a WHERE a.user_id = target_user) AS is_admin,
    COALESCE(ap.can_manage_invitations, FALSE) AS can_manage_invitations,
    ap.last_password_reset_requested_at
  FROM (
    SELECT target_user AS uid
  ) t
  LEFT JOIN public.admin_permissions ap ON ap.user_id = t.uid;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_admin_permissions(UUID) TO authenticated;

-- 4. Toggle admin status -----------------------------------------------------------
CREATE OR REPLACE FUNCTION public.set_admin_status(
  target_user UUID,
  should_be_admin BOOLEAN
)
RETURNS TABLE (is_admin BOOLEAN)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  caller UUID := auth.uid();
BEGIN
  IF NOT public.is_admin(caller) THEN
    RAISE EXCEPTION 'Not authorized' USING ERRCODE = '42501';
  END IF;

  IF should_be_admin THEN
    INSERT INTO public.admins (user_id, created_by)
    VALUES (target_user, caller)
    ON CONFLICT (user_id) DO NOTHING;
  ELSE
    DELETE FROM public.admins WHERE user_id = target_user;
  END IF;

  INSERT INTO public.admin_permissions (user_id, updated_at, updated_by)
  VALUES (target_user, NOW(), caller)
  ON CONFLICT (user_id) DO UPDATE
  SET updated_at = NOW(), updated_by = caller;

  RETURN QUERY
  SELECT EXISTS (SELECT 1 FROM public.admins WHERE user_id = target_user) AS is_admin;
END;
$$;

GRANT EXECUTE ON FUNCTION public.set_admin_status(UUID, BOOLEAN) TO authenticated;

-- 5. Toggle invitation management --------------------------------------------------
CREATE OR REPLACE FUNCTION public.set_admin_invitation_permission(
  target_user UUID,
  allow BOOLEAN
)
RETURNS TABLE (can_manage_invitations BOOLEAN)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  caller UUID := auth.uid();
BEGIN
  IF NOT public.is_admin(caller) THEN
    RAISE EXCEPTION 'Not authorized' USING ERRCODE = '42501';
  END IF;

  INSERT INTO public.admin_permissions (user_id, can_manage_invitations, updated_at, updated_by)
  VALUES (target_user, allow, NOW(), caller)
  ON CONFLICT (user_id) DO UPDATE
  SET can_manage_invitations = allow,
      updated_at = NOW(),
      updated_by = caller;

  RETURN QUERY
  SELECT COALESCE(ap.can_manage_invitations, FALSE)
  FROM public.admin_permissions ap
  WHERE ap.user_id = target_user;
END;
$$;

GRANT EXECUTE ON FUNCTION public.set_admin_invitation_permission(UUID, BOOLEAN) TO authenticated;

-- 6. Record password reset requests ------------------------------------------------
CREATE OR REPLACE FUNCTION public.record_admin_password_reset(target_user UUID)
RETURNS TABLE (last_password_reset_requested_at TIMESTAMPTZ)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  caller UUID := auth.uid();
  timestamp_requested TIMESTAMPTZ := NOW();
BEGIN
  IF NOT public.is_admin(caller) THEN
    RAISE EXCEPTION 'Not authorized' USING ERRCODE = '42501';
  END IF;

  INSERT INTO public.admin_permissions (user_id, last_password_reset_requested_at, updated_at, updated_by)
  VALUES (target_user, timestamp_requested, timestamp_requested, caller)
  ON CONFLICT (user_id) DO UPDATE
  SET last_password_reset_requested_at = timestamp_requested,
      updated_at = timestamp_requested,
      updated_by = caller;

  RETURN QUERY
  SELECT ap.last_password_reset_requested_at
  FROM public.admin_permissions ap
  WHERE ap.user_id = target_user;
END;
$$;

GRANT EXECUTE ON FUNCTION public.record_admin_password_reset(UUID) TO authenticated;

-- 7. Notes -------------------------------------------------------------------------
-- Run this script in Supabase SQL editor or via psql:
--   \\i scripts/23_admin_permissions.sql
-- After running:
--   - Verify tables: SELECT * FROM public.admin_permissions LIMIT 5;
--   - Confirm functions exist: SELECT proname FROM pg_proc WHERE proname LIKE 'set_admin_%';
--   - Test via RPC: SELECT * FROM public.get_admin_permissions('<user_uuid>');

-- ============================================================================

