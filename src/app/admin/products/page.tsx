import { Sidebar } from '@/components/admin/Sidebar'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/server'

export default async function ProductsPage() {
  const supabase = await createClient()

  // 尝试从 Supabase 获取产品数据
  const { data: products } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false })

  const hasRealData = products && products.length > 0

  return (
    <div className="flex">
      <Sidebar />
      <main className="flex-1 p-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-slate-900">产品管理</h1>
          <Link href="/admin/upload">
            <Button>上传新产品</Button>
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-medium text-slate-700">名称</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-slate-700">分类</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-slate-700">价格</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-slate-700">状态</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {hasRealData ? (
                products.map((product: any) => (
                  <tr key={product.id}>
                    <td className="px-6 py-4">{product.name}</td>
                    <td className="px-6 py-4">
                      {product.category === 'new' && '新品'}
                      {product.category === 'hot' && '热销'}
                      {product.category === 'classic' && '经典'}
                    </td>
                    <td className="px-6 py-4">¥{product.price || '-'}</td>
                    <td className="px-6 py-4">
                      {product.is_active ? (
                        <span className="text-green-600">上架</span>
                      ) : (
                        <span className="text-slate-400">下架</span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-slate-500">
                    <div className="flex flex-col items-center gap-4">
                      <div className="text-4xl">📦</div>
                      <div>
                        <p className="font-semibold">暂无产品数据</p>
                        <p className="text-sm mt-2">
                          请先上传产品图片，或运行数据迁移脚本导入旧数据
                        </p>
                      </div>
                      <Link href="/admin/upload">
                        <Button>上传产品</Button>
                      </Link>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {!hasRealData && (
          <div className="mt-6 grid md:grid-cols-2 gap-4">
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800 font-semibold mb-2">📤 上传新产品</p>
              <p className="text-sm text-blue-700">
                前往 <Link href="/admin/upload" className="underline font-semibold">批量上传</Link> 页面添加产品
              </p>
            </div>
            <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
              <p className="text-sm text-purple-800 font-semibold mb-2">🔄 迁移旧数据</p>
              <p className="text-sm text-purple-700">
                运行 <code className="bg-purple-100 px-1 rounded">node scripts/migrate.js</code> 导入旧网站数据
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
