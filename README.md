# 流云帆布鞋 - 批发网站

现代化的鞋类批发网站，基于 Next.js 和 Supabase 构建。

## 技术栈

- Next.js 15 (App Router)
- Supabase (数据库 + 存储 + 认证)
- Tailwind CSS
- TypeScript

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 配置环境变量

复制 `.env.local.example` 为 `.env.local` 并填入您的 Supabase 配置：

```bash
cp .env.local.example .env.local
```

编辑 `.env.local`：

```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### 3. 运行开发服务器

```bash
npm run dev
```

访问 http://localhost:3000 查看网站。

### 4. 运行数据迁移（可选）

如果您有旧网站的数据需要迁移：

```bash
node scripts/migrate.js
```

## 部署

项目托管在 Vercel 上，推送代码即可自动部署。

### 环境变量设置

在 Vercel 项目设置中添加以下环境变量：

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

## 项目结构

```
liuyunshoes/
├── src/
│   ├── app/              # Next.js App Router
│   │   ├── (shop)/       # 前台页面
│   │   └── admin/        # 管理后台
│   ├── components/       # React 组件
│   │   ├── shop/         # 前台组件
│   │   ├── admin/        # 后台组件
│   │   └── ui/           # UI 组件
│   └── lib/              # 工具函数
├── supabase/             # 数据库迁移
├── scripts/              # 脚本工具
└── public/               # 静态资源
```

## 联系信息

**店主:** 朱文格
**电话:** 15224226812
**地址:** 聊城东昌府区香江一期广场东路西排28
**网址:** https://liuyun.186633.xyz/
