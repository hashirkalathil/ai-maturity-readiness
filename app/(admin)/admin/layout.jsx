import { redirect } from 'next/navigation'

import Sidebar from '@/components/admin/Sidebar'
import { getAdminSession } from '@/lib/adminAuth'

export default async function AdminLayout({ children }) {
  const { session } = await getAdminSession()

  if (!session) {
    redirect('/admin/login')
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <div className="hidden lg:block">
        <Sidebar />
      </div>
      <div className="flex min-h-screen flex-1 flex-col">
        <main className="flex-1 px-4 py-4 sm:px-6 sm:py-6 lg:px-8">
          {children}
        </main>
      </div>
    </div>
  )
}
