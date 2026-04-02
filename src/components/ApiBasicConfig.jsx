import { useState } from 'react';
import { useConfig } from '../context/ConfigContext';
import { ChevronDown, Send, Loader2, Zap, ArrowDown } from 'lucide-react';
import { mockApiCall } from '../utils/mockData';

export default function ApiBasicConfig() {
  const { config, updateApiConfig, setIsLoading, setTestResponse } = useConfig();
  const [testInput, setTestInput] = useState('');
  const [useMock, setUseMock] = useState(false);
  const [showScrollTip, setShowScrollTip] = useState(false);

  const handleSendTest = async () => {
    setIsLoading(true);
    setTestResponse(null, null);
    setShowScrollTip(false);

    try {
      // 如果是 Mock 模式或 API 地址为空
      if (useMock || !config.apiConfig.apiUrl.trim()) {
        const mockData = await mockApiCall(config, testInput);
        setTestResponse(mockData, null);
        setIsLoading(false);
        // 延迟显示滚动提示，等待响应区域渲染
        setTimeout(() => setShowScrollTip(true), 100);
        return;
      }

      const { apiUrl, method, headers, body, apiKey, bearerToken, authType } = config.apiConfig;
      
      const processedBody = body.replace(/{{USER_INPUT}}/g, testInput || 'test');
      
      const headerObj = {};
      headers.forEach(h => {
        if (h.key.trim()) {
          headerObj[h.key.trim()] = h.value;
        }
      });

      if (authType === 'API_KEY' && apiKey) {
        headerObj['Authorization'] = apiKey;
      } else if (authType === 'BEARER_TOKEN' && bearerToken) {
        headerObj['Authorization'] = `Bearer ${bearerToken}`;
      }

      const response = await fetch(apiUrl, {
        method,
        headers: headerObj,
        body: method !== 'GET' ? processedBody : undefined,
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      setTestResponse(data, null);
    } catch (error) {
      setTestResponse(null, error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* API 轮询频率 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="form-label">API 轮询频率</label>
          <div className="relative">
            <select
              value={config.apiConfig.queryFrequency}
              onChange={(e) => updateApiConfig({ queryFrequency: e.target.value })}
              className="input-light appearance-none pr-8"
            >
              <option value="1m">每 1m</option>
              <option value="5m">每 5m</option>
              <option value="10m">每 10m</option>
              <option value="30m">每 30m</option>
              <option value="1h">每 1h</option>
              <option value="6h">每 6h</option>
              <option value="12h">每 12h</option>
              <option value="24h">每 24h</option>
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* API 平台说明 */}
      <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-start gap-2">
          <Zap className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-xs text-blue-800">
            <p className="font-medium mb-1">通用 HTTP API 配置</p>
            <p>支持任意 MAAS 平台（Dify、Coze、九天等），只需填写 API 地址和认证信息即可。</p>
          </div>
        </div>
      </div>

      {/* API 名称 */}
      <div>
        <label className="form-label-required">API 名称</label>
        <input
          type="text"
          value={config.apiConfig.apiName}
          onChange={(e) => updateApiConfig({ apiName: e.target.value })}
          placeholder="请输入 API 名称"
          className="input-light"
        />
      </div>

      {/* API 地址 */}
      <div>
        <label className="form-label-required">API 地址</label>
        <input
          type="text"
          value={config.apiConfig.apiUrl}
          onChange={(e) => updateApiConfig({ apiUrl: e.target.value })}
          placeholder="请输入 API 地址"
          className="input-light"
        />
      </div>

      {/* API 描述 */}
      <div>
        <label className="form-label">API 描述</label>
        <textarea
          value={config.apiConfig.apiDescription}
          onChange={(e) => updateApiConfig({ apiDescription: e.target.value })}
          placeholder="请输入 API 描述"
          rows={2}
          maxLength={200}
          className="input-light resize-none"
        />
        <div className="text-right text-xs text-gray-400 mt-1">
          {config.apiConfig.apiDescription.length} / 200
        </div>
      </div>

      {/* 认证类型 */}
      <div>
        <label className="form-label-required">认证类型</label>
        <div className="flex gap-6">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="authType"
              value="API_KEY"
              checked={config.apiConfig.authType === 'API_KEY'}
              onChange={(e) => updateApiConfig({ authType: e.target.value })}
              className="radio-light"
            />
            <span className="text-sm text-gray-700">API_KEY</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="authType"
              value="BEARER_TOKEN"
              checked={config.apiConfig.authType === 'BEARER_TOKEN'}
              onChange={(e) => updateApiConfig({ authType: e.target.value })}
              className="radio-light"
            />
            <span className="text-sm text-gray-700">BEARER_TOKEN</span>
          </label>
        </div>
      </div>

      {/* API_KEY / Token */}
      <div>
        <label className="form-label-required">
          {config.apiConfig.authType === 'API_KEY' ? 'API_KEY' : 'Bearer Token'}
        </label>
        <input
          type="text"
          value={config.apiConfig.authType === 'API_KEY' ? config.apiConfig.apiKey : config.apiConfig.bearerToken}
          onChange={(e) => updateApiConfig({ 
            [config.apiConfig.authType === 'API_KEY' ? 'apiKey' : 'bearerToken']: e.target.value 
          })}
          placeholder={`请输入${config.apiConfig.authType === 'API_KEY' ? 'API_KEY' : 'Bearer Token'}`}
          className="input-light"
        />
      </div>

      {/* 测试输入 */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="form-label">测试输入</label>
          <label className="flex items-center gap-2 text-xs text-gray-600 cursor-pointer">
            <input
              type="checkbox"
              checked={useMock}
              onChange={(e) => setUseMock(e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <Zap className={`w-3 h-3 ${useMock ? 'text-yellow-500' : 'text-gray-400'}`} />
            <span>使用 Mock 数据</span>
          </label>
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={testInput}
            onChange={(e) => setTestInput(e.target.value)}
            placeholder="请输入测试问题"
            className="input-light flex-1"
          />
          <button
            onClick={handleSendTest}
            disabled={config.isLoading}
            className={`btn-primary flex items-center gap-2 ${config.isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {config.isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                发送中...
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                接口测试
              </>
            )}
          </button>
        </div>
        {useMock && (
          <p className="text-xs text-gray-500 mt-1">
            💡 Mock 模式：无需真实 API，快速体验界面交互
          </p>
        )}
        
        {/* 滚动提示 */}
        {showScrollTip && (
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg animate-bounce">
            <button
              onClick={() => {
                document.getElementById('output-mapping-section')?.scrollIntoView({ 
                  behavior: 'smooth',
                  block: 'start'
                });
                setShowScrollTip(false);
              }}
              className="flex items-center gap-2 text-sm text-blue-700 hover:text-blue-900 transition-colors w-full justify-center"
            >
              <ArrowDown className="w-4 h-4" />
              <span>查看响应数据</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
