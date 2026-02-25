# Vercel 部署指南

本指南将帮助您将流云帆布鞋网站部署到 Vercel。

## 前置条件

✅ 已完成 Supabase 项目设置
✅ 已拥有 GitHub 账号并推送代码到仓库

## 步骤 1: 注册 Vercel

1. 访问 https://vercel.com
2. 点击 "Sign Up"
3. 使用 GitHub 账号登录

## 步骤 2: 导入项目

1. 点击 "Add New" → "Project"
2. 从 GitHub 导入 `llllllhui/liuyunshoes` 仓库
3. 如果需要，点击 "Configure GitHub" 授权 Vercel 访问您的仓库

## 步骤 3: 配置项目

1. **Framework Preset**: Next.js（自动检测）
2. **Root Directory**: `liuyunshoes`（因为项目在子目录中）

**重要：在构建命令中修改：**
- **Build Command**: `cd liuyunshoes && npm run build`
- **Output Directory**: `liuyunshoes/.next`

## 步骤 4: 设置环境变量

在 "Environment Variables" 部分添加以下变量：

| Name | Value |
|------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | 您的 Supabase 项目 URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | 您的 Supabase anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | 您的 Supabase service role key |

⚠️ **注意：** 这些值应该从 Supabase 项目的 Settings → API 页面复制。

## 步骤 5: 部署

1. 点击 "Deploy"
2. 等待构建完成（约 2-3 分钟）
3. 部署成功后，您会得到一个 `.vercel.app` 域名

## 步骤 6: 配置自定义域名

1. 在项目设置中，点击 **Domains**
2. 点击 **Add Domain**
3. 输入您的域名：`liuyunshoes.store`
4. Vercel 会提供 DNS 记录配置

### DNS 配置

根据您的域名注册商，添加以下 DNS 记录：

**如果使用 A 记录：**
```
Type: A
Name: @
Value: 76.76.21.21
```

**如果使用 CNAME 记录：**
```
Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

5. 等待 DNS 生效（可能需要 24-48 小时）

## 步骤 7: 验证部署

1. 访问 https://www.liuyunshoes.store/
2. 检查以下功能：
   - ✅ 首页正常显示
   - ✅ 导航菜单可点击
   - ✅ 产品分类页面可访问
   - ✅ 管理后台可以登录

## 自动部署

配置完成后，每次您推送代码到 GitHub 主分支，Vercel 会自动部署新版本。

## 更新部署

当您需要更新网站时：

```bash
git add .
git commit -m "描述您的更改"
git push origin main
```

Vercel 会自动构建和部署。

## 环境变量管理

### 在 Vercel Dashboard 中更新环境变量：

1. 进入项目 → **Settings** → **Environment Variables**
2. 添加、编辑或删除变量
3. 重新部署项目以应用更改

### 重新部署：

进入项目 → **Deployments** → 点击最新部署右侧的 "..." → "Redeploy"

## 监控和分析

Vercel 提供：

- **Analytics**: 访问量、页面浏览量
- **Logs**: 部署和函数日志
- **Speed Insights**: 页面加载性能

## 成本

Vercel 免费计划包括：
- ✅ 无限部署
- ✅ 100GB 带宽/月
- ✅ Serverless 函数
- ✅ 自动 HTTPS
- ✅ 全球 CDN

对于小型批发网站，免费计划完全够用。

## 故障排除

### 构建失败
- 检查构建命令是否正确
- 查看 "Build Logs" 了解详细错误

### 环境变量未生效
- 确保变量名称正确（区分大小写）
- 重新部署项目

### 域名无法访问
- 检查 DNS 配置是否正确
- 使用 `nslookup` 或 `dig` 命令检查 DNS 解析

## 安全建议

1. ✅ 使用强密码保护 Supabase
2. ✅ 定期更新依赖包
3. ✅ 监控访问日志
4. ✅ 启用 Vercel 的防火墙功能

## 完成！

您的网站现在应该已经在 https://www.liuyunshoes.store/ 上运行了！

如有问题，请检查：
- Vercel 部署日志
- Supabase 日志
- 浏览器控制台错误
