import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "流云帆布鞋 - 专业鞋类批发",
  description: "流云帆布鞋 - 聊城香江市场，为您提供时尚运动鞋、休闲鞋批发服务",
  viewport: "width=device-width, initial-scale=1.0, maximum-scale=5.0",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  )
}
