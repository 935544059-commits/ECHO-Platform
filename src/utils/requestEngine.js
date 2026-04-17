/**
 * 请求引擎工具函数
 * 负责解析请求体模板中的占位符，并替换为实际值
 */

/**
 * 从模板中提取所有占位符变量
 * @param {string} template - 请求体模板
 * @returns {string[]} 变量名列表
 */
export function extractVariables(template) {
  const regex = /\{\{(\w+)\}\}/g;
  const variables = [];
  let match;
  
  while ((match = regex.exec(template)) !== null) {
    const varName = match[1];
    if (!variables.includes(varName)) {
      variables.push(varName);
    }
  }
  
  return variables;
}

/**
 * 构建最终的请求体
 * @param {string} template - 请求体模板
 * @param {Object} context - 上下文变量集合
 * @returns {string} 替换后的请求体
 */
export function buildRequestBody(template, context = {}) {
  if (!template) return template;
  
  let result = template;
  
  // 替换所有占位符
  Object.keys(context).forEach(key => {
    const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
    const value = context[key];
    
    // 根据值类型进行不同处理
    if (typeof value === 'object') {
      result = result.replace(regex, JSON.stringify(value));
    } else if (typeof value === 'number' || typeof value === 'boolean') {
      // 数字和布尔值直接替换（不带引号）
      result = result.replace(regex, String(value));
    } else {
      // 字符串替换（带引号）
      result = result.replace(regex, `"${String(value).replace(/"/g, '\\"')}"`);
    }
  });
  
  return result;
}

/**
 * 验证 JSON 模板是否有效
 * @param {string} template - 请求体模板
 * @returns {Object} { valid: boolean, error: string | null }
 */
export function validateTemplate(template) {
  if (!template || !template.trim()) {
    return { valid: false, error: '模板不能为空' };
  }
  
  try {
    // 尝试解析 JSON（可能包含占位符）
    // 先临时替换占位符为有效 JSON 值
    const tempTemplate = template.replace(/\{\{\w+\}\}/g, '""');
    JSON.parse(tempTemplate);
    return { valid: true, error: null };
  } catch (e) {
    return { valid: false, error: `JSON 格式错误：${e.message}` };
  }
}

/**
 * 格式化 JSON 模板
 * @param {string} template - 请求体模板
 * @returns {string} 格式化后的模板
 */
export function formatTemplate(template) {
  try {
    const tempTemplate = template.replace(/\{\{\w+\}\}/g, '""');
    const parsed = JSON.parse(tempTemplate);
    const formatted = JSON.stringify(parsed, null, 2);
    
    // 恢复占位符（这里简化处理，实际应该更复杂）
    return formatted.replace(/""/g, '{{VARIABLE}}');
  } catch (e) {
    return template;
  }
}

/**
 * 合并多源变量
 * @param {Object} builtinVars - 内置变量
 * @param {Array} businessParams - 业务参数配置
 * @param {Object} businessValues - 业务参数实际值
 * @returns {Object} 合并后的变量集合
 */
export function mergeVariables(builtinVars = {}, businessParams = [], businessValues = {}) {
  const merged = { ...builtinVars };
  
  // 添加业务参数
  businessParams.forEach(param => {
    const key = param.key.toUpperCase();
    const value = businessValues[param.key];
    
    // 如果有用户输入的值，使用用户输入的值
    if (value !== undefined && value !== '') {
      merged[key] = value;
    } 
    // 否则使用默认值
    else if (param.defaultValue !== undefined && param.defaultValue !== '') {
      merged[key] = param.defaultValue;
    }
  });
  
  return merged;
}

/**
 * 生成请求体预览
 * @param {string} template - 请求体模板
 * @param {Object} context - 上下文变量集合
 * @returns {string} 预览文本
 */
export function generatePreview(template, context = {}) {
  return buildRequestBody(template, context);
}

/**
 * 检查模板中是否包含某个变量
 * @param {string} template - 请求体模板
 * @param {string} varName - 变量名
 * @returns {boolean} 是否包含
 */
export function hasVariable(template, varName) {
  const regex = new RegExp(`\\{\\{${varName}\\}\\}`, 'g');
  return regex.test(template);
}

/**
 * 获取未赋值的变量列表
 * @param {string} template - 请求体模板
 * @param {Object} context - 上下文变量集合
 * @returns {string[]} 未赋值的变量名列表
 */
export function getUnassignedVariables(template, context = {}) {
  const variables = extractVariables(template);
  return variables.filter(varName => {
    const value = context[varName];
    return value === undefined || value === null || value === '';
  });
}

export default {
  extractVariables,
  buildRequestBody,
  validateTemplate,
  formatTemplate,
  mergeVariables,
  generatePreview,
  hasVariable,
  getUnassignedVariables,
};
