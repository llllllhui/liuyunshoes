import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // 如果未登录，重定向到登录页
  if (!user) {
    redirect('/login')
  }

  return <div>{children}</div>
}
