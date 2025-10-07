import { redirect } from 'next/navigation'

export default function AdminPage() {
  // Redirect to applicants page by default
  redirect('/admin/applicants')
}

