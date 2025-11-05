import { createClient } from '@/lib/supabase/server'
import { ApplicantsTable } from '@/components/admin/ApplicantsTable'
import { ApplicantsKPICards } from '@/components/admin/ApplicantsKPICards'

export const dynamic = 'force-dynamic'

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
              <a
                href="/admin/applicants"
                className="mt-3 inline-block px-4 py-2 bg-red-500 hover:bg-red-600 text-white text-sm rounded-lg transition-colors text-center"
              >
                Retry
              </a>
            </div>
          </div>
        </div>

        <ApplicantsTable rows={rows ?? []} />
      </div>
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

