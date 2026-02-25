# 流云帆布鞋网站重构实施计划

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**目标:** 将现有静态鞋类批发网站重构为基于 Next.js + Supabase 的现代化网站，包含前台展示和管理后台

**架构:** 前台使用 Next.js 静态生成提供产品展示，管理后台使用服务端渲染提供产品管理功能，Supabase 提供数据库、存储和认证服务

**技术栈:** Next.js 14 (App Router), shadcn/ui, Tailwind CSS, Supabase, Sharp, TypeScript

---

## 准备工作

### Task 1: 创建 Next.js 项目

**Files:**
- Create: `next.config.mjs`
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `tailwind.config.ts`
- Create: `src/app/layout.tsx`
- Create: `src/app/page.tsx`
- Create: `src/app/globals.css`

**Step 1: 初始化 Next.js 项目**

```bash
cd liuyunshoes
npx create-next-app@latest . --typescript --tailwind --app --no-src --import-alias "@/*" --use-npm
```

按提示确认覆盖现有文件。

**Step 2: 安装核心依赖**

```bash
npm install @supabase/supabase-js @supabase/auth-helpers-nextjs zustand sharp react-hook-form zod @hookform/resolvers lucide-react clsx tailwind-merge
npm install -D @types/node eslint-config-next
```

**Step 3: 配置 next.config.mjs**

创建 `next.config.mjs`:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
      },
    ],
  },
  // 兼容旧路径
  async rewrites() {
    return [
      {
        source: '/new_product/:path*',
        destination: '/api/legacy-image?path=new_product/:path*',
      },
      {
        source: '/hot_product/:path*',
        destination: '/api/legacy-image?path=hot_product/:path*',
      },
      {
        source: '/typical_product/:path*',
        destination: '/api/legacy-image?path=typical_product/:path*',
      },
    ];
  },
};
export default nextConfig;
```

**Step 4: 更新 tailwind.config.ts**

```typescript
import type {Config} from "tailwindcss"

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
export default config
```

**Step 5: 安装 tailwindcss-animate**

```bash
npm install tailwindcss-animate
```

**Step 6: 提交**

```bash
git add .
git commit -m "feat: initialize Next.js project with dependencies"
```

---

### Task 2: 配置 Supabase

**Files:**
- Create: `src/lib/supabase.ts`
- Create: `src/lib/supabase/server.ts`
- Create: `src/lib/supabase/client.ts`
- Create: `.env.local.example`
- Create: `supabase/migrations/001_initial_schema.sql`

**Step 1: 创建环境变量示例文件**

创建 `.env.local.example`:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# 管理员账号
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=change-me-on-first-login
```

**Step 2: 创建 Supabase 客户端配置**

创建 `src/lib/supabase.ts`:

```typescript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

创建 `src/lib/supabase/client.ts`:

```typescript
'use client'

import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

创建 `src/lib/supabase/server.ts`:

```typescript
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // 在服务器组件中可能无法设置 cookies
          }
        },
      },
    }
  )
}
```

**Step 3: 创建数据库迁移脚本**

创建 `supabase/migrations/001_initial_schema.sql`:

```sql
-- 产品表
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(200) NOT NULL,
  category VARCHAR(20) NOT NULL CHECK (category IN ('new', 'hot', 'classic')),
  description TEXT,
  price DECIMAL(10,2),
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 产品图片表
CREATE TABLE product_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  image_url VARCHAR(500) NOT NULL,
  thumbnail_url VARCHAR(500),
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 客户咨询表
CREATE TABLE inquiries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name VARCHAR(100),
  customer_phone VARCHAR(20),
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  message TEXT,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'contacted', 'closed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 管理员表
CREATE TABLE admins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_active ON products(is_active);
CREATE INDEX idx_product_images_product ON product_images(product_id);
CREATE INDEX idx_inquiries_status ON inquiries(status);

-- 启用 RLS
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

-- 公开读取产品
CREATE POLICY "Public read products" ON products
  FOR SELECT USING (true);

-- 公开读取产品图片
CREATE POLICY "Public read product images" ON product_images
  FOR SELECT USING (true);

-- 允许插入咨询
CREATE POLICY "Public insert inquiries" ON inquiries
  FOR INSERT WITH CHECK (true);

-- 只有认证用户可以管理产品
CREATE POLICY "Authenticated manage products" ON products
  FOR ALL USING (auth.role() = 'authenticated');

-- 只有认证用户可以管理图片
CREATE POLICY "Authenticated manage images" ON product_images
  FOR ALL USING (auth.role() = 'authenticated');

-- 管理员策略
CREATE POLICY "Admin access" ON admins
  FOR ALL USING (auth.uid()::text = (SELECT id::text FROM admins WHERE email = auth.email()));
```

**Step 4: 提交**

```bash
git add .
git commit -m "feat: configure Supabase client and database schema"
```

---

### Task 3: 安装 shadcn/ui 组件

**Files:**
- Create: `src/components/ui/*.tsx` (多个组件)
- Create: `src/lib/utils.ts`
- Modify: `src/app/globals.css`

**Step 1: 初始化 shadcn/ui**

```bash
npx shadcn@latest init
```

选择以下选项：
- TypeScript: Yes
- Style: Default
- Base color: Slate
- CSS variables: Yes
- Import path: @/*

**Step 2: 添加需要的组件**

```bash
npx shadcn@latest add button card input label textarea select dialog dropdown-menu navigation-menu sheet badge avatar separator
```

**Step 3: 提交**

```bash
git add .
git commit -m "feat: install shadcn/ui components"
```

---

## 前台开发

### Task 4: 创建前台布局组件

**Files:**
- Create: `src/components/shop/Header.tsx`
- Create: `src/components/shop/Footer.tsx`
- Create: `src/app/(shop)/layout.tsx`

**Step 1: 创建全局样式**

更新 `src/app/globals.css`:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --border: 214.3 31.8% 91.4%;
    --input: 214.3 31.8% 91.4%;
    --ring: 222.2 84% 4.9%;
  }
  .dark {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
  }
}

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground;
  }
}
```

**Step 2: 创建 Header 组件**

创建 `src/components/shop/Header.tsx`:

```typescript
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'

const navItems = [
  { href: '/', label: '首页' },
  { href: '/products/new', label: '新品' },
  { href: '/products/hot', label: '热销' },
  { href: '/products/classic', label: '经典' },
]

export function Header() {
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <header className="bg-slate-900 text-white">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="text-xl font-bold">
            流云帆布鞋
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-6">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`hover:text-slate-300 transition-colors ${
                  pathname === item.href ? 'text-slate-300 font-semibold' : ''
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden text-white hover:text-slate-300"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <Menu className="h-6 w-6" />
          </Button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <nav className="md:hidden py-4 border-t border-slate-700">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`block py-2 hover:text-slate-300 transition-colors ${
                  pathname === item.href ? 'text-slate-300 font-semibold' : ''
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        )}
      </div>
    </header>
  )
}
```

**Step 3: 创建 Footer 组件**

创建 `src/components/shop/Footer.tsx`:

```typescript
import Link from 'next/link'

export function Footer() {
  return (
    <footer className="bg-slate-900 text-white mt-12">
      <div className="container mx-auto px-4 py-8">
        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-4">联系我们</h3>
            <p className="mb-2">店主：朱文格</p>
            <p className="mb-2">
              电话：<a href="tel:15224226812" className="hover:text-slate-300">15224226812</a>
            </p>
            <p className="mb-2">地址：聊城东昌府区香江一期广场东路西排28</p>
            <p>
              网址：<a href="https://www.liuyunshoes.store/" className="hover:text-slate-300">liuyunshoes.store</a>
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">快速链接</h3>
            <nav className="flex flex-col space-y-2">
              <Link href="/products/new" className="hover:text-slate-300">新品推荐</Link>
              <Link href="/products/hot" className="hover:text-slate-300">爆款专区</Link>
              <Link href="/products/classic" className="hover:text-slate-300">经典款式</Link>
            </nav>
          </div>
        </div>
        <div className="border-t border-slate-700 mt-8 pt-8 text-center text-slate-400">
          <p>版权所有 © 2025 流云帆布鞋</p>
        </div>
      </div>
    </footer>
  )
}
```

**Step 4: 创建前台路由布局**

创建 `src/app/(shop)/layout.tsx`:

```typescript
import { Header } from '@/components/shop/Header'
import { Footer } from '@/components/shop/Footer'

export default function ShopLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  )
}
```

**Step 5: 提交**

```bash
git add .
git commit -m "feat: create shop layout with Header and Footer components"
```

---

### Task 5: 创建首页

**Files:**
- Create: `src/app/(shop)/page.tsx`
- Create: `src/components/shop/ProductCard.tsx`

**Step 1: 创建 ProductCard 组件**

创建 `src/components/shop/ProductCard.tsx`:

```typescript
'use client'

import Image from 'next/image'
import Link from 'next/link'
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

  return (
    <>
      <div
        className="group cursor-pointer bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
        onClick={() => setShowModal(true)}
      >
        <div className="relative aspect-square overflow-hidden bg-slate-100">
          <Image
            src={thumbnailUrl || imageUrl}
            alt={name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
          />
        </div>
        <div className="p-4 text-center">
          <p className="text-sm text-slate-600">点击查看详情咨询</p>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
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
```

**Step 2: 创建首页**

创建 `src/app/(shop)/page.tsx`:

```typescript
import { createClient } from '@/lib/supabase/server'
import { ProductCard } from '@/components/shop/ProductCard'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

async function getHotProducts() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('products')
    .select(`
      *,
      product_images(image_url, thumbnail_url)
    `)
    .eq('category', 'hot')
    .eq('is_active', true)
    .order('display_order', { ascending: true })
    .limit(8)

  return data?.map(p => ({
    id: p.id,
    name: p.name,
    imageUrl: p.product_images?.[0]?.image_url || '',
    thumbnailUrl: p.product_images?.[0]?.thumbnail_url,
  })) || []
}

export default async function HomePage() {
  const hotProducts = await getHotProducts()

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-slate-100 to-slate-200 py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">
            专业鞋类批发，品质保证
          </h1>
          <p className="text-xl text-slate-700 mb-8 max-w-2xl mx-auto">
            流云帆布鞋 - 聊城香江市场，为您提供时尚运动鞋、休闲鞋批发服务
          </p>
          <div className="flex justify-center gap-4">
            <Link href="/products/hot">
              <button className="bg-slate-900 text-white px-8 py-3 rounded-lg hover:bg-slate-700 transition-colors">
                浏览热销产品
              </button>
            </Link>
            <a href="tel:15224226812">
              <button className="border-2 border-slate-900 text-slate-900 px-8 py-3 rounded-lg hover:bg-slate-900 hover:text-white transition-colors">
                立即咨询
              </button>
            </a>
          </div>
        </div>
      </section>

      {/* Hot Products Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-slate-900">热销推荐</h2>
            <Link href="/products/hot" className="text-slate-600 hover:text-slate-900 flex items-center gap-1">
              查看更多 <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {hotProducts.map((product) => (
              <ProductCard key={product.id} {...product} />
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-slate-50 py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-slate-900 mb-12">为什么选择我们</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-4xl mb-4">📦</div>
              <h3 className="text-xl font-semibold mb-2">货源丰富</h3>
              <p className="text-slate-600">新品、爆款、经典款，应有尽有</p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-4">💰</div>
              <h3 className="text-xl font-semibold mb-2">价格实惠</h3>
              <p className="text-slate-600">厂家直供，批发价格优惠</p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-4">🚚</div>
              <h3 className="text-xl font-semibold mb-2">发货快速</h3>
              <p className="text-slate-600">订单处理迅速，物流便捷</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
```

**Step 3: 提交**

```bash
git add .
git commit -m "feat: create homepage with hero section and hot products"
```

---

### Task 6: 创建产品分类页面

**Files:**
- Create: `src/app/(shop)/products/[category]/page.tsx`
- Create: `src/lib/hooks/use-products.ts`

**Step 1: 创建产品获取 Hook**

创建 `src/lib/hooks/use-products.ts`:

```typescript
'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export interface Product {
  id: string
  name: string
  imageUrl: string
  thumbnailUrl?: string
}

export function useProducts(category: string) {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadProducts() {
      const supabase = createClient()
      const { data } = await supabase
        .from('products')
        .select(`
          *,
          product_images(image_url, thumbnail_url)
        `)
        .eq('category', category)
        .eq('is_active', true)
        .order('display_order', { ascending: true })

      if (data) {
        setProducts(data.map(p => ({
          id: p.id,
          name: p.name,
          imageUrl: p.product_images?.[0]?.image_url || '',
          thumbnailUrl: p.product_images?.[0]?.thumbnail_url,
        })))
      }
      setLoading(false)
    }

    loadProducts()
  }, [category])

  return { products, loading }
}
```

**Step 2: 创建分类页面**

创建 `src/app/(shop)/products/[category]/page.tsx`:

```typescript
import { createClient } from '@/lib/supabase/server'
import { ProductCard } from '@/components/shop/ProductCard'

interface Props {
  params: { category: string }
}

const categoryNames: Record<string, string> = {
  new: '新品推荐',
  hot: '爆款专区',
  classic: '经典款式',
}

async function getProducts(category: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from('products')
    .select(`
      *,
      product_images(image_url, thumbnail_url)
    `)
    .eq('category', category)
    .eq('is_active', true)
    .order('display_order', { ascending: true })

  return data?.map(p => ({
    id: p.id,
    name: p.name,
    imageUrl: p.product_images?.[0]?.image_url || '',
    thumbnailUrl: p.product_images?.[0]?.thumbnail_url,
  })) || []
}

export default async function CategoryPage({ params }: Props) {
  const category = params.category
  const products = await getProducts(category)
  const categoryName = categoryNames[category] || '产品列表'

  return (
    <div className="py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold text-slate-900 mb-8">{categoryName}</h1>
        {products.length === 0 ? (
          <div className="text-center py-12 text-slate-600">
            <p>暂无产品</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} {...product} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
```

**Step 3: 提交**

```bash
git add .
git commit -m "feat: create product category pages"
```

---

## 管理后台开发

### Task 7: 创建管理后台布局和认证

**Files:**
- Create: `src/app/admin/login/page.tsx`
- Create: `src/app/admin/layout.tsx`
- Create: `src/middleware.ts`
- Create: `src/lib/auth.ts`

**Step 1: 创建认证工具**

创建 `src/lib/auth.ts`:

```typescript
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function requireAuth() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/admin/login')
  }

  // 检查是否是管理员
  const { data: admin } = await supabase
    .from('admins')
    .select('*')
    .eq('email', user.email)
    .single()

  if (!admin) {
    redirect('/admin/login')
  }

  return admin
}
```

**Step 2: 创建登录页面**

创建 `src/app/admin/login/page.tsx`:

```typescript
'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const supabase = createClient()
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error
      router.push('/admin')
      router.refresh()
    } catch (err: any) {
      setError(err.message || '登录失败')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center">流云帆布鞋 - 管理后台</h1>
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <Label htmlFor="email">邮箱</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="password">密码</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {error && (
            <div className="text-red-500 text-sm">{error}</div>
          )}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? '登录中...' : '登录'}
          </Button>
        </form>
      </div>
    </div>
  )
}
```

**Step 3: 创建后台布局**

创建 `src/app/admin/layout.tsx`:

```typescript
import { requireAuth } from '@/lib/auth'
import { redirect } from 'next/navigation'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  try {
    await requireAuth()
  } catch {
    redirect('/admin/login')
  }

  return <div>{children}</div>
}
```

**Step 4: 提交**

```bash
git add .
git commit -m "feat: create admin authentication and login page"
```

---

### Task 8: 创建管理后台主页和侧边栏

**Files:**
- Create: `src/app/admin/page.tsx`
- Create: `src/components/admin/Sidebar.tsx`
- Create: `src/components/admin/StatsCard.tsx`

**Step 1: 创建 Sidebar 组件**

创建 `src/components/admin/Sidebar.tsx`:

```typescript
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Package, Upload, MessageSquare, Settings, LogOut } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

const navItems = [
  { href: '/admin', icon: LayoutDashboard, label: '仪表盘' },
  { href: '/admin/products', icon: Package, label: '产品管理' },
  { href: '/admin/upload', icon: Upload, label: '批量上传' },
  { href: '/admin/inquiries', icon: MessageSquare, label: '咨询管理' },
  { href: '/admin/settings', icon: Settings, label: '设置' },
]

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/admin/login')
  }

  return (
    <aside className="w-64 bg-slate-900 text-white min-h-screen p-4">
      <div className="mb-8">
        <h1 className="text-xl font-bold">流云帆布鞋</h1>
        <p className="text-slate-400 text-sm">管理后台</p>
      </div>

      <nav className="space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive ? 'bg-slate-700' : 'hover:bg-slate-800'
              }`}
            >
              <Icon className="h-5 w-5" />
              {item.label}
            </Link>
          )
        })}
      </nav>

      <button
        onClick={handleLogout}
        className="absolute bottom-4 left-4 right-4 flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-slate-800 transition-colors text-slate-400 hover:text-white"
      >
        <LogOut className="h-5 w-5" />
        退出登录
      </button>
    </aside>
  )
}
```

**Step 2: 创建 StatsCard 组件**

创建 `src/components/admin/StatsCard.tsx`:

```typescript
interface StatsCardProps {
  title: string
  value: number
  icon: string
}

export function StatsCard({ title, value, icon }: StatsCardProps) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-slate-600 text-sm">{title}</p>
          <p className="text-3xl font-bold text-slate-900 mt-2">{value}</p>
        </div>
        <div className="text-4xl">{icon}</div>
      </div>
    </div>
  )
}
```

**Step 3: 创建后台主页**

创建 `src/app/admin/page.tsx`:

```typescript
import { createClient } from '@/lib/supabase/server'
import { Sidebar } from '@/components/admin/Sidebar'
import { StatsCard } from '@/components/admin/StatsCard'

export default async function AdminPage() {
  const supabase = await createClient()

  // 获取统计数据
  const { count: totalProducts } = await supabase
    .from('products')
    .select('*', { count: 'exact', head: true })

  const { count: newProducts } = await supabase
    .from('products')
    .select('*', { count: 'exact', head: true })
    .eq('category', 'new')

  const { count: hotProducts } = await supabase
    .from('products')
    .select('*', { count: 'exact', head: true })
    .eq('category', 'hot')

  const { count: pendingInquiries } = await supabase
    .from('inquiries')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'pending')

  return (
    <div className="flex">
      <Sidebar />
      <main className="flex-1 p-8">
        <h1 className="text-2xl font-bold text-slate-900 mb-6">仪表盘</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCard title="总产品数" value={totalProducts || 0} icon="👟" />
          <StatsCard title="新品数量" value={newProducts || 0} icon="✨" />
          <StatsCard title="热销数量" value={hotProducts || 0} icon="🔥" />
          <StatsCard title="待处理咨询" value={pendingInquiries || 0} icon="💬" />
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">快速操作</h2>
          <div className="flex gap-4">
            <a
              href="/admin/upload"
              className="bg-slate-900 text-white px-6 py-2 rounded-lg hover:bg-slate-700"
            >
              上传新产品
            </a>
            <a
              href="/admin/products"
              className="border border-slate-900 text-slate-900 px-6 py-2 rounded-lg hover:bg-slate-50"
            >
              管理产品
            </a>
          </div>
        </div>
      </main>
    </div>
  )
}
```

**Step 4: 提交**

```bash
git add .
git commit -m "feat: create admin dashboard with sidebar and stats"
```

---

### Task 9: 创建产品管理页面

**Files:**
- Create: `src/app/admin/products/page.tsx`
- Create: `src/app/admin/products/new/page.tsx`
- Create: `src/app/admin/products/[id]/edit/page.tsx`
- Create: `src/components/admin/ProductForm.tsx`

**Step 1: 创建产品列表页**

创建 `src/app/admin/products/page.tsx`:

```typescript
import { createClient } from '@/lib/supabase/server'
import { Sidebar } from '@/components/admin/Sidebar'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Pencil, Trash2 } from 'lucide-react'

export default async function ProductsPage() {
  const supabase = await createClient()
  const { data: products } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div className="flex">
      <Sidebar />
      <main className="flex-1 p-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-slate-900">产品管理</h1>
          <Link href="/admin/products/new">
            <Button>添加产品</Button>
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-medium text-slate-700">名称</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-slate-700">分类</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-slate-700">价格</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-slate-700">状态</th>
                <th className="px-6 py-3 text-right text-sm font-medium text-slate-700">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {products?.map((product) => (
                <tr key={product.id}>
                  <td className="px-6 py-4">{product.name}</td>
                  <td className="px-6 py-4">
                    {product.category === 'new' && '新品'}
                    {product.category === 'hot' && '热销'}
                    {product.category === 'classic' && '经典'}
                  </td>
                  <td className="px-6 py-4">¥{product.price || '-'}</td>
                  <td className="px-6 py-4">
                    {product.is_active ? (
                      <span className="text-green-600">上架</span>
                    ) : (
                      <span className="text-slate-400">下架</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link href={`/admin/products/${product.id}/edit`}>
                      <Button variant="ghost" size="icon">
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  )
}
```

**Step 2: 创建产品表单组件**

创建 `src/components/admin/ProductForm.tsx`:

```typescript
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface ProductFormProps {
  product?: any
}

export function ProductForm({ product }: ProductFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const data = {
      name: formData.get('name'),
      category: formData.get('category'),
      description: formData.get('description'),
      price: formData.get('price') ? parseFloat(formData.get('price') as string) : null,
    }

    // TODO: 保存到数据库
    setLoading(false)
    router.push('/admin/products')
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      <div>
        <Label htmlFor="name">产品名称</Label>
        <Input
          id="name"
          name="name"
          defaultValue={product?.name}
          required
        />
      </div>

      <div>
        <Label htmlFor="category">分类</Label>
        <Select name="category" defaultValue={product?.category || 'new'}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="new">新品</SelectItem>
            <SelectItem value="hot">热销</SelectItem>
            <SelectItem value="classic">经典</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="price">价格（可选）</Label>
        <Input
          id="price"
          name="price"
          type="number"
          step="0.01"
          defaultValue={product?.price}
        />
      </div>

      <div>
        <Label htmlFor="description">产品描述</Label>
        <Textarea
          id="description"
          name="description"
          rows={4}
          defaultValue={product?.description}
        />
      </div>

      <div className="flex gap-4">
        <Button type="submit" disabled={loading}>
          {loading ? '保存中...' : '保存'}
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
  )
}
```

**Step 3: 提交**

```bash
git add .
git commit -m "feat: create product management pages"
```

---

### Task 10: 创建图片上传功能

**Files:**
- Create: `src/app/admin/upload/page.tsx`
- Create: `src/app/api/upload/route.ts`
- Create: `src/lib/image-utils.ts`

**Step 1: 创建图片工具函数**

创建 `src/lib/image-utils.ts`:

```typescript
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
```

**Step 2: 创建上传 API**

创建 `src/app/api/upload/route.ts`:

```typescript
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
```

**Step 3: 创建上传页面**

创建 `src/app/admin/upload/page.tsx`:

```typescript
'use client'

import { useState } from 'react'
import { Sidebar } from '@/components/admin/Sidebar'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Upload } from 'lucide-react'

export default function UploadPage() {
  const [category, setCategory] = useState('new')
  const [files, setFiles] = useState<FileList | null>(null)
  const [uploading, setUploading] = useState(false)

  const handleUpload = async () => {
    if (!files || files.length === 0) return

    setUploading(true)
    try {
      for (const file of Array.from(files)) {
        const formData = new FormData()
        formData.append('file', file)
        formData.append('category', category)

        await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        })
      }
      alert('上传完成！')
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
            <label className="block text-sm font-medium mb-2">选择分类</label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="new">新品</SelectItem>
                <SelectItem value="hot">热销</SelectItem>
                <SelectItem value="classic">经典</SelectItem>
              </SelectContent>
            </Select>
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
        </div>
      </main>
    </div>
  )
}
```

**Step 4: 提交**

```bash
git add .
git commit -m "feat: create batch image upload functionality"
```

---

## 数据迁移

### Task 11: 创建数据迁移脚本

**Files:**
- Create: `scripts/migrate.js`
- Create: `scripts/seed.js`

**Step 1: 创建迁移脚本**

创建 `scripts/migrate.js`:

```javascript
const fs = require('fs')
const path = require('path')
const { createClient } = require('@supabase/supabase-js')

require('dotenv').config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

const categories = {
  'new_product': 'new',
  'hot_product': 'hot',
  'typical_product': 'classic'
}

async function migrateImages() {
  for (const [folder, category] of Object.entries(categories)) {
    const dir = path.join(__dirname, '..', folder)

    if (!fs.existsSync(dir)) {
      console.log(`跳过不存在的目录: ${folder}`)
      continue
    }

    const files = fs.readdirSync(dir)
      .filter(f => /\.(jpg|jpeg|png|gif)$/i.test(f))
      .sort()

    console.log(`处理 ${folder}: ${files.length} 个文件`)

    for (const file of files) {
      const filePath = path.join(dir, file)
      const buffer = fs.readFileSync(filePath)

      const filename = `${Date.now()}-${file}`

      try {
        // 上传原图
        const { data: imageData } = await supabase.storage
          .from('products')
          .upload(`migrated/${category}/${filename}`, buffer)

        if (imageData) {
          // 创建产品记录
          const { data: product } = await supabase
            .from('products')
            .insert({
              name: file.replace(/\.[^/.]+$/, ''),
              category,
            })
            .select()
            .single()

          if (product) {
            await supabase
              .from('product_images')
              .insert({
                product_id: product.id,
                image_url: imageData.path,
              })
          }

          console.log(`  已迁移: ${file}`)
        }
      } catch (error) {
        console.error(`  失败: ${file}`, error.message)
      }
    }
  }

  console.log('迁移完成！')
}

migrateImages()
```

**Step 2: 提交**

```bash
git add .
git commit -m "feat: add data migration script for existing images"
```

---

## 部署准备

### Task 12: 配置 Vercel 部署

**Files:**
- Create: `.vercelignore`
- Create: `README.md`

**Step 1: 创建 .vercelignore**

```
.env.local
.env*.local
supabase/
node_modules/
.next/
```

**Step 2: 创建 README**

创建 `README.md`:

```markdown
# 流云帆布鞋 - 批发网站

现代化的鞋类批发网站，基于 Next.js 和 Supabase 构建。

## 技术栈

- Next.js 14 (App Router)
- Supabase (数据库 + 存储 + 认证)
- Tailwind CSS + shadcn/ui
- TypeScript

## 本地开发

1. 安装依赖:
\`\`\`bash
npm install
\`\`\`

2. 配置环境变量:
\`\`\`bash
cp .env.local.example .env.local
# 编辑 .env.local 填入 Supabase 配置
\`\`\`

3. 运行开发服务器:
\`\`\`bash
npm run dev
\`\`\`

## 部署

项目托管在 Vercel 上，推送代码即可自动部署。

## 管理后台

访问 `/admin` 进入管理后台，使用管理员账号登录。
\`

**Step 3: 提交**

```bash
git add .
git commit -m "docs: add deployment configuration and README"
```

---

## 最终步骤

### Task 13: 初始化 Supabase 项目

**Step 1: 注册 Supabase**

1. 访问 https://supabase.com 注册账号
2. 创建新项目，命名为 "liuyunshoes"
3. 等待项目初始化完成

**Step 2: 运行数据库迁移**

在 Supabase Dashboard 的 SQL Editor 中运行 `supabase/migrations/001_initial_schema.sql` 中的 SQL

**Step 3: 配置存储**

1. 在 Supabase Storage 中创建名为 `products` 的存储桶
2. 设置为 Public 访问
3. 在桶内创建 `original` 和 `thumbnails` 文件夹

**Step 4: 创建管理员账号**

在 SQL Editor 中运行:

```sql
-- 插入管理员（密码: admin123，请登录后修改）
INSERT INTO admins (email, password_hash, name)
VALUES ('admin@liuyunshoes.store', crypt('admin123', gen_salt('bf')), '管理员');
```

**Step 5: 配置本地环境**

创建 `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=你的项目URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=你的anon key
SUPABASE_SERVICE_ROLE_KEY=你的service role key
```

**Step 6: 运行数据迁移**

```bash
node scripts/migrate.js
```

---

### Task 14: 部署到 Vercel

**Step 1: 安装 Vercel CLI**

```bash
npm install -g vercel
```

**Step 2: 登录并部署**

```bash
vercel login
vercel
```

按提示完成配置：
- 选择正确的项目目录
- Vercel 会自动检测 Next.js 项目
- 添加环境变量（从 .env.local 复制）

**Step 3: 配置域名**

1. 在 Vercel 项目设置中添加自定义域名 `liuyunshoes.store`
2. 更新域名 DNS 记录指向 Vercel

**Step 4: 验证部署**

访问 https://www.liuyunshoes.store/ 确认网站正常运行

---

## 总结

完成以上所有任务后，你将拥有：

✅ 现代化的前台展示网站
✅ 功能完整的管理后台
✅ 图片上传和管理功能
✅ 完全免费的托管方案
✅ 数据从旧站点迁移

**下一步建议:**

1. 培训父母使用管理后台
2. 监控网站运行状态
3. 根据反馈持续优化

**命令速查:**

```bash
# 开发
npm run dev

# 构建
npm run build

# 数据迁移
node scripts/migrate.js

# 部署
vercel --prod
```
