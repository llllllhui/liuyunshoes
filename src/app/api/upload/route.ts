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

    const [{ data: imageData }, { data: thumbnailData }] = await Promise.all([
      supabase.storage.from('products').upload(`original/${filename}`, compressed),
      supabase.storage.from('products').upload(`thumbnails/${filename}`, thumbnail),
    ])

    return NextResponse.json({
      imageUrl: imageData?.path,
      thumbnailUrl: thumbnailData?.path,
    })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json({ error: '上传失败' }, { status: 500 })
  }
}
