import { createClient } from '@/lib/supabase/server'
import { ProductCard } from '@/components/shop/ProductCard'

interface Props {
  params: { category: string }
}

const categoryNames: Record<string, string> = {
  new: '新品推荐',
  hot: '爆款专区',
  classic: '经典款式',
}

async function getProducts(category: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from('products')
    .select(`
      *,
      product_images(image_url, thumbnail_url)
    `)
    .eq('category', category)
    .eq('is_active', true)
    .order('display_order', { ascending: true })

  return data?.map((p: any) => ({
    id: p.id,
    name: p.name,
    imageUrl: p.product_images?.[0]?.image_url || '',
    thumbnailUrl: p.product_images?.[0]?.thumbnail_url,
  })) || []
}

export default async function CategoryPage({ params }: Props) {
  const category = params.category
  const products = await getProducts(category)
  const categoryName = categoryNames[category] || '产品列表'

  return (
    <div className="py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold text-slate-900 mb-8">{categoryName}</h1>
        {products.length === 0 ? (
          <div className="text-center py-12 text-slate-600">
            <div className="text-4xl mb-4">📦</div>
            <p className="font-semibold">暂无产品</p>
            <p className="text-sm mt-2">请稍后再来查看最新产品</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} {...product} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
