# 🎨 动态表单生成系统 - 功能演示指南

## 📋 功能概述

我们已经成功实现了一套完整的**智能体业务参数动态配置系统**，让管理员能够：

1. ✅ 定义自定义业务参数（变量标识、显示文本、交互类型、数据约束）
2. ✅ 将参数拖入请求体模板的任何位置
3. ✅ 即时预览对话端 UI 效果
4. ✅ 自动生成最终请求体

---

## 🎯 核心功能

### 1️⃣ 增强型业务参数配置弹窗

**支持 6 种交互类型：**

| 类型 | 图标 | 用途 | 配置项 |
|------|------|------|--------|
| 📝 单行文本 | Input | 短文本输入 | 占位提示语 |
| 📄 多行文本 | Textarea | 长文本描述 | 占位提示语 |
| 📋 下拉选择 | Select | 从预设选项选择 | 选项列表 (Label/Value) |
| 🔘 开关 | Switch | 布尔值切换 | 默认开/关 |
| 📊 滑块 | Slider | 数值范围选择 | 最小值、最大值、步长 |
| 🔢 数字输入 | Number | 精确数值输入 | 最小值、最大值、步长 |

**每个参数包含的元数据：**
```javascript
{
  id: "1234567890",           // 唯一标识
  key: "style",                // 变量标识（用于占位符）
  label: "文案风格",           // 显示文本
  uiType: "select",            // 交互类型
  required: true,              // 是否必填
  placeholder: "请选择风格",   // 占位提示语（Input/Textarea）
  options: [                   // 选项列表（Select）
    { label: "正式", value: "formal" },
    { label: "幽默", value: "humorous" }
  ],
  defaultValue: "formal",      // 默认值
  min: 0,                      // 最小值（Slider/Number）
  max: 100,                    // 最大值
  step: 1                      // 步长
}
```

---

### 2️⃣ 变量拾取器

**自动分类显示：**

#### 内置变量（系统提供）
- 💬 `USER_INPUT` - 用户输入的文本内容
- 🔗 `SESSION_ID` - 当前会话 ID
- ⏰ `TIMESTAMP` - 当前时间戳
- 👤 `USER_ID` - 用户 ID

#### 业务参数（管理员定义）
- 📋 `{{STYLE}}` - 业务参数：文案风格
- 🔢 `{{MAX_TOKENS}}` - 业务参数：最大 Token 数
- 📝 `{{TEMPERATURE}}` - 业务参数：温度参数

**使用方法：**
1. 点击任意变量
2. 自动插入到光标位置
3. 格式为 `{{变量名}}`

---

### 3️⃣ 对话端 UI 预览

**实时渲染管理员配置的表单：**

#### 预览区功能
- ✅ 自动根据 `uiType` 渲染对应组件
- ✅ 支持必填项标记（红色 *）
- ✅ 支持默认值显示
- ✅ 支持实时交互测试
- ✅ 可折叠/展开

#### 示例场景

**场景 1：文案风格选择**
```javascript
// 配置
{
  key: "style",
  label: "文案风格",
  uiType: "select",
  options: [
    { label: "正式", value: "formal" },
    { label: "幽默", value: "humorous" },
    { label: "诗意", value: "poetic" }
  ],
  defaultValue: "formal"
}

// 预览效果：下拉选择框
```

**场景 2：创意度调节**
```javascript
// 配置
{
  key: "temperature",
  label: "创意度",
  uiType: "slider",
  min: 0,
  max: 1,
  step: 0.1,
  defaultValue: 0.7
}

// 预览效果：滑块（0 - 1，步长 0.1）
```

**场景 3：是否启用联网搜索**
```javascript
// 配置
{
  key: "enable_search",
  label: "启用联网搜索",
  uiType: "switch",
  defaultValue: false
}

// 预览效果：开关按钮
```

---

### 4️⃣ 请求体模板动态渲染

**智能占位符替换引擎：**

#### 工作流程

```
1. 管理员配置请求体模板
   {
     "query": "{{USER_INPUT}}",
     "style": "{{STYLE}}",
     "temperature": {{TEMPERATURE}}
   }

2. 系统扫描模板提取变量
   → 提取：USER_INPUT, STYLE, TEMPERATURE

3. 合并多源变量
   - 内置变量：USER_INPUT = "用户输入"
   - 业务参数：STYLE = "formal", TEMPERATURE = 0.7

4. 生成最终请求体
   {
     "query": "用户输入",
     "style": "formal",
     "temperature": 0.7
   }
```

#### 智能类型处理

```javascript
// 字符串 - 自动添加引号
"{{STYLE}}" → "formal"

// 数字 - 不添加引号
{{TEMPERATURE}} → 0.7

// 布尔值 - 不添加引号
{{ENABLE_SEARCH}} → true

// 对象 - JSON 序列化
{{OPTIONS}} → {"key": "value"}
```

---

## 🛠️ 使用指南

### 步骤 1：添加业务参数

1. 点击 **"添加业务参数"** 按钮
2. 填写基础配置：
   - 变量标识：`style`
   - 显示文本：`文案风格`
   - 交互类型：选择 `下拉选择`
   - 勾选 `必填项`
3. 配置数据约束：
   - 添加选项：正式/幽默/诗意
4. 设置默认值：`正式`
5. 点击 **保存**

---

### 步骤 2：插入占位符

1. 在右侧变量拾取器找到 `{{STYLE}}`
2. 点击变量
3. 自动插入到请求体模板

**示例模板：**
```json
{
  "query": "{{USER_INPUT}}",
  "style": "{{STYLE}}",
  "temperature": {{TEMPERATURE}}
}
```

---

### 步骤 3：预览对话端 UI

1. 点击右上角 **"对话端预览"** 按钮
2. 查看自动生成的表单
3. 测试各个组件的交互
4. 调整参数值查看效果

---

### 步骤 4：预览请求体

1. 点击 **"查看请求预览"** 按钮
2. 查看：
   - 模板中的变量列表
   - 变量映射关系
   - 最终生成的 JSON 请求体
3. 验证请求体是否符合预期

---

## 📊 完整示例

### 示例：配置一个写作助手智能体

#### 1. 添加业务参数

**参数 1：文案风格**
```javascript
{
  key: "style",
  label: "文案风格",
  uiType: "select",
  required: true,
  options: [
    { label: "正式", value: "formal" },
    { label: "幽默", value: "humorous" },
    { label: "诗意", value: "poetic" },
    { label: "简洁", value: "concise" }
  ],
  defaultValue: "formal"
}
```

**参数 2：创意度**
```javascript
{
  key: "temperature",
  label: "创意度",
  uiType: "slider",
  min: 0,
  max: 1,
  step: 0.1,
  defaultValue: 0.7
}
```

**参数 3：最大长度**
```javascript
{
  key: "max_tokens",
  label: "最大长度",
  uiType: "number",
  min: 100,
  max: 4000,
  step: 100,
  defaultValue: 1000
}
```

**参数 4：启用联网搜索**
```javascript
{
  key: "enable_search",
  label: "启用联网搜索",
  uiType: "switch",
  defaultValue: false
}
```

---

#### 2. 配置请求体模板

```json
{
  "query": "{{USER_INPUT}}",
  "parameters": {
    "style": "{{STYLE}}",
    "temperature": {{TEMPERATURE}},
    "max_tokens": {{MAX_TOKENS}},
    "enable_search": {{ENABLE_SEARCH}}
  },
  "session_id": "{{SESSION_ID}}",
  "user_id": "{{USER_ID}}"
}
```

---

#### 3. 对话端 UI 预览

预览区自动渲染：

```
┌─────────────────────────────────────┐
│ 文案风格 *                          │
│ ┌─────────────────────────────┐    │
│ │ 正式                         ▼│    │
│ └─────────────────────────────┘    │
│                                     │
│ 创意度                              │
│ 0 ────●─────────────── 1           │
│      0.7                            │
│                                     │
│ 最大长度                            │
│ ┌─────────────────────────────┐    │
│ │ 1000                         │    │
│ └─────────────────────────────┘    │
│                                     │
│ 启用联网搜索                        │
│ ○ 关闭                              │
└─────────────────────────────────────┘
```

---

#### 4. 最终请求体预览

```json
{
  "query": "用户输入的内容",
  "parameters": {
    "style": "formal",
    "temperature": 0.7,
    "max_tokens": 1000,
    "enable_search": false
  },
  "session_id": "session_123456",
  "user_id": "user_789"
}
```

---

## 🔧 技术实现

### 核心组件

1. **BusinessParamModal.jsx** - 业务参数配置弹窗
2. **DynamicFormPreview.jsx** - 动态表单预览
3. **RequestPreview.jsx** - 请求体预览
4. **requestEngine.js** - 请求引擎工具

### 核心函数

```javascript
// 提取模板中的变量
extractVariables(template) → ['USER_INPUT', 'STYLE']

// 构建最终请求体
buildRequestBody(template, context) → JSON String

// 合并多源变量
mergeVariables(builtinVars, businessParams, businessValues) → Object

// 验证模板
validateTemplate(template) → { valid, error }
```

---

## 🎨 UI/UX 特性

### 视觉设计
- ✅ 渐变色彩方案（紫色/蓝色主题）
- ✅ 卡片式布局
- ✅ 图标辅助识别
- ✅ 悬停动效
- ✅ 响应式设计

### 交互体验
- ✅ 可折叠配置区域
- ✅ 实时预览
- ✅ 一键复制
- ✅ 格式化 JSON
- ✅ 删除确认

### 用户反馈
- ✅ 必填项标记（红色 *）
- ✅ 工具提示
- ✅ 错误提示
- ✅ 成功提示

---

## 📝 最佳实践

### 1. 变量命名规范
```javascript
// ✅ 推荐：使用小写字母 + 下划线
key: "text_style"
key: "max_tokens"
key: "enable_search"

// ❌ 避免：大写字母（系统会自动转换）
key: "TEXT_STYLE"  // 会自动转为 {{TEXT_STYLE}}
```

### 2. 默认值设置
```javascript
// ✅ 为常用参数设置合理的默认值
defaultValue: "formal"  // 默认正式风格
defaultValue: 0.7       // 默认创意度
defaultValue: false     // 默认关闭

// ❌ 避免：不设置默认值导致空值
```

### 3. 占位符使用
```javascript
// ✅ 字符串值 - 添加引号
"style": "{{STYLE}}"

// ✅ 数字/布尔值 - 不添加引号
"temperature": {{TEMPERATURE}}
"enable_search": {{ENABLE_SEARCH}}
```

### 4. 选项配置
```javascript
// ✅ 使用有意义的 Label
options: [
  { label: "正式 - 适合商务场景", value: "formal" },
  { label: "幽默 - 适合轻松场景", value: "humorous" }
]

// ❌ 避免：Label 不清晰
options: [
  { label: "选项 1", value: "1" },
  { label: "选项 2", value: "2" }
]
```

---

## 🚀 未来扩展

### 可能的增强功能
- [ ] 更多 UI 组件（日期选择器、颜色选择器、文件上传）
- [ ] 参数依赖关系（显示 A 后才显示 B）
- [ ] 参数验证规则（正则表达式）
- [ ] 批量导入/导出参数配置
- [ ] 参数模板库（预设常用参数）
- [ ] 实时协作编辑
- [ ] 版本历史记录

---

## 📖 相关文档

- [BusinessParamModal 组件文档](./src/components/BusinessParamModal.jsx)
- [DynamicFormPreview 组件文档](./src/components/DynamicFormPreview.jsx)
- [RequestPreview 组件文档](./src/components/RequestPreview.jsx)
- [RequestEngine 工具文档](./src/utils/requestEngine.js)

---

**现在请在浏览器访问 http://localhost:5174 测试功能！** 🎉
