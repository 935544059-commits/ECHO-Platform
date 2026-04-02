import { useState } from 'react';
import { useConfig } from '../context/ConfigContext';
import { 
  Eye, 
  Send, 
  User,
  MessageSquare,
  ChevronDown,
  Loader2
} from 'lucide-react';

export default function FormPreview() {
  const { config, isLoading } = useConfig();
  const [userInput, setUserInput] = useState('');
  const [paramValues, setParamValues] = useState({});

  const handleParamChange = (key, value) => {
    setParamValues(prev => ({ ...prev, [key]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form submitted:', {
      userInput,
      paramValues
    });
  };

  const renderParamInput = (param) => {
    switch (param.type) {
      case 'text':
        return (
          <input
            type="text"
            value={paramValues[param.key] || param.defaultValue || ''}
            onChange={(e) => handleParamChange(param.key, e.target.value)}
            placeholder={param.placeholder || `请输入${param.label}`}
            className="w-full bg-slate-700 text-white px-3 py-2 rounded-lg border border-slate-600 focus:border-blue-500 focus:outline-none text-sm"
          />
        );
      case 'number':
        return (
          <input
            type="number"
            value={paramValues[param.key] || param.defaultValue || ''}
            onChange={(e) => handleParamChange(param.key, e.target.value)}
            placeholder={param.placeholder || `请输入${param.label}`}
            className="w-full bg-slate-700 text-white px-3 py-2 rounded-lg border border-slate-600 focus:border-blue-500 focus:outline-none text-sm"
          />
        );
      case 'select':
        return (
          <div className="relative">
            <select
              value={paramValues[param.key] || param.defaultValue || ''}
              onChange={(e) => handleParamChange(param.key, e.target.value)}
              className="w-full appearance-none bg-slate-700 text-white px-3 py-2 pr-8 rounded-lg border border-slate-600 focus:border-blue-500 focus:outline-none text-sm"
            >
              <option value="">请选择...</option>
              {(param.options || []).map((opt, i) => (
                <option key={i} value={opt}>{opt}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          </div>
        );
      case 'boolean':
        return (
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={paramValues[param.key] ?? param.defaultValue === 'true'}
              onChange={(e) => handleParamChange(param.key, e.target.checked)}
              className="w-4 h-4 rounded border-slate-600 bg-slate-700 text-blue-500 focus:ring-blue-500"
            />
            <span className="text-sm text-slate-300">启用</span>
          </label>
        );
      default:
        return null;
    }
  };

  return (
    <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 h-full">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-emerald-500/20 rounded-lg">
          <Eye className="w-5 h-5 text-emerald-400" />
        </div>
        <h2 className="text-lg font-semibold text-white">表单预览</h2>
      </div>

      <div className="bg-slate-900/50 rounded-lg border border-slate-700 overflow-hidden">
        <div className="bg-slate-700/50 px-4 py-2 border-b border-slate-700">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <div className="w-3 h-3 rounded-full bg-yellow-500" />
            <div className="w-3 h-3 rounded-full bg-green-500" />
            <span className="ml-2 text-xs text-slate-400">用户输入界面预览</span>
          </div>
        </div>

        <div className="p-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                <User className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1">
                <div className="bg-slate-700 rounded-lg p-3">
                  <div className="text-sm text-slate-300 mb-3">
                    请输入您的问题，我将为您提供帮助。
                  </div>
                  
                  <div className="space-y-3">
                    {config.inputParams.businessParams.map(param => (
                      <div key={param.id}>
                        <label className="block text-sm text-slate-300 mb-1">
                          {param.label}
                          {param.required && <span className="text-red-400 ml-1">*</span>}
                        </label>
                        {renderParamInput(param)}
                      </div>
                    ))}
                    
                    <div>
                      <label className="block text-sm text-slate-300 mb-1">
                        您的问题
                        <span className="text-red-400 ml-1">*</span>
                      </label>
                      <textarea
                        value={userInput}
                        onChange={(e) => setUserInput(e.target.value)}
                        placeholder="请输入您想问的问题..."
                        rows={3}
                        className="w-full bg-slate-700 text-white px-3 py-2 rounded-lg border border-slate-600 focus:border-blue-500 focus:outline-none text-sm resize-none"
                      />
                    </div>
                  </div>
                  
                  <button
                    type="submit"
                    disabled={isLoading || !userInput.trim()}
                    className="mt-4 w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-medium py-2.5 rounded-lg transition-colors text-sm"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        处理中...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        发送
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>

      <div className="mt-4 p-3 bg-slate-900/30 rounded-lg border border-slate-700">
        <div className="text-xs text-slate-500 mb-2">实时数据预览</div>
        <pre className="text-xs text-slate-400 font-mono overflow-auto max-h-32">
          {JSON.stringify({
            USER_INPUT: userInput || '(未输入)',
            ...Object.fromEntries(
              config.inputParams.businessParams.map(p => [
                p.key.toUpperCase(), 
                paramValues[p.key] || p.defaultValue || '(未设置)'
              ])
            )
          }, null, 2)}
        </pre>
      </div>
    </div>
  );
}
