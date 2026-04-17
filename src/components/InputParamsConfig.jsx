import { useState, useRef } from 'react';
import { useConfig } from '../context/ConfigContext';
import { Code, Copy, Check, MousePointer, Plus, Eye, Settings2, FileJson, ArrowRight, Zap } from 'lucide-react';
import BusinessParamModal from './BusinessParamModal';
import DynamicFormPreview from './DynamicFormPreview';
import RequestPreview from './RequestPreview';

const BUILTIN_VARIABLES = [
  { name: 'USER_INPUT', description: '用户输入的问题', icon: '💬' },
  { name: 'SESSION_ID', description: '当前会话 ID', icon: '🔗' },
  { name: 'TIMESTAMP', description: '当前时间戳', icon: '⏰' },
  { name: 'USER_ID', description: '用户 ID', icon: '👤' },
];

export default function InputParamsConfig() {
  const { config, updateBodyTemplate, addBusinessParam, updateBusinessParam, removeBusinessParam } = useConfig();
  const [copied, setCopied] = useState(false);
  const [showParamModal, setShowParamModal] = useState(false);
  const [editParamIndex, setEditParamIndex] = useState(undefined);
  const [editingParam, setEditingParam] = useState(null);
  const [previewValues, setPreviewValues] = useState({});
  const [showPreview, setShowPreview] = useState(false);
  const [showRequestPreview, setShowRequestPreview] = useState(false);
  const [inputMappings, setInputMappings] = useState([
    { key: '', valueType: 'variable', value: 'USER_INPUT' },
    { key: '', valueType: 'variable', value: 'SESSION_ID' }
  ]);

  const [fixedValues, setFixedValues] = useState({});

  const businessVariables = config.inputParams.businessParams.map(p => ({
    name: p.key.toUpperCase(),
    description: `业务参数：${p.label}`,
    icon: p.uiType === 'select' ? '📋' : p.uiType === 'number' || p.uiType === 'slider' ? '🔢' : '📝'
  }));

  const allVariables = [...BUILTIN_VARIABLES, ...businessVariables];

  const handleAddMapping = () => {
    setInputMappings([...inputMappings, { key: '', valueType: 'variable', value: 'USER_INPUT' }]);
  };

  const handleRemoveMapping = (index) => {
    if (inputMappings.length > 1) {
      setInputMappings(inputMappings.filter((_, i) => i !== index));
    }
  };

  const handleMappingChange = (index, field, value) => {
    const newMappings = [...inputMappings];
    newMappings[index][field] = value;
    setInputMappings(newMappings);
    updateBodyTemplate(generateRequestBody(newMappings));
  };

  const handleFixedValueChange = (index, value) => {
    setFixedValues({ ...fixedValues, [index]: value });
    updateBodyTemplate(generateRequestBody(inputMappings));
  };



  const generateRequestBody = (mappings) => {
    const body = {};
    mappings.forEach((mapping, index) => {
      if (mapping.key) {
        if (mapping.valueType === 'variable') {
          body[mapping.key] = `{{${mapping.value}}}`;
        } else {
          body[mapping.key] = fixedValues[index] || '';
        }
      }
    });
    return JSON.stringify(body, null, 2);
  };

  const handleSaveBusinessParam = (paramData) => {
    if (editParamIndex !== undefined) {
      updateBusinessParam(editParamIndex, paramData);
    } else {
      addBusinessParam(paramData);
    }
    setEditParamIndex(undefined);
    setEditingParam(null);
  };

  const handleEditParam = (param, index) => {
    setEditingParam(param);
    setEditParamIndex(index);
    setShowParamModal(true);
  };

  const handleDeleteParam = (index) => {
    if (confirm('确定要删除这个业务参数吗？')) {
      removeBusinessParam(index);
    }
  };

  const handlePreviewValueChange = (key, value) => {
    setPreviewValues(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(config.inputParams.bodyTemplate);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="card-light p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="section-title mb-0">入参动态构建</div>
        <button
          onClick={() => setShowPreview(!showPreview)}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors ${
            showPreview 
              ? 'bg-blue-100 text-blue-700' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <Eye className="w-4 h-4" />
          {showPreview ? '隐藏预览' : '对话端预览'}
        </button>
      </div>

      {/* 对话端 UI 预览 */}
      {showPreview && (
        <div className="mb-6 p-6 bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl border border-blue-200">
          <div className="flex items-center gap-2 mb-4">
            <Eye className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-blue-900">对话端 UI 预览</h3>
          </div>
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <DynamicFormPreview
              businessParams={config.inputParams.businessParams}
              paramValues={previewValues}
              onParamChange={handlePreviewValueChange}
            />
          </div>
        </div>
      )}

      {/* 整合的参数配置卡片 */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">参数配置</h3>
          <button
            onClick={handleAddMapping}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors"
          >
            <Plus className="w-4 h-4" />
            添加映射
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 左侧：配置区 */}
          <div className="lg:col-span-2 space-y-4">
            {/* 参数映射 */}
            <div className="space-y-3">
              {inputMappings.map((mapping, index) => (
                <div key={index} className="relative p-4 bg-gray-50 border border-gray-100 rounded-lg hover:bg-gray-100 transition-colors duration-200">
                  <div className="flex items-center gap-3">
                    {/* 接口参数名 */}
                    <div className="flex-1 min-w-[200px]">
                      <label className="block text-xs font-medium text-gray-700 mb-1">接口参数名 (Key)</label>
                      <div className="relative">
                        <input
                          type="text"
                          value={mapping.key}
                          onChange={(e) => handleMappingChange(index, 'key', e.target.value)}
                          placeholder={index === 0 ? '如 input' : index === 1 ? '如 session_id' : '填入第三方 API 要求的字段名'}
                          className="w-full input-light placeholder:text-gray-400 leading-tight"
                          style={{ lineHeight: '1.5', padding: '0.5rem 0.75rem 0.5rem 2rem' }}
                        />
                        <div className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400">
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M4 6h16"/>
                            <path d="M4 12h16"/>
                            <path d="M4 18h16"/>
                          </svg>
                        </div>
                      </div>
                    </div>

                    {/* 映射箭头 */}
                    <div className="flex items-center justify-center w-8">
                      <div className="relative w-full flex justify-center">
                        <div className={`transition-colors duration-300 ${mapping.key && (mapping.valueType === 'variable' ? mapping.value : fixedValues[index]) ? 'text-blue-600' : 'text-gray-400'}`}>
                          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="5" y1="12" x2="19" y2="12"/>
                            <polyline points="12 5 19 12 12 19"/>
                          </svg>
                        </div>
                        <div className={`absolute -top-0.5 -bottom-0.5 left-1/2 transform -translate-x-1/2 w-0.5 transition-colors duration-300 ${mapping.key && (mapping.valueType === 'variable' ? mapping.value : fixedValues[index]) ? 'bg-blue-400' : 'bg-gray-300'}`}></div>
                      </div>
                    </div>

                    {/* 数据来源 */}
                    <div className="flex-1.5 min-w-[250px]">
                      <label className="block text-xs font-medium text-gray-700 mb-1">数据来源 (Value)</label>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <select
                            value={mapping.valueType}
                            onChange={(e) => {
                              handleMappingChange(index, 'valueType', e.target.value);
                            }}
                            className="flex-1 input-light appearance-none bg-white border border-gray-200 rounded-lg px-3 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm hover:border-gray-300 transition-all duration-200"
                          >
                            <option value="variable">变量</option>
                            <option value="fixed">固定值</option>
                          </select>
                        </div>
                        {mapping.valueType === 'variable' ? (
                          <select
                            value={mapping.value}
                            onChange={(e) => handleMappingChange(index, 'value', e.target.value)}
                            className="w-full input-light appearance-none bg-white border border-gray-200 rounded-lg px-3 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm hover:border-gray-300 transition-all duration-200"
                          >
                            {allVariables.map(v => (
                              <option key={v.name} value={v.name} className="px-2 py-3 hover:bg-blue-50 transition-colors duration-150">
                                <div className="flex flex-col">
                                  <span className="font-medium text-gray-900">{v.icon} {v.description}</span>
                                  <span className="text-xs text-gray-500 mt-1">{'{'}{'{'}{v.name}{'}'}{'}'}</span>
                                </div>
                              </option>
                            ))}
                          </select>
                        ) : (
                          <input
                            type="text"
                            value={fixedValues[index] || ''}
                            onChange={(e) => handleFixedValueChange(index, e.target.value)}
                            placeholder="请输入固定参数值"
                            className="w-full input-light placeholder:text-gray-400 leading-tight"
                            style={{ lineHeight: '1.5', padding: '0.5rem 0.75rem' }}
                          />
                        )}
                      </div>
                    </div>

                    {/* 删除按钮 */}
                    <button
                      onClick={() => handleRemoveMapping(index)}
                      className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                      disabled={inputMappings.length === 1}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M3 6h18"/>
                        <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/>
                        <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* 业务参数 */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-md font-medium text-gray-900">业务参数</h4>
                <button
                  onClick={() => setShowParamModal(true)}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm bg-green-100 text-green-700 hover:bg-green-200 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  添加业务参数
                </button>
              </div>

              {config.inputParams.businessParams.length === 0 ? (
                <div className="text-center text-gray-400 py-8 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50 hover:border-blue-400 transition-colors duration-200">
                  <div className="text-4xl mb-4">📋</div>
                  <p className="text-sm font-medium text-gray-600">暂无业务参数</p>
                  <p className="text-xs text-gray-500 mt-2">点击上方「添加业务参数」按钮开始配置</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {config.inputParams.businessParams.map((param, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-gray-900">{'{'}{'{'}{param.key.toUpperCase()}{'}'}{'}'}</span>
                          <span className="text-xs px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded">
                            {param.uiType === 'input' && '单行文本'}
                            {param.uiType === 'textarea' && '多行文本'}
                            {param.uiType === 'select' && '下拉选择'}
                            {param.uiType === 'switch' && '开关'}
                            {param.uiType === 'slider' && '滑块'}
                            {param.uiType === 'number' && '数字输入'}
                          </span>
                          {param.required && (
                            <span className="text-xs text-red-500">*</span>
                          )}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">{param.label}</div>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleEditParam(param, index)}
                          className="p-1.5 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded transition-colors"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDeleteParam(index)}
                          className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M3 6h18"/>
                            <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/>
                            <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* 右侧：JSON 预览 */}
          <div className="lg:col-span-1 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Code className="w-4 h-4 text-gray-400" />
                <span className="text-sm font-medium text-gray-700">请求体预览</span>
              </div>
              <button
                onClick={handleCopy}
                className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 transition-colors px-2 py-1 hover:bg-gray-100 rounded"
              >
                {copied ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
                {copied ? '已复制' : '复制'}
              </button>
            </div>
            
            <div className="relative font-mono text-sm">
              <textarea
                value={config.inputParams.bodyTemplate}
                readOnly
                rows={20}
                className="input-light resize-none font-mono text-sm bg-gray-50 h-96"
                spellCheck={false}
              />
            </div>
          </div>
        </div>
      </div>

      {/* 业务参数配置弹窗 */}
      <BusinessParamModal
        isOpen={showParamModal}
        onClose={() => setShowParamModal(false)}
        onSave={handleSaveBusinessParam}
        editIndex={editParamIndex}
        existingParam={editingParam}
      />
    </div>
  );
}