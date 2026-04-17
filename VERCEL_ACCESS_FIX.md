# 🔧 Vercel 部署访问问题排查指南

## 📋 快速诊断

### 问题 1: 部署失败或构建错误

#### 检查步骤
1. 访问 [vercel.com](https://vercel.com)
2. 进入你的项目
3. 点击 "Deployments" 标签
4. 查看最新部署状态

#### 如果显示 "Failed" 或 "Error"
```bash
# 1. 点击失败的部署
# 2. 查看 "Build Logs"
# 3. 查找错误信息

# 常见错误：
❌ Build failed at step "Install Dependencies"
→ package.json 有语法错误
→ 依赖包版本冲突

❌ Build failed at step "Build"
→ 代码有编译错误
→ TypeScript 类型错误
→ 缺少依赖

❌ Build failed at step "Deploy"
→ 文件权限问题
→ 超出 Vercel 限制
```

#### 解决方法
```bash
# 本地测试构建
npm run build

# 如果有错误，修复后重新部署
git add .
git commit -m "fix: 修复构建错误"
git push
```

---

### 问题 2: 部署成功但访问显示 404

#### 可能原因
1. **路由配置问题**
2. **SPA 刷新 404**
3. **自定义域名配置错误**

#### 解决方案

**方案 1: 添加重定向规则（推荐）**

创建或修改 `vercel.json`:
```json
{
  "rewrites": [
    {
      "source": "/((?!api/.*).*)",
      "destination": "/index.html"
    }
  ]
}
```

**方案 2: 使用 Vercel 配置文件**

创建 `vercel.json`:
```json
{
  "routes": [
    {
      "src": "/[^?]+",
      "dest": "/index.html"
    }
  ]
}
```

**方案 3: 如果是 React Router**

在 `vite.config.js` 中添加:
```javascript
export default defineConfig({
  plugins: [react()],
  server: {
    historyApiFallback: true
  }
});
```

---

### 问题 3: 访问显示空白页面

#### 检查浏览器控制台
```
按 F12 打开开发者工具
查看 Console 标签
查找红色错误信息
```

#### 常见错误

**错误 1: Failed to load resource**
```
原因：静态资源路径错误
解决：检查 vite.config.js 中的 base 配置
```

**错误 2: Cannot find module**
```
原因：依赖未正确安装
解决：重新部署，清除构建缓存
```

**错误 3: CORS error**
```
原因：跨域请求被阻止
解决：使用 vercel.json 配置代理
```

---

### 问题 4: 国内用户访问慢或无法访问

#### 原因
- Vercel 服务器在海外
- 国内网络限制
- CDN 未优化

#### 解决方案

**方案 1: 使用国内 CDN 加速**
```
1. 购买国内 CDN 服务（阿里云、腾讯云）
2. 配置 CNAME 到 Vercel 域名
3. 用户通过 CDN 访问
```

**方案 2: 使用 Vercel 亚洲节点**
```json
{
  "regions": ["hnd1", "icn1"]  // 东京、首尔节点
}
```

**方案 3: 自定义域名**
```
1. 购买国内可访问的域名
2. 在 Vercel 配置自定义域名
3. 使用 Cloudflare CDN（可选）
```

---

### 问题 5: 显示 "Deployment in progress"

#### 解决方法
```
1. 等待部署完成（2-5 分钟）
2. 刷新 Deployments 页面
3. 如果卡住超过 10 分钟，取消部署重新部署
```

---

### 问题 6: 自定义域名无法访问

#### 检查清单
- [ ] DNS 记录已正确配置
- [ ] SSL 证书已生成
- [ ] 域名已在 Vercel 绑定

#### DNS 配置
```
类型：CNAME
名称：@ 或 www
值：cname.vercel-dns.com
TTL: 自动
```

#### 验证 DNS
```bash
# 使用 ping 命令
ping your-domain.com

# 应该解析到 Vercel 的 IP
```

---

## 🔍 完整排查流程

### 步骤 1: 检查部署状态

```bash
# 访问 Vercel 仪表板
https://vercel.com/dashboard

# 查看项目状态
Your Project → Deployments

# 确认：
✅ 最新部署状态为 "Ready"
✅ 部署时间正常
✅ 没有错误日志
```

### 步骤 2: 检查部署日志

```
1. 点击最新部署
2. 查看 "Build Logs"
3. 查找警告或错误

# 常见警告：
⚠️  "Function duration exceeded"
→ 优化代码性能

⚠️  "Bundle size too large"
→ 减少依赖包大小
```

### 步骤 3: 测试访问

```bash
# 1. 使用 Vercel 提供的域名
https://your-project.vercel.app

# 2. 使用无痕模式访问
# 避免浏览器缓存影响

# 3. 使用不同设备测试
手机、平板、其他电脑

# 4. 使用在线工具测试
https://www.websiteplanet.com/zh-hans/webtools/down-for-everyone-or-just-me/
```

### 步骤 4: 检查网络

```bash
# 1. ping 测试
ping your-project.vercel.app

# 2. traceroute 测试
traceroute your-project.vercel.app

# 3. DNS 解析测试
nslookup your-project.vercel.app
```

### 步骤 5: 清除缓存

```bash
# Vercel 清除缓存
vercel --prod --force

# 或手动清除
Vercel Dashboard → Settings → Git → Ignored Build Step
设置为空，强制重新构建
```

---

## 🛠️ 常见解决方案

### 解决方案 1: 重新部署

```bash
# 方法 1: Git 推送
git commit --allow-empty -m "trigger redeploy"
git push

# 方法 2: Vercel CLI
vercel --prod --force

# 方法 3: Vercel 仪表板
Dashboard → Deployments → 点击 "Redeploy"
```

### 解决方案 2: 检查环境变量

```
Vercel Dashboard → Settings → Environment Variables

确认：
✅ 所有必需的环境变量已添加
✅ 环境变量值正确
✅ 环境变量作用域正确（Production/Preview）
```

### 解决方案 3: 检查构建输出

```bash
# 本地构建
npm run build

# 检查 dist 目录
ls dist/

# 应该包含：
✅ index.html
✅ assets/ 目录
✅ 其他静态资源
```

### 解决方案 4: 添加错误边界

创建 `src/components/ErrorBoundary.jsx`:
```jsx
import { Component } from 'react';

export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 bg-red-50 border border-red-200 rounded">
          <h2>出错了</h2>
          <p>{this.state.error?.message}</p>
        </div>
      );
    }
    return this.props.children;
  }
}
```

在 `src/main.jsx` 中使用:
```jsx
<ErrorBoundary>
  <App />
</ErrorBoundary>
```

---

## 📊 访问测试工具

### 在线测试
1. [Down For Everyone Or Just Me](https://downforeveryoneorjustme.com/)
2. [Is It Down Right Now](https://www.isitdownrightnow.com/)
3. [Website Planet](https://www.websiteplanet.com/zh-hans/webtools/down-for-everyone-or-just-me/)

### 浏览器开发者工具
```
F12 → Network 标签
查看：
- 请求状态码
- 加载时间
- 失败请求
```

### 命令行测试
```bash
# curl 测试
curl -I https://your-project.vercel.app

# 应该返回 200 OK
```

---

## 🎯 预防措施

### 1. 部署前检查

```bash
# 本地构建测试
npm run build

# 本地预览测试
npm run preview

# 检查文件大小
ls -lh dist/

# 检查依赖
npm ls --depth=0
```

### 2. 使用预部署钩子

创建 `.vercelignore`:
```
node_modules
.git
*.log
.DS_Store
```

修改 `package.json`:
```json
{
  "scripts": {
    "predeploy": "npm run build && npm run lint",
    "deploy": "vercel --prod"
  }
}
```

### 3. 监控部署

```
Vercel Dashboard → Analytics
开启：
- Web Vitals
- Bandwidth
- Function Invocations
```

---

## 📞 获取帮助

### 提供以下信息以便快速定位问题

1. **Vercel 项目链接**
   ```
   https://vercel.com/your-username/your-project
   ```

2. **访问地址**
   ```
   https://your-project.vercel.app
   ```

3. **错误截图**
   - Vercel 部署日志
   - 浏览器控制台错误
   - 访问时的错误页面

4. **Git 信息**
   ```bash
   git log --oneline -5
   git status
   ```

5. **构建信息**
   ```bash
   npm run build 2>&1 | tail -20
   ```

---

## 🚀 快速修复命令

### 一键部署
```bash
git add . && git commit -m "fix: 修复访问问题" && git push
```

### 强制重新部署
```bash
vercel --prod --force
```

### 查看部署状态
```bash
vercel ls
```

### 查看部署日志
```bash
vercel logs
```

---

## ✅ 验证清单

部署后，确认以下项目：

- [ ] Vercel 显示 "Ready"
- [ ] 访问 Vercel 域名正常
- [ ] 浏览器控制台无错误
- [ ] 所有资源加载成功
- [ ] 不同设备测试正常
- [ ] 不同网络环境测试正常
- [ ] 移动端适配正常
- [ ] 核心功能测试通过

---

**按照以上步骤排查，99% 的访问问题都能解决！** 💪

如果仍有问题，请提供上述信息，我会帮你详细诊断！
