import { FileText, XCircle, CheckCircle, Users } from 'lucide-react'

interface KPICardProps {
  label: string
  value: number | string
  icon: React.ReactNode
  iconBg: string
}

function KPICard({ label, value, icon, iconBg }: KPICardProps) {
  return (
    <div className="bg-card rounded-xl border border-border p-4 sm:p-6 flex items-center justify-between">
      <div>
        <p className="text-xs sm:text-sm text-muted-foreground mb-1">{label}</p>
        <p className="text-2xl sm:text-3xl font-bold text-foreground">{value}</p>
      </div>
      <div className={`w-10 h-10 sm:w-12 sm:h-12 ${iconBg} rounded-lg flex items-center justify-center flex-shrink-0`}>
        {icon}
      </div>
    </div>
  )
}

interface ApplicantsKPICardsProps {
  newApplicants: number
  rejectedApplicants: number
  approvedThisWeek: number
  activeUsersToday: number
}

export function ApplicantsKPICards({ 
  newApplicants, 
  rejectedApplicants, 
  approvedThisWeek, 
  activeUsersToday 
}: ApplicantsKPICardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      <KPICard
        label="New Applicants"
        value={newApplicants}
        icon={<FileText className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />}
        iconBg="bg-blue-50 dark:bg-blue-900/20"
      />
      <KPICard
        label="Rejected Applicants"
        value={rejectedApplicants}
        icon={<XCircle className="w-5 h-5 sm:w-6 sm:h-6 text-red-600" />}
        iconBg="bg-red-50 dark:bg-red-900/20"
      />
      <KPICard
        label="Approved This Week"
        value={approvedThisWeek}
        icon={<CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />}
        iconBg="bg-green-50 dark:bg-green-900/20"
      />
      <KPICard
        label="Active Users Today"
        value={activeUsersToday}
        icon={<Users className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-600" />}
        iconBg="bg-indigo-50 dark:bg-indigo-900/20"
      />
    </div>
  )
}
