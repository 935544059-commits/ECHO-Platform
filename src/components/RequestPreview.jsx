import { useState } from 'react';
import { buildRequestBody, mergeVariables, extractVariables } from '../utils/requestEngine';

/**
 * 请求预览组件
 * 展示最终生成的请求体
 */
export default function RequestPreview({ template, businessParams, businessValues }) {
  const [showPreview, setShowPreview] = useState(false);

  // 模拟内置变量
  const builtinVars = {
    USER_INPUT: '用户输入的内容',
    SESSION_ID: 'session_123456',
    TIMESTAMP: Date.now(),
    USER_ID: 'user_789',
  };

  // 合并变量
  const context = mergeVariables(builtinVars, businessParams, businessValues);
  
  // 提取模板中的变量
  const templateVars = extractVariables(template);
  
  // 生成预览
  const previewBody = buildRequestBody(template, context);

  return (
    <div className="mt-4">
      <button
        onClick={() => setShowPreview(!showPreview)}
        className="text-sm text-blue-600 hover:text-blue-700"
      >
        {showPreview ? '隐藏预览' : '查看请求预览'}
      </button>

      {showPreview && (
        <div className="mt-2 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <div className="mb-2 text-xs text-gray-500">
            <strong>可用变量：</strong> {templateVars.join(', ') || '无'}
          </div>
          <div className="mb-2 text-xs text-gray-500">
            <strong>变量映射：</strong>
            <pre className="mt-1 text-xs bg-white p-2 rounded">
              {JSON.stringify(context, null, 2)}
            </pre>
          </div>
          <div className="text-xs text-gray-500 mb-1">
            <strong>最终请求体：</strong>
          </div>
          <pre className="text-xs bg-white p-3 rounded border border-gray-200 overflow-auto max-h-64">
            {previewBody}
          </pre>
        </div>
      )}
    </div>
  );
}
