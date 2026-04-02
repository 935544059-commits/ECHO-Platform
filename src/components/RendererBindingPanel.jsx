import { useState } from 'react';
import { useConfig } from '../context/ConfigContext';
import { 
  Layout, 
  GripVertical, 
  FileText, 
  Image, 
  BarChart3, 
  BookOpen,
  ChevronDown,
  Check
} from 'lucide-react';

const COMPONENT_TYPES = [
  { 
    id: 'markdown', 
    name: 'Markdown 渲染器', 
    description: '渲染 Markdown 格式的文本内容',
    icon: FileText,
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/20'
  },
  { 
    id: 'image', 
    name: '图片展示', 
    description: '显示图片链接对应的图片',
    icon: Image,
    color: 'text-green-400',
    bgColor: 'bg-green-500/20'
  },
  { 
    id: 'chart', 
    name: '图表组件', 
    description: '将 JSON 数据渲染为可视化图表',
    icon: BarChart3,
    color: 'text-orange-400',
    bgColor: 'bg-orange-500/20'
  },
  { 
    id: 'reference', 
    name: '引用来源', 
    description: '展示引用或参考链接列表',
    icon: BookOpen,
    color: 'text-purple-400',
    bgColor: 'bg-purple-500/20'
  },
];

export default function RendererBindingPanel() {
  const { 
    config, 
    addComponentBinding, 
    updateComponentBinding, 
    reorderComponents 
  } = useConfig();
  
  const [draggedIndex, setDraggedIndex] = useState(null);

  const handleBindingChange = (componentType, variableName) => {
    const existingBinding = config.componentBindings.find(b => b.componentType === componentType);
    
    if (existingBinding) {
      updateComponentBinding(componentType, variableName);
    } else if (variableName) {
      addComponentBinding({
        componentType,
        variableName,
        order: config.componentBindings.length
      });
    }
  };

  const handleDragStart = (e, index) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;
    
    const newBindings = [...config.componentBindings];
    const [draggedItem] = newBindings.splice(draggedIndex, 1);
    newBindings.splice(index, 0, draggedItem);
    
    reorderComponents(newBindings.map((b, i) => ({ ...b, order: i })));
    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  const getBindingForComponent = (componentType) => {
    return config.componentBindings.find(b => b.componentType === componentType);
  };

  return (
    <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-green-500/20 rounded-lg">
          <Layout className="w-5 h-5 text-green-400" />
        </div>
        <h2 className="text-lg font-semibold text-white">渲染组件绑定</h2>
      </div>

      <div className="space-y-6">
        <div className="space-y-3">
          <span className="text-sm font-medium text-slate-300">可用组件</span>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {COMPONENT_TYPES.map(component => {
              const binding = getBindingForComponent(component.id);
              const Icon = component.icon;
              
              return (
                <div 
                  key={component.id}
                  className={`p-4 rounded-lg border transition-colors ${
                    binding 
                      ? 'border-green-500/50 bg-green-500/5' 
                      : 'border-slate-700 bg-slate-900/30'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg ${component.bgColor}`}>
                      <Icon className={`w-5 h-5 ${component.color}`} />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-white font-medium text-sm">{component.name}</span>
                        {binding && <Check className="w-4 h-4 text-green-400" />}
                      </div>
                      <p className="text-slate-500 text-xs mt-0.5">{component.description}</p>
                      
                      <div className="mt-3 relative">
                        <select
                          value={binding?.variableName || ''}
                          onChange={(e) => handleBindingChange(component.id, e.target.value)}
                          className="w-full appearance-none bg-slate-700 text-white px-3 py-2 pr-8 rounded border border-slate-600 focus:border-blue-500 focus:outline-none text-sm"
                        >
                          <option value="">选择绑定变量...</option>
                          {config.outputVariables.map(variable => (
                            <option key={variable.name} value={variable.name}>
                              {variable.name} ({variable.type})
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {config.componentBindings.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-300">组件显示顺序</span>
              <span className="text-xs text-slate-500">拖拽调整顺序</span>
            </div>
            
            <div className="space-y-2">
              {[...config.componentBindings]
                .sort((a, b) => a.order - b.order)
                .map((binding, index) => {
                  const component = COMPONENT_TYPES.find(c => c.id === binding.componentType);
                  const variable = config.outputVariables.find(v => v.name === binding.variableName);
                  if (!component) return null;
                  
                  const Icon = component.icon;
                  
                  return (
                    <div
                      key={binding.componentType}
                      draggable
                      onDragStart={(e) => handleDragStart(e, index)}
                      onDragOver={(e) => handleDragOver(e, index)}
                      onDragEnd={handleDragEnd}
                      className={`flex items-center gap-3 p-3 bg-slate-900/50 rounded-lg border border-slate-700 cursor-move transition-colors ${
                        draggedIndex === index ? 'opacity-50' : ''
                      }`}
                    >
                      <GripVertical className="w-4 h-4 text-slate-500" />
                      
                      <div className={`p-1.5 rounded ${component.bgColor}`}>
                        <Icon className={`w-4 h-4 ${component.color}`} />
                      </div>
                      
                      <span className="text-white text-sm flex-1">{component.name}</span>
                      
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-500">绑定:</span>
                        <code className="text-xs bg-slate-700 px-2 py-0.5 rounded text-blue-400">
                          {variable?.name || binding.variableName}
                        </code>
                      </div>
                      
                      <span className="text-xs text-slate-600">#{index + 1}</span>
                    </div>
                  );
                })}
            </div>
          </div>
        )}

        {config.componentBindings.length === 0 && (
          <div className="p-4 bg-slate-900/30 rounded-lg border border-dashed border-slate-600 text-center">
            <p className="text-slate-500 text-sm">请先定义输出变量，然后绑定到渲染组件</p>
          </div>
        )}
      </div>
    </div>
  );
}
