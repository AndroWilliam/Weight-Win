import { FileText, Activity, CheckCircle, Users } from 'lucide-react'

interface KPICardProps {
  label: string
  value: number | string
  icon: React.ReactNode
}

function KPICard({ label, value, icon }: KPICardProps) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-4">
      <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0">
        {icon}
      </div>
      <div>
        <p className="text-sm font-medium text-slate-800">{value}</p>
        <p className="text-xs text-slate-500">{label}</p>
      </div>
    </div>
  )
}

interface KPICardsProps {
  newApplicants: number
  inReview: number
  approvedThisWeek: number
  activeUsersToday: number
}

export function KPICards({ newApplicants, inReview, approvedThisWeek, activeUsersToday }: KPICardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      <KPICard
        label="New Applicants"
        value={newApplicants}
        icon={<FileText className="w-5 h-5 text-blue-600" />}
      />
      <KPICard
        label="In Review"
        value={inReview}
        icon={<Activity className="w-5 h-5 text-orange-600" />}
      />
      <KPICard
        label="Approved This Week"
        value={approvedThisWeek}
        icon={<CheckCircle className="w-5 h-5 text-green-600" />}
      />
      <KPICard
        label="Active Users Today"
        value={activeUsersToday}
        icon={<Users className="w-5 h-5 text-indigo-600" />}
      />
    </div>
  )
}

