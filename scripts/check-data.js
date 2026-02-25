// 检查产品和图片的详细信息
const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function checkData() {
  console.log('🔍 检查产品和图片详情...\n')

  // 获取所有产品及其图片
  const { data: products, error } = await supabase
    .from('products')
    .select(`
      *,
      product_images(*)
    `)
    .eq('is_active', true)

  if (error) {
    console.error('❌ 查询失败:', error)
    return
  }

  console.log(`✅ 找到 ${products.length} 个活跃产品\n`)

  products.forEach((product, index) => {
    console.log(`${index + 1}. ${product.name}`)
    console.log(`   分类: ${product.category}`)
    console.log(`   状态: ${product.is_active ? '上架' : '下架'}`)
    console.log(`   图片数量: ${product.product_images?.length || 0}`)

    if (product.product_images && product.product_images.length > 0) {
      product.product_images.forEach((img, i) => {
        console.log(`   图片 ${i + 1}:`)
        console.log(`     -原图: ${img.image_url}`)
        console.log(`     -缩略图: ${img.thumbnail_url}`)
      })
    } else {
      console.log(`   ⚠️  没有关联的图片!`)
    }
    console.log()
  })
}

checkData().catch(console.error)
