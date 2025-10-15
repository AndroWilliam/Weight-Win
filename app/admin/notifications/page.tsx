import { Bell } from 'lucide-react'

export default function AdminNotificationsPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Bell className="w-6 h-6 text-primary" />
        <h1 className="text-2xl font-bold text-foreground">Notifications</h1>
      </div>

      <div className="bg-card border border-border rounded-lg p-8 text-center">
        <Bell className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <h2 className="text-lg font-semibold text-foreground mb-2">
          No notifications yet
        </h2>
        <p className="text-muted-foreground">
          When you have new notifications, they will appear here.
        </p>
      </div>
    </div>
  )
}
