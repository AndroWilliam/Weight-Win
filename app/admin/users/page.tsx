import { createClient } from '@/lib/supabase/server'
import { UsersTable } from '@/components/admin/UsersTable'
import { KPICards } from '@/components/admin/KPICards'

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
    .rpc('get_admin_kpis')
    .single()

  if (kpiError) {
    console.error('[Users Page] Error fetching KPIs:', kpiError)
    // Fallback to static calculation if KPI function fails
    const users = rows ?? []
    const activeUsersToday = users.filter(u => {
      if (!u.last_weigh_in_at) return false
      const lastWeighIn = new Date(u.last_weigh_in_at)
      const today = new Date()
      return lastWeighIn.toDateString() === today.toDateString()
    }).length

    const inReview = users.filter(u => u.challenge_status === 'active' && (u.total_weigh_ins || 0) < 7).length
    
    const weekAgo = new Date()
    weekAgo.setDate(weekAgo.getDate() - 7)
    const approvedThisWeek = users.filter(u => 
      (u.total_weigh_ins || 0) >= 7 && u.last_weigh_in_at && new Date(u.last_weigh_in_at) >= weekAgo
    ).length

    const newApplicants = users.filter(u => (u.total_weigh_ins || 0) === 0).length

    return (
      <>
        <KPICards
          newApplicants={newApplicants}
          inReview={inReview}
          approvedThisWeek={approvedThisWeek}
          activeUsersToday={activeUsersToday}
        />
        
        <UsersTable rows={users} />
      </>
    )
  }

  const users = rows ?? []

  return (
    <>
      <KPICards
        newApplicants={kpiData?.new_users_this_week || 0}
        inReview={kpiData?.in_review || 0}
        approvedThisWeek={kpiData?.completed_challenges_this_week || 0}
        activeUsersToday={kpiData?.active_users_today || 0}
      />
      
      <UsersTable rows={users} />
    </>
  )
}

