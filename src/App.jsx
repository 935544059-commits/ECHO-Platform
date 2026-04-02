import { useState, useEffect } from 'react';
import { ConfigProvider, useConfig } from './context/ConfigContext';
import AgentInfoPanel from './components/AgentInfoPanel';
import ApiBasicConfig from './components/ApiBasicConfig';
import InputParamsConfig from './components/InputParamsConfig';
import OutputMappingConfig from './components/OutputMappingConfig';
import { ArrowLeft, Save, CheckCircle, AlertCircle } from 'lucide-react';

function ValidationErrors({ errors }) {
  if (errors.length === 0) return null;
  
  return (
    <div className="fixed top-4 right-4 z-50 bg-red-50 border border-red-200 rounded-lg shadow-lg p-4 max-w-md">
      <div className="flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
        <div>
          <h4 className="text-sm font-medium text-red-800">请完善以下信息：</h4>
          <ul className="mt-2 text-xs text-red-700 space-y-1">
            {errors.map((error, index) => (
              <li key={index}>• {error}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

function SuccessToast({ message, onClose }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed top-4 right-4 z-50 bg-green-50 border border-green-200 rounded-lg shadow-lg p-4 animate-fadeIn">
      <div className="flex items-center gap-3">
        <CheckCircle className="w-5 h-5 text-green-500" />
        <p className="text-sm font-medium text-green-800">{message}</p>
      </div>
    </div>
  );
}

function AppContent() {
  const { config, setConfigStatus } = useConfig();
  const [showValidationErrors, setShowValidationErrors] = useState(false);
  const [validationErrors, setValidationErrors] = useState([]);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [showSaveConfirm, setShowSaveConfirm] = useState(false);

  const validateForm = () => {
    const errors = [];
    
    if (!config.agentInfo.name.trim()) {
      errors.push('智能体名称不能为空');
    }
    if (!config.apiConfig.apiName.trim()) {
      errors.push('API 名称不能为空');
    }
    if (!config.apiConfig.apiUrl.trim()) {
      errors.push('API 地址不能为空');
    }
    if (config.apiConfig.authType === 'API_KEY' && !config.apiConfig.apiKey.trim()) {
      errors.push('API_KEY 不能为空');
    }
    if (config.apiConfig.authType === 'BEARER_TOKEN' && !config.apiConfig.bearerToken.trim()) {
      errors.push('Bearer Token 不能为空');
    }
    
    return errors;
  };

  const getSaveButtonText = () => {
    if (config.configStatus === 'tested') {
      return '保存配置';
    }
    if (config.testError) {
      return '保存（接口测试失败）';
    }
    return '保存（未测试接口）';
  };

  const handleSave = () => {
    const errors = validateForm();
    if (errors.length > 0) {
      setValidationErrors(errors);
      setShowValidationErrors(true);
      setTimeout(() => setShowValidationErrors(false), 5000);
      return;
    }
    
    // 如果接口未测试，显示确认提示
    if (config.configStatus !== 'tested' && !showSaveConfirm) {
      setShowSaveConfirm(true);
      return;
    }
    
    // 模拟保存
    console.log('Saving configuration:', config);
    setSuccessMessage('配置已保存成功！');
    setShowSuccess(true);
    setShowSaveConfirm(false);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const handleTest = () => {
    const errors = validateForm();
    if (errors.length > 0) {
      setValidationErrors(errors);
      setShowValidationErrors(true);
      setTimeout(() => setShowValidationErrors(false), 5000);
      return;
    }
    
    setSuccessMessage('开始接口测试...');
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 2000);
  };

  return (
    <div className="min-h-screen">
      {showValidationErrors && (
        <ValidationErrors errors={validationErrors} />
      )}
      {showSuccess && (
        <SuccessToast 
          message={successMessage} 
          onClose={() => setShowSuccess(false)} 
        />
      )}

      {/* 顶部导航栏 */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <h1 className="text-lg font-semibold text-gray-900">手工添加智能体</h1>
            </div>
          </div>
        </div>
      </header>

      {/* 主内容区 */}
      <main className="max-w-7xl mx-auto px-6 py-6">
        <div className="space-y-6">
          {/* 智能体基本信息 */}
          <AgentInfoPanel />

          {/* API 基本信息配置 */}
          <div id="api-basic-config" className="card-light p-6">
            <div className="section-title mb-4">API 基本信息配置</div>
            <ApiBasicConfig />
          </div>

          {/* 入参动态构建 */}
          <InputParamsConfig />

          {/* 出参解析与映射 */}
          <div id="output-mapping-section">
            <OutputMappingConfig />
          </div>
        </div>
      </main>

      {/* 底部操作栏 */}
      <footer className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-end gap-3">
            <button 
              onClick={handleSave}
              className={`btn-primary ${config.configStatus !== 'tested' ? 'opacity-90' : ''}`}
            >
              <Save className="w-4 h-4 inline mr-2" />
              {getSaveButtonText()}
            </button>
          </div>
          
          {/* 保存确认提示 */}
          {showSaveConfirm && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 max-w-md mx-4 shadow-xl animate-fadeIn">
                <div className="flex items-start gap-3 mb-4">
                  <AlertCircle className="w-6 h-6 text-yellow-500 flex-shrink-0" />
                  <div>
                    <h3 className="text-base font-semibold text-gray-900 mb-2">
                      {config.testError ? '接口测试失败' : '接口未测试'}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {config.testError 
                        ? '接口测试未通过，出参映射可能无法正常工作。您可以选择先保存配置，稍后修复接口问题。'
                        : '您还没有进行接口测试，出参映射可能不完整。您可以选择先保存配置，稍后完成测试。'}
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-3 justify-end">
                  <button
                    onClick={() => {
                      setShowSaveConfirm(false);
                      // 滚动到 API 配置区域
                      document.getElementById('api-basic-config')?.scrollIntoView({ 
                        behavior: 'smooth',
                        block: 'center'
                      });
                    }}
                    className="btn-secondary text-sm"
                  >
                    去测试
                  </button>
                  <button
                    onClick={handleSave}
                    className="btn-primary text-sm"
                  >
                    仍要保存
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </footer>

      {/* 底部占位，防止内容被 footer 遮挡 */}
      <div className="h-20" />
    </div>
  );
}

export default function App() {
  return (
    <ConfigProvider>
      <AppContent />
    </ConfigProvider>
  );
}
