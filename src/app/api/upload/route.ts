import { createClient } from '@/lib/supabase/server'
import { compressImage, generateThumbnail } from '@/lib/image-utils'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const category = formData.get('category') as string

    if (!file) {
      return NextResponse.json({ error: '没有文件' }, { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // 压缩图片
    const compressed = await compressImage(buffer)
    const thumbnail = await generateThumbnail(buffer)

    // 上传到 Supabase Storage
    const supabase = await createClient()
    const filename = `${Date.now()}-${file.name}`

    // 获取图片的公开 URL
    const { data: urlData } = supabase.storage
      .from('products')
      .getPublicUrl('original/' + filename)

    const { data: thumbnailUrlData } = supabase.storage
      .from('products')
      .getPublicUrl('thumbnails/' + filename)

    // 上传图片文件
    const [{ error: uploadError }] = await Promise.all([
      supabase.storage.from('products').upload(`original/${filename}`, compressed),
      supabase.storage.from('products').upload(`thumbnails/${filename}`, thumbnail),
    ])

    if (uploadError) {
      console.error('Storage upload error:', uploadError)
      return NextResponse.json({ error: '图片上传失败: ' + uploadError.message }, { status: 500 })
    }

    // 创建产品记录
    const productName = file.name.replace(/\.[^/.]+$/, '') // 去掉扩展名
    const { data: product, error: dbError } = await supabase
      .from('products')
      .insert({
        name: productName,
        category: category,
      })
      .select()
      .single()

    if (dbError) {
      console.error('Database insert error:', dbError)
      return NextResponse.json({ error: '数据库插入失败: ' + dbError.message }, { status: 500 })
    }

    // 创建图片记录
    const { error: imageError } = await supabase
      .from('product_images')
      .insert({
        product_id: product.id,
        image_url: urlData.publicUrl,
        thumbnail_url: thumbnailUrlData.publicUrl,
      })

    if (imageError) {
      console.error('Image record error:', imageError)
      return NextResponse.json({ error: '图片记录创建失败: ' + imageError.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      productId: product.id,
      productName: product.name,
    })
  } catch (error: any) {
    console.error('Upload error:', error)
    return NextResponse.json({ error: '上传失败: ' + error.message }, { status: 500 })
  }
}
