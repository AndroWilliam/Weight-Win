import { createClient } from '@/lib/supabase/server'
import { ApplicantsTable } from '@/components/admin/ApplicantsTable'
import { KPICards } from '@/components/admin/KPICards'

export default async function ApplicantsPage() {
  const supabase = await createClient()
  
  // Fetch all nutritionist applications
  const { data: rows, error } = await supabase
    .from('nutritionist_applications')
    .select('id, created_at, first_name, family_name, email, mobile_e164, id_type, id_number, ocr_status, status, cv_file_path, id_file_path')
    .order('created_at', { ascending: false })
    .limit(100)
  
  if (error) {
    console.error('[Applicants Page] Error fetching applications:', error)
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-8 text-center">
        <p className="text-red-600 font-medium">Failed to load applications</p>
        <p className="text-sm text-slate-600 mt-2">{error.message}</p>
      </div>
    )
  }

  // Calculate KPIs
  const applications = rows ?? []
  const newApplicants = applications.filter(app => app.status === 'pending' || app.status === 'new').length
  const inReview = applications.filter(app => app.status === 'reviewing' || app.status === 'in_review').length
  
  // Get approved this week (last 7 days)
  const weekAgo = new Date()
  weekAgo.setDate(weekAgo.getDate() - 7)
  const approvedThisWeek = applications.filter(app => 
    app.status === 'approved' && new Date(app.created_at) >= weekAgo
  ).length

  // Get active users count (mock for now)
  const activeUsersToday = 247 // TODO: Query from user_streaks where last_check_in = today

  return (
    <>
      <KPICards
        newApplicants={newApplicants}
        inReview={inReview}
        approvedThisWeek={approvedThisWeek}
        activeUsersToday={activeUsersToday}
      />
      
      <ApplicantsTable rows={applications} />
    </>
  )
}

