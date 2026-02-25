'use client'

import { useState } from 'react'
import { Sidebar } from '@/components/admin/Sidebar'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Upload } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function UploadPage() {
  const [category, setCategory] = useState('new')
  const [files, setFiles] = useState<FileList | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadStatus, setUploadStatus] = useState<{
    success: number
    failed: number
    errors: string[]
  }>({ success: 0, failed: 0, errors: [] })
  const router = useRouter()

  const handleUpload = async () => {
    if (!files || files.length === 0) return

    setUploading(true)
    setUploadStatus({ success: 0, failed: 0, errors: [] })

    try {
      const results = { success: 0, failed: 0, errors: [] as string[] }

      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        const formData = new FormData()
        formData.append('file', file)
        formData.append('category', category)

        try {
          const response = await fetch('/api/upload', {
            method: 'POST',
            body: formData,
          })

          if (response.ok) {
            results.success++
          } else {
            results.failed++
            results.errors.push(`${file.name}: ${await response.text()}`)
          }
        } catch (error: any) {
          results.failed++
          results.errors.push(`${file.name}: ${error.message}`)
        }
      }

      setUploadStatus(results)

      if (results.success > 0) {
        setTimeout(() => {
          router.push('/admin/products')
          router.refresh()
        }, 2000)
      }
    } catch (error) {
      alert('上传失败')
    } finally {
      setUploading(false)
    }
  }

  const selectedCount = files?.length || 0

  return (
    <div className="flex">
      <Sidebar />
      <main className="flex-1 p-8">
        <h1 className="text-2xl font-bold text-slate-900 mb-6">批量上传</h1>

        <div className="max-w-2xl space-y-6">
          <div>
            <Label className="block text-sm font-medium mb-2">选择分类</Label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full h-10 px-3 rounded-md border border-slate-200 bg-white"
            >
              <option value="new">新品</option>
              <option value="hot">热销</option>
              <option value="classic">经典</option>
            </select>
          </div>

          <div className="border-2 border-dashed border-slate-300 rounded-lg p-12 text-center">
            <Upload className="h-12 w-12 mx-auto text-slate-400 mb-4" />
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={(e) => setFiles(e.target.files)}
              className="block mx-auto"
              disabled={uploading}
            />
            <p className="text-slate-600 mt-2">
              {selectedCount > 0 ? `已选择 ${selectedCount} 个文件` : '选择多张图片上传'}
            </p>
          </div>

          <Button onClick={handleUpload} disabled={uploading || selectedCount === 0}>
            {uploading ? '上传中...' : '开始上传'}
          </Button>

          {uploadStatus.success > 0 || uploadStatus.failed > 0 ? (
            <div className="space-y-2">
              {uploadStatus.success > 0 && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm text-green-800">
                    ✅ 成功上传 {uploadStatus.success} 个文件
                  </p>
                </div>
              )}
              {uploadStatus.failed > 0 && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-800 font-semibold mb-2">
                    ❌ {uploadStatus.failed} 个文件上传失败
                  </p>
                  <ul className="text-sm text-red-700 list-disc list-inside">
                    {uploadStatus.errors.slice(0, 5).map((error, i) => (
                      <li key={i}>{error}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                💡 提示：图片会自动压缩并生成缩略图。支持 JPG、PNG、GIF 格式。
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
