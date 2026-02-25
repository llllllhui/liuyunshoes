import { ProductCard } from '@/components/shop/ProductCard'

interface Props {
  params: { category: string }
}

const categoryNames: Record<string, string> = {
  new: '新品推荐',
  hot: '爆款专区',
  classic: '经典款式',
}

// 临时数据 - 等待 Supabase 配置后将替换为真实数据
const mockProducts = Array.from({ length: 12 }, (_, i) => ({
  id: `${i}`,
  name: `产品 ${i + 1}`,
  imageUrl: '/placeholder.jpg',
  thumbnailUrl: '/placeholder.jpg',
}))

export default function CategoryPage({ params }: Props) {
  const category = params.category
  const categoryName = categoryNames[category] || '产品列表'

  return (
    <div className="py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold text-slate-900 mb-8">{categoryName}</h1>
        {mockProducts.length === 0 ? (
          <div className="text-center py-12 text-slate-600">
            <p>暂无产品</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {mockProducts.map((product) => (
              <div
                key={product.id}
                className="group cursor-pointer bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                <div className="relative aspect-square overflow-hidden bg-slate-100 flex items-center justify-center">
                  <span className="text-slate-400">{product.name}</span>
                </div>
                <div className="p-4 text-center">
                  <p className="text-sm text-slate-600">点击查看详情咨询</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
