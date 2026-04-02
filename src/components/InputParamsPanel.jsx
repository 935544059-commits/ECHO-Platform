import { useState, useRef, useEffect } from 'react';
import { useConfig } from '../context/ConfigContext';
import { 
  Code, 
  Copy, 
  Check, 
  MousePointer,
  Braces,
  Variable
} from 'lucide-react';

const BUILTIN_VARIABLES = [
  { name: 'USER_INPUT', description: '用户输入的文本内容', icon: '💬' },
  { name: 'SESSION_ID', description: '当前会话 ID', icon: '🔗' },
  { name: 'TIMESTAMP', description: '当前时间戳', icon: '⏰' },
  { name: 'USER_ID', description: '用户 ID', icon: '👤' },
];

function JsonEditor({ value, onChange, onVariableInsert }) {
  const textareaRef = useRef(null);
  const [cursorPosition, setCursorPosition] = useState(0);

  const handleInsertVariable = (varName) => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const insertText = `{{${varName}}}`;
    
    const newValue = value.substring(0, start) + insertText + value.substring(end);
    onChange(newValue);
    
    setTimeout(() => {
      textarea.focus();
      const newCursorPos = start + insertText.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  const highlightSyntax = (text) => {
    return text
      .replace(/(".*?")/g, '<span class="json-tree-string">$1</span>')
      .replace(/(\d+\.?\d*)/g, '<span class="json-tree-number">$1</span>')
      .replace(/(true|false)/g, '<span class="json-tree-boolean">$1</span>')
      .replace(/(null)/g, '<span class="json-tree-null">$1</span>')
      .replace(/(\{\{.*?\}\})/g, '<span class="bg-yellow-500/30 text-yellow-300 px-0.5 rounded">$1</span>');
  };

  return (
    <div className="relative">
      <div className="absolute top-2 right-2 flex items-center gap-2 z-10">
        <span className="text-xs text-slate-500 bg-slate-800 px-2 py-1 rounded">JSON</span>
      </div>
      
      <div className="relative font-mono text-sm">
        <pre 
          className="absolute inset-0 p-4 pointer-events-none whitespace-pre-wrap break-all overflow-auto text-slate-300"
          dangerouslySetInnerHTML={{ __html: highlightSyntax(value) }}
        />
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onSelect={(e) => setCursorPosition(e.target.selectionStart)}
          className="relative w-full h-64 bg-transparent text-transparent caret-white px-4 py-3 rounded-lg border border-slate-600 focus:border-blue-500 focus:outline-none resize-none font-mono text-sm"
          spellCheck={false}
        />
      </div>
    </div>
  );
}

export default function InputParamsPanel() {
  const { config, updateBodyTemplate } = useConfig();
  const [copied, setCopied] = useState(false);

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

  const businessVariables = config.inputParams.businessParams.map(p => ({
    name: p.key.toUpperCase(),
    description: `业务参数: ${p.label}`,
    icon: p.type === 'select' ? '📋' : p.type === 'number' ? '🔢' : '📝'
  }));

  const allVariables = [...BUILTIN_VARIABLES, ...businessVariables];

  return (
    <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 h-full">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-cyan-500/20 rounded-lg">
          <Braces className="w-5 h-5 text-cyan-400" />
        </div>
        <h2 className="text-lg font-semibold text-white">入参动态构建</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Code className="w-4 h-4 text-slate-400" />
              <span className="text-sm font-medium text-slate-300">请求体模板</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleFormat}
                className="text-xs text-slate-400 hover:text-white transition-colors px-2 py-1 hover:bg-slate-700 rounded"
              >
                格式化
              </button>
              <button
                onClick={handleCopy}
                className="flex items-center gap-1 text-xs text-slate-400 hover:text-white transition-colors px-2 py-1 hover:bg-slate-700 rounded"
              >
                {copied ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
                {copied ? '已复制' : '复制'}
              </button>
            </div>
          </div>
          
          <div className="bg-slate-900/50 rounded-lg border border-slate-700 overflow-hidden">
            <JsonEditor
              value={config.inputParams.bodyTemplate}
              onChange={updateBodyTemplate}
            />
          </div>
          
          <p className="text-xs text-slate-500">
            使用 <code className="bg-slate-700 px-1.5 py-0.5 rounded text-yellow-300">{'{{变量名}}'}</code> 插入动态变量
          </p>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <MousePointer className="w-4 h-4 text-slate-400" />
            <span className="text-sm font-medium text-slate-300">变量拾取器</span>
          </div>
          
          <div className="bg-slate-900/50 rounded-lg border border-slate-700 p-3 space-y-2 max-h-80 overflow-auto">
            <div className="text-xs text-slate-500 uppercase tracking-wider mb-2">内置变量</div>
            {BUILTIN_VARIABLES.map(v => (
              <button
                key={v.name}
                onClick={() => {
                  const textarea = document.querySelector('textarea');
                  if (textarea) {
                    const start = textarea.selectionStart;
                    const end = textarea.selectionEnd;
                    const insertText = `{{${v.name}}}`;
                    const newValue = config.inputParams.bodyTemplate.substring(0, start) + insertText + config.inputParams.bodyTemplate.substring(end);
                    updateBodyTemplate(newValue);
                  }
                }}
                className="w-full flex items-center gap-2 p-2 rounded-lg hover:bg-slate-700/50 transition-colors text-left group"
              >
                <span className="text-lg">{v.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <code className="text-xs text-cyan-400 group-hover:text-cyan-300">{'{{' + v.name + '}}'}</code>
                  </div>
                  <p className="text-xs text-slate-500 truncate">{v.description}</p>
                </div>
              </button>
            ))}
            
            {businessVariables.length > 0 && (
              <>
                <div className="text-xs text-slate-500 uppercase tracking-wider mt-4 mb-2">业务参数</div>
                {businessVariables.map(v => (
                  <button
                    key={v.name}
                    onClick={() => {
                      const insertText = `{{${v.name}}}`;
                      const newValue = config.inputParams.bodyTemplate + insertText;
                      updateBodyTemplate(newValue);
                    }}
                    className="w-full flex items-center gap-2 p-2 rounded-lg hover:bg-slate-700/50 transition-colors text-left group"
                  >
                    <span className="text-lg">{v.icon}</span>
                    <div className="flex-1 min-w-0">
                      <code className="text-xs text-purple-400 group-hover:text-purple-300">{'{{' + v.name + '}}'}</code>
                      <p className="text-xs text-slate-500 truncate">{v.description}</p>
                    </div>
                  </button>
                ))}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
