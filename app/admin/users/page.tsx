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
    // Show error banner instead of misleading 0 values
    return (
      <div className="px-4 sm:px-6 space-y-4 sm:space-y-6">
        <div className="p-6 bg-red-500/10 border border-red-500 rounded-lg">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-5 h-5 mt-0.5">
              <svg className="w-5 h-5 text-red-500" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                <path d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-red-500 font-medium text-sm sm:text-base">Failed to load KPI data</h3>
              <p className="text-red-400 text-xs sm:text-sm mt-1">{kpiError.message}</p>
              <button
                onClick={() => window.location.reload()}
                className="mt-3 px-4 py-2 bg-red-500 hover:bg-red-600 text-white text-sm rounded-lg transition-colors"
              >
                Retry
              </button>
            </div>
          </div>
        </div>

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

