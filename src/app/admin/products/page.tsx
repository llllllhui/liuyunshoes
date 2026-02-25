import { Sidebar } from '@/components/admin/Sidebar'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Pencil } from 'lucide-react'

// 临时数据 - 等待 Supabase 配置后将替换为真实数据
const mockProducts = [
  { id: '1', name: '新品运动鞋-1', category: 'new', price: null, isActive: true },
  { id: '2', name: '爆款休闲鞋-1', category: 'hot', price: 89, isActive: true },
  { id: '3', name: '经典帆布鞋-1', category: 'classic', price: 65, isActive: true },
]

export default function ProductsPage() {
  return (
    <div className="flex">
      <Sidebar />
      <main className="flex-1 p-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-slate-900">产品管理</h1>
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
              {mockProducts.map((product) => (
                <tr key={product.id}>
                  <td className="px-6 py-4">{product.name}</td>
                  <td className="px-6 py-4">
                    {product.category === 'new' && '新品'}
                    {product.category === 'hot' && '热销'}
                    {product.category === 'classic' && '经典'}
                  </td>
                  <td className="px-6 py-4">¥{product.price || '-'}</td>
                  <td className="px-6 py-4">
                    {product.isActive ? (
                      <span className="text-green-600">上架</span>
                    ) : (
                      <span className="text-slate-400">下架</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-800">
            ⚠️ 产品管理功能需要配置 Supabase 后才能使用。请先完成 Supabase 项目设置。
          </p>
        </div>
      </main>
    </div>
  )
}
