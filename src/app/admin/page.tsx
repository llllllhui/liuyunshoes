import { Sidebar } from '@/components/admin/Sidebar'
import { StatsCard } from '@/components/admin/StatsCard'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/server'

export default async function AdminPage() {
  const supabase = await createClient()

  // 获取真实统计数据（只统计已上架的产品）
  const [
    { count: totalProducts },
    { count: newProducts },
    { count: hotProducts },
    { count: pendingInquiries }
  ] = await Promise.all([
    supabase.from('products').select('*', { count: 'exact', head: true }).eq('is_active', true),
    supabase.from('products').select('*', { count: 'exact', head: true }).eq('category', 'new').eq('is_active', true),
    supabase.from('products').select('*', { count: 'exact', head: true }).eq('category', 'hot').eq('is_active', true),
    supabase.from('inquiries').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
  ])

  const stats = {
    total: totalProducts || 0,
    new: newProducts || 0,
    hot: hotProducts || 0,
    pending: pendingInquiries || 0,
  }

  return (
    <div className="flex">
      <Sidebar />
      <main className="flex-1 p-4 lg:p-8 lg:ml-64 mt-28 lg:mt-0">
        <h1 className="text-xl lg:text-2xl font-bold text-slate-900 mb-6">仪表盘</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCard title="总产品数" value={stats.total} icon="👟" />
          <StatsCard title="新品数量" value={stats.new} icon="✨" />
          <StatsCard title="热销数量" value={stats.hot} icon="🔥" />
          <StatsCard title="待处理咨询" value={stats.pending} icon="💬" />
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">快速操作</h2>
          <div className="flex gap-4 flex-wrap">
            <Link href="/admin/upload">
              <Button>上传新产品</Button>
            </Link>
            <Link href="/admin/products">
              <Button variant="outline">管理产品</Button>
            </Link>
            <Link href="/admin/settings">
              <Button variant="outline">系统设置</Button>
            </Link>
          </div>
        </div>

        {stats.total === 0 && (
          <div className="bg-white rounded-lg shadow p-6 mt-6">
            <h2 className="text-lg font-semibold mb-4">👋 欢迎使用流云帆布鞋管理系统</h2>
            <p className="text-slate-600 mb-4">
              您的 Supabase 已配置完成，现在可以开始添加产品了。
            </p>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm font-semibold text-blue-900 mb-2">📤 上传产品</p>
                <p className="text-sm text-blue-700">
                  通过批量上传功能添加产品图片
                </p>
              </div>
              <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                <p className="text-sm font-semibold text-purple-900 mb-2">🔄 迁移旧数据</p>
                <p className="text-sm text-purple-700">
                  运行 <code className="bg-purple-100 px-1 rounded">node scripts/migrate.js</code> 导入旧数据
                </p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
