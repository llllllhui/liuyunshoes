'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Sidebar } from '@/components/admin/Sidebar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { X, Plus } from 'lucide-react'

export default function EditProductPage() {
  const params = useParams()
  const router = useRouter()
  const supabase = createClient()
  const productId = params.id as string

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [name, setName] = useState('')
  const [category, setCategory] = useState('new')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [isActive, setIsActive] = useState(true)
  const [error, setError] = useState('')
  const [images, setImages] = useState<Array<{ image_url: string; thumbnail_url: string | null }>>([])

  useEffect(() => {
    loadProduct()
  }, [productId])

  async function loadProduct() {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', productId)
        .single()

      if (error) throw error

      if (data) {
        setName(data.name || '')
        setCategory(data.category || 'new')
        setDescription(data.description || '')
        setPrice(data.price?.toString() || '')
        setIsActive(data.is_active ?? true)
      }

      // 加载产品图片
      const { data: imageData, error: imageError } = await supabase
        .from('product_images')
        .select('image_url, thumbnail_url')
        .eq('product_id', productId)
        .order('display_order', { ascending: true })

      if (!imageError && imageData) {
        setImages(imageData)
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError('')

    try {
      const { error } = await supabase
        .from('products')
        .update({
          name,
          category,
          description,
          price: price ? parseFloat(price) : null,
          is_active: isActive,
          updated_at: new Date().toISOString(),
        })
        .eq('id', productId)

      if (error) throw error

      router.push('/admin/products')
      router.refresh()
    } catch (err: any) {
      setError(err.message || '保存失败')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-4 lg:p-8 lg:ml-64 mt-28 lg:mt-0">
          <p>加载中...</p>
        </main>
      </div>
    )
  }

  return (
    <div className="flex">
      <Sidebar />
      <main className="flex-1 p-4 lg:p-8 lg:ml-64 mt-16 lg:mt-0">
        <div className="max-w-2xl">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <h1 className="text-xl lg:text-2xl font-bold text-slate-900">编辑产品</h1>
            <Button variant="outline" onClick={() => router.back()}>
              返回
            </Button>
          </div>

          {/* 产品图片预览 */}
          {images.length > 0 && (
            <div className="mb-6 bg-white rounded-lg shadow p-6">
              <h3 className="text-sm font-medium text-slate-700 mb-3">产品图片</h3>
              <div className="flex flex-wrap gap-3">
                {images.map((img, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={img.thumbnail_url || img.image_url}
                      alt={`${name} - 图片 ${index + 1}`}
                      className="w-20 h-20 object-cover rounded-lg border border-slate-200"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6 bg-white rounded-lg shadow p-6">
            <div>
              <Label htmlFor="name">产品名称</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div>
              <Label htmlFor="category">分类</Label>
              <select
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full h-10 px-3 rounded-md border border-slate-200 bg-white"
              >
                <option value="new">新品</option>
                <option value="hot">热销</option>
                <option value="classic">经典</option>
              </select>
            </div>

            <div>
              <Label htmlFor="description">产品描述</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={6}
                placeholder="请输入产品描述，例如：材质、尺码、颜色、特点等..."
              />
            </div>

            <div>
              <Label htmlFor="price">价格（元）</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="可选填"
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isActive"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="w-4 h-4"
              />
              <Label htmlFor="isActive" className="cursor-pointer">
                产品上架
              </Label>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
                {error}
              </div>
            )}

            <div className="flex gap-4">
              <Button type="submit" disabled={saving}>
                {saving ? '保存中...' : '保存'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
              >
                取消
              </Button>
            </div>
          </form>
        </div>
      </main>
    </div>
  )
}
