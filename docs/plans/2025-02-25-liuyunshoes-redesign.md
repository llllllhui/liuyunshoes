# 流云帆布鞋网站重构设计文档

**项目:** 流云帆布鞋批发网站重构
**日期:** 2025-02-25
**负责人:** llllllhui

---

## 1. 项目概述

### 1.1 背景
流云帆布鞋是位于山东聊城的鞋类批发商，当前网站为简单的静态 HTML 页面，需要全面重构以提升用户体验、管理效率和品牌形象。

### 1.2 目标
- 现代化网站设计，提升品牌形象
- 优化用户体验，方便客户浏览和联系
- 提供管理后台，简化产品更新流程
- 完全免费运行，零运维成本

### 1.3 现有网站分析
- **URL:** https://www.liuyunshoes.store/
- **技术栈:** 纯 HTML + CSS + JavaScript
- **产品分类:** 新品(27)、热销(24)、经典(36)
- **管理方式:** Python 脚本 + 手动编辑 HTML

---

## 2. 技术方案

### 2.1 技术选型

| 层级 | 技术 | 说明 |
|------|------|------|
| 前端框架 | Next.js 14 (App Router) | React 框架，支持 SSG/SSR |
| UI 组件 | shadcn/ui | 现代化组件库 |
| 样式 | Tailwind CSS | 原子化 CSS |
| 状态管理 | Zustand | 轻量级状态管理 |
| 后端服务 | Supabase | 数据库 + 存储 + 认证 |
| 部署平台 | Vercel | 自动部署 + 全球 CDN |
| 图片处理 | Sharp | 服务端图片压缩 |

### 2.2 架构图

```
┌─────────────────────────────────────────────────────────────────┐
│                        用户 (浏览器)                              │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Vercel Edge Network                           │
└─────────────────────────────────────────────────────────────────┘
                                │
                ┌───────────────┴───────────────┐
                ▼                               ▼
┌──────────────────────────┐    ┌──────────────────────────┐
│      前台网站             │    │      管理后台             │
│  (Next.js 静态生成)       │    │  (Next.js 服务端渲染)     │
│  - 首页                   │    │  - 登录认证              │
│  - 产品分类页             │    │  - 产品管理              │
│  - 产品图片展示           │    │  - 图片上传              │
│  - 联系信息               │    │  - 订单咨询管理           │
└──────────────────────────┘    └──────────────────────────┘
                │                               │
                └───────────────┬───────────────┘
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Supabase (后端服务)                          │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐ │
│  │  PostgreSQL │  │  Storage    │  │    Auth                 │ │
│  │  数据库      │  │  图片存储   │  │    管理员认证            │ │
│  │  - 产品数据  │  │  - 产品图   │  │    - 邮箱密码           │ │
│  │  - 分类标签  │  │   片缩略图 │  │                         │ │
│  │  - 咨询记录  │  │            │  │                         │ │
│  └─────────────┘  └─────────────┘  └─────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

### 2.3 项目结构

```
liuyunshoes/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (shop)/            # 前台路由组
│   │   │   ├── page.tsx       # 首页
│   │   │   ├── products/
│   │   │   │   ├── page.tsx   # 产品列表页
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx # 产品详情
│   │   │   ├── new/           # 新品页面
│   │   │   ├── hot/           # 热销页面
│   │   │   └── classic/       # 经典页面
│   │   ├── admin/             # 管理后台
│   │   │   ├── login/         # 登录页
│   │   │   ├── page.tsx       # 后台首页
│   │   │   ├── products/      # 产品管理
│   │   │   ├── upload/        # 批量上传
│   │   │   └── inquiries/     # 咨询管理
│   │   ├── api/               # API 路由
│   │   │   ├── products/
│   │   │   ├── upload/
│   │   │   └── auth/
│   │   ├── layout.tsx         # 根布局
│   │   └── globals.css        # 全局样式
│   ├── components/            # 组件
│   │   ├── ui/                # shadcn/ui 组件
│   │   ├── shop/              # 前台组件
│   │   ├── admin/             # 后台组件
│   │   └── providers/         # Context Providers
│   ├── lib/                   # 工具函数
│   │   ├── supabase.ts
│   │   ├── utils.ts
│   │   └── image-utils.ts
│   ├── hooks/                 # 自定义 Hooks
│   └── types/                 # TypeScript 类型
├── public/                    # 静态资源
├── supabase/                  # Supabase 配置
│   ├── migrations/            # 数据库迁移
│   └── seed.sql               # 初始数据
├── next.config.mjs
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

---

## 3. 功能设计

### 3.1 前台功能

#### 页面列表
| 路由 | 功能 |
|------|------|
| `/` | 首页 - Hero横幅、热门产品、店铺介绍 |
| `/products/new` | 新品列表 |
| `/products/hot` | 热销列表 |
| `/products/classic` | 经典款列表 |
| `/products/[id]` | 产品详情大图 |

#### UI/UX 特性
- 响应式设计（手机/平板/桌面）
- 图片懒加载 + 无限滚动
- 图片灯箱（点击放大）
- 一键拨号（移动端）
- 暗色模式
- 实时搜索 + 分类筛选

### 3.2 管理后台功能

#### 页面列表
| 路由 | 功能 |
|------|------|
| `/admin/login` | 管理员登录 |
| `/admin` | 数据仪表盘 |
| `/admin/products` | 产品管理（增删改） |
| `/admin/upload` | 批量上传图片 |
| `/admin/inquiries` | 客户咨询记录 |
| `/admin/settings` | 店铺信息设置 |

#### 核心功能
- 拖拽上传图片
- 自动压缩 + 生成缩略图
- 批量操作（移动分类、删除）
- 产品排序
- 简单直观的界面

---

## 4. 数据库设计

### 4.1 数据表

**products (产品表)**
```sql
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(200) NOT NULL,
  category VARCHAR(20) NOT NULL, -- 'new' | 'hot' | 'classic'
  description TEXT,
  price DECIMAL(10,2),
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

**product_images (产品图片表)**
```sql
CREATE TABLE product_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  image_url VARCHAR(500) NOT NULL,
  thumbnail_url VARCHAR(500),
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);
```

**inquiries (客户咨询表)**
```sql
CREATE TABLE inquiries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name VARCHAR(100),
  customer_phone VARCHAR(20),
  product_id UUID REFERENCES products(id),
  message TEXT,
  status VARCHAR(20) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT NOW()
);
```

**admins (管理员表)**
```sql
CREATE TABLE admins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(100),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### 4.2 存储桶

| 桶名 | 用途 | 权限 |
|------|------|------|
| `products` | 产品原图 | 公开 |
| `thumbnails` | 产品缩略图 | 公开 |

---

## 5. 部署方案

### 5.1 服务配置

| 服务 | 免费额度 | 用途 |
|------|----------|------|
| Vercel | 100GB 带宽/月 | 网站托管 |
| Supabase | 500MB 存储 + 2GB 数据库 | 后端服务 |

### 5.2 环境变量

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# 管理员邮箱（初始化）
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=initial-password
```

---

## 6. 迁移计划

### 6.1 数据迁移

```
现有文件系统 → 新数据库
├── new_product/      → products (category: 'new')
├── hot_product/      → products (category: 'hot')
├── typical_product/  → products (category: 'classic')
└── picture/          → 产品展示图片
```

### 6.2 上线步骤

```
阶段 1: 开发 (1-2周)
├── 项目初始化
├── 前台开发
├── 后台开发
└── 功能测试

阶段 2: 数据迁移 (1天)
├── 备份现有数据
├── 迁移到数据库
└── 验证完整性

阶段 3: 部署上线 (1天)
├── 配置 Vercel
├── 配置 Supabase
├── 域名配置
└── 正式上线

阶段 4: 培训监控 (1周)
├── 培训使用后台
├── 监控运行状态
└── 收集反馈优化
```

### 6.3 兼容性

- 保留旧图片路径重定向
- 保留 Python 脚本作为备用
- 渐进式迁移，先测试后切换

---

## 7. 成本总结

| 项目 | 费用 | 备注 |
|------|------|------|
| 域名 | ¥0 | 已有 |
| Vercel 托管 | ¥0 | 免费计划 |
| Supabase | ¥0 | 免费层 |
| **总成本** | **¥0** | 完全免费 |

---

## 8. 联系信息

**店主:** 朱文格
**电话:** 15224226812
**地址:** 聊城东昌府区香江一期广场东路西排28
**网址:** https://www.liuyunshoes.store/
