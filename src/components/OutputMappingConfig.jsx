import { useState } from 'react';
import { useConfig } from '../context/ConfigContext';
import { Database, Plus, Trash2, CheckCircle, AlertCircle } from 'lucide-react';

const VARIABLE_TYPES = [
  { value: 'text', label: '文本', icon: '📝' },
  { value: 'image', label: '图片链接', icon: '🖼️' },
  { value: 'chart', label: '图表数据', icon: '📊' },
  { value: 'json', label: 'JSON 对象', icon: '📋' },
];

function JsonNode({ keyName, value, path = [], onNodeClick, selectedPath, depth = 0 }) {
  const [isExpanded, setIsExpanded] = useState(depth < 2);
  
  const isObject = value !== null && typeof value === 'object';
  const isArray = Array.isArray(value);
  const currentPath = keyName !== undefined ? [...path, keyName] : path;
  const jsonPath = '$' + currentPath.map(k => typeof k === 'number' ? `[${k}]` : `.${k}`).join('');
  const isSelected = selectedPath === jsonPath;

  const handleClick = (e) => {
    e.stopPropagation();
    if (!isObject) {
      onNodeClick(jsonPath, value);
    }
  };

  const getValueColor = () => {
    if (value === null) return 'json-tree-null';
    if (typeof value === 'string') return 'json-tree-string';
    if (typeof value === 'number') return 'json-tree-number';
    if (typeof value === 'boolean') return 'json-tree-boolean';
    return '';
  };

  const renderValue = () => {
    if (value === null) return 'null';
    if (typeof value === 'string') return `"${value.length > 50 ? value.slice(0, 50) + '...' : value}"`;
    if (typeof value === 'boolean') return value ? 'true' : 'false';
    return String(value);
  };

  if (isObject) {
    const entries = isArray ? value.map((v, i) => [i, v]) : Object.entries(value);
    
    return (
      <div className="select-none">
        <div 
          className={`flex items-center gap-1 py-0.5 px-1 rounded cursor-pointer hover:bg-gray-100 ${isSelected ? 'bg-blue-100' : ''}`}
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <span className="text-gray-400 text-xs w-4">
            {isExpanded ? '▼' : '▶'}
          </span>
          
          {keyName !== undefined && (
            <span className="json-tree-key text-sm">{keyName}</span>
          )}
          
          <span className="json-tree-bracket text-xs text-gray-500">
            {isArray ? `[${value.length}]` : `{${Object.keys(value).length}}`}
          </span>
        </div>
        
        {isExpanded && (
          <div className="ml-4 border-l border-gray-200 pl-2">
            {entries.map(([k, v]) => (
              <JsonNode
                key={k}
                keyName={k}
                value={v}
                path={currentPath}
                onNodeClick={onNodeClick}
                selectedPath={selectedPath}
                depth={depth + 1}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div 
      className={`flex items-center gap-2 py-0.5 px-1 rounded cursor-pointer hover:bg-gray-100 ${isSelected ? 'bg-blue-100' : ''}`}
      onClick={handleClick}
    >
      <span className="w-4" />
      
      {keyName !== undefined && (
        <span className="json-tree-key text-sm">{keyName}:</span>
      )}
      
      <span className={`${getValueColor()} text-sm`}>
        {renderValue()}
      </span>
    </div>
  );
}

export default function OutputMappingConfig() {
  const { config, addOutputVariable, removeOutputVariable } = useConfig();
  const [selectedPath, setSelectedPath] = useState(null);
  const [selectedValue, setSelectedValue] = useState(null);
  const [newVarName, setNewVarName] = useState('');
  const [newVarType, setNewVarType] = useState('text');

  const handleNodeSelect = (path, value) => {
    setSelectedPath(path);
    setSelectedValue(value);
    const suggestedName = path.split('.').pop().replace(/[\[\]]/g, '');
    setNewVarName(`var_${suggestedName}`);
  };

  const handleAddVariable = () => {
    if (!selectedPath || !newVarName.trim()) return;
    
    addOutputVariable({
      name: newVarName.trim(),
      path: selectedPath,
      type: newVarType,
      sampleValue: selectedValue,
    });
    
    setSelectedPath(null);
    setSelectedValue(null);
    setNewVarName('');
  };

  return (
    <div className="card-light p-6">
      <div className="section-title mb-4">出参解析与映射</div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* JSON 树预览 */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Database className={`w-4 h-4 ${config.testResponse ? 'text-blue-500' : 'text-gray-400'}`} />
              <span className="text-sm font-medium text-gray-700">响应预览</span>
            </div>
            {config.testResponse && (
              <span className="flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full animate-fadeIn">
                <CheckCircle className="w-3 h-3" />
                已收到响应
              </span>
            )}
          </div>
          
          <div className={`rounded-lg border p-4 font-mono text-sm max-h-96 overflow-auto transition-all duration-300 ${
            config.testResponse 
              ? 'bg-white border-blue-300 shadow-md ring-2 ring-blue-100' 
              : 'bg-gray-50 border-gray-200'
          }`}>
            {config.testResponse ? (
              <div className="animate-fadeIn">
                <JsonNode 
                  value={config.testResponse}
                  onNodeClick={handleNodeSelect}
                  selectedPath={selectedPath}
                />
              </div>
            ) : (
              <div className="text-center text-gray-400 py-8">
                <Database className="w-12 h-12 mx-auto mb-3 opacity-20" />
                <p className="text-sm">发送测试请求后，响应数据将在此显示</p>
              </div>
            )}
          </div>
          
          {config.testError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg animate-shake">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                <p className="text-red-600 text-sm">{config.testError}</p>
              </div>
            </div>
          )}
          
          {/* 新响应提示 */}
          {config.testResponse && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg animate-fadeIn">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-sm text-green-800 font-medium">接口测试成功！</span>
                </div>
                <button
                  onClick={() => {
                    // 滚动到字段拾取区域
                    document.getElementById('field-picking-section')?.scrollIntoView({ 
                      behavior: 'smooth',
                      block: 'center'
                    });
                  }}
                  className="text-xs text-green-700 hover:text-green-900 font-medium px-3 py-1 bg-green-100 rounded-full transition-colors"
                >
                  开始映射字段 →
                </button>
              </div>
            </div>
          )}
        </div>

        {/* 字段拾取 */}
        <div id="field-picking-section" className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">已定义变量</span>
            <span className="text-xs text-gray-500">{config.outputVariables.length} 个</span>
          </div>
          
          {selectedPath && (
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200 space-y-3">
              <div>
                <label className="text-xs text-gray-600 block mb-1">选中的 JSONPath</label>
                <code className="text-sm text-blue-700 bg-white px-2 py-1 rounded block break-all border border-blue-100">
                  {selectedPath}
                </code>
              </div>
              
              <div>
                <label className="text-xs text-gray-600 block mb-1">示例值</label>
                <div className="text-sm text-gray-700 bg-white px-2 py-1 rounded max-h-20 overflow-auto border border-blue-100">
                  {typeof selectedValue === 'object' 
                    ? JSON.stringify(selectedValue, null, 2) 
                    : String(selectedValue)}
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-600 block mb-1">变量名称</label>
                  <input
                    type="text"
                    value={newVarName}
                    onChange={(e) => setNewVarName(e.target.value)}
                    placeholder="var_answer"
                    className="input-light text-sm"
                  />
                </div>
                
                <div>
                  <label className="text-xs text-gray-600 block mb-1">数据类型</label>
                  <select
                    value={newVarType}
                    onChange={(e) => setNewVarType(e.target.value)}
                    className="input-light text-sm"
                  >
                    {VARIABLE_TYPES.map(type => (
                      <option key={type.value} value={type.value}>
                        {type.icon} {type.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              <button
                onClick={handleAddVariable}
                disabled={!newVarName.trim()}
                className="w-full btn-primary text-sm py-2 disabled:opacity-50"
              >
                <Plus className="w-4 h-4 inline mr-1" />
                添加输出变量
              </button>
            </div>
          )}
          
          {!selectedPath && config.testResponse && (
            <div className="p-4 bg-gray-50 rounded-lg border border-dashed border-gray-300 text-center">
              <p className="text-gray-500 text-sm">点击左侧 JSON 树中的节点来选择字段</p>
            </div>
          )}

          <div className="space-y-2 max-h-64 overflow-auto">
            {config.outputVariables.map((variable, index) => (
              <div 
                key={index}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
              >
                <div className="flex items-center gap-3">
                  <span className="text-lg">
                    {VARIABLE_TYPES.find(t => t.value === variable.type)?.icon || '📝'}
                  </span>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-900 font-medium text-sm">{variable.name}</span>
                      <CheckCircle className="w-3 h-3 text-green-500" />
                    </div>
                    <code className="text-xs text-gray-500">{variable.path}</code>
                  </div>
                </div>
                <button
                  onClick={() => removeOutputVariable(variable.name)}
                  className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
            
            {config.outputVariables.length === 0 && (
              <div className="p-4 bg-gray-50 rounded-lg border border-dashed border-gray-300 text-center">
                <p className="text-gray-500 text-sm">暂无输出变量</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
