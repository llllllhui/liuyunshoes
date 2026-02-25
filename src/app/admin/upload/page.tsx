'use client'

import { useState } from 'react'
import { Sidebar } from '@/components/admin/Sidebar'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Upload } from 'lucide-react'

export default function UploadPage() {
  const [category, setCategory] = useState('new')
  const [files, setFiles] = useState<FileList | null>(null)
  const [uploading, setUploading] = useState(false)

  const handleUpload = async () => {
    if (!files || files.length === 0) return

    setUploading(true)
    try {
      // TODO: 实现上传到 Supabase 的逻辑
      await new Promise(resolve => setTimeout(resolve, 2000))
      alert('上传功能需要配置 Supabase 后才能使用')
      setFiles(null)
    } catch (error) {
      alert('上传失败')
    } finally {
      setUploading(false)
    }
  }

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
            />
            <p className="text-slate-600 mt-2">选择多张图片上传</p>
          </div>

          <Button onClick={handleUpload} disabled={uploading || !files}>
            {uploading ? '上传中...' : '开始上传'}
          </Button>

          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              ⚠️ 上传功能需要配置 Supabase 后才能使用。请先完成 Supabase 项目设置。
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
