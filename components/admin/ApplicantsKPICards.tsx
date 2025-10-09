import { FileText, XCircle, CheckCircle, Users } from 'lucide-react'

interface KPICardProps {
  label: string
  value: number | string
  icon: React.ReactNode
  iconBg: string
}

function KPICard({ label, value, icon, iconBg }: KPICardProps) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 flex items-center justify-between">
      <div>
        <p className="text-sm text-slate-600 mb-1">{label}</p>
        <p className="text-3xl font-bold text-slate-900">{value}</p>
      </div>
      <div className={`w-12 h-12 ${iconBg} rounded-lg flex items-center justify-center flex-shrink-0`}>
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
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
      <KPICard
        label="New Applicants"
        value={newApplicants}
        icon={<FileText className="w-6 h-6 text-blue-600" />}
        iconBg="bg-blue-50"
      />
      <KPICard
        label="Rejected Applicants"
        value={rejectedApplicants}
        icon={<XCircle className="w-6 h-6 text-red-600" />}
        iconBg="bg-red-50"
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
