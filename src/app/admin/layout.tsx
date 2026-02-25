import { requireAuth } from '@/lib/auth'
import { redirect } from 'next/navigation'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  try {
    await requireAuth()
  } catch {
    redirect('/admin/login')
  }

  return <div>{children}</div>
}
