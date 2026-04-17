# ECHO 智能体接入配置中心 - PRD 核心逻辑

> 版本：v1.0
> 日期：2026-04-03
> 状态：草稿

---

## 一、产品概述

### 1.1 产品定位

ECHO 智能体接入配置中心是一个**零代码智能体配置平台**，面向 AI 项目团队，使其能够通过可视化界面配置和接入第三方 MAAS（Model as a Service）平台，实现：

- **零代码接入**：无需编写代码，通过 UI 配置即可完成智能体接入
- **动态参数配置**：支持管理员自定义业务参数，实时生成用户交互界面
- **多平台适配**：兼容多种第三方 MAAS 平台（Dify 等）
- **所见即所得**：配置过程实时预览用户体验效果

### 1.2 目标用户

| 用户角色 | 使用场景 | 核心需求 |
|---------|---------|---------|
| 平台管理员 | 配置新智能体接入 | 快速配置、灵活定制业务参数 |
| 业务运营 | 调整智能体参数 | 实时预览、频繁迭代参数 |
| 终端用户 | 使用智能体服务 | 简洁的交互界面、清晰的参数选项 |

### 1.3 核心价值

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│   传统方式：                                                  │
│   接入新智能体 → 编写代码 → 调试 → 部署 → 耗时数天            │
│                                                             │
│   ECHO 方式：                                                │
│   配置智能体 → 预览效果 → 保存部署 → 耗时数分钟                │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 二、核心概念

### 2.1 术语定义

| 术语 | 定义 | 示例 |
|------|------|------|
| **智能体（Agent）** | 具有特定功能的 AI 服务单元 | "写作助手"、"翻译专家" |
| **MAAS 平台** | 提供 AI 模型服务的第三方平台 | Dify、Coze、LangChain |
| **业务参数（Business Param）** | 管理员定义的动态业务变量 | 文案风格、创意度、最大 Token 数 |
| **内置变量（Builtin Variable）** | 系统预设的上下文变量 | USER_INPUT、SESSION_ID、TIMESTAMP |
| **请求体模板（Body Template）** | 包含占位符的 JSON 结构 | `{"query": "{{USER_INPUT}}"}` |
| **对话端（User Side）** | 终端用户使用的交互界面 | 用户选择参数、输入内容的界面 |

### 2.2 数据流架构

```
┌─────────────────────────────────────────────────────────────────┐
│                        配置阶段（Admin Side）                     │
│  ┌─────────────┐    ┌──────────────┐    ┌─────────────────┐    │
│  │ 业务参数定义  │ → │ 变量拾取器    │ → │ 请求体模板编辑   │    │
│  └─────────────┘    └──────────────┘    └─────────────────┘    │
│         ↓                                        ↓              │
│  ┌─────────────────────────────────────────────────────┐       │
│  │              对话端 UI 预览（实时渲染）                │       │
│  └─────────────────────────────────────────────────────┘       │
└─────────────────────────────────────────────────────────────────┘
                                ↓
┌─────────────────────────────────────────────────────────────────┐
│                        运行阶段（Runtime）                       │
│  ┌─────────────┐    ┌──────────────┐    ┌─────────────────┐    │
│  │ 终端用户输入  │ +  │ 业务参数选择  │ +  │ 内置变量注入     │    │
│  └─────────────┘    └──────────────┘    └─────────────────┘    │
│                                ↓                                │
│                    ┌──────────────────┐                         │
│                    │  请求引擎合并    │                         │
│                    └──────────────────┘                         │
│                                ↓                                │
│                    ┌──────────────────┐                         │
│                    │  第三方 MAAS API │                         │
│                    └──────────────────┘                         │
└─────────────────────────────────────────────────────────────────┘
```

---

## 三、业务规则

### 3.1 业务参数配置规则

#### 3.1.1 参数元数据规范

每个业务参数必须包含以下元数据：

```typescript
interface BusinessParam {
  id: string;              // 唯一标识，UUID
  key: string;            // 变量标识，用于占位符匹配
  label: string;           // 显示文本，用户界面呈现
  uiType: UIType;          // 交互组件类型
  required: boolean;       // 是否必填
  placeholder?: string;    // 占位提示语（Input/Textarea 专用）
  options?: Option[];      // 选项列表（Select 专用）
  defaultValue?: any;      // 默认值
  min?: number;            // 最小值（Slider/Number 专用）
  max?: number;           // 最大值（Slider/Number 专用）
  step?: number;          // 步长（Slider/Number 专用）
}

type UIType = 'input' | 'textarea' | 'select' | 'switch' | 'slider' | 'number';

interface Option {
  label: string;  // 显示文本
  value: string;  // 值
}
```

#### 3.1.2 Key 命名规范

**规则：**
1. 只能包含小写字母、数字、下划线
2. 必须以字母或下划线开头
3. 不能以数字开头
4. 长度 1-64 字符
5. 唯一性约束：同一智能体内 key 不可重复

**正则表达式：**
```regex
^[a-zA-Z_][a-zA-Z0-9_]{0,63}$
```

**正确示例：**
```javascript
✅ style
✅ max_tokens
✅ enable_search
✅ temperature_2x
✅ _private_param
```

**错误示例：**
```javascript
❌ 2style        // 不能以数字开头
❌ style-name    // 不能包含连字符
❌ style.name     // 不能包含点号
❌ MAX_TOKENS    // 推荐小写（虽然系统会转大写）
```

#### 3.1.3 UI 类型约束

| UI 类型 | 必填字段 | 可选字段 | 默认值 |
|---------|---------|---------|-------|
| `input` | key, label, uiType | placeholder, defaultValue, required | - |
| `textarea` | key, label, uiType | placeholder, defaultValue, required | - |
| `select` | key, label, uiType, options | defaultValue, required | options[0] |
| `switch` | key, label, uiType | defaultValue, required | false |
| `slider` | key, label, uiType, min, max | step, defaultValue, required | min |
| `number` | key, label, uiType, min, max | step, defaultValue, required | min |

#### 3.1.4 Select 类型特殊规则

```typescript
// options 必须满足：
interface Option {
  label: string;  // 显示文本，长度 1-128 字符
  value: string; // 值，长度 1-128 字符
}

// 约束：
1. options 数组长度 2-50 项
2. label 唯一性约束
3. value 唯一性约束
4. 不能包含空字符串
5. 推荐格式：{label: "显示文本", value: "value"}
```

**示例：**
```javascript
✅ options: [
    { label: "正式", value: "formal" },
    { label: "幽默", value: "humorous" },
    { label: "诗意", value: "poetic" }
  ]

❌ options: [
    { label: "", value: "formal" }           // label 不能为空
    { label: "正式", value: "" }             // value 不能为空
    { label: "正式", value: "formal" },
    { label: "正式", value: "formal2" }      // label 不能重复
  ]
```

#### 3.1.5 Slider/Number 类型数值规则

```typescript
// 约束：
1. min < max（最小值必须小于最大值）
2. min 取值范围：-999999999 ~ 999999999
3. max 取值范围：-999999999 ~ 999999999
4. step > 0（步长必须为正数）
5. step <= (max - min)
6. defaultValue 必须在 [min, max] 范围内
```

**示例：**
```javascript
✅ slider: { min: 0, max: 1, step: 0.1, defaultValue: 0.7 }

❌ slider: { min: 1, max: 0, step: 0.1 }  // min 必须 < max

❌ slider: { min: 0, max: 1, step: 2 }    // step 不能 > (max - min)
```

---

### 3.2 变量拾取器规则

#### 3.2.1 内置变量清单

| 变量名 | 说明 | 数据类型 | 示例值 |
|--------|------|---------|--------|
| `USER_INPUT` | 用户输入的文本内容 | string | "请帮我翻译这段文字" |
| `SESSION_ID` | 当前会话 ID | string | "sess_abc123" |
| `TIMESTAMP` | 当前 Unix 时间戳（秒） | number | 1743657600 |
| `USER_ID` | 用户 ID | string | "user_789" |

#### 3.2.2 变量插入规则

**插入位置：**
- 光标当前所在位置
- 自动在模板字符串中定位

**插入格式：**
```javascript
// 统一格式：{{VARIABLE_NAME}}
{{USER_INPUT}}
{{STYLE}}
{{MAX_TOKENS}}
```

**插入行为：**
1. 点击变量按钮
2. 在 textarea 光标位置插入 `{{VARIABLE_NAME}}`
3. 自动聚焦回 textarea
4. 光标定位到占位符之后

#### 3.2.3 变量匹配规则

**匹配逻辑：**
```javascript
// 占位符正则
/\{\{(\w+)\}\}/g

// 示例模板
{
  "query": "{{USER_INPUT}}",
  "style": "{{STYLE}}",
  "temperature": {{TEMPERATURE}}
}

// 提取结果
["USER_INPUT", "STYLE", "TEMPERATURE"]
```

**匹配特性：**
- 大小写敏感：`{{STYLE}}` ≠ `{{style}}`
- 贪婪匹配：尽可能匹配最长的变量名
- 支持嵌套：检测到第一个 `}}` 即结束

---

### 3.3 请求体模板规则

#### 3.3.1 模板语法

**JSON 结构要求：**
```typescript
// 必须符合标准 JSON 格式
// 占位符 {{VARIABLE_NAME}} 可以出现在：
// - 字符串值中："{{VARIABLE}}"
// - 数字值中：{{VARIABLE}}
// - 布尔值中：{{VARIABLE}}
// - 数组元素中：[{{VARIABLE}}]
// - 对象属性中：{"key": "{{VARIABLE}}"}
```

**有效示例：**
```json
{
  "query": "{{USER_INPUT}}",
  "style": "{{STYLE}}",
  "temperature": {{TEMPERATURE}},
  "enable_search": {{ENABLE_SEARCH}},
  "tags": ["{{TAG1}}", "{{TAG2}}"],
  "metadata": {
    "source": "{{SOURCE}}",
    "count": {{COUNT}}
  }
}
```

**无效示例：**
```json
{
  "query": {{USER_INPUT}},    // 缺少引号，字符串必须加引号
  "style": """{{STYLE}}"""     // 多余引号
}
```

#### 3.3.2 占位符类型推断

系统根据占位符所在位置自动推断数据类型：

| 位置示例 | 推断类型 | 替换方式 |
|---------|---------|---------|
| `"key": "{{VAR}}"` | string | 添加双引号 |
| `"key": {{VAR}}` | number/boolean | 不添加引号 |
| `"key": [{{VAR}}]` | string/number/boolean | 根据实际值判断 |
| `"key": {"sub": "{{VAR}}"}` | string | 添加双引号 |

#### 3.3.3 模板验证规则

```typescript
// validateTemplate() 函数执行以下验证：

1. 非空检查
   ❌ template === null
   ❌ template === ""
   ✅ template.trim().length > 0

2. JSON 格式验证
   ❌ 缺少引号
   ❌ 缺少逗号/冒号
   ❌ 括号不匹配
   ✅ 临时替换占位符后可解析

3. 占位符格式验证
   ❌ {{VAR}              // 未闭合
   ❌ {{}}                 // 变量名为空
   ❌ { {VAR} }           // 空格干扰
   ✅ {{VALID_VAR}}
```

---

### 3.4 变量替换与合并规则

#### 3.4.1 优先级规则

```typescript
// 多源变量合并优先级（从高到低）：
1. 用户输入值（userInputValue）
2. 业务参数值（businessParamValue）
3. 默认值（defaultValue）
4. 内置系统值（builtinSystemValue）

// 示例：
{
  USER_INPUT: "用户输入内容",     // 优先级 1
  STYLE: "humorous",             // 优先级 2（用户选择了"幽默"）
  TEMPERATURE: 0.7,              // 优先级 3（使用默认值）
  SESSION_ID: "sess_123"         // 优先级 4（系统自动生成）
}
```

#### 3.4.2 类型转换规则

```typescript
// buildRequestBody() 执行类型推断和转换：

function convertValue(value: any, templateContext: string): any {
  // 模板上下文判断
  const isStringContext = templateContext.includes('"{{');

  if (isStringContext) {
    // 字符串上下文：添加引号并转义
    return `"${String(value).replace(/"/g, '\\"')}"`;
  } else {
    // 非字符串上下文：根据实际类型处理
    if (typeof value === 'number') {
      return String(value);  // 数字不添加引号
    } else if (typeof value === 'boolean') {
      return String(value); // 布尔不添加引号
    } else if (typeof value === 'object') {
      return JSON.stringify(value); // 对象 JSON 序列化
    } else {
      return String(value);
    }
  }
}
```

**转换示例：**

| 原始值 | 字符串上下文 | 非字符串上下文 |
|--------|-------------|--------------|
| `"formal"` | `"formal"` | `formal` |
| `0.7` | `"0.7"` | `0.7` |
| `true` | `"true"` | `true` |
| `{key: "val"}` | `"{\"key\":\"val\"}"` | `{"key":"val"}` |

#### 3.4.3 未赋值变量处理

```typescript
// getUnassignedVariables() 函数检测未赋值变量：

const template = `{"query": "{{USER_INPUT}}", "style": "{{STYLE}}"}`;

const context = {
  USER_INPUT: "用户输入",
  // STYLE 未赋值
};

const unassigned = getUnassignedVariables(template, context);
// 结果：["STYLE"]

// 处理策略：
1. 警告级别：console.warn 提示管理员
2. 模板保留：未替换的占位符保持原样
3. 运行时错误：最终请求可能因缺少字段而失败
```

---

### 3.5 对话端预览规则

#### 3.5.1 实时预览机制

```typescript
// DynamicFormPreview 组件渲染逻辑：

function renderPreview(params: BusinessParam[], values: Record<string, any>) {
  return params.map(param => {
    // 1. 渲染标签
    renderLabel(param);

    // 2. 渲染对应组件
    switch (param.uiType) {
      case 'input':
        return <InputComponent value={values[param.key]} />;
      case 'select':
        return <SelectComponent options={param.options} value={values[param.key]} />;
      case 'switch':
        return <SwitchComponent checked={values[param.key]} />;
      case 'slider':
        return <SliderComponent min={param.min} max={param.max} value={values[param.key]} />;
      // ...
    }

    // 3. 必填标记
    if (param.required) {
      renderRequiredMark();
    }
  });
}
```

#### 3.5.2 预览与实际运行时差异

| 特性 | 预览环境 | 生产环境 |
|------|---------|---------|
| 参数来源 | 管理员配置 | 用户实际输入 |
| 默认值 | 展示默认值 | 可选覆盖 |
| 必填校验 | 显示标记 | 强制校验 |
| 实时反馈 | 立即响应 | 提交后校验 |

---

## 四、数据校验逻辑

### 4.1 业务参数校验

#### 4.1.1 校验时机

```typescript
// 1. 实时校验（onChange）
// - 输入过程中实时反馈
// - 轻度校验（格式、长度）

// 2. 保存时校验（onSave）
// - 完整性校验
// - 业务规则校验
// - 唯一性校验

// 3. 提交时校验（onSubmit）
// - 最终确认
// - 所有规则再次验证
```

#### 4.1.2 校验规则清单

```typescript
const validationRules = {
  // Key 校验
  key: [
    { rule: 'required', message: '变量标识不能为空' },
    { rule: 'pattern', pattern: /^[a-zA-Z_][a-zA-Z0-9_]{0,63}$/, message: '变量标识格式不正确' },
    { rule: 'unique', message: '变量标识不能重复' }
  ],

  // Label 校验
  label: [
    { rule: 'required', message: '显示文本不能为空' },
    { rule: 'maxLength', max: 128, message: '显示文本不能超过 128 字符' }
  ],

  // UI Type 校验
  uiType: [
    { rule: 'required', message: '交互类型不能为空' },
    { rule: 'enum', values: ['input', 'textarea', 'select', 'switch', 'slider', 'number'], message: '不支持的交互类型' }
  ],

  // Options 校验（Select 类型）
  options: [
    { rule: 'required', condition: (param) => param.uiType === 'select', message: '下拉选项不能为空' },
    { rule: 'minLength', min: 2, condition: (param) => param.uiType === 'select', message: '至少需要 2 个选项' },
    { rule: 'maxLength', max: 50, condition: (param) => param.uiType === 'select', message: '最多支持 50 个选项' },
    { rule: 'uniqueLabel', message: '选项显示文本不能重复' },
    { rule: 'uniqueValue', message: '选项值不能重复' }
  ],

  // Placeholder 校验（Input/Textarea 类型）
  placeholder: [
    { rule: 'maxLength', max: 256, message: '占位提示语不能超过 256 字符' }
  ],

  // 数值范围校验（Slider/Number 类型）
  range: [
    { rule: 'minLessThanMax', message: '最小值必须小于最大值' },
    { rule: 'stepPositive', message: '步长必须为正数' },
    { rule: 'stepValid', message: '步长不能超过范围' },
    { rule: 'defaultInRange', message: '默认值必须在范围内' }
  ]
};
```

#### 4.1.3 校验实现示例

```typescript
// requestEngine.js 中的校验函数

export function validateBusinessParam(param: BusinessParam): ValidationResult {
  const errors: string[] = [];

  // 1. Key 校验
  if (!param.key || !param.key.trim()) {
    errors.push('变量标识不能为空');
  } else if (!/^[a-zA-Z_][a-zA-Z0-9_]{0,63}$/.test(param.key)) {
    errors.push('变量标识只能包含字母、数字和下划线，且不能以数字开头');
  }

  // 2. Label 校验
  if (!param.label || !param.label.trim()) {
    errors.push('显示文本不能为空');
  } else if (param.label.length > 128) {
    errors.push('显示文本不能超过 128 字符');
  }

  // 3. UI Type 校验
  const validUITypes = ['input', 'textarea', 'select', 'switch', 'slider', 'number'];
  if (!validUITypes.includes(param.uiType)) {
    errors.push('不支持的交互类型');
  }

  // 4. Select 类型专属校验
  if (param.uiType === 'select') {
    if (!param.options || param.options.length < 2) {
      errors.push('下拉选项至少需要 2 个');
    } else if (param.options.length > 50) {
      errors.push('下拉选项最多支持 50 个');
    }

    // 检查 label 重复
    const labels = param.options.map(o => o.label);
    if (new Set(labels).size !== labels.length) {
      errors.push('选项显示文本不能重复');
    }

    // 检查 value 重复
    const values = param.options.map(o => o.value);
    if (new Set(values).size !== values.length) {
      errors.push('选项值不能重复');
    }
  }

  // 5. Slider/Number 类型专属校验
  if (param.uiType === 'slider' || param.uiType === 'number') {
    if (param.min >= param.max) {
      errors.push('最小值必须小于最大值');
    }

    if (param.step <= 0) {
      errors.push('步长必须为正数');
    }

    if (param.step > (param.max - param.min)) {
      errors.push('步长不能超过范围');
    }

    if (param.defaultValue < param.min || param.defaultValue > param.max) {
      errors.push('默认值必须在范围内');
    }
  }

  return {
    valid: errors.length === 0,
    errors
  };
}
```

---

### 4.2 请求体模板校验

#### 4.2.1 校验流程

```typescript
// validateTemplate() 执行步骤：

function validateTemplate(template: string): ValidationResult {
  // 步骤 1：非空检查
  if (!template || !template.trim()) {
    return { valid: false, error: '模板不能为空' };
  }

  // 步骤 2：JSON 格式检查（临时替换占位符）
  const tempTemplate = template.replace(/\{\{(\w+)\}\}/g, '""');

  try {
    JSON.parse(tempTemplate);
  } catch (e) {
    return { valid: false, error: `JSON 格式错误：${e.message}` };
  }

  // 步骤 3：占位符格式检查
  const placeholderRegex = /\{\{(\w+)\}\}/g;
  let match;
  while ((match = placeholderRegex.exec(template)) !== null) {
    const varName = match[1];
    if (!varName || varName.length === 0) {
      return { valid: false, error: '占位符变量名不能为空' };
    }
  }

  // 步骤 4：语法歧义检查
  // 检测可能导致类型推断错误的模式
  const ambiguousPatterns = [
    /"\{\{[^"]+\}\}"[^"]*"/,  // 嵌套引号
    /\{\{[^}]+\}\}[^,\s\]}]/,  // 缺少逗号/括号不匹配
  ];

  for (const pattern of ambiguousPatterns) {
    if (pattern.test(template)) {
      return {
        valid: false,
        error: '模板存在语法歧义，请检查占位符使用是否正确'
      };
    }
  }

  return { valid: true, error: null };
}
```

#### 4.2.2 常见错误与修复

| 错误类型 | 错误示例 | 正确示例 | 修复建议 |
|---------|---------|---------|---------|
| 字符串未加引号 | `"query": {{USER_INPUT}}` | `"query": "{{USER_INPUT}}"` | 字符串类型的占位符需要加引号 |
| 多余引号 | `"query": """{{USER_INPUT}}"""` | `"query": "{{USER_INPUT}}"` | 只能有一对引号 |
| 数字缺引号 | `"temp": {{TEMPERATURE}}` | `"temp": {{TEMPERATURE}}` | ✅ 数字类型不加引号 |
| 括号不匹配 | `{"key": "{{VAR}}"` | `{"key": "{{VAR}}"}` | 检查括号闭合 |
| 空变量名 | `{{}}` | `{{VALID_VAR}}` | 变量名不能为空 |

---

### 4.3 变量替换校验

#### 4.3.1 替换前校验

```typescript
// buildRequestBody() 替换前检查：

function buildRequestBody(template: string, context: Record<string, any>): string {
  // 1. 提取所有占位符
  const variables = extractVariables(template);

  // 2. 检查必填变量是否都已赋值
  const unassignedVars = getUnassignedVariables(template, context);

  if (unassignedVars.length > 0) {
    console.warn(`[警告] 以下变量未赋值：${unassignedVars.join(', ')}`);
    // 不阻止流程，但记录警告
  }

  // 3. 检查变量值类型是否匹配
  for (const varName of variables) {
    const value = context[varName];

    // 检测潜在的类型不匹配
    if (value !== undefined && value !== null) {
      const templateContext = getTemplateContext(template, varName);
      const expectedType = inferType(templateContext);
      const actualType = typeof value;

      if (!isTypeCompatible(expectedType, actualType)) {
        console.warn(
          `[警告] 变量 ${varName} 类型可能不匹配：` +
          `期望 ${expectedType}，实际 ${actualType}`
        );
      }
    }
  }

  // 4. 执行替换
  let result = template;
  for (const [key, value] of Object.entries(context)) {
    result = replacePlaceholder(result, key, value);
  }

  // 5. 验证最终 JSON
  try {
    JSON.parse(result);
  } catch (e) {
    return {
      error: `替换后 JSON 格式错误：${e.message}`
    };
  }

  return result;
}
```

#### 4.3.2 类型推断与兼容性

```typescript
// 类型推断规则：

function inferType(templateContext: string): 'string' | 'number' | 'boolean' {
  // 根据上下文推断期望类型

  // 数字上下文：前后有逗号、冒号、括号等
  if (/[:\[,\s]\s*\{\{/.test(templateContext)) {
    return 'number'; // {"temp": {{VAR}}}
  }

  // 布尔上下文：true/false 关键字
  if (templateContext.includes('true') || templateContext.includes('false')) {
    return 'boolean';
  }

  // 字符串上下文：双引号内
  if (/"[^"]*\{\{/.test(templateContext)) {
    return 'string';
  }

  // 默认字符串
  return 'string';
}

// 类型兼容性检查：

function isTypeCompatible(expected: string, actual: string): boolean {
  // 实际类型到期望类型的兼容矩阵
  const compatibilityMatrix = {
    'string': ['string', 'number', 'boolean'], // 宽松模式
    'number': ['number'],
    'boolean': ['boolean']
  };

  return compatibilityMatrix[expected]?.includes(actual) ?? false;
}
```

---

## 五、用户交互流程

### 5.1 业务参数配置流程

```
┌─────────────────────────────────────────────────────────────────┐
│                     业务参数配置流程                              │
└─────────────────────────────────────────────────────────────────┘

开始
  │
  ▼
┌─────────────────┐
│ 1. 点击"添加     │
│    业务参数"     │
└─────────────────┘
  │
  ▼
┌─────────────────┐
│ 2. 填写基础配置  │
│ - 变量标识 (Key) │
│ - 显示文本 (Label)│
│ - 交互类型 (Type)│
│ - 是否必填       │
└─────────────────┘
  │
  ├── 校验失败？ ──┐
  │    是         │
  ▼               ▼
┌─────────────────┐   ┌─────────────────┐
│ 显示错误提示    │ ← │ 返回修改        │
└─────────────────┘   └─────────────────┘
  │
  否
  ▼
┌─────────────────┐
│ 3. 配置数据约束  │
│ (根据类型不同)   │
└─────────────────┘
  │
  ├── Select ────┐
  │ → 添加选项列表│
  ▼              ▼
┌─────────────────┐   ┌─────────────────┐
│ 4. 设置默认值   │   │ Input/Slider等  │
└─────────────────┘   │ 跳过或设置      │
  │                   └─────────────────┘
  ▼
┌─────────────────┐
│ 5. 点击"保存"   │
└─────────────────┘
  │
  ├── 校验失败？ ──┐
  │    是         │
  ▼               ▼
┌─────────────────┐   ┌─────────────────┐
│ 显示错误详情    │ ← │ 返回修改        │
└─────────────────┘   └─────────────────┘
  │
  是
  ▼
┌─────────────────┐
│ 6. 保存成功     │
│ - 添加到参数列表 │
│ - 更新拾取器    │
│ - 关闭弹窗      │
└─────────────────┘
  │
  ▼
结束
```

### 5.2 变量插入流程

```
┌─────────────────────────────────────────────────────────────────┐
│                     变量插入流程                                 │
└─────────────────────────────────────────────────────────────────┘

开始
  │
  ▼
┌─────────────────────────┐
│ 用户在模板编辑器中输入   │
│ 或点击变量拾取器        │
└─────────────────────────┘
  │
  ├── 点击拾取器变量 ─────┐
  │                      │
  ▼                      ▼
┌────────────────────┐   ┌────────────────────┐
│ 获取 textarea       │   │ 直接获取变量名     │
│ 光标位置            │   │                    │
└────────────────────┘   └────────────────────┘
  │                      │
  └──────────┬───────────┘
             ▼
┌─────────────────────────┐
│ 构造占位符字符串         │
│ "{{VARIABLE_NAME}}"    │
└─────────────────────────┘
             │
             ▼
┌─────────────────────────┐
│ 在光标位置插入           │
│ oldValue = ...          │
│ newValue = oldValue[0:pos] + "{{VAR}}" + oldValue[pos:end] │
└─────────────────────────┘
             │
             ▼
┌─────────────────────────┐
│ 更新状态                 │
│ updateBodyTemplate()    │
└─────────────────────────┘
             │
             ▼
┌─────────────────────────┐
│ 重新渲染编辑器          │
│ 保持 textarea 焦点      │
│ 光标定位到占位符之后     │
└─────────────────────────┘
             │
             ▼
结束
```

### 5.3 预览更新流程

```
┌─────────────────────────────────────────────────────────────────┐
│                     预览更新流程                                 │
└─────────────────────────────────────────────────────────────────┘

管理员操作
  │
  ├── 添加参数 ──────────┐
  ├── 编辑参数 ──────────┤
  ├── 删除参数 ──────────┤
  └── 修改参数值 ────────┘
             │
             ▼
┌─────────────────────────┐
│ 触发 onChange           │
│ setPreviewValues()      │
└─────────────────────────┘
             │
             ▼
┌─────────────────────────┐
│ 状态更新                 │
│ React 重新渲染          │
└─────────────────────────┘
             │
             ▼
┌─────────────────────────┐
│ DynamicFormPreview 渲染  │
│ 遍历 businessParams     │
│ 根据 uiType 渲染组件    │
└─────────────────────────┘
             │
             ▼
┌─────────────────────────┐
│ 显示预览区域             │
│ - 参数标签              │
│ - UI 组件               │
│ - 必填标记              │
│ - 默认值                │
└─────────────────────────┘
             │
             ▼
用户交互（可选）
  │
  ├── 修改参数值 ─────────┐
  ├── 触发 onParamChange  │
  └── 更新 previewValues  │
             │
             ▼
结束
```

---

## 六、系统约束

### 6.1 性能约束

| 指标 | 限制 | 说明 |
|------|------|------|
| 单个智能体业务参数数量 | ≤ 50 个 | 避免界面过于复杂 |
| 单个选项列表选项数 | ≤ 50 个 | Select 类型限制 |
| 请求体模板大小 | ≤ 64 KB | JSON 模板字符数限制 |
| 变量名长度 | ≤ 64 字符 | 包含 `{{}}` 不超过 66 |
| 标签文本长度 | ≤ 128 字符 | Label 显示限制 |

### 6.2 安全约束

```typescript
// XSS 防护：所有用户输入必须转义
function escapeHtml(str: string): string {
  const escapeMap = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;'
  };
  return str.replace(/[&<>"']/g, char => escapeMap[char]);
}

// SQL 注入防护（如有数据库操作）
// 使用参数化查询，禁止字符串拼接 SQL

// JSON 解析安全
// 限制 JSON 嵌套深度 ≤ 100 层
// 限制字符串值最大长度 ≤ 1MB
```

### 6.3 可用性约束

```typescript
// 浏览器兼容性
const browserSupport = {
  Chrome: '>= 80',
  Firefox: '>= 75',
  Safari: '>= 13',
  Edge: '>= 80',
  MobileSafari: '>= 13',
  ChromeAndroid: '>= 80'
};

// 响应式断点
const breakpoints = {
  mobile: '640px',    // 手机
  tablet: '768px',   // 平板
  desktop: '1024px', // 桌面
  wide: '1280px'     // 宽屏
};
```

---

## 七、错误处理

### 7.1 错误分类

```typescript
enum ErrorLevel {
  WARN = 'warn',     // 警告：不影响功能，但可能有问题
  ERROR = 'error',   // 错误：阻止操作，但可恢复
  FATAL = 'fatal'   // 致命：系统无法继续运行
}

interface SystemError {
  level: ErrorLevel;
  code: string;          // 错误代码
  message: string;       // 用户可读的错误信息
  details?: any;         // 详细信息
  timestamp: number;     // 发生时间
  stack?: string;        // 错误堆栈（开发环境）
}
```

### 7.2 错误代码清单

| 代码 | 级别 | 说明 | 用户提示 |
|------|------|------|---------|
| `PARAM_KEY_INVALID` | ERROR | 变量标识格式无效 | "变量标识格式不正确，只能包含字母、数字和下划线" |
| `PARAM_KEY_DUPLICATE` | ERROR | 变量标识重复 | "变量标识不能重复" |
| `PARAM_OPTIONS_INVALID` | ERROR | 选项配置无效 | "请检查选项配置，确保至少 2 个选项且无重复" |
| `PARAM_RANGE_INVALID` | ERROR | 数值范围配置错误 | "最小值必须小于最大值，步长必须为正数" |
| `TEMPLATE_JSON_INVALID` | ERROR | 模板 JSON 格式错误 | "请求体模板 JSON 格式不正确，请检查语法" |
| `TEMPLATE_PLACEHOLDER_EMPTY` | WARN | 空占位符变量名 | "存在空的占位符，请检查模板" |
| `TEMPLATE_VAR_UNASSIGNED` | WARN | 变量未赋值 | "以下变量未赋值：{varList}" |
| `RUNTIME_JSON_ENCODE_FAILED` | FATAL | JSON 编码失败 | "系统错误，请刷新页面重试" |

### 7.3 错误展示策略

```typescript
// 错误展示优先级
const errorDisplayPriority = {
  // 1. 最高：致命错误 - 全屏错误页面
  [ErrorLevel.FATAL]: {
    component: 'ErrorPage',
    behavior: 'block_all',
    allowDismiss: false
  },

  // 2. 高：错误提示 - 顶部固定提示条
  [ErrorLevel.ERROR]: {
    component: 'ErrorToast',
    behavior: 'auto_dismiss_5s',
    allowDismiss: true,
    position: 'top-right'
  },

  // 3. 中：警告提示 - 内联警告
  [ErrorLevel.WARN]: {
    component: 'WarningInline',
    behavior: 'inline_display',
    allowDismiss: true,
    position: 'near_component'
  }
};
```

---

## 八、附录

### 8.1 数据模型完整定义

```typescript
// 智能体配置完整模型
interface AgentConfig {
  // 基本信息
  agentInfo: {
    name: string;              // 智能体名称
    tags: string[];           // 标签列表
    description: string;      // 描述
    avatar: string | null;   // 头像 URL
  };

  // API 配置
  apiConfig: {
    queryFrequency: string;   // 查询频率
    apiType: string;         // API 类型
    apiName: string;         // API 名称
    apiUrl: string;          // API 地址
    apiDescription: string;  // API 描述
    authType: 'API_KEY' | 'BEARER_TOKEN' | 'NONE';
    apiKey?: string;
    bearerToken?: string;
    method: 'GET' | 'POST' | 'PUT' | 'DELETE';
    headers: Array<{ key: string; value: string }>;
    body: string;            // 请求体模板
    isStreaming: boolean;
  };

  // 入参配置
  inputParams: {
    bodyTemplate: string;    // 请求体模板
    businessParams: BusinessParam[]; // 业务参数列表
  };

  // 出参配置
  outputVariables: Array<{
    name: string;
    path: string;            // JSONPath
    description: string;
  }>;

  componentBindings: Array<{
    componentType: string;
    variableName: string;
  }>;

  testResponse: any;
  testError: any;
  configStatus: 'incomplete' | 'tested' | 'complete';
}
```

### 8.2 相关文件清单

| 文件路径 | 说明 |
|---------|------|
| `src/components/BusinessParamModal.jsx` | 业务参数配置弹窗组件 |
| `src/components/DynamicFormPreview.jsx` | 动态表单预览组件 |
| `src/components/RequestPreview.jsx` | 请求预览组件 |
| `src/components/InputParamsConfig.jsx` | 入参配置主组件 |
| `src/utils/requestEngine.js` | 请求引擎工具函数 |
| `src/context/ConfigContext.jsx` | 配置状态管理 |
| `src/App.jsx` | 应用主组件 |
| `DYNAMIC_FORM_FEATURE_GUIDE.md` | 功能演示指南 |

### 8.3 版本历史

| 版本 | 日期 | 修改内容 | 作者 |
|------|------|---------|------|
| v1.0 | 2026-04-03 | 初始版本，包含核心逻辑定义 | ECHO Team |

---

## 九、待明确事项

以下事项需要在后续评审中确认：

1. **变量作用域**：业务参数是否需要在多个智能体间共享？
2. **版本管理**：是否需要支持配置版本回滚？
3. **权限控制**：是否需要区分管理员和普通用户权限？
4. **审计日志**：是否需要记录所有配置变更？
5. **导入导出**：是否需要支持配置的批量导入导出？
6. **模板市场**：是否需要预设参数模板库？

---

**文档状态：待评审**

**下一步行动：**
- [ ] 产品团队评审核心逻辑
- [ ] 开发团队确认技术可行性
- [ ] 设计团队确认 UX 细节
- [ ] 最终确认并锁定 PRD
