const fs = require('fs')
const path = require('path')
const { createClient } = require('@supabase/supabase-js')

require('dotenv').config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

const categories = {
  'new_product': 'new',
  'hot_product': 'hot',
  'typical_product': 'classic'
}

async function migrateImages() {
  console.log('开始数据迁移...')

  for (const [folder, category] of Object.entries(categories)) {
    const dir = path.join(__dirname, '..', '..', folder)

    if (!fs.existsSync(dir)) {
      console.log(`跳过不存在的目录: ${folder}`)
      continue
    }

    const files = fs.readdirSync(dir)
      .filter(f => /\.(jpg|jpeg|png|gif)$/i.test(f))
      .sort()

    console.log(`处理 ${folder}: ${files.length} 个文件`)

    for (const file of files) {
      const filePath = path.join(dir, file)
      const buffer = fs.readFileSync(filePath)

      const filename = `${Date.now()}-${file}`

      try {
        // 上传原图
        const { data: imageData, error: uploadError } = await supabase.storage
          .from('products')
          .upload(`migrated/${category}/${filename}`, buffer)

        if (uploadError) {
          console.error(`  上传失败: ${file}`, uploadError.message)
          continue
        }

        // 创建产品记录
        const { data: product, error: dbError } = await supabase
          .from('products')
          .insert({
            name: file.replace(/\.[^/.]+$/, ''),
            category,
          })
          .select()
          .single()

        if (dbError) {
          console.error(`  数据库插入失败: ${file}`, dbError.message)
          continue
        }

        // 创建图片记录
        await supabase
          .from('product_images')
          .insert({
            product_id: product.id,
            image_url: imageData.path,
          })

        console.log(`  已迁移: ${file}`)
      } catch (error) {
        console.error(`  失败: ${file}`, error.message)
      }
    }
  }

  console.log('迁移完成！')
}

migrateImages()
