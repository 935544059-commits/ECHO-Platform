import { useState } from 'react';
import { useConfig } from '../context/ConfigContext';
import { buildMappingFromVariables } from '../utils/parser';
import { 
  Code, 
  Copy, 
  Check, 
  Download,
  Settings2
} from 'lucide-react';

export default function ConfigPreview() {
  const { config } = useConfig();
  const [copied, setCopied] = useState(false);

  const generateConfig = () => {
    const mapping = buildMappingFromVariables(config.outputVariables);
    
    return {
      api: {
        url: config.apiConfig.url,
        method: config.apiConfig.method,
        headers: config.apiConfig.headers.reduce((acc, h) => {
          if (h.key.trim()) acc[h.key] = h.value;
          return acc;
        }, {}),
        bodyTemplate: config.apiConfig.body,
        isStreaming: config.apiConfig.isStreaming,
      },
      inputParams: {
        bodyTemplate: config.inputParams.bodyTemplate,
        businessParams: config.inputParams.businessParams.map(p => ({
          key: p.key,
          label: p.label,
          type: p.type,
          required: p.required,
          options: p.options,
          defaultValue: p.defaultValue,
          placeholder: p.placeholder,
        })),
      },
      mapping,
      variables: config.outputVariables.map(v => ({
        name: v.name,
        path: v.path,
        type: v.type,
      })),
      renderers: config.componentBindings
        .sort((a, b) => a.order - b.order)
        .map(b => ({
          component: b.componentType,
          bindTo: b.variableName,
        })),
    };
  };

  const handleCopy = () => {
    const configJson = JSON.stringify(generateConfig(), null, 2);
    navigator.clipboard.writeText(configJson);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const configJson = JSON.stringify(generateConfig(), null, 2);
    const blob = new Blob([configJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'echo-agent-config.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const configJson = generateConfig();

  return (
    <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-orange-500/20 rounded-lg">
            <Settings2 className="w-5 h-5 text-orange-400" />
          </div>
          <h2 className="text-lg font-semibold text-white">配置导出</h2>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="flex items-center gap-2 px-3 py-1.5 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm text-slate-300 transition-colors"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-green-400" />
                已复制
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                复制
              </>
            )}
          </button>
          
          <button
            onClick={handleDownload}
            className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 rounded-lg text-sm text-white transition-colors"
          >
            <Download className="w-4 h-4" />
            导出
          </button>
        </div>
      </div>

      <div className="relative">
        <div className="absolute top-2 right-2 flex items-center gap-1 text-xs text-slate-500">
          <Code className="w-3 h-3" />
          JSON
        </div>
        
        <pre className="bg-slate-900/50 rounded-lg p-4 overflow-auto max-h-64 text-sm font-mono text-slate-300 border border-slate-700">
          {JSON.stringify(configJson, null, 2)}
        </pre>
      </div>

      <div className="mt-4 grid grid-cols-4 gap-3">
        <div className="p-3 bg-slate-900/30 rounded-lg border border-slate-700">
          <div className="text-2xl font-bold text-white">{config.inputParams.businessParams.length}</div>
          <div className="text-xs text-slate-500">业务参数</div>
        </div>
        
        <div className="p-3 bg-slate-900/30 rounded-lg border border-slate-700">
          <div className="text-2xl font-bold text-white">{config.outputVariables.length}</div>
          <div className="text-xs text-slate-500">输出变量</div>
        </div>
        
        <div className="p-3 bg-slate-900/30 rounded-lg border border-slate-700">
          <div className="text-2xl font-bold text-white">{config.componentBindings.length}</div>
          <div className="text-xs text-slate-500">组件绑定</div>
        </div>
        
        <div className="p-3 bg-slate-900/30 rounded-lg border border-slate-700">
          <div className="text-2xl font-bold text-white">
            {config.apiConfig.isStreaming ? 'SSE' : 'HTTP'}
          </div>
          <div className="text-xs text-slate-500">传输模式</div>
        </div>
      </div>
    </div>
  );
}
