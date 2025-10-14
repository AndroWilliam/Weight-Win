import { createClient } from '@/lib/supabase/server'
import { ApplicantsTable } from '@/components/admin/ApplicantsTable'
import { ApplicantsKPICards } from '@/components/admin/ApplicantsKPICards'

export default async function ApplicantsPage() {
  const supabase = await createClient()
  
  // Fetch all nutritionist applications
  const { data: rows, error } = await supabase
    .from('nutritionist_applications')
    .select('id, created_at, first_name, family_name, email, mobile_e164:phone_e164, id_type, id_number, ocr_status, status, cv_file_path, id_file_path')
    .order('created_at', { ascending: false })
    .limit(100)
  
  if (error) {
    console.error('[Applicants Page] Error fetching applications:', error)
    return (
      <div className="bg-card rounded-xl border border-border p-6 sm:p-8 text-center">
        <p className="text-red-600 font-medium">Failed to load applications</p>
        <p className="text-xs sm:text-sm text-muted-foreground mt-2">{error.message}</p>
      </div>
    )
  }

  // Get dynamic KPIs from database
  const { data: kpiData, error: kpiError } = await supabase
    .rpc('get_applicants_kpis')
    .single()

  if (kpiError) {
    console.error('[Applicants Page] Error fetching KPIs:', kpiError)
    // Fallback to 0 values if KPI function fails
    return (
      <>
        <ApplicantsKPICards
          newApplicants={0}
          rejectedApplicants={0}
          approvedThisWeek={0}
          activeUsersToday={0}
        />
        
        <ApplicantsTable rows={rows ?? []} />
      </>
    )
  }

  const applications = rows ?? []

  return (
    <div className="px-4 sm:px-6 space-y-4 sm:space-y-6">
      <ApplicantsKPICards
        newApplicants={kpiData?.new_applicants || 0}
        rejectedApplicants={kpiData?.rejected_applicants || 0}
        approvedThisWeek={kpiData?.approved_this_week || 0}
        activeUsersToday={kpiData?.active_users_today || 0}
      />
      
      <ApplicantsTable rows={applications} />
    </div>
  )
}

