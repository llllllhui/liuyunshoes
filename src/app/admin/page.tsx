import { Sidebar } from '@/components/admin/Sidebar'
import { StatsCard } from '@/components/admin/StatsCard'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function AdminPage() {
  // 临时统计数据 - 等待 Supabase 配置后将替换为真实数据
  const stats = {
    total: 87,
    new: 27,
    hot: 24,
    pending: 5,
  }

  return (
    <div className="flex">
      <Sidebar />
      <main className="flex-1 p-8">
        <h1 className="text-2xl font-bold text-slate-900 mb-6">仪表盘</h1>

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
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 mt-6">
          <h2 className="text-lg font-semibold mb-4">系统提示</h2>
          <p className="text-slate-600">
            Supabase 尚未配置。请在配置环境变量后重新启动服务器以启用完整功能。
          </p>
        </div>
      </main>
    </div>
  )
}
