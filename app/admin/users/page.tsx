import { createClient } from '@/lib/supabase/server'
import { UsersTable } from '@/components/admin/UsersTable'
import { UsersKPICards } from '@/components/admin/UsersKPICards'

export default async function UsersPage() {
  const supabase = await createClient()
  
  // Fetch user progress from the admin view
  const { data: rows, error } = await supabase
    .from('admin_user_progress')
    .select('*')
    .order('days_to_reward', { ascending: true })
    .limit(100)
  
  if (error) {
    console.error('[Users Page] Error fetching user progress:', error)
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-8 text-center">
        <p className="text-red-600 font-medium">Failed to load user data</p>
        <p className="text-sm text-slate-600 mt-2">{error.message}</p>
      </div>
    )
  }

  // Get dynamic KPIs from database
  const { data: kpiData, error: kpiError } = await supabase
    .rpc('get_users_kpis')
    .single()

  if (kpiError) {
    console.error('[Users Page] Error fetching KPIs:', kpiError)
    // Fallback to 0 values if KPI function fails
    return (
      <div className="space-y-4 sm:space-y-6">
        <UsersKPICards
          newUsersThisWeek={0}
          usersInProgress={0}
          completedThisWeek={0}
          activeUsersToday={0}
        />
        
        <UsersTable rows={rows ?? []} />
      </div>
    )
  }

  const users = rows ?? []

  return (
    <div className="px-4 sm:px-6 space-y-4 sm:space-y-6">
      <UsersKPICards
        newUsersThisWeek={kpiData?.new_users_this_week || 0}
        usersInProgress={kpiData?.users_in_progress || 0}
        completedThisWeek={kpiData?.completed_this_week || 0}
        activeUsersToday={kpiData?.active_users_today || 0}
      />
      
      <UsersTable rows={users} />
    </div>
  )
}

