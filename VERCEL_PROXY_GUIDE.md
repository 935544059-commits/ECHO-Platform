# 🌐 Vercel 代理转发配置指南

## 📋 问题解决

**原问题**：前端直接请求第三方 MAAS 平台 API 出现跨域错误（CORS）

**解决方案**：使用 Vercel Rewrites 功能，将请求转发到代理路径 `/api/proxy`，由 Vercel 服务器端转发请求

---

## 🎯 配置说明

### vercel.json 核心功能

1. **请求转发**：将 `/api/proxy/*` 转发到实际 API 地址
2. **CORS 处理**：添加跨域响应头
3. **多平台支持**：支持不同 MAAS 平台的转发

---

## 📝 路由规则

### 1. 默认路由（Dify）
```
前端请求：https://your-domain.vercel.app/api/proxy/chat-messages
实际转发：https://api.dify.ai/v1/chat-messages
```

### 2. Dify 平台
```
前端请求：https://your-domain.vercel.app/api/proxy/dify/chat-messages
实际转发：https://api.dify.ai/v1/chat-messages
```

### 3. Coze 平台
```
前端请求：https://your-domain.vercel.app/api/proxy/coze/chat
实际转发：https://api.coze.com/v1/chat
```

### 4. 九天平台
```
前端请求：https://your-domain.vercel.app/api/proxy/jiutian/api
实际转发：https://api.jiutian.cn/api
```

### 5. 测试端点
```
前端请求：https://your-domain.vercel.app/api/proxy/test/post
实际转发：https://httpbin.org/post
```

---

## 🔧 使用方法

### 方式 1：直接修改 API 地址

在前端代码中，将 API 地址改为代理地址：

**原地址：**
```javascript
const apiUrl = 'https://api.dify.ai/v1/chat-messages';
```

**改为：**
```javascript
const apiUrl = 'https://your-domain.vercel.app/api/proxy/dify/chat-messages';
```

### 方式 2：动态拼接

```javascript
const platform = 'dify'; // 或 'coze', 'jiutian'
const endpoint = 'chat-messages';
const proxyUrl = `https://your-domain.vercel.app/api/proxy/${platform}/${endpoint}`;
```

### 方式 3：在配置中心中使用

在智能体接入配置中心的 API 地址栏填写：
```
https://your-domain.vercel.app/api/proxy/dify/chat-messages
```

---

## 🔐 认证处理

### 方式 1：在请求头中传递

```javascript
fetch('https://your-domain.vercel.app/api/proxy/dify/chat-messages', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_API_KEY',
    'X-API-Key': 'YOUR_API_KEY'
  },
  body: JSON.stringify({
    query: '你好'
  })
});
```

### 方式 2：在请求体中包含

```javascript
fetch('https://your-domain.vercel.app/api/proxy/dify/chat-messages', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    query: '你好',
    api_key: 'YOUR_API_KEY'  // 如果 API 支持
  })
});
```

---

## 🧪 测试方法

### 测试 1：使用 httpbin 测试
```bash
curl -X POST https://your-domain.vercel.app/api/proxy/test/post \
  -H "Content-Type: application/json" \
  -d '{"test": "data"}'
```

### 测试 2：测试 Dify API
```bash
curl https://your-domain.vercel.app/api/proxy/dify/chat-messages \
  -X POST \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -d '{"query": "你好", "response_mode": "blocking"}'
```

### 测试 3：浏览器测试
```javascript
// 在浏览器控制台执行
fetch('https://your-domain.vercel.app/api/proxy/test/headers', {
  method: 'GET'
})
.then(res => res.json())
.then(data => console.log(data));
```

---

## 📊 跨域头说明

vercel.json 中配置的 CORS 头：

```json
{
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, PATCH, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-API-Key, X-Bearer-Token, X-Target-Platform, X-Custom-Header",
  "Access-Control-Max-Age": "86400"
}
```

**说明：**
- `Access-Control-Allow-Origin`: 允许所有来源（生产环境建议指定域名）
- `Access-Control-Allow-Methods`: 允许的 HTTP 方法
- `Access-Control-Allow-Headers`: 允许的请求头
- `Access-Control-Max-Age`: 预检请求缓存时间（24 小时）

---

## 🚀 部署步骤

### 步骤 1：提交配置
```bash
git add vercel.json
git commit -m "Add Vercel proxy configuration"
git push
```

### 步骤 2：Vercel 自动部署
- Vercel 会自动检测 vercel.json 并应用配置
- 等待部署完成（约 1-2 分钟）

### 步骤 3：验证配置
```bash
# 测试代理是否工作
curl https://your-domain.vercel.app/api/proxy/test/get
```

---

## 🎨 完整示例

### React 组件示例

```jsx
import { useState } from 'react';

function AgentTest() {
  const [response, setResponse] = useState(null);

  const handleTest = async () => {
    try {
      const res = await fetch(
        'https://your-domain.vercel.app/api/proxy/dify/chat-messages',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer app-xxxxxxxxxxxxx'
          },
          body: JSON.stringify({
            query: '你好，请介绍一下你自己',
            response_mode: 'blocking',
            user: 'user-123'
          })
        }
      );

      const data = await res.json();
      setResponse(data);
      console.log('Response:', data);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div>
      <button onClick={handleTest}>测试 API</button>
      {response && <pre>{JSON.stringify(response, null, 2)}</pre>}
    </div>
  );
}
```

### 在配置中心中使用

修改 `ApiBasicConfig.jsx` 中的测试逻辑：

```javascript
const handleSendTest = async () => {
  setIsLoading(true);
  
  try {
    // 使用代理地址
    const proxyUrl = `https://your-domain.vercel.app/api/proxy/${config.apiConfig.apiType}/${endpoint}`;
    
    const response = await fetch(proxyUrl, {
      method: config.apiConfig.method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': config.apiConfig.authType === 'API_KEY' 
          ? config.apiConfig.apiKey 
          : `Bearer ${config.apiConfig.bearerToken}`
      },
      body: processedBody
    });

    const data = await response.json();
    setTestResponse(data, null);
  } catch (error) {
    setTestResponse(null, error.message);
  } finally {
    setIsLoading(false);
  }
};
```

---

## 🔒 生产环境建议

### 1. 限制允许的源
```json
{
  "key": "Access-Control-Allow-Origin",
  "value": "https://your-domain.com"
}
```

### 2. 添加速率限制
在 Vercel 仪表板中配置：
- 免费计划：100GB-小时/月
- 付费计划：更高限制

### 3. 使用环境变量
```json
{
  "rewrites": [
    {
      "source": "/api/proxy/dify/:path*",
      "destination": "https://api.dify.ai/v1/:path*"
    }
  ]
}
```

然后在代码中使用环境变量：
```javascript
const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'https://your-domain.vercel.app';
```

### 4. 添加认证验证
创建 Vercel Function 验证请求：

```javascript
// api/proxy/verify.js
export default function handler(req, res) {
  const apiKey = req.headers['x-api-key'];
  
  if (!apiKey || apiKey !== process.env.API_KEY) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  // 转发请求
  // ...
}
```

---

## 🐛 常见问题

### Q1: 配置后仍然跨域？
**A**: 
1. 检查 vercel.json 是否正确提交
2. 确认 Vercel 已重新部署
3. 清除浏览器缓存
4. 检查请求地址是否正确

### Q2: 404 错误？
**A**: 
1. 检查路径是否匹配
2. 确认目标 API 地址正确
3. 查看 Vercel 部署日志

### Q3: 502/504 错误？
**A**: 
1. 目标 API 可能不可用
2. 检查网络连接
3. 查看 Vercel Function 超时设置

### Q4: 如何调试？
**A**: 
```bash
# 查看 Vercel 日志
vercel logs your-project

# 本地测试
curl -v https://your-domain.vercel.app/api/proxy/test/headers
```

---

## 📚 参考资料

- [Vercel Rewrites 文档](https://vercel.com/docs/project-configuration#rewrites)
- [Vercel Headers 文档](https://vercel.com/docs/project-configuration#headers)
- [CORS 配置指南](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS)

---

## 🎯 下一步

1. ✅ 提交 vercel.json 到 Git
2. ✅ 等待 Vercel 自动部署
3. ✅ 测试代理是否工作
4. ✅ 修改前端代码使用代理地址
5. ✅ 验证跨域问题已解决

---

**配置完成！现在可以解决跨域问题了！** 🎉
