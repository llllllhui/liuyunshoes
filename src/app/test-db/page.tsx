import { createClient } from '@/lib/supabase/server'

export default async function TestPage() {
  const supabase = await createClient()

  const { data: products } = await supabase
    .from('products')
    .select(`
      *,
      product_images(image_url, thumbnail_url)
    `)
    .eq('is_active', true)
    .limit(5)

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">数据库测试页面</h1>
      <pre className="bg-slate-100 p-4 rounded-lg overflow-auto">
        {JSON.stringify(products, null, 2)}
      </pre>
    </div>
  )
}
