import { redirect } from 'next/navigation'

import Sidebar from '@/components/admin/Sidebar'
import { getAdminSession } from '@/lib/adminAuth'

export default async function AdminLayout({ children }) {
  const { session } = await getAdminSession()

  if (!session) {
    redirect('/admin/login')
  }

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <div className="hidden lg:block h-full">
        <Sidebar />
      </div>
      <div className="flex h-full flex-1 flex-col overflow-hidden">
        <main className="flex-1 px-10 py-16 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
