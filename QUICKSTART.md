# 🚀 快速启动指南

## 1. 启动开发服务器

```bash
# 如果还未启动，在项目根目录执行
npm run dev
```

访问：http://localhost:5173/

---

## 2. 快速测试流程（推荐新手）

### 方式一：使用 Mock 数据（最简单）

1. **填写基本信息**
   - 智能体名称：`客服助手`
   - 添加标签：`客服`、`AI`（输入后按 Enter）
   - 能力描述：`智能客服助手`

2. **配置 API**
   - API 类型：选择 `知 + 工作流`
   - API 名称：`测试 API`
   - API 地址：**留空**（会自动使用 Mock）
   - 认证类型：`API_KEY`
   - API_KEY：随意填写（如 `test-key`）

3. **启用 Mock 模式**
   - 在"测试输入"区域，勾选 ✅ **使用 Mock 数据**

4. **发送测试**
   - 测试输入：`你好`
   - 点击 **接口测试** 按钮
   - 右侧会显示 Mock 响应数据

5. **配置出参映射**
   - 点击响应 JSON 中的字段（如 `data.answer`）
   - 点击 **添加输出变量**
   - 类型选择：`文本`

6. **保存配置**
   - 点击底部 **直接保存**
   - 看到绿色成功提示 ✅

---

### 方式二：使用真实 API

#### 示例 1：JSONPlaceholder（免费测试 API）

1. **API 配置**
   - API 类型：`知 + 工作流`
   - API 名称：`JSONPlaceholder 测试`
   - API 地址：`https://jsonplaceholder.typicode.com/posts/1`
   - 方法：`GET`
   - 认证类型：`API_KEY`（留空）

2. **测试**
   - 不勾选 Mock
   - 点击 **接口测试**
   - 查看真实响应

#### 示例 2：Dify 平台

1. **获取 API Key**
   - 登录 Dify 平台
   - 进入应用 → 访问 API → 复制 API Key

2. **配置**
   - API 类型：`知 + 工作流`
   - API 地址：`https://api.dify.ai/v1/chat-messages`
   - API_KEY：填入你的 `app-xxxxx`
   - 请求体模板：
   ```json
   {
     "inputs": {},
     "query": "{{USER_INPUT}}",
     "response_mode": "blocking",
     "user": "{{USER_ID}}"
   }
   ```

3. **出参映射**
   - JSONPath：`$.answer`
   - 变量类型：`文本`

---

## 3. 完整功能演示

### 场景：配置一个客服机器人

#### 步骤 1：基本信息
```
名称：电商客服助手
标签：电商、客服、自动回复
描述：处理电商相关咨询，包括订单查询、物流跟踪、退换货政策等
```

#### 步骤 2：API 配置（以 Dify 为例）
```
API 类型：知 + 工作流
API 名称：Dify 电商客服
API 地址：https://api.dify.ai/v1/chat-messages
认证：API_KEY
密钥：app-your-key
```

#### 步骤 3：入参配置
```json
{
  "inputs": {
    "scene": "ecommerce"
  },
  "query": "{{USER_INPUT}}",
  "user_id": "{{USER_ID}}"
}
```

添加业务参数：
- 参数键：`priority`
- 显示标签：`优先级`
- 类型：`下拉选择`
- 选项：`普通、紧急、VIP`

#### 步骤 4：出参配置
1. 点击 **接口测试**
2. 点击响应中的 `$.answer` 字段
3. 添加输出变量：
   - 变量名：`var_answer`
   - 类型：`文本`
   - 描述：`客服回复内容`

#### 步骤 5：保存
点击 **直接保存** ✅

---

## 4. 常见问题

### Q: Mock 模式是什么？
A: Mock 模式不需要真实 API，会返回预设的测试数据，适合快速体验界面交互。

### Q: 如何知道 API 返回的 JSON 结构？
A: 先进行一次接口测试，响应数据会以树状结构显示在右侧。

### Q: JSONPath 怎么用？
A: 点击 JSON 树中的节点，系统会自动生成路径，如：
- 点击第一层：`$.data`
- 点击第二层：`$.data.answer`
- 点击数组：`$.data.items[0].name`

### Q: 变量占位符有哪些？
A: 系统内置：
- `{{USER_INPUT}}` - 用户输入
- `{{SESSION_ID}}` - 会话 ID
- `{{USER_ID}}` - 用户 ID
- `{{TIMESTAMP}}` - 时间戳

### Q: 如何测试流式响应？
A: 
1. 勾选 API 配置中的"流式响应"
2. Dify 平台设置 `response_mode: "streaming"`
3. 系统会自动处理 SSE 流式数据

---

## 5. 界面交互说明

### ✅ 已实现的交互效果

1. **表单验证**
   - 必填项带红色 `*`
   - 未填写时点击保存会显示错误提示
   - 错误提示右上角弹出，5 秒后自动消失

2. **成功提示**
   - 保存成功显示绿色提示
   - 3 秒后自动消失

3. **实时计数**
   - 能力描述：显示 `x / 100`
   - API 描述：显示 `x / 200`

4. **标签管理**
   - 输入后按 Enter 添加
   - 点击 `x` 删除标签

5. **头像上传**
   - 点击上传
   - 实时预览
   - 限制 2M 以内

6. **JSON 编辑器**
   - 点击变量快速插入
   - 格式化按钮
   - 一键复制

7. **JSON 树**
   - 点击展开/折叠
   - 点击节点选中
   - 显示选中路径

---

## 6. 开发者工具

### 查看配置数据
打开浏览器控制台（F12），保存配置时会输出完整配置对象：
```javascript
Saving configuration: { ... }
```

### 导入配置
在控制台执行：
```javascript
// 粘贴你的配置 JSON
const config = {...};
localStorage.setItem('echo-config', JSON.stringify(config));
location.reload();
```

---

## 7. 下一步

- [ ] 配置真实的 MAAS 平台 API
- [ ] 添加更多输出变量（图片、图表等）
- [ ] 配置业务参数
- [ ] 测试完整的对话流程

---

**祝你使用愉快！** 🎉

如有问题，请查看 [TEST_GUIDE.md](./TEST_GUIDE.md) 获取更详细的说明。
