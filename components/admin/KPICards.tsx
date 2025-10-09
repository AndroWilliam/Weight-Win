import { FileText, Activity, CheckCircle, Users } from 'lucide-react'

interface KPICardProps {
  label: string
  value: number | string
  icon: React.ReactNode
  iconBg: string
}

function KPICard({ label, value, icon, iconBg }: KPICardProps) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 flex items-center justify-between shadow-sm">
      <div className="flex-1">
        <p className="text-sm font-medium text-slate-600 mb-2">{label}</p>
        <p className="text-3xl font-bold text-slate-900 leading-none">{value}</p>
      </div>
      <div className={`w-14 h-14 ${iconBg} rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm`}>
        {icon}
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
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <KPICard
        label="New Applicants"
        value={newApplicants}
        icon={<FileText className="w-6 h-6 text-blue-600" />}
        iconBg="bg-blue-50"
      />
      <KPICard
        label="In Review"
        value={inReview}
        icon={<Activity className="w-6 h-6 text-orange-600" />}
        iconBg="bg-orange-50"
      />
      <KPICard
        label="Approved This Week"
        value={approvedThisWeek}
        icon={<CheckCircle className="w-6 h-6 text-green-600" />}
        iconBg="bg-green-50"
      />
      <KPICard
        label="Active Users Today"
        value={activeUsersToday}
        icon={<Users className="w-6 h-6 text-indigo-600" />}
        iconBg="bg-indigo-50"
      />
    </div>
  )
}

