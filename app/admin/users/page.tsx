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

  const users = rows ?? []
  
  // Calculate KPIs for users
  const activeUsersToday = users.filter(u => {
    if (!u.last_weigh_in_at) return false
    const lastWeighIn = new Date(u.last_weigh_in_at)
    const today = new Date()
    return lastWeighIn.toDateString() === today.toDateString()
  }).length

  // Count users in review (active challenges not completed)
  const inReview = users.filter(u => u.challenge_status === 'active' && (u.total_weigh_ins || 0) < 7).length
  
  // Count approved this week (completed challenges in last 7 days)
  const weekAgo = new Date()
  weekAgo.setDate(weekAgo.getDate() - 7)
  const approvedThisWeek = users.filter(u => 
    (u.total_weigh_ins || 0) >= 7 && u.last_weigh_in_at && new Date(u.last_weigh_in_at) >= weekAgo
  ).length

  // New users (mock - would need to check user creation date)
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

