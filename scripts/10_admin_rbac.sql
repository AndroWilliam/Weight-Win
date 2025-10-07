-- Admin RBAC system
-- Creates admins table and helper function for role-based access control

-- 1. Create admins table (idempotent)
CREATE TABLE IF NOT EXISTS public.admins (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  notes TEXT
);

-- 2. Enable RLS on admins table
ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;

-- 3. Admin check function (idempotent)
-- Drop existing function if it exists (handle both signatures)
-- Use CASCADE to drop dependent policies too
DROP FUNCTION IF EXISTS public.is_admin(UUID) CASCADE;
DROP FUNCTION IF EXISTS public.is_admin() CASCADE;

-- Create the function with explicit signature
CREATE FUNCTION public.is_admin(uid UUID)
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS(
    SELECT 1 
    FROM public.admins a 
    WHERE a.user_id = uid
  );
$$;

-- Create convenience overload with no parameters (uses current user)
CREATE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS(
    SELECT 1 
    FROM public.admins a 
    WHERE a.user_id = auth.uid()
  );
$$;

-- 4. RLS policies for admins table (only admins can read/write admins table)
DROP POLICY IF EXISTS "admins_read" ON public.admins;
CREATE POLICY "admins_read" ON public.admins
  FOR SELECT
  USING (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "admins_write" ON public.admins;
CREATE POLICY "admins_write" ON public.admins
  FOR ALL
  USING (public.is_admin(auth.uid()));

-- 5. Grant execute permission on is_admin functions (both signatures)
GRANT EXECUTE ON FUNCTION public.is_admin(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin(UUID) TO anon;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin() TO anon;

-- 6. Add RLS policy for nutritionist_applications (admin bypass)
-- Admins can read all applications, users can only read their own
DROP POLICY IF EXISTS "na_admin_read" ON public.nutritionist_applications;
CREATE POLICY "na_admin_read" ON public.nutritionist_applications
  FOR SELECT
  USING (
    public.is_admin(auth.uid()) 
    OR applicant_user_id = auth.uid()
  );

-- 7. Add RLS policy for weight_entries (admin read-only for monitoring)
DROP POLICY IF EXISTS "weight_entries_admin_read" ON public.weight_entries;
CREATE POLICY "weight_entries_admin_read" ON public.weight_entries
  FOR SELECT
  USING (
    public.is_admin(auth.uid())
    OR user_id = auth.uid()
  );

-- 8. Create helper view for user progress (admin dashboard)
CREATE OR REPLACE VIEW admin_user_progress AS
SELECT 
  u.id AS user_id,
  u.email,
  us.current_streak,
  us.longest_streak,
  us.last_check_in,
  uc.start_date AS challenge_start_date,
  uc.status AS challenge_status,
  COUNT(we.id) AS total_weigh_ins,
  MAX(we.recorded_at) AS last_weigh_in_at,
  CASE 
    WHEN COUNT(we.id) >= 7 THEN 0
    ELSE 7 - COUNT(we.id)
  END AS days_to_reward,
  ROUND((COUNT(we.id)::NUMERIC / 7) * 100, 0) AS progress_percent
FROM auth.users u
LEFT JOIN user_streaks us ON us.user_id = u.id
LEFT JOIN user_challenges uc ON uc.user_id = u.id
LEFT JOIN weight_entries we ON we.user_id = u.id
WHERE u.deleted_at IS NULL
GROUP BY u.id, u.email, us.current_streak, us.longest_streak, us.last_check_in, uc.start_date, uc.status;

-- Grant access to the view
GRANT SELECT ON admin_user_progress TO authenticated;

COMMENT ON TABLE public.admins IS 'Stores admin user IDs for role-based access control';
COMMENT ON FUNCTION public.is_admin IS 'Returns true if the given user ID (or current user) is an admin';
COMMENT ON VIEW admin_user_progress IS 'Admin dashboard view showing user progress and streaks';

