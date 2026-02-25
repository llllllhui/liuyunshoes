import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { productId } = await request.json()

    if (!productId) {
      return NextResponse.json({ error: '缺少产品ID' }, { status: 400 })
    }

    const supabase = await createClient()

    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', productId)

    if (error) {
      console.error('删除产品失败:', error)
      return NextResponse.json({ error: '删除产品失败' }, { status: 500 })
    }

    revalidatePath('/admin/products')
    revalidatePath('/admin')

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('删除产品错误:', error)
    return NextResponse.json({ error: '服务器错误' }, { status: 500 })
  }
}
