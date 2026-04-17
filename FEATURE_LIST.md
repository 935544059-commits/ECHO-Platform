# ECHO 智能体接入配置中心 - 功能清单（Feature List）

> 版本：v1.0
> 日期：2026-04-03
> 状态：草稿

---

## 一、项目结构概览

### 1.1 路由结构

```
应用类型：单页应用（SPA）
路由方式：无路由（所有功能在单页面内完成）
页面数量：1 个主页面（手工添加智能体）
```

### 1.2 页面结构

```
┌─────────────────────────────────────────────────────────────┐
│                      手工添加智能体                           │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────┐   │
│  │            智能体基本信息（AgentInfoPanel）           │   │
│  │  - 头像上传                                         │   │
│  │  - 名称输入                                         │   │
│  │  - 标签管理                                         │   │
│  │  - 描述输入                                         │   │
│  └─────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │         API 基本信息配置（ApiBasicConfig）             │   │
│  │  - API 类型选择                                      │   │
│  │  - 请求地址配置                                      │   │
│  │  - 认证方式配置                                      │   │
│  │  - 请求方法选择                                      │   │
│  │  - Header 配置                                      │   │
│  │  - Streaming 开关                                   │   │
│  └─────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │          入参动态构建（InputParamsConfig） ⭐         │   │
│  │  - 请求体模板编辑                                    │   │
│  │  - 变量拾取器                                        │   │
│  │  - 业务参数管理                                      │   │
│  │  - 对话端预览                                        │   │
│  │  - 请求预览                                          │   │
│  └─────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │         出参解析与映射（OutputMappingConfig）         │   │
│  │  - 响应预览                                          │   │
│  │  - 输出变量配置                                      │   │
│  │  - 组件绑定                                          │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

---

## 二、功能模块详解

### 2.1 智能体基本信息（AgentInfoPanel）

#### 文件位置
```
src/components/AgentInfoPanel.jsx
```

#### 功能描述
配置智能体的基础信息，包括头像、名称、标签和描述。

#### 核心交互点

| 交互点 | 类型 | 说明 | 业务参数 |
|--------|------|------|---------|
| 头像上传 | 文件上传 | 支持 JPG/PNG，最大 2MB | `avatar: string \| null` |
| 智能体名称 | 文本输入 | 必填，最大长度无限制 | `name: string` |
| 标签添加 | 标签输入 | 可添加多个标签，支持回车添加 | `tags: string[]` |
| 标签删除 | 点击删除 | 点击 × 按钮删除单个标签 | - |
| 描述输入 | 多行文本 | 可选，最大 100 字符 | `description: string` |

#### 字段定义
```typescript
interface AgentInfo {
  avatar: string | null;    // Base64 或 URL
  name: string;            // 智能体名称
  tags: string[];          // 标签列表
  description: string;     // 描述
}
```

#### 校验规则
```typescript
{
  name: [
    { rule: 'required', message: '智能体名称不能为空' }
  ],
  description: [
    { rule: 'maxLength', max: 100, message: '描述不能超过 100 字' }
  ],
  avatar: [
    { rule: 'maxSize', max: '2MB', message: '图片大小不能超过 2M' }
  ]
}
```

#### UI 组件
- 头像上传区（点击触发文件选择）
- 文本输入框
- 标签输入框（回车添加）
- 标签显示（带删除按钮）
- 多行文本框

---

### 2.2 API 基本信息配置（ApiBasicConfig）

#### 文件位置
```
src/components/ApiBasicConfig.jsx
```

#### 功能描述
配置第三方 MAAS 平台的 API 连接信息，包括地址、认证方式、请求头等。

#### 核心交互点

| 交互点 | 类型 | 说明 | 业务参数 |
|--------|------|------|---------|
| API 类型 | 下拉选择 | 选择 MAAS 平台类型 | `apiType: string` |
| API 名称 | 文本输入 | 必填，API 名称 | `apiName: string` |
| API 地址 | URL 输入 | 必填，第三方 API URL | `apiUrl: string` |
| API 描述 | 文本输入 | 可选，API 说明 | `apiDescription: string` |
| 认证方式 | 单选按钮 | API_KEY / Bearer Token / 无 | `authType: string` |
| API Key | 密码输入 | 认证方式为 API_KEY 时显示 | `apiKey: string` |
| Bearer Token | 密码输入 | 认证方式为 Bearer 时显示 | `bearerToken: string` |
| 请求方法 | 下拉选择 | GET / POST / PUT / DELETE | `method: string` |
| Header 添加 | 行添加 | 可添加多个自定义 Header | `headers: Array<{key, value}>` |
| Header 删除 | 行删除 | 点击删除单行 Header | - |
| Streaming 开关 | 开关切换 | 是否启用流式响应 | `isStreaming: boolean` |

#### 字段定义
```typescript
interface ApiConfig {
  queryFrequency: string;          // 查询频率
  apiType: string;                 // API 类型
  apiName: string;                 // API 名称
  apiUrl: string;                  // API 地址
  apiDescription: string;           // API 描述
  authType: 'API_KEY' | 'BEARER_TOKEN' | 'NONE';
  apiKey?: string;
  bearerToken?: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  headers: Array<{ key: string; value: string }>;
  body: string;                   // 请求体模板
  isStreaming: boolean;
}
```

#### 校验规则
```typescript
{
  apiName: [
    { rule: 'required', message: 'API 名称不能为空' }
  ],
  apiUrl: [
    { rule: 'required', message: 'API 地址不能为空' },
    { rule: 'url', message: '请输入有效的 URL 地址' }
  ],
  apiKey: [
    { rule: 'required', condition: (config) => config.authType === 'API_KEY', message: 'API_KEY 不能为空' }
  ],
  bearerToken: [
    { rule: 'required', condition: (config) => config.authType === 'BEARER_TOKEN', message: 'Bearer Token 不能为空' }
  ]
}
```

#### UI 组件
- 下拉选择框（API 类型、请求方法）
- 文本输入框
- URL 输入框（带验证）
- 单选按钮组（认证方式）
- 密码输入框
- Header 表格（动态行）
- 开关切换

---

### 2.3 入参动态构建（InputParamsConfig）⭐ 核心模块

#### 文件位置
```
src/components/InputParamsConfig.jsx
```

#### 功能描述
动态构建请求体模板，管理业务参数配置，提供实时预览功能。

#### 核心交互点

| 交互点 | 类型 | 说明 | 业务参数 |
|--------|------|------|---------|
| 请求体模板编辑 | 文本编辑 | JSON 格式，支持占位符 | `bodyTemplate: string` |
| 格式化按钮 | 按钮 | 格式化 JSON 模板 | - |
| 复制按钮 | 按钮 | 复制模板到剪贴板 | - |
| 变量插入 | 点击插入 | 从拾取器插入内置/业务变量 | - |
| 添加业务参数 | 按钮 | 打开业务参数配置弹窗 | `businessParams: BusinessParam[]` |
| 编辑业务参数 | 按钮 | 编辑已有参数 | - |
| 删除业务参数 | 按钮 | 删除已有参数（需确认） | - |
| 对话端预览 | 按钮 | 展开/收起 UI 预览区 | - |
| 请求预览 | 按钮 | 展开/收起请求预览区 | - |
| 参数值修改 | 实时交互 | 预览区内修改参数值 | - |

#### 子组件

**1. BusinessParamModal（业务参数配置弹窗）**
```
文件位置：src/components/BusinessParamModal.jsx
```

| 交互点 | 类型 | 说明 |
|--------|------|------|
| 变量标识输入 | 文本输入 | Key 值，唯一性校验 |
| 显示文本输入 | 文本输入 | Label 值 |
| 交互类型选择 | 网格选择 | 6 种类型可选 |
| 必填开关 | 开关 | 是否必填 |
| 选项列表配置 | 动态列表 | Select 类型专用 |
| 选项添加 | 按钮 | 添加选项项 |
| 选项删除 | 按钮 | 删除选项项 |
| 占位提示语 | 文本输入 | Input/Textarea 类型 |
| 数值范围配置 | 数字输入 | Slider/Number 类型 |
| 步长配置 | 数字输入 | Slider/Number 类型 |
| 默认值设置 | 动态组件 | 根据类型渲染不同组件 |
| 保存按钮 | 按钮 | 保存配置 |
| 取消按钮 | 按钮 | 关闭弹窗 |

**2. DynamicFormPreview（对话端 UI 预览）**
```
文件位置：src/components/DynamicFormPreview.jsx
```

| 交互点 | 类型 | 说明 |
|--------|------|------|
| 单行文本输入 | Input | 文本输入组件 |
| 多行文本输入 | Textarea | 多行文本组件 |
| 下拉选择 | Select | 选项选择组件 |
| 开关切换 | Switch | 布尔切换组件 |
| 滑块调节 | Slider | 数值滑块组件 |
| 数字输入 | Number | 数字输入组件 |

**3. RequestPreview（请求预览）**
```
文件位置：src/components/RequestPreview.jsx
```

| 交互点 | 类型 | 说明 |
|--------|------|------|
| 变量列表展示 | 列表 | 显示提取的变量 |
| 变量映射展示 | JSON 树 | 显示变量映射关系 |
| 最终请求体 | JSON 编辑器 | 显示替换后的请求体 |

#### 字段定义
```typescript
interface InputParams {
  bodyTemplate: string;           // 请求体模板
  businessParams: BusinessParam[]; // 业务参数列表
}

interface BusinessParam {
  id: string;                      // 唯一标识
  key: string;                     // 变量标识
  label: string;                   // 显示文本
  uiType: 'input' | 'textarea' | 'select' | 'switch' | 'slider' | 'number';
  required: boolean;               // 是否必填
  placeholder?: string;            // 占位提示语
  options?: Array<{                // 选项列表
    label: string;
    value: string;
  }>;
  defaultValue?: any;              // 默认值
  min?: number;                   // 最小值
  max?: number;                   // 最大值
  step?: number;                  // 步长
}
```

#### 校验规则
```typescript
{
  key: [
    { rule: 'required', message: '变量标识不能为空' },
    { rule: 'pattern', pattern: /^[a-zA-Z_][a-zA-Z0-9_]{0,63}$/, message: '变量标识格式不正确' },
    { rule: 'unique', message: '变量标识不能重复' }
  ],
  label: [
    { rule: 'required', message: '显示文本不能为空' },
    { rule: 'maxLength', max: 128, message: '显示文本不能超过 128 字符' }
  ],
  uiType: [
    { rule: 'required', message: '交互类型不能为空' },
    { rule: 'enum', values: ['input', 'textarea', 'select', 'switch', 'slider', 'number'], message: '不支持的交互类型' }
  ],
  options: [
    { rule: 'required', condition: (param) => param.uiType === 'select', message: '下拉选项不能为空' },
    { rule: 'minLength', min: 2, condition: (param) => param.uiType === 'select', message: '至少需要 2 个选项' },
    { rule: 'maxLength', max: 50, condition: (param) => param.uiType === 'select', message: '最多支持 50 个选项' }
  ],
  range: [
    { rule: 'minLessThanMax', condition: (param) => param.uiType === 'slider' || param.uiType === 'number', message: '最小值必须小于最大值' },
    { rule: 'stepPositive', condition: (param) => param.uiType === 'slider' || param.uiType === 'number', message: '步长必须为正数' },
    { rule: 'defaultInRange', condition: (param) => param.uiType === 'slider' || param.uiType === 'number', message: '默认值必须在范围内' }
  ]
}
```

#### 支持的 UI 类型

| 类型 | 图标 | 渲染组件 | 特殊参数 |
|------|------|---------|---------|
| `input` | 📝 | 单行文本输入框 | placeholder |
| `textarea` | 📄 | 多行文本输入框 | placeholder |
| `select` | 📋 | 下拉选择框 | options[] |
| `switch` | 🔘 | 开关按钮 | defaultValue (boolean) |
| `slider` | 📊 | 滑块控件 | min, max, step |
| `number` | 🔢 | 数字输入框 | min, max, step |

---

### 2.4 出参解析与映射（OutputMappingConfig）

#### 文件位置
```
src/components/OutputMappingConfig.jsx
```

#### 功能描述
配置 API 响应的解析规则，将响应数据映射到前端组件。

#### 核心交互点

| 交互点 | 类型 | 说明 | 业务参数 |
|--------|------|------|---------|
| 响应预览 | JSON 展示 | 显示测试响应数据 | - |
| 添加输出变量 | 按钮 | 添加新的输出变量映射 | `outputVariables: OutputVariable[]` |
| 删除输出变量 | 按钮 | 删除已有变量 | - |
| 变量名称输入 | 文本输入 | 变量名称 | - |
| JSONPath 输入 | 路径输入 | 数据提取路径 | - |
| 描述输入 | 文本输入 | 变量描述 | - |
| 组件类型选择 | 下拉选择 | 选择绑定的 UI 组件 | - |
| 组件排序 | 拖拽排序 | 调整组件显示顺序 | `componentBindings: ComponentBinding[]` |

#### 字段定义
```typescript
interface OutputVariable {
  name: string;              // 变量名称
  path: string;              // JSONPath 路径
  description: string;       // 描述
}

interface ComponentBinding {
  componentType: string;    // 组件类型
  variableName: string;     // 绑定的变量名
}
```

#### 校验规则
```typescript
{
  name: [
    { rule: 'required', message: '变量名称不能为空' },
    { rule: 'pattern', pattern: /^[a-zA-Z_][a-zA-Z0-9_]*$/, message: '变量名称格式不正确' }
  ],
  path: [
    { rule: 'required', message: 'JSONPath 不能为空' },
    { rule: 'jsonPath', message: '请输入有效的 JSONPath' }
  ]
}
```

#### UI 组件
- JSON 响应预览器（树形结构）
- 输出变量表格（动态行）
- 组件绑定配置区
- 拖拽排序列表

---

### 2.5 全局交互组件

#### 2.5.1 验证错误提示（ValidationErrors）

**文件位置：** App.jsx 内联组件

| 属性 | 类型 | 说明 |
|------|------|------|
| errors | string[] | 错误信息列表 |

**显示规则：**
- 固定在右上角
- 5 秒后自动消失
- 可手动关闭
- 红色警告样式

---

#### 2.5.2 成功提示（SuccessToast）

**文件位置：** App.jsx 内联组件

| 属性 | 类型 | 说明 |
|------|------|------|
| message | string | 成功消息 |
| onClose | function | 关闭回调 |

**显示规则：**
- 固定在右上角
- 3 秒后自动消失
- 绿色成功样式

---

#### 2.5.3 保存确认弹窗

**文件位置：** App.jsx 内联组件

**触发条件：**
- 接口未测试时点击保存
- 显示确认提示

**操作：**
- 确认：执行保存
- 取消：关闭弹窗

---

## 三、变量系统

### 3.1 内置变量（Builtin Variables）

系统预设的上下文变量，不可删除，管理员可直接使用。

| 变量名 | 说明 | 数据类型 | 示例值 |
|--------|------|---------|--------|
| `USER_INPUT` | 用户输入的文本内容 | string | "请帮我翻译这段话" |
| `SESSION_ID` | 当前会话 ID | string | "sess_abc123xyz" |
| `TIMESTAMP` | 当前 Unix 时间戳（秒） | number | 1743657600 |
| `USER_ID` | 用户 ID | string | "user_789" |

**使用场景：**
```json
{
  "query": "{{USER_INPUT}}",
  "session_id": "{{SESSION_ID}}",
  "timestamp": {{TIMESTAMP}},
  "user_id": "{{USER_ID}}"
}
```

---

### 3.2 业务变量（Business Variables）

管理员自定义的动态业务参数，定义后自动出现在变量拾取器中。

**定义方式：**
- 通过 BusinessParamModal 添加
- 配置 Key、Label、UI Type、数据约束

**使用流程：**
```
1. 管理员在 BusinessParamModal 中定义参数
   ↓
2. 参数保存后自动添加到变量拾取器
   ↓
3. 管理员点击插入到请求体模板
   ↓
4. 生成占位符 {{KEY}}
   ↓
5. 运行时会替换为用户实际选择的值
```

---

### 3.3 变量替换规则

**替换优先级：**
```
1. 用户输入值（USER_INPUT）
2. 业务参数用户选择的值
3. 业务参数的默认值
4. 内置系统变量（SESSION_ID, TIMESTAMP 等）
```

**类型处理：**
```typescript
// 字符串类型 - 加引号
"{{STYLE}}" → "formal"

// 数字类型 - 不加引号
{{TEMPERATURE}} → 0.7

// 布尔类型 - 不加引号
{{ENABLE_SEARCH}} → true

// 对象类型 - JSON 序列化
{{METADATA}} → {"key": "value"}
```

---

## 四、数据流

### 4.1 配置阶段数据流

```
用户输入
    ↓
┌──────────────────────────────────────────────┐
│           BusinessParamModal                  │
│  1. 填写 Key/Label/Type                      │
│  2. 配置数据约束                              │
│  3. 设置默认值                                │
└──────────────────────────────────────────────┘
    ↓
┌──────────────────────────────────────────────┐
│           ConfigContext                       │
│  addBusinessParam(param)                       │
│  updateBusinessParam(index, updates)          │
│  removeBusinessParam(index)                   │
└──────────────────────────────────────────────┘
    ↓
┌──────────────────────────────────────────────┐
│           InputParamsConfig                    │
│  1. 变量拾取器显示新参数                       │
│  2. 点击插入到模板                             │
│  3. DynamicFormPreview 实时渲染               │
└──────────────────────────────────────────────┘
    ↓
用户预览效果 → 调整参数 → 最终保存
```

### 4.2 运行阶段数据流

```
┌──────────────────────────────────────────────┐
│           用户输入阶段                         │
│  - USER_INPUT: 用户输入文本                    │
│  - 业务参数: 用户选择的值                      │
└──────────────────────────────────────────────┘
    ↓
┌──────────────────────────────────────────────┐
│           requestEngine                        │
│  extractVariables(template)                    │
│  mergeVariables(builtin, business, values)     │
│  buildRequestBody(template, context)          │
└──────────────────────────────────────────────┘
    ↓
┌──────────────────────────────────────────────┐
│           最终请求体                           │
│  {                                            │
│    "query": "用户输入",                        │
│    "style": "formal",                         │
│    "temperature": 0.7                         │
│  }                                            │
└──────────────────────────────────────────────┘
    ↓
┌──────────────────────────────────────────────┐
│           第三方 MAAS API                      │
│  POST /api/v1/agent/run                      │
└──────────────────────────────────────────────┘
```

---

## 五、组件清单

### 5.1 组件列表

| 组件名 | 文件路径 | 职责 | 状态 |
|--------|---------|------|------|
| AgentInfoPanel | `src/components/AgentInfoPanel.jsx` | 智能体基本信息配置 | ✅ 正常 |
| ApiBasicConfig | `src/components/ApiBasicConfig.jsx` | API 基本信息配置 | ✅ 正常 |
| InputParamsConfig | `src/components/InputParamsConfig.jsx` | 入参动态构建（核心） | ✅ 正常 |
| BusinessParamModal | `src/components/BusinessParamModal.jsx` | 业务参数配置弹窗 | ✅ 正常 |
| DynamicFormPreview | `src/components/DynamicFormPreview.jsx` | 对话端 UI 预览 | ✅ 正常 |
| RequestPreview | `src/components/RequestPreview.jsx` | 请求体预览 | ✅ 正常 |
| OutputMappingConfig | `src/components/OutputMappingConfig.jsx` | 出参解析与映射 | ✅ 正常 |
| ErrorBoundary | `src/components/ErrorBoundary.jsx` | 错误边界 | ✅ 正常 |
| ConfigPreview | `src/components/ConfigPreview.jsx` | 配置预览 | ⚠️ 未使用 |
| FormPreview | `src/components/FormPreview.jsx` | 表单预览 | ⚠️ 未使用 |
| BusinessParamsPanel | `src/components/BusinessParamsPanel.jsx` | 业务参数面板 | ⚠️ 未使用 |
| InputParamsPanel | `src/components/InputParamsPanel.jsx` | 入参面板 | ⚠️ 未使用 |
| RendererBindingPanel | `src/components/RendererBindingPanel.jsx` | 渲染绑定面板 | ⚠️ 未使用 |
| DataMappingPanel | `src/components/DataMappingPanel.jsx` | 数据映射面板 | ⚠️ 未使用 |
| JsonTreeView | `src/components/JsonTreeView.jsx` | JSON 树视图 | ⚠️ 未使用 |
| ApiConfigPanel | `src/components/ApiConfigPanel.jsx` | API 配置面板 | ⚠️ 未使用 |

### 5.2 工具函数清单

| 函数文件 | 路径 | 主要函数 |
|---------|------|---------|
| requestEngine | `src/utils/requestEngine.js` | extractVariables, buildRequestBody, validateTemplate, mergeVariables, getUnassignedVariables |
| parser | `src/utils/parser.js` | - |
| mockData | `src/utils/mockData.js` | - |

---

## 六、业务参数完整示例

### 6.1 示例：写作助手智能体

**配置的参数：**

```typescript
const businessParams = [
  {
    id: "param_001",
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
  },
  {
    id: "param_002",
    key: "temperature",
    label: "创意度",
    uiType: "slider",
    required: false,
    min: 0,
    max: 1,
    step: 0.1,
    defaultValue: 0.7
  },
  {
    id: "param_003",
    key: "max_tokens",
    label: "最大长度",
    uiType: "number",
    required: false,
    min: 100,
    max: 4000,
    step: 100,
    defaultValue: 1000
  },
  {
    id: "param_004",
    key: "enable_search",
    label: "启用联网搜索",
    uiType: "switch",
    required: false,
    defaultValue: false
  },
  {
    id: "param_005",
    key: "custom_instruction",
    label: "自定义指令",
    uiType: "textarea",
    required: false,
    placeholder: "输入额外的指令要求...",
    defaultValue: ""
  }
];
```

**请求体模板：**
```json
{
  "query": "{{USER_INPUT}}",
  "parameters": {
    "style": "{{STYLE}}",
    "temperature": {{TEMPERATURE}},
    "max_tokens": {{MAX_TOKENS}},
    "enable_search": {{ENABLE_SEARCH}} ,
    "custom_instruction": "{{CUSTOM_INSTRUCTION}}"
  },
  "session_id": "{{SESSION_ID}}",
  "user_id": "{{USER_ID}}"
}
```

**对话端 UI 预览：**
```
┌─────────────────────────────────────────────┐
│ 文案风格 *                                  │
│ ┌─────────────────────────────────────┐    │
│ │ 正式                             ▼  │    │
│ └─────────────────────────────────────┘    │
│                                             │
│ 创意度                                      │
│ 0 ────────●─────────────────────────── 1    │
│          0.7                               │
│                                             │
│ 最大长度                                    │
│ ┌─────────────────────────────────────┐    │
│ │ 1000                               │    │
│ └─────────────────────────────────────┘    │
│                                             │
│ 启用联网搜索                                │
│ [○ 关闭]                                    │
│                                             │
│ 自定义指令                                  │
│ ┌─────────────────────────────────────┐    │
│ │ 输入额外的指令要求...                │    │
│ │                                     │    │
│ └─────────────────────────────────────┘    │
└─────────────────────────────────────────────┘
```

**最终请求体：**
```json
{
  "query": "请帮我写一首关于春天的诗",
  "parameters": {
    "style": "poetic",
    "temperature": 0.8,
    "max_tokens": 2000,
    "enable_search": false,
    "custom_instruction": "要有押韵"
  },
  "session_id": "sess_abc123",
  "user_id": "user_456"
}
```

---

## 七、页面加载流程

### 7.1 初始化流程

```
1. 用户访问页面
   ↓
2. main.jsx 渲染 App 组件
   ↓
3. App 渲染 ErrorBoundary
   ↓
4. ErrorBoundary 渲染 AppContent
   ↓
5. AppContent 渲染 ConfigProvider
   ↓
6. ConfigProvider 初始化状态（initialConfig）
   ↓
7. 渲染所有面板组件
   ↓
8. 页面加载完成
```

### 7.2 状态管理

```
ConfigContext
  │
  ├── agentInfo { name, tags, description, avatar }
  ├── apiConfig { apiType, apiUrl, authType, headers, ... }
  ├── inputParams { bodyTemplate, businessParams }
  ├── outputVariables [ { name, path, description }, ... ]
  ├── componentBindings [ { componentType, variableName }, ... ]
  ├── testResponse
  ├── testError
  └── configStatus 'incomplete' | 'tested' | 'complete'
```

---

## 八、待完善功能

### 8.1 未使用组件

以下组件存在于代码库中但未在当前页面使用：

| 组件 | 路径 | 建议 |
|------|------|------|
| ConfigPreview | `src/components/ConfigPreview.jsx` | 可用于配置完成后的总览 |
| FormPreview | `src/components/FormPreview.jsx` | 预留的表单预览组件 |
| BusinessParamsPanel | `src/components/BusinessParamsPanel.jsx` | 可能是旧版业务参数面板 |
| InputParamsPanel | `src/components/InputParamsPanel.jsx` | 可能是旧版入参面板 |
| RendererBindingPanel | `src/components/RendererBindingPanel.jsx` | 可能是渲染绑定配置 |
| DataMappingPanel | `src/components/DataMappingPanel.jsx` | 可能是数据映射配置 |
| JsonTreeView | `src/components/JsonTreeView.jsx` | 可用于响应数据展示 |
| ApiConfigPanel | `src/components/ApiConfigPanel.jsx` | 可能是旧版 API 配置 |

### 8.2 建议清理

建议在后续迭代中：
1. 清理未使用的组件，或
2. 明确其用途并集成到现有流程中

---

## 九、总结

### 9.1 核心功能矩阵

| 功能模块 | 核心交互数 | 业务参数数 | 校验规则数 |
|---------|-----------|-----------|-----------|
| AgentInfoPanel | 5 | 4 | 3 |
| ApiBasicConfig | 10 | 12 | 5 |
| InputParamsConfig | 10 | 1 (数组) | 7+ |
| OutputMappingConfig | 7 | 2 (数组) | 3 |
| 全局组件 | 3 | - | - |
| **总计** | **35** | **19+** | **18+** |

### 9.2 技术亮点

1. **零代码配置**：通过 UI 配置即可完成复杂业务参数定义
2. **实时预览**：所见即所得的配置体验
3. **类型安全**：完整的校验规则和类型推断
4. **灵活扩展**：支持 6 种 UI 组件类型
5. **变量驱动**：内置变量 + 业务变量双轨并行

---

**文档状态：待评审**

**下一步行动：**
- [ ] 确认功能清单完整性
- [ ] 清理未使用的组件
- [ ] 补充缺失的校验规则
- [ ] 完善测试用例
