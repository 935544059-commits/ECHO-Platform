import { useState } from 'react';
import { useConfig } from '../context/ConfigContext';
import JsonTreeView from './JsonTreeView';
import { 
  Database, 
  Plus, 
  Trash2, 
  Variable,
  FileJson,
  CheckCircle
} from 'lucide-react';

const VARIABLE_TYPES = [
  { value: 'text', label: '文本', icon: '📝' },
  { value: 'image', label: '图片链接', icon: '🖼️' },
  { value: 'chart', label: '图表数据', icon: '📊' },
  { value: 'json', label: 'JSON 对象', icon: '📋' },
];

export default function DataMappingPanel() {
  const { 
    config, 
    addOutputVariable, 
    removeOutputVariable 
  } = useConfig();
  
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
    <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-purple-500/20 rounded-lg">
          <Database className="w-5 h-5 text-purple-400" />
        </div>
        <h2 className="text-lg font-semibold text-white">数据解析与映射</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <FileJson className="w-4 h-4 text-slate-400" />
            <span className="text-sm font-medium text-slate-300">响应预览</span>
          </div>
          
          <JsonTreeView 
            data={config.testResponse}
            onNodeSelect={handleNodeSelect}
            selectedPath={selectedPath}
          />
          
          {config.testError && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
              <p className="text-red-400 text-sm">{config.testError}</p>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Variable className="w-4 h-4 text-slate-400" />
            <span className="text-sm font-medium text-slate-300">字段拾取</span>
          </div>

          {selectedPath && (
            <div className="p-4 bg-slate-900/50 rounded-lg border border-slate-700 space-y-4">
              <div>
                <label className="text-xs text-slate-500 block mb-1">选中的 JSONPath</label>
                <code className="text-sm text-blue-400 bg-slate-800 px-2 py-1 rounded block break-all">
                  {selectedPath}
                </code>
              </div>
              
              <div>
                <label className="text-xs text-slate-500 block mb-1">示例值</label>
                <div className="text-sm text-slate-300 bg-slate-800 px-2 py-1 rounded max-h-24 overflow-auto">
                  {typeof selectedValue === 'object' 
                    ? JSON.stringify(selectedValue, null, 2) 
                    : String(selectedValue)}
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-500 block mb-1">变量名称</label>
                  <input
                    type="text"
                    value={newVarName}
                    onChange={(e) => setNewVarName(e.target.value)}
                    placeholder="var_answer"
                    className="w-full bg-slate-700 text-white px-3 py-2 rounded border border-slate-600 focus:border-blue-500 focus:outline-none text-sm"
                  />
                </div>
                
                <div>
                  <label className="text-xs text-slate-500 block mb-1">数据类型</label>
                  <select
                    value={newVarType}
                    onChange={(e) => setNewVarType(e.target.value)}
                    className="w-full bg-slate-700 text-white px-3 py-2 rounded border border-slate-600 focus:border-blue-500 focus:outline-none text-sm"
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
                className="w-full flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-500 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-medium py-2 rounded-lg transition-colors text-sm"
              >
                <Plus className="w-4 h-4" />
                添加输出变量
              </button>
            </div>
          )}

          {!selectedPath && (
            <div className="p-4 bg-slate-900/30 rounded-lg border border-dashed border-slate-600 text-center">
              <p className="text-slate-500 text-sm">点击左侧 JSON 树中的节点来选择字段</p>
            </div>
          )}

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-300">已定义的变量</span>
              <span className="text-xs text-slate-500">{config.outputVariables.length} 个</span>
            </div>
            
            {config.outputVariables.length === 0 ? (
              <div className="p-4 bg-slate-900/30 rounded-lg border border-dashed border-slate-600 text-center">
                <p className="text-slate-500 text-sm">暂无输出变量</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-48 overflow-auto">
                {config.outputVariables.map((variable, index) => (
                  <div 
                    key={index}
                    className="flex items-center justify-between p-3 bg-slate-900/50 rounded-lg border border-slate-700"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-lg">
                        {VARIABLE_TYPES.find(t => t.value === variable.type)?.icon || '📝'}
                      </span>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-white font-medium text-sm">{variable.name}</span>
                          <CheckCircle className="w-3 h-3 text-green-400" />
                        </div>
                        <code className="text-xs text-slate-500">{variable.path}</code>
                      </div>
                    </div>
                    <button
                      onClick={() => removeOutputVariable(variable.name)}
                      className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-slate-700 rounded transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
