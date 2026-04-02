import { useState } from 'react';
import { ChevronRight, ChevronDown, Copy, Check } from 'lucide-react';
import { getJsonPath } from '../utils/parser';

function JsonNode({ keyName, value, path = [], onNodeClick, selectedPath, depth = 0 }) {
  const [isExpanded, setIsExpanded] = useState(depth < 2);
  const [copied, setCopied] = useState(false);
  
  const isObject = value !== null && typeof value === 'object';
  const isArray = Array.isArray(value);
  const currentPath = keyName !== undefined ? [...path, keyName] : path;
  const jsonPath = getJsonPath(currentPath);
  const isSelected = selectedPath === jsonPath;

  const handleClick = (e) => {
    e.stopPropagation();
    if (!isObject) {
      onNodeClick(jsonPath, value);
    }
  };

  const handleCopy = (e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(jsonPath);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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
          className={`flex items-center gap-1 py-0.5 px-1 rounded cursor-pointer hover:bg-slate-700/50 ${isSelected ? 'bg-blue-500/20' : ''}`}
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? (
            <ChevronDown className="w-3 h-3 text-slate-500 flex-shrink-0" />
          ) : (
            <ChevronRight className="w-3 h-3 text-slate-500 flex-shrink-0" />
          )}
          
          {keyName !== undefined && (
            <span className="json-tree-key text-sm">{keyName}</span>
          )}
          
          <span className="json-tree-bracket text-xs">
            {isArray ? `[${value.length}]` : `{${Object.keys(value).length}}`}
          </span>
        </div>
        
        {isExpanded && (
          <div className="ml-4 border-l border-slate-700 pl-2">
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
      className={`flex items-center gap-2 py-0.5 px-1 rounded cursor-pointer hover:bg-slate-700/50 group ${isSelected ? 'bg-blue-500/20' : ''}`}
      onClick={handleClick}
    >
      <span className="w-3" />
      
      {keyName !== undefined && (
        <span className="json-tree-key text-sm">{keyName}:</span>
      )}
      
      <span className={`${getValueColor()} text-sm`}>
        {renderValue()}
      </span>
      
      <button
        onClick={handleCopy}
        className="opacity-0 group-hover:opacity-100 p-1 hover:bg-slate-600 rounded transition-opacity"
        title="复制 JSONPath"
      >
        {copied ? (
          <Check className="w-3 h-3 text-green-400" />
        ) : (
          <Copy className="w-3 h-3 text-slate-400" />
        )}
      </button>
    </div>
  );
}

export default function JsonTreeView({ data, onNodeSelect, selectedPath }) {
  if (!data) {
    return (
      <div className="flex items-center justify-center h-full text-slate-500">
        <p>发送测试请求后，响应数据将在此显示</p>
      </div>
    );
  }

  return (
    <div className="font-mono text-sm overflow-auto max-h-[500px] p-4 bg-slate-900/50 rounded-lg">
      <JsonNode 
        value={data} 
        onNodeClick={onNodeSelect}
        selectedPath={selectedPath}
      />
    </div>
  );
}
