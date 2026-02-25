import sharp from 'sharp'

export async function compressImage(buffer: Buffer): Promise<Buffer> {
  return sharp(buffer)
    .resize(1200, 900, { fit: 'inside', withoutEnlargement: true })
    .jpeg({ quality: 85 })
    .toBuffer()
}

export async function generateThumbnail(buffer: Buffer): Promise<Buffer> {
  return sharp(buffer)
    .resize(400, 300, { fit: 'cover' })
    .jpeg({ quality: 80 })
    .toBuffer()
}
