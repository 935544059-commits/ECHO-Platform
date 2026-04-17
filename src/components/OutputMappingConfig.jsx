import { useState } from 'react';
import { useConfig } from '../context/ConfigContext';
import { Database, Plus, Trash2, CheckCircle, AlertCircle, Eye, ChevronDown, ChevronUp, PieChart, MessageSquare, Tag, MousePointer } from 'lucide-react';
import MarkdownRenderer from './MarkdownRenderer';

const RENDER_SLOTS = [
  { id: 'mainContent', label: '主回复内容', icon: <MessageSquare className="w-4 h-4" />, description: '智能渲染引擎' },
  { id: 'thoughtChain', label: '思维链/思考过程', icon: <PieChart className="w-4 h-4" />, description: '折叠气泡组件' },
  { id: 'suggestions', label: '建议问题', icon: <Tag className="w-4 h-4" />, description: '快捷标签组件' },
];

const MOCK_DATA = {
  mainContent: '# 智能体回复\n\n这是一段 **Markdown** 格式的回复内容。\n\n## 图片示例\n\n![示例图片](https://neeko-copilot.bytedance.net/api/text2image?prompt=beautiful%20landscape%20with%20mountains%20and%20lake&size=1024x1024)\n\n## 图表示例\n\n```json-chart\n{\n  "title": "销售数据",\n  "type": "pie",\n  "data": [\n    { "name": "产品A", "value": 300 },\n    { "name": "产品B", "value": 200 },\n    { "name": "产品C", "value": 150 }\n  ]\n}\n```',
  thoughtChain: '首先分析用户的问题，然后查阅相关资料，最后生成合适的回答。需要确保回答准确、全面、易懂。',
  suggestions: ['如何使用智能体？', '智能体有哪些功能？', '如何优化智能体的回答？']
};

function JsonNode({ keyName, value, path = [], onNodeClick, selectedPath, depth = 0, onSlotBinding, bindings }) {
  const [isExpanded, setIsExpanded] = useState(depth < 2);
  const [showMenu, setShowMenu] = useState(false);
  
  const isObject = value !== null && typeof value === 'object';
  const isArray = Array.isArray(value);
  const currentPath = keyName !== undefined ? [...path, keyName] : path;
  const jsonPath = '$' + currentPath.map(k => typeof k === 'number' ? `[${k}]` : `.${k}`).join('');
  const isSelected = selectedPath === jsonPath;
  
  // 检查当前路径是否已绑定到某个插槽
  const getBindingSlot = () => {
    for (const [slot, path] of Object.entries(bindings)) {
      if (path === jsonPath) return slot;
    }
    return null;
  };
  
  const bindingSlot = getBindingSlot();

  const handleClick = (e) => {
    e.stopPropagation();
    if (!isObject) {
      onNodeClick(jsonPath, value);
    }
  };

  const handleRightClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isObject) {
      setShowMenu(true);
    }
  };

  const handleSlotBind = (slotId) => {
    onSlotBinding(slotId, jsonPath);
    setShowMenu(false);
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
          
          {bindingSlot && (
            <span className="ml-2 text-xs px-1.5 py-0.5 bg-green-100 text-green-700 rounded-full">
              {bindingSlot === 'mainContent' && '主回复'}
              {bindingSlot === 'thoughtChain' && '思维链'}
              {bindingSlot === 'suggestions' && '建议问题'}
            </span>
          )}
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
                onSlotBinding={onSlotBinding}
                bindings={bindings}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="relative">
      <div 
        className={`flex items-center gap-2 py-0.5 px-1 rounded cursor-pointer hover:bg-gray-100 ${isSelected ? 'bg-blue-100' : ''}`}
        onClick={handleClick}
        onContextMenu={handleRightClick}
      >
        <span className="w-4" />
        
        {keyName !== undefined && (
          <span className="json-tree-key text-sm">{keyName}:</span>
        )}
        
        <span className={`${getValueColor()} text-sm`}>
          {renderValue()}
        </span>
        
        {bindingSlot && (
          <span className="ml-2 text-xs px-1.5 py-0.5 bg-green-100 text-green-700 rounded-full">
            {bindingSlot === 'mainContent' && '主回复'}
            {bindingSlot === 'thoughtChain' && '思维链'}
            {bindingSlot === 'suggestions' && '建议问题'}
          </span>
        )}
      </div>
      
      {showMenu && (
        <div className="absolute right-0 top-0 z-10 bg-white shadow-lg rounded-lg border border-gray-200 py-1 min-w-48">
          <button
            onClick={() => handleSlotBind('mainContent')}
            className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100"
          >
            设为主回复内容
          </button>
          <button
            onClick={() => handleSlotBind('thoughtChain')}
            className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100"
          >
            设为思维链/思考过程
          </button>
          <button
            onClick={() => handleSlotBind('suggestions')}
            className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100"
          >
            设为建议问题
          </button>
          <button
            onClick={() => setShowMenu(false)}
            className="w-full text-left px-3 py-2 text-sm text-gray-500 hover:bg-gray-100 border-t border-gray-100"
          >
            取消
          </button>
        </div>
      )}
    </div>
  );
}

export default function OutputMappingConfig() {
  const { config } = useConfig();
  const [selectedPath, setSelectedPath] = useState(null);
  const [selectedValue, setSelectedValue] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [showDemo, setShowDemo] = useState(false);
  const [renderBindings, setRenderBindings] = useState({
    mainContent: '',
    thoughtChain: '',
    suggestions: ''
  });
  const [autoParseMedia, setAutoParseMedia] = useState(true);
  const [pickingSlot, setPickingSlot] = useState(null); // 当前正在拾取的插槽
  const [previewTab, setPreviewTab] = useState('render'); // 预览标签页：render, send, receive

  const handleNodeSelect = (path, value) => {
    setSelectedPath(path);
    setSelectedValue(value);
    
    // 如果正在拾取模式，绑定到对应的插槽
    if (pickingSlot) {
      const newBindings = { ...renderBindings, [pickingSlot]: path };
      setRenderBindings(newBindings);
      setPickingSlot(null); // 结束拾取模式
    }
  };

  const handleStartPick = (slotId) => {
    setPickingSlot(slotId);
  };

  const handleSlotBinding = (slotId, path) => {
    const newBindings = { ...renderBindings, [slotId]: path };
    setRenderBindings(newBindings);
  };

  const handleRenderDemo = () => {
    setShowDemo(true);
    setShowPreview(true);
  };

  const getMockData = () => {
    if (showDemo) {
      return MOCK_DATA;
    }
    return {
      mainContent: '',
      thoughtChain: '',
      suggestions: []
    };
  };

  const mockData = getMockData();

  return (
    <div className="card-light p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="section-title mb-0">出参解析与渲染配置</div>
        <button
          onClick={() => setShowPreview(!showPreview)}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors ${
            showPreview 
              ? 'bg-blue-100 text-blue-700' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <Eye className="w-4 h-4" />
          {showPreview ? '隐藏预览' : '响应预览'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* JSON 树预览 */}
        <div className="lg:col-span-1 space-y-3">
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
                  onSlotBinding={handleSlotBinding}
                  bindings={renderBindings}
                />
              </div>
            ) : (
              <div className="text-center text-gray-400 py-8">
                <Database className="w-12 h-12 mx-auto mb-3 opacity-20" />
                <p className="text-sm">发送测试请求后，响应数据将在此显示</p>
                <p className="text-xs text-gray-500 mt-2">或右键点击 JSON 节点绑定渲染插槽</p>
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
        </div>

        {/* 语义化渲染插槽 */}
        <div className="lg:col-span-1 space-y-4">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-gray-400" />
            <span className="text-sm font-medium text-gray-700">语义化渲染插槽</span>
          </div>
          
          <div className="space-y-6">
            {RENDER_SLOTS.map((slot) => (
              <div key={slot.id} className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="text-blue-600">{slot.icon}</div>
                  <div>
                    <div className="text-sm font-medium text-gray-900">{slot.label}</div>
                    <div className="text-xs text-gray-500">{slot.description}</div>
                  </div>
                </div>
                
                {slot.id === 'mainContent' && (
                  <div className="mt-2">
                    <div className="text-xs text-gray-500">支持 Markdown、图片及 ECharts 图表 AI 自动识别渲染</div>
                  </div>
                )}
                
                <div className="mt-3">
                  <div className="text-xs text-gray-500 mb-1">绑定路径</div>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={renderBindings[slot.id] || ''}
                      onChange={(e) => {
                        const newBindings = { ...renderBindings, [slot.id]: e.target.value };
                        setRenderBindings(newBindings);
                      }}
                      className="flex-1 input-light text-xs font-mono"
                      placeholder={`例如：$.data.${slot.id}`}
                    />
                    <button
                      onClick={() => handleStartPick(slot.id)}
                      className={`flex items-center gap-1 px-2 py-1 text-xs transition-colors ${
                        pickingSlot === slot.id 
                          ? 'bg-blue-100 text-blue-700' 
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      } rounded`}
                    >
                      <MousePointer className="w-3 h-3" />
                      拾取
                    </button>
                    {renderBindings[slot.id] && (
                      <button
                        onClick={() => {
                          const newBindings = { ...renderBindings, [slot.id]: '' };
                          setRenderBindings(newBindings);
                        }}
                        className="text-gray-400 hover:text-red-500"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                  {pickingSlot === slot.id && (
                    <div className="mt-2 text-xs text-blue-600 flex items-center gap-1">
                      <MousePointer className="w-3 h-3 animate-pulse" />
                      请在左侧 JSON 树中点击要绑定的节点
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
          
          <button
            onClick={handleRenderDemo}
            className="w-full btn-primary text-sm"
          >
            <Eye className="w-3 h-3 inline mr-1" />
            查看渲染 Demo
          </button>
        </div>

        {/* 模拟对话框预览 */}
        {showPreview && (
          <div className="lg:col-span-1 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-gray-400" />
                <span className="text-sm font-medium text-gray-700">模拟对话框</span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setPreviewTab('render')}
                  className={`px-3 py-1 text-xs transition-colors ${
                    previewTab === 'render' 
                      ? 'bg-blue-100 text-blue-700' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  } rounded-l-lg`}
                >
                  渲染效果
                </button>
                <button
                  onClick={() => setPreviewTab('send')}
                  className={`px-3 py-1 text-xs transition-colors ${
                    previewTab === 'send' 
                      ? 'bg-blue-100 text-blue-700' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  发送数据
                </button>
                <button
                  onClick={() => setPreviewTab('receive')}
                  className={`px-3 py-1 text-xs transition-colors ${
                    previewTab === 'receive' 
                      ? 'bg-blue-100 text-blue-700' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  } rounded-r-lg`}
                >
                  接收数据
                </button>
              </div>
            </div>
            
            <div className="bg-gray-50 rounded-lg border border-gray-200 p-4 pb-8 space-y-4 max-h-[400px] overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
              {previewTab === 'render' && (
                <>
                  {/* 思维链 */}
                  {mockData.thoughtChain && (
                    <div className="bg-gray-100 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <PieChart className="w-4 h-4 text-gray-500" />
                        <span className="text-xs font-medium text-gray-700">思考中...</span>
                      </div>
                      <div className="text-xs text-gray-600">
                        {mockData.thoughtChain}
                      </div>
                    </div>
                  )}
                  
                  {/* 主回复内容 */}
                  {mockData.mainContent && (
                    <div className="bg-white rounded-lg p-4 border border-gray-200">
                      <MarkdownRenderer 
                        content={mockData.mainContent} 
                        autoParseMedia={autoParseMedia} 
                      />
                    </div>
                  )}
                  
                  {/* 建议问题 */}
                  {mockData.suggestions && mockData.suggestions.length > 0 && (
                    <div>
                      <div className="text-xs font-medium text-gray-700 mb-2">建议问题</div>
                      <div className="flex flex-wrap gap-2">
                        {mockData.suggestions.map((suggestion, index) => (
                          <button key={index} className="px-3 py-1 text-xs bg-blue-50 text-blue-700 rounded-full hover:bg-blue-100 transition-colors">
                            {suggestion}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {!mockData.mainContent && !mockData.thoughtChain && !mockData.suggestions.length && (
                    <div className="text-center text-gray-400 py-8">
                      <MessageSquare className="w-10 h-10 mx-auto mb-2 opacity-20" />
                      <p className="text-sm">绑定渲染插槽后，预览将显示在这里</p>
                    </div>
                  )}
                </>
              )}
              
              {previewTab === 'send' && (
                <div className="space-y-2">
                  <div className="text-xs font-medium text-gray-700">发送的请求数据</div>
                  <div className="bg-white rounded-lg p-3 border border-gray-200 font-mono text-xs">
                    <pre className="whitespace-pre-wrap">
                      {JSON.stringify({
                        method: 'POST',
                        headers: {
                          'Content-Type': 'application/json'
                        },
                        body: {
                          input: '用户输入的问题',
                          session_id: 'session_123456',
                          user_id: 'user_789'
                        }
                      }, null, 2)}
                    </pre>
                  </div>
                </div>
              )}
              
              {previewTab === 'receive' && (
                <div className="space-y-2">
                  <div className="text-xs font-medium text-gray-700">接收的响应数据</div>
                  <div className="bg-white rounded-lg p-3 border border-gray-200 font-mono text-xs">
                    <pre className="whitespace-pre-wrap">
                      {JSON.stringify({
                        status: 'success',
                        data: {
                          mainContent: '# 智能体回复\n\n这是一段 **Markdown** 格式的回复内容。',
                          thoughtChain: '首先分析用户的问题，然后查阅相关资料，最后生成合适的回答。',
                          suggestions: ['如何使用智能体？', '智能体有哪些功能？']
                        }
                      }, null, 2)}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}