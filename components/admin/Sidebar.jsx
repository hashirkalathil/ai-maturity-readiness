'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  ClipboardList,
  Download,
  LayoutDashboard,
  LogOut,
} from 'lucide-react'

import Button from '@/components/ui/Button'
import { createClient } from '@/lib/supabase/client'

const navItems = [
  { label: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
  { label: 'Responses', href: '/admin/responses', icon: ClipboardList },
  { label: 'Export', href: '/admin/export', icon: Download },
]

export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/admin/login')
  }

  return (
    <aside className="flex h-full w-[280px] flex-col overflow-y-auto border-r border-slate-200 bg-white px-5 py-6">
      <div className="mb-8 px-5 py-6">
        <p className="text-xs font-semibold uppercase">
          AI Maturity Framework
        </p>
        <h1 className="mt-3 text-xl uppercase font-semibold">Admin Console</h1>
      </div>

      <nav className="space-y-2">
        {navItems.map(({ label, href, icon: Icon }) => {
          const isActive = pathname === href || pathname?.startsWith(`${href}/`)

          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition ${
                isActive
                  ? 'bg-cyan-50 text-cyan-700'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <Icon className="h-5 w-5" />
              <span>{label}</span>
            </Link>
          )
        })}
      </nav>

      <div className="mt-auto">
        <Button
          variant="ghost"
          className="w-full justify-start rounded-2xl"
          onClick={handleSignOut}
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </Button>
      </div>
    </aside>
  )
}
