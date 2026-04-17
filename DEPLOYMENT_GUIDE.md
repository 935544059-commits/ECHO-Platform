# 🚀 Vercel 部署更新指南

## ⚠️ 问题原因

**现象**：本地预览有保存确认提示功能，但 Vercel 云上看不到

**原因**：Vercel 部署的是构建后的静态文件，需要重新构建才能更新代码

---

## 🔧 解决方案

### 方案 1：Git 推送自动部署（推荐）✅

```bash
# 1. 提交所有更改
git add .
git commit -m "feat: 添加智能保存确认提示功能"

# 2. 推送到 Git 仓库
git push origin main

# 3. Vercel 会自动检测并重新部署
# 等待 2-3 分钟即可看到更新
```

### 方案 2：Vercel CLI 手动部署

```bash
# 1. 安装 Vercel CLI（如果未安装）
npm i -g vercel

# 2. 登录 Vercel
vercel login

# 3. 部署到生产环境
vercel --prod

# 或者部署到预览环境
vercel
```

### 方案 3：Vercel 仪表板手动触发

1. 访问 [vercel.com](https://vercel.com)
2. 进入你的项目
3. 点击 "Redeploy" 按钮
4. 选择 "Use existing Build Cache" 或 "Rebuild all"

---

## 📋 完整部署流程

### 步骤 1：检查本地更改

```bash
# 查看更改的文件
git status

# 确认包含以下文件：
# - src/App.jsx (保存确认提示)
# - src/context/ConfigContext.jsx (配置状态管理)
# - vercel.json (代理配置)
```

### 步骤 2：提交并推送

```bash
git add .
git commit -m "feat: 实现智能保存功能和 Vercel 代理配置"
git push
```

### 步骤 3：等待 Vercel 部署

```
部署流程：
1. Vercel 检测 Git 推送
2. 自动安装依赖 (npm install)
3. 自动构建项目 (npm run build)
4. 部署到 CDN
5. 更新域名解析

预计时间：2-5 分钟
```

### 步骤 4：验证部署

```bash
# 1. 访问你的 Vercel 域名
https://your-project.vercel.app

# 2. 强制刷新浏览器
Windows: Ctrl + Shift + R
Mac: Cmd + Shift + R

# 3. 清除浏览器缓存
# 或使用无痕模式访问
```

---

## 🔍 验证功能是否正常

### 测试 1：未测试接口保存

1. 填写智能体基本信息
2. 配置 API 信息（不点击测试）
3. 点击底部"保存（未测试接口）"按钮
4. ✅ 应该显示确认提示框

### 测试 2：测试失败后保存

1. 填写智能体基本信息
2. 配置 API 信息（填写错误地址）
3. 点击"接口测试" → 显示失败
4. 点击"保存（接口测试失败）"
5. ✅ 应该显示确认提示框

### 测试 3：正常保存

1. 填写所有信息
2. 点击"接口测试" → 成功
3. 点击"保存配置"
4. ✅ 应该直接保存，不显示提示框

---

## 🐛 常见问题排查

### Q1: 推送后 Vercel 没有自动部署？

**检查清单：**
- [ ] Git 仓库是否正确连接到 Vercel
- [ ] 推送的分支是否是主分支（main/master）
- [ ] Vercel 项目设置中的 Git 集成是否启用

**解决方法：**
```bash
# 检查 Git 远程仓库
git remote -v

# 应该显示你的 GitHub/GitLab 仓库地址
# 如果没有，添加远程仓库
git remote add origin https://github.com/your-username/your-repo.git
```

### Q2: 部署失败？

**查看部署日志：**
1. 访问 Vercel 仪表板
2. 进入项目
3. 点击 "Deployments" 标签
4. 点击失败的部署
5. 查看 "Build Logs"

**常见错误：**
```
❌ Build failed at step "Install Dependencies"
→ 检查 package.json 是否有语法错误

❌ Build failed at step "Build"
→ 检查代码是否有编译错误
→ 运行 npm run build 本地测试
```

### Q3: 部署成功但功能仍不显示？

**可能原因：**
1. 浏览器缓存旧版本
2. CDN 缓存未更新
3. 代码未正确提交

**解决方法：**
```bash
# 1. 强制刷新浏览器
Ctrl + Shift + R (Windows)
Cmd + Shift + R (Mac)

# 2. 清除浏览器缓存
# 或使用无痕模式

# 3. 检查代码是否已提交
git log --oneline -5

# 4. 重新部署
vercel --prod --force
```

### Q4: 如何确认部署的是最新版本？

**方法 1：检查部署时间**
```
Vercel 仪表板 → Deployments → 查看最新部署时间
应该与你的推送时间接近
```

**方法 2：添加版本标识**
在 `package.json` 中修改版本号：
```json
{
  "version": "0.0.2"  // 每次部署前递增
}
```

在代码中添加版本显示：
```jsx
<div className="text-xs text-gray-400">
  版本：{import('../package.json').version}
</div>
```

---

## 📊 部署状态监控

### Vercel 部署阶段

```
┌─────────────────────────────────────┐
│ 1. QUEUED (排队中)                  │
│    等待构建资源                     │
├─────────────────────────────────────┤
│ 2. BUILD IN PROGRESS (构建中)       │
│    - Installing dependencies        │
│    - Running build command          │
├─────────────────────────────────────┤
│ 3. DEPLOYING (部署中)               │
│    上传到 CDN                       │
├─────────────────────────────────────┤
│ 4. READY (就绪)                     │
│    部署成功，可访问                 │
└─────────────────────────────────────┘
```

### 部署成功标志

✅ 部署状态显示 "Ready"
✅ 部署 URL 可访问
✅ 构建日志无错误
✅ 部署时间显示 "Just now"

---

## 🎯 最佳实践

### 1. 提交规范

```bash
# 功能新增
git commit -m "feat: 添加智能保存确认提示"

# Bug 修复
git commit -m "fix: 修复配置状态更新问题"

# 文档更新
git commit -m "docs: 更新部署指南"

# 配置更改
git commit -m "config: 更新 Vercel 代理配置"
```

### 2. 部署前检查清单

```bash
# □ 本地构建测试通过
npm run build

# □ 本地功能测试正常
npm run dev

# □ 代码已提交
git status

# □ 版本号已更新（可选）
cat package.json | grep version
```

### 3. 部署后验证

```bash
# □ 访问 Vercel 域名
# □ 强制刷新浏览器
# □ 测试核心功能
# □ 检查浏览器控制台无错误
```

---

## 🔗 相关资源

- [Vercel 部署文档](https://vercel.com/docs/deployments)
- [Vercel CLI 使用指南](https://vercel.com/docs/cli)
- [自动部署配置](https://vercel.com/docs/git)
- [部署钩子](https://vercel.com/docs/deployments/deployment-hooks)

---

## 📞 需要帮助？

如果按照以上步骤仍无法解决，请提供：

1. Vercel 部署日志截图
2. 浏览器控制台错误信息
3. Git 提交记录 (`git log --oneline -5`)

---

**快速部署命令：**

```bash
git add . && git commit -m "deploy: 更新保存确认功能" && git push
```

然后等待 2-5 分钟，刷新浏览器即可看到更新！🚀
