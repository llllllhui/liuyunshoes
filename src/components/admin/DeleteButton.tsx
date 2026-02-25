'use client'

import { useState } from 'react'
import { Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface DeleteButtonProps {
  productId: string
  productName: string
}

export function DeleteButton({ productId, productName }: DeleteButtonProps) {
  const [isDeleting, setIsDeleting] = useState(false)

  async function handleDelete() {
    if (!confirm(`确定要删除产品"${productName}"吗？此操作不可恢复。`)) {
      return
    }

    setIsDeleting(true)

    try {
      const response = await fetch('/admin/products/delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ productId }),
      })

      if (!response.ok) {
        throw new Error('删除失败')
      }

      // 刷新页面以更新数据
      window.location.href = '/admin/products'
    } catch (error) {
      console.error('删除产品失败:', error)
      alert('删除产品失败，请重试')
      setIsDeleting(false)
    }
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleDelete}
      disabled={isDeleting}
      className="text-red-600 hover:text-red-700 hover:bg-red-50"
    >
      <Trash2 className="h-4 w-4" />
    </Button>
  )
}
