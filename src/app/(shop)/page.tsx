import { createClient } from '@/lib/supabase/server'
import { ProductCard } from '@/components/shop/ProductCard'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

async function getHotProducts() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('products')
    .select(`
      *,
      product_images(image_url, thumbnail_url)
    `)
    .eq('category', 'hot')
    .eq('is_active', true)
    .order('display_order', { ascending: true })
    .limit(8)

  return data?.map((p: any) => ({
    id: p.id,
    name: p.name,
    description: p.description,
    imageUrl: p.product_images?.[0]?.image_url || '',
    thumbnailUrl: p.product_images?.[0]?.thumbnail_url,
  })) || []
}

export default async function HomePage() {
  const hotProducts = await getHotProducts()

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-slate-100 to-slate-200 py-12 md:py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900 mb-4 md:mb-6">
            专业鞋类批发，品质保证
          </h1>
          <p className="text-base md:text-lg lg:text-xl text-slate-700 mb-6 md:mb-8 max-w-2xl mx-auto px-4">
            流云帆布鞋 - 聊城香江市场，为您提供时尚运动鞋、休闲鞋批发服务
          </p>
          <div className="flex justify-center gap-3 md:gap-4 flex-wrap px-4">
            <Link href="/products/hot" className="w-full sm:w-auto">
              <button className="w-full sm:w-auto bg-slate-900 text-white px-6 md:px-8 py-3 rounded-lg hover:bg-slate-700 transition-colors text-base md:min-w-[160px]">
                浏览热销产品
              </button>
            </Link>
            <a href="tel:15224226812" className="w-full sm:w-auto">
              <button className="w-full sm:w-auto border-2 border-slate-900 text-slate-900 px-6 md:px-8 py-3 rounded-lg hover:bg-slate-900 hover:text-white transition-colors text-base md:min-w-[160px]">
                立即咨询
              </button>
            </a>
          </div>
        </div>
      </section>

      {/* Hot Products Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-slate-900">热销推荐</h2>
            <Link href="/products/hot" className="text-slate-600 hover:text-slate-900 flex items-center gap-1">
              查看更多 <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          {hotProducts.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg shadow">
              <div className="text-4xl mb-4">📦</div>
              <p className="text-slate-600">热销产品即将上线，敬请期待</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {hotProducts.map((product) => (
                <ProductCard key={product.id} {...product} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-slate-50 py-12 md:py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-center text-slate-900 mb-8 md:mb-12">为什么选择我们</h2>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6 md:gap-8">
            <div className="text-center">
              <div className="text-4xl mb-4">📦</div>
              <h3 className="text-xl font-semibold mb-2">货源丰富</h3>
              <p className="text-slate-600">新品、爆款、经典款，应有尽有</p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-4">💰</div>
              <h3 className="text-xl font-semibold mb-2">价格实惠</h3>
              <p className="text-slate-600">厂家直供，批发价格优惠</p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-4">🚚</div>
              <h3 className="text-xl font-semibold mb-2">发货快速</h3>
              <p className="text-slate-600">订单处理迅速，物流便捷</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4 text-center">
          <div className="bg-slate-900 text-white rounded-xl p-8 md:p-12 max-w-3xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">准备好开始采购了吗？</h2>
            <p className="text-slate-300 mb-6 text-base md:text-lg">
              联系我们获取最新产品目录和批发价格
            </p>
            <a
              href="tel:15224226812"
              className="inline-block bg-white text-slate-900 px-6 md:px-8 py-3 rounded-lg hover:bg-slate-100 transition-colors font-semibold text-sm md:text-base min-w-[200px]"
            >
              📞 拨打电话: 15224226812
            </a>
          </div>
        </div>
      </section>
    </div>
  )
}
