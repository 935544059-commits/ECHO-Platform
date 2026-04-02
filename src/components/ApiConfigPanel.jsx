import { useState } from 'react';
import { useConfig } from '../context/ConfigContext';
import { 
  Send, 
  Plus, 
  Trash2, 
  Globe, 
  ChevronDown,
  Zap,
  Loader2
} from 'lucide-react';

const HTTP_METHODS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'];

export default function ApiConfigPanel() {
  const { 
    config, 
    isLoading, 
    setIsLoading, 
    updateApiConfig, 
    addHeader, 
    updateHeader, 
    removeHeader,
    setTestResponse 
  } = useConfig();
  
  const [testInput, setTestInput] = useState('你好，请介绍一下自己');

  const handleSendTest = async () => {
    setIsLoading(true);
    setTestResponse(null, null);

    try {
      const { url, method, headers, body, isStreaming } = config.apiConfig;
      
      const processedBody = body.replace(/{{USER_INPUT}}/g, testInput);
      
      const headerObj = {};
      headers.forEach(h => {
        if (h.key.trim()) {
          headerObj[h.key.trim()] = h.value;
        }
      });

      if (isStreaming) {
        await handleSSERequest(url, headerObj, processedBody);
      } else {
        const response = await fetch(url, {
          method,
          headers: headerObj,
          body: method !== 'GET' ? processedBody : undefined,
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        setTestResponse(data, null);
      }
    } catch (error) {
      setTestResponse(null, error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSSERequest = async (url, headers, body) => {
    try {
      const response = await fetch(url, {
        method: config.apiConfig.method,
        headers,
        body: config.apiConfig.method !== 'GET' ? body : undefined,
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let fullResponse = { chunks: [] };

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') continue;
            try {
              const json = JSON.parse(data);
              fullResponse.chunks.push(json);
              setTestResponse({ ...fullResponse }, null);
            } catch (e) {
              console.warn('Failed to parse SSE data:', data);
            }
          }
        }
      }
    } catch (error) {
      throw error;
    }
  };

  return (
    <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-blue-500/20 rounded-lg">
          <Globe className="w-5 h-5 text-blue-400" />
        </div>
        <h2 className="text-lg font-semibold text-white">API 协议配置</h2>
      </div>

      <div className="space-y-4">
        <div className="flex gap-3">
          <div className="relative">
            <select
              value={config.apiConfig.method}
              onChange={(e) => updateApiConfig({ method: e.target.value })}
              className="appearance-none bg-slate-700 text-white px-4 py-2.5 pr-10 rounded-lg border border-slate-600 focus:border-blue-500 focus:outline-none cursor-pointer"
            >
              {HTTP_METHODS.map(method => (
                <option key={method} value={method}>{method}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          </div>
          
          <input
            type="text"
            value={config.apiConfig.url}
            onChange={(e) => updateApiConfig({ url: e.target.value })}
            placeholder="输入 API URL，例如：https://api.example.com/v1/chat"
            className="flex-1 bg-slate-700 text-white px-4 py-2.5 rounded-lg border border-slate-600 focus:border-blue-500 focus:outline-none placeholder-slate-500"
          />
        </div>

        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={config.apiConfig.isStreaming}
            onChange={(e) => updateApiConfig({ isStreaming: e.target.checked })}
            className="w-4 h-4 rounded border-slate-600 bg-slate-700 text-blue-500 focus:ring-blue-500 focus:ring-offset-slate-800"
          />
          <Zap className="w-4 h-4 text-yellow-400" />
          <span className="text-slate-300 text-sm">启用 SSE 流式传输</span>
        </label>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-300">Headers</span>
            <button
              onClick={addHeader}
              className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 transition-colors"
            >
              <Plus className="w-3 h-3" />
              添加 Header
            </button>
          </div>
          
          {config.apiConfig.headers.map((header, index) => (
            <div key={index} className="flex gap-2">
              <input
                type="text"
                value={header.key}
                onChange={(e) => updateHeader(index, 'key', e.target.value)}
                placeholder="Header Name"
                className="flex-1 bg-slate-700 text-white px-3 py-2 rounded-lg border border-slate-600 focus:border-blue-500 focus:outline-none placeholder-slate-500 text-sm"
              />
              <input
                type="text"
                value={header.value}
                onChange={(e) => updateHeader(index, 'value', e.target.value)}
                placeholder="Header Value"
                className="flex-1 bg-slate-700 text-white px-3 py-2 rounded-lg border border-slate-600 focus:border-blue-500 focus:outline-none placeholder-slate-500 text-sm"
              />
              <button
                onClick={() => removeHeader(index)}
                className="p-2 text-slate-400 hover:text-red-400 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>

        {config.apiConfig.method !== 'GET' && (
          <div className="space-y-2">
            <span className="text-sm font-medium text-slate-300">Request Body</span>
            <textarea
              value={config.apiConfig.body}
              onChange={(e) => updateApiConfig({ body: e.target.value })}
              placeholder='{"query": "{{USER_INPUT}}"}'
              rows={6}
              className="w-full bg-slate-700 text-white px-4 py-3 rounded-lg border border-slate-600 focus:border-blue-500 focus:outline-none placeholder-slate-500 font-mono text-sm resize-none"
            />
            <p className="text-xs text-slate-500">
              使用 <code className="bg-slate-700 px-1.5 py-0.5 rounded">{'{{USER_INPUT}}'}</code> 作为用户输入的占位符
            </p>
          </div>
        )}

        <div className="space-y-2">
          <span className="text-sm font-medium text-slate-300">测试输入</span>
          <input
            type="text"
            value={testInput}
            onChange={(e) => setTestInput(e.target.value)}
            placeholder="输入测试问题..."
            className="w-full bg-slate-700 text-white px-4 py-2.5 rounded-lg border border-slate-600 focus:border-blue-500 focus:outline-none placeholder-slate-500"
          />
        </div>

        <button
          onClick={handleSendTest}
          disabled={isLoading || !config.apiConfig.url}
          className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-medium py-2.5 rounded-lg transition-colors"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              发送中...
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              发送测试请求
            </>
          )}
        </button>
      </div>
    </div>
  );
}
