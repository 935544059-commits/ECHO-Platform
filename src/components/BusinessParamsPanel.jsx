import { useState } from 'react';
import { useConfig } from '../context/ConfigContext';
import { 
  Settings, 
  Plus, 
  Trash2, 
  ChevronDown,
  Type,
  Hash,
  List,
  ToggleLeft,
  GripVertical
} from 'lucide-react';

const PARAM_TYPES = [
  { value: 'text', label: '文本输入', icon: Type, color: 'text-blue-400' },
  { value: 'number', label: '数字输入', icon: Hash, color: 'text-green-400' },
  { value: 'select', label: '下拉选择', icon: List, color: 'text-purple-400' },
  { value: 'boolean', label: '开关', icon: ToggleLeft, color: 'text-orange-400' },
];

export default function BusinessParamsPanel() {
  const { 
    config, 
    addBusinessParam, 
    updateBusinessParam, 
    removeBusinessParam 
  } = useConfig();
  
  const [newParam, setNewParam] = useState({
    key: '',
    label: '',
    type: 'text',
    required: false,
    options: [],
    defaultValue: '',
    placeholder: '',
  });
  const [showAddForm, setShowAddForm] = useState(false);
  const [newOption, setNewOption] = useState('');

  const handleAddParam = () => {
    if (!newParam.key.trim() || !newParam.label.trim()) return;
    
    addBusinessParam({
      ...newParam,
      id: Date.now().toString(),
    });
    
    setNewParam({
      key: '',
      label: '',
      type: 'text',
      required: false,
      options: [],
      defaultValue: '',
      placeholder: '',
    });
    setShowAddForm(false);
  };

  const handleAddOption = (paramIndex) => {
    if (!newOption.trim()) return;
    
    const param = config.inputParams.businessParams[paramIndex];
    updateBusinessParam(paramIndex, {
      options: [...(param.options || []), newOption.trim()]
    });
    setNewOption('');
  };

  const getTypeIcon = (type) => {
    const typeConfig = PARAM_TYPES.find(t => t.value === type);
    return typeConfig?.icon || Type;
  };

  const getTypeColor = (type) => {
    const typeConfig = PARAM_TYPES.find(t => t.value === type);
    return typeConfig?.color || 'text-blue-400';
  };

  return (
    <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 h-full">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-500/20 rounded-lg">
            <Settings className="w-5 h-5 text-indigo-400" />
          </div>
          <h2 className="text-lg font-semibold text-white">业务参数配置</h2>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-sm text-white transition-colors"
        >
          <Plus className="w-4 h-4" />
          添加参数
        </button>
      </div>

      {showAddForm && (
        <div className="mb-6 p-4 bg-slate-900/50 rounded-lg border border-slate-700 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-slate-500 block mb-1">参数键名 *</label>
              <input
                type="text"
                value={newParam.key}
                onChange={(e) => setNewParam({ ...newParam, key: e.target.value })}
                placeholder="例如: scene"
                className="w-full bg-slate-700 text-white px-3 py-2 rounded border border-slate-600 focus:border-indigo-500 focus:outline-none text-sm"
              />
            </div>
            <div>
              <label className="text-xs text-slate-500 block mb-1">显示标签 *</label>
              <input
                type="text"
                value={newParam.label}
                onChange={(e) => setNewParam({ ...newParam, label: e.target.value })}
                placeholder="例如: 业务场景"
                className="w-full bg-slate-700 text-white px-3 py-2 rounded border border-slate-600 focus:border-indigo-500 focus:outline-none text-sm"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-slate-500 block mb-1">参数类型</label>
              <div className="relative">
                <select
                  value={newParam.type}
                  onChange={(e) => setNewParam({ ...newParam, type: e.target.value })}
                  className="w-full appearance-none bg-slate-700 text-white px-3 py-2 pr-8 rounded border border-slate-600 focus:border-indigo-500 focus:outline-none text-sm"
                >
                  {PARAM_TYPES.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              </div>
            </div>
            <div>
              <label className="text-xs text-slate-500 block mb-1">占位提示</label>
              <input
                type="text"
                value={newParam.placeholder}
                onChange={(e) => setNewParam({ ...newParam, placeholder: e.target.value })}
                placeholder="输入框提示文字"
                className="w-full bg-slate-700 text-white px-3 py-2 rounded border border-slate-600 focus:border-indigo-500 focus:outline-none text-sm"
              />
            </div>
          </div>

          <div>
            <label className="text-xs text-slate-500 block mb-1">默认值</label>
            <input
              type="text"
              value={newParam.defaultValue}
              onChange={(e) => setNewParam({ ...newParam, defaultValue: e.target.value })}
              placeholder="参数默认值"
              className="w-full bg-slate-700 text-white px-3 py-2 rounded border border-slate-600 focus:border-indigo-500 focus:outline-none text-sm"
            />
          </div>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={newParam.required}
              onChange={(e) => setNewParam({ ...newParam, required: e.target.checked })}
              className="w-4 h-4 rounded border-slate-600 bg-slate-700 text-indigo-500 focus:ring-indigo-500"
            />
            <span className="text-sm text-slate-300">必填参数</span>
          </label>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-700">
            <button
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2 text-slate-400 hover:text-white transition-colors text-sm"
            >
              取消
            </button>
            <button
              onClick={handleAddParam}
              disabled={!newParam.key.trim() || !newParam.label.trim()}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-600 disabled:cursor-not-allowed text-white rounded-lg text-sm transition-colors"
            >
              确认添加
            </button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {config.inputParams.businessParams.length === 0 ? (
          <div className="p-8 bg-slate-900/30 rounded-lg border border-dashed border-slate-600 text-center">
            <Settings className="w-8 h-8 text-slate-600 mx-auto mb-2" />
            <p className="text-slate-500 text-sm">暂无业务参数</p>
            <p className="text-slate-600 text-xs mt-1">点击上方"添加参数"按钮创建</p>
          </div>
        ) : (
          config.inputParams.businessParams.map((param, index) => {
            const TypeIcon = getTypeIcon(param.type);
            const typeColor = getTypeColor(param.type);
            
            return (
              <div 
                key={param.id}
                className="p-4 bg-slate-900/50 rounded-lg border border-slate-700"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-slate-800 rounded-lg mt-0.5">
                      <TypeIcon className={`w-4 h-4 ${typeColor}`} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-white font-medium">{param.label}</span>
                        {param.required && (
                          <span className="text-xs bg-red-500/20 text-red-400 px-1.5 py-0.5 rounded">必填</span>
                        )}
                      </div>
                      <code className="text-xs text-slate-500 bg-slate-800 px-1.5 py-0.5 rounded mt-1 inline-block">
                        {param.key}
                      </code>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-xs text-slate-500">类型:</span>
                        <span className="text-xs text-slate-400">{PARAM_TYPES.find(t => t.value === param.type)?.label}</span>
                        {param.defaultValue && (
                          <>
                            <span className="text-slate-600">|</span>
                            <span className="text-xs text-slate-500">默认: <span className="text-slate-400">{param.defaultValue}</span></span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => removeBusinessParam(index)}
                    className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-slate-700 rounded transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {param.type === 'select' && (
                  <div className="mt-3 pt-3 border-t border-slate-700">
                    <div className="text-xs text-slate-500 mb-2">选项列表</div>
                    <div className="flex flex-wrap gap-2">
                      {(param.options || []).map((opt, optIndex) => (
                        <span 
                          key={optIndex}
                          className="px-2 py-1 bg-slate-700 rounded text-xs text-slate-300 flex items-center gap-1"
                        >
                          {opt}
                          <button
                            onClick={() => {
                              updateBusinessParam(index, {
                                options: param.options.filter((_, i) => i !== optIndex)
                              });
                            }}
                            className="text-slate-500 hover:text-red-400"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                      <div className="flex items-center gap-1">
                        <input
                          type="text"
                          value={newOption}
                          onChange={(e) => setNewOption(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleAddOption(index);
                            }
                          }}
                          placeholder="添加选项..."
                          className="w-24 bg-slate-700 text-white px-2 py-1 rounded text-xs border border-slate-600 focus:border-indigo-500 focus:outline-none"
                        />
                        <button
                          onClick={() => handleAddOption(index)}
                          className="p-1 bg-slate-700 hover:bg-slate-600 rounded text-slate-400 hover:text-white transition-colors"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
