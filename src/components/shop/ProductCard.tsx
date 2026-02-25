'use client'

import Image from 'next/image'
import { useState } from 'react'
import { X } from 'lucide-react'

interface ProductCardProps {
  id: string
  name: string
  imageUrl: string
  thumbnailUrl?: string
}

export function ProductCard({ id, name, imageUrl, thumbnailUrl }: ProductCardProps) {
  const [showModal, setShowModal] = useState(false)
  const [imageError, setImageError] = useState(false)
  const displayUrl = thumbnailUrl || imageUrl

  return (
    <>
      <div
        className="group cursor-pointer bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
        onClick={() => !imageError && setShowModal(true)}
      >
        <div className="relative aspect-square overflow-hidden bg-slate-100">
          {imageError ? (
            <div className="absolute inset-0 flex items-center justify-center text-slate-400">
              <div className="text-center">
                <div className="text-4xl mb-2">🖼️</div>
                <p className="text-sm">图片加载失败</p>
              </div>
            </div>
          ) : (
            <Image
              src={displayUrl}
              alt={name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
              onError={() => setImageError(true)}
            />
          )}
        </div>
        <div className="p-4 text-center">
          <p className="text-sm text-slate-600">点击查看详情咨询</p>
        </div>
      </div>

      {/* Modal */}
      {showModal && !imageError && (
        <div
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={() => setShowModal(false)}
        >
          <button
            className="absolute top-4 right-4 text-white hover:text-slate-300"
            onClick={() => setShowModal(false)}
          >
            <X className="h-8 w-8" />
          </button>
          <div className="relative max-w-4xl max-h-[90vh] w-full" onClick={(e) => e.stopPropagation()}>
            <Image
              src={imageUrl}
              alt={name}
              width={1200}
              height={900}
              className="w-full h-auto object-contain"
            />
            <div className="bg-white p-4 mt-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-2">{name}</h3>
              <p className="text-slate-600 mb-4">
                如您对此产品感兴趣，欢迎来电咨询
              </p>
              <a
                href="tel:15224226812"
                className="inline-block bg-slate-900 text-white px-6 py-2 rounded-lg hover:bg-slate-700 transition-colors"
              >
                📞 拨打电话: 15224226812
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
