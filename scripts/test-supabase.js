// 测试 Supabase 连接和配置
const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function testConnection() {
  console.log('🔍 测试 Supabase 连接...\n')

  // 1. 测试基本连接
  console.log('1. 测试基本连接...')
  const { data, error } = await supabase.from('products').select('count')
  if (error) {
    console.error('❌ 数据库连接失败:', error.message)
  } else {
    console.log('✅ 数据库连接正常')
  }

  // 2. 检查存储桶
  console.log('\n2. 检查存储桶...')
  const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets()
  if (bucketsError) {
    console.error('❌ 无法访问存储:', bucketsError.message)
  } else {
    console.log('✅ 存储访问正常')
    console.log('   现有存储桶:', buckets.map(b => b.name).join(', ') || '无')

    const productsBucket = buckets?.find(b => b.name === 'products')
    if (!productsBucket) {
      console.log('⚠️  警告: products 存储桶不存在!')
      console.log('   请在 Supabase Dashboard → Storage 中创建名为 "products" 的公开存储桶')
    } else {
      console.log(`✅ products 存储桶存在 (公开: ${productsBucket.public})`)
    }
  }

  // 3. 检查现有产品
  console.log('\n3. 检查数据库中的产品...')
  const { data: products, error: productsError } = await supabase
    .from('products')
    .select('id, name, category, is_active')

  if (productsError) {
    console.error('❌ 查询产品失败:', productsError.message)
  } else {
    console.log(`✅ 找到 ${products?.length || 0} 个产品`)
    if (products && products.length > 0) {
      console.log('   产品列表:')
      products.forEach(p => {
        console.log(`   - ${p.name} (${p.category}) ${p.is_active ? '✅' : '❌'}`)
      })
    }
  }

  // 4. 检查产品图片
  console.log('\n4. 检查产品图片...')
  const { data: images, error: imagesError } = await supabase
    .from('product_images')
    .select('product_id, image_url')

  if (imagesError) {
    console.error('❌ 查询图片失败:', imagesError.message)
  } else {
    console.log(`✅ 找到 ${images?.length || 0} 张图片`)
  }

  console.log('\n✨ 测试完成!')
}

testConnection().catch(console.error)
