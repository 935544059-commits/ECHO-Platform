import { useState, useRef } from 'react';
import { useConfig } from '../context/ConfigContext';
import { Code, Copy, Check, MousePointer, Plus } from 'lucide-react';

const BUILTIN_VARIABLES = [
  { name: 'USER_INPUT', description: '用户输入的文本内容', icon: '💬' },
  { name: 'SESSION_ID', description: '当前会话 ID', icon: '🔗' },
  { name: 'TIMESTAMP', description: '当前时间戳', icon: '⏰' },
  { name: 'USER_ID', description: '用户 ID', icon: '👤' },
];

export default function InputParamsConfig() {
  const { config, updateBodyTemplate, addBusinessParam } = useConfig();
  const [copied, setCopied] = useState(false);
  const textareaRef = useRef(null);
  const [showAddParam, setShowAddParam] = useState(false);
  const [newParam, setNewParam] = useState({ key: '', label: '', type: 'text' });

  const handleInsertVariable = (varName) => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const insertText = `{{${varName}}}`;
    
    const newValue = config.inputParams.bodyTemplate.substring(0, start) + insertText + config.inputParams.bodyTemplate.substring(end);
    updateBodyTemplate(newValue);
    
    setTimeout(() => {
      textarea.focus();
      const newCursorPos = start + insertText.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(config.inputParams.bodyTemplate);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFormat = () => {
    try {
      const parsed = JSON.parse(config.inputParams.bodyTemplate);
      updateBodyTemplate(JSON.stringify(parsed, null, 2));
    } catch (e) {
      console.warn('Invalid JSON');
    }
  };

  const handleAddBusinessParam = () => {
    if (!newParam.key.trim() || !newParam.label.trim()) return;
    addBusinessParam({
      ...newParam,
      id: Date.now().toString(),
      required: false,
      options: [],
      defaultValue: '',
    });
    setNewParam({ key: '', label: '', type: 'text' });
    setShowAddParam(false);
  };

  const businessVariables = config.inputParams.businessParams.map(p => ({
    name: p.key.toUpperCase(),
    description: `业务参数：${p.label}`,
    icon: p.type === 'select' ? '📋' : p.type === 'number' ? '🔢' : '📝'
  }));

  return (
    <div className="card-light p-6">
      <div className="section-title mb-4">入参动态构建</div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* JSON 编辑器 */}
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Code className="w-4 h-4 text-gray-400" />
              <span className="text-sm font-medium text-gray-700">请求体模板</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleFormat}
                className="text-xs text-gray-500 hover:text-gray-700 transition-colors px-2 py-1 hover:bg-gray-100 rounded"
              >
                格式化
              </button>
              <button
                onClick={handleCopy}
                className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 transition-colors px-2 py-1 hover:bg-gray-100 rounded"
              >
                {copied ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
                {copied ? '已复制' : '复制'}
              </button>
            </div>
          </div>
          
          <div className="relative font-mono text-sm">
            <textarea
              ref={textareaRef}
              value={config.inputParams.bodyTemplate}
              onChange={(e) => updateBodyTemplate(e.target.value)}
              rows={8}
              className="input-light resize-none font-mono text-sm"
              spellCheck={false}
            />
          </div>
          
          <p className="text-xs text-gray-500">
            使用 <code className="bg-yellow-100 px-1.5 py-0.5 rounded text-yellow-700">{'{{变量名}}'}</code> 插入动态变量
          </p>
        </div>

        {/* 变量拾取器 */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <MousePointer className="w-4 h-4 text-gray-400" />
            <span className="text-sm font-medium text-gray-700">变量拾取器</span>
          </div>
          
          <div className="bg-gray-50 rounded-lg border border-gray-200 p-3 space-y-2 max-h-80 overflow-auto">
            <div className="text-xs text-gray-500 uppercase tracking-wider mb-2">内置变量</div>
            {BUILTIN_VARIABLES.map(v => (
              <button
                key={v.name}
                onClick={() => handleInsertVariable(v.name)}
                className="w-full flex items-center gap-2 p-2 rounded-lg hover:bg-white hover:shadow-sm transition-all text-left group"
              >
                <span className="text-lg">{v.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <code className="text-xs text-blue-600 group-hover:text-blue-700">{'{{' + v.name + '}}'}</code>
                  </div>
                  <p className="text-xs text-gray-500 truncate">{v.description}</p>
                </div>
              </button>
            ))}
            
            {businessVariables.length > 0 && (
              <>
                <div className="text-xs text-gray-500 uppercase tracking-wider mt-4 mb-2">业务参数</div>
                {businessVariables.map(v => (
                  <button
                    key={v.name}
                    onClick={() => handleInsertVariable(v.name)}
                    className="w-full flex items-center gap-2 p-2 rounded-lg hover:bg-white hover:shadow-sm transition-all text-left group"
                  >
                    <span className="text-lg">{v.icon}</span>
                    <div className="flex-1 min-w-0">
                      <code className="text-xs text-purple-600 group-hover:text-purple-700">{'{{' + v.name + '}}'}</code>
                      <p className="text-xs text-gray-500 truncate">{v.description}</p>
                    </div>
                  </button>
                ))}
              </>
            )}
          </div>

          {/* 添加业务参数按钮 */}
          {!showAddParam && (
            <button
              onClick={() => setShowAddParam(true)}
              className="w-full flex items-center justify-center gap-1 text-sm text-blue-600 hover:text-blue-700 py-2 border border-dashed border-blue-300 rounded-lg hover:bg-blue-50 transition-colors"
            >
              <Plus className="w-4 h-4" />
              添加业务参数
            </button>
          )}

          {showAddParam && (
            <div className="bg-gray-50 rounded-lg border border-gray-200 p-3 space-y-3">
              <div>
                <input
                  type="text"
                  value={newParam.key}
                  onChange={(e) => setNewParam({ ...newParam, key: e.target.value })}
                  placeholder="参数键名 (如：scene)"
                  className="input-light text-sm"
                />
              </div>
              <div>
                <input
                  type="text"
                  value={newParam.label}
                  onChange={(e) => setNewParam({ ...newParam, label: e.target.value })}
                  placeholder="显示标签 (如：业务场景)"
                  className="input-light text-sm"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleAddBusinessParam}
                  className="flex-1 btn-primary text-xs py-1.5"
                >
                  确认
                </button>
                <button
                  onClick={() => setShowAddParam(false)}
                  className="flex-1 btn-secondary text-xs py-1.5"
                >
                  取消
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
