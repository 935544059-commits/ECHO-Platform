import { useState } from 'react';

const DynamicFormPreview = ({ businessParams, paramValues, onParamChange }) => {
  if (!businessParams || businessParams.length === 0) {
    return (
      <div className="text-center py-12 text-gray-400">
        <div className="text-6xl mb-4">📋</div>
        <p>暂无业务参数</p>
        <p className="text-sm mt-2">在下方添加业务参数后，预览区将自动渲染对应的 UI 组件</p>
      </div>
    );
  }

  const renderComponent = (param) => {
    const value = paramValues[param.key] !== undefined ? paramValues[param.key] : param.defaultValue;

    switch (param.uiType) {
      case 'input':
        return (
          <input
            type="text"
            value={value || ''}
            onChange={(e) => onParamChange(param.key, e.target.value)}
            placeholder={param.placeholder}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        );

      case 'textarea':
        return (
          <textarea
            value={value || ''}
            onChange={(e) => onParamChange(param.key, e.target.value)}
            placeholder={param.placeholder}
            rows={3}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          />
        );

      case 'select':
        return (
          <select
            value={value || ''}
            onChange={(e) => onParamChange(param.key, e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">请选择</option>
            {param.options?.map((opt, idx) => (
              <option key={idx} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        );

      case 'switch':
        return (
          <label className="flex items-center cursor-pointer">
            <div className="relative">
              <input
                type="checkbox"
                checked={value || false}
                onChange={(e) => onParamChange(param.key, e.target.checked)}
                className="sr-only"
              />
              <div className={`block w-14 h-8 rounded-full transition-colors ${value ? 'bg-blue-600' : 'bg-gray-300'}`}></div>
              <div className={`absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform ${value ? 'transform translate-x-6' : ''}`}></div>
            </div>
            <span className="ml-3 text-sm text-gray-700">{value ? '开启' : '关闭'}</span>
          </label>
        );

      case 'slider':
        return (
          <div className="space-y-2">
            <input
              type="range"
              min={param.min}
              max={param.max}
              step={param.step}
              value={value || param.min}
              onChange={(e) => onParamChange(param.key, Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>{param.min}</span>
              <span className="font-medium text-blue-600">{value || param.min}</span>
              <span>{param.max}</span>
            </div>
          </div>
        );

      case 'number':
        return (
          <input
            type="number"
            value={value || ''}
            onChange={(e) => onParamChange(param.key, Number(e.target.value))}
            min={param.min}
            max={param.max}
            step={param.step}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-4">
      {businessParams.map((param) => (
        <div key={param.id} className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            {param.label}
            {param.required && <span className="text-red-500 ml-1">*</span>}
          </label>
          {renderComponent(param)}
        </div>
      ))}
    </div>
  );
};

export default DynamicFormPreview;
