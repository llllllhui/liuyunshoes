# Supabase 设置指南

本指南将帮助您设置 Supabase 项目以支持流云帆布鞋网站。

## 步骤 1: 注册 Supabase

1. 访问 https://supabase.com
2. 点击 "Start your project"
3. 使用 GitHub 账号登录

## 步骤 2: 创建新项目

1. 点击 "New Project"
2. 填写项目信息：
   - **Name:** `liuyunshoes`
   - **Database Password:** 设置一个强密码（请保存好）
   - **Region:** 选择离您最近的区域（推荐 Northeast Asia (Seoul)）
3. 点击 "Create new project"
4. 等待项目初始化（约 2 分钟）

## 步骤 3: 获取 API 密钥

1. 在项目左侧菜单，点击 **Settings** → **API**
2. 复制以下信息：
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon public**: `eyJhbGci...`
   - **service_role**: `eyJhbGci...`（⚠️ 保密！）

## 步骤 4: 运行数据库迁移

1. 在左侧菜单，点击 **SQL Editor**
2. 点击 "New query"
3. 复制 `supabase/migrations/001_initial_schema.sql` 的内容
4. 粘贴到编辑器中
5. 点击 "Run" 执行

## 步骤 5: 配置存储

1. 在左侧菜单，点击 **Storage**
2. 点击 "Create a new bucket"
3. 设置：
   - **Name:** `products`
   - **Public bucket:** ✅ 勾选（公开访问）
4. 点击 "Create bucket"

## 步骤 6: 设置存储桶权限

1. 点击 `products` 桶
2. 点击 **Policies** 标签
3. 为 `products` 桶添加以下策略（点击 "New Policy" → "Get started quickly"）：

**公开读取策略:**
```sql
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
TO anon
USING ( bucket_id = 'products' );
```

**认证用户上传策略:**
```sql
CREATE POLICY "Auth Upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK ( bucket_id = 'products' );
```

## 步骤 7: 创建管理员账号

在 SQL Editor 中运行以下命令创建管理员账号：

```sql
-- 插入管理员（密码: Admin123!@#，请登录后立即修改）
INSERT INTO admins (email, password_hash, name)
VALUES (
  'admin@liuyun.186633.xyz',
  crypt('Admin123!@#', gen_salt('bf')),
  '管理员'
);
```

## 步骤 8: 配置本地环境

1. 复制环境变量文件：
```bash
cp .env.local.example .env.local
```

2. 编辑 `.env.local`，填入您在第 3 步复制的密钥：

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

## 步骤 9: 运行数据迁移（可选）

如果您有旧网站数据需要迁移：

```bash
node scripts/migrate.js
```

## 步骤 10: 测试

1. 启动开发服务器：
```bash
npm run dev
```

2. 访问测试：
   - 前台: http://localhost:3000
   - 管理后台: http://localhost:3000/admin
   - 登录邮箱: `admin@liuyun.186633.xyz`
   - 登录密码: `Admin123!@#`

## 故障排除

### 问题：无法连接到 Supabase
- 检查 `.env.local` 中的 URL 和密钥是否正确
- 确保网络连接正常

### 问题：上传图片失败
- 检查存储桶是否已创建
- 检查存储桶策略是否正确设置
- 确保已安装 `sharp` 包

### 问题：登录失败
- 确认已在 `admins` 表中创建了账号
- 检查邮箱和密码是否正确

## 安全提醒

⚠️ **重要：**
- 永远不要将 `SUPABASE_SERVICE_ROLE_KEY` 提交到 Git
- `.env.local` 文件已在 `.gitignore` 中
- 在生产环境中使用强密码
- 完成设置后修改默认管理员密码

## 下一步

完成 Supabase 设置后：
1. ✅ 测试网站功能
2. ✅ 运行数据迁移
3. ✅ 部署到 Vercel
