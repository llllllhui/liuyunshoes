'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Package, Upload, Settings, LogOut } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

const navItems = [
  { href: '/admin', icon: LayoutDashboard, label: '仪表盘' },
  { href: '/admin/products', icon: Package, label: '产品管理' },
  { href: '/admin/upload', icon: Upload, label: '批量上传' },
  { href: '/admin/settings', icon: Settings, label: '设置' },
]

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <aside className="w-64 bg-slate-900 text-white min-h-screen p-4">
      <div className="mb-8">
        <h1 className="text-xl font-bold">流云帆布鞋</h1>
        <p className="text-slate-400 text-sm">管理后台</p>
      </div>

      <nav className="space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive ? 'bg-slate-700' : 'hover:bg-slate-800'
              }`}
            >
              <Icon className="h-5 w-5" />
              {item.label}
            </Link>
          )
        })}
      </nav>

      <button
        onClick={handleLogout}
        className="absolute bottom-4 left-4 right-4 flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-slate-800 transition-colors text-slate-400 hover:text-white"
      >
        <LogOut className="h-5 w-5" />
        退出登录
      </button>
    </aside>
  )
}
