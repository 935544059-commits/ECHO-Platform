import { useState } from 'react';
import { X, Plus, Settings, ChevronDown, ChevronUp } from 'lucide-react';

const UI_TYPES = [
  { value: 'input', label: '单行文本', icon: '📝' },
  { value: 'textarea', label: '多行文本', icon: '📄' },
  { value: 'select', label: '下拉选择', icon: '📋' },
  { value: 'switch', label: '开关', icon: '🔘' },
  { value: 'slider', label: '滑块', icon: '📊' },
  { value: 'number', label: '数字输入', icon: '🔢' },
];

export default function BusinessParamModal({ isOpen, onClose, onSave, editIndex, existingParam }) {
  const [formData, setFormData] = useState(existingParam || {
    key: '',
    label: '',
    uiType: 'input',
    required: false,
    placeholder: '',
    options: [],
    defaultValue: '',
    min: 0,
    max: 100,
    step: 1,
  });
  const [newOption, setNewOption] = useState({ label: '', value: '' });
  const [expandedSection, setExpandedSection] = useState('basic');

  if (!isOpen) return null;

  const handleSave = () => {
    if (!formData.key.trim() || !formData.label.trim()) {
      alert('请填写变量标识和显示文本');
      return;
    }

    // 验证 key 格式（只能包含字母、数字、下划线）
    if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(formData.key)) {
      alert('变量标识只能包含字母、数字和下划线，且不能以数字开头');
      return;
    }

    onSave({
      ...formData,
      id: existingParam?.id || Date.now().toString(),
    });
    onClose();
  };

  const handleAddOption = () => {
    if (!newOption.label.trim() || !newOption.value.trim()) return;
    setFormData(prev => ({
      ...prev,
      options: [...prev.options, { ...newOption }],
    }));
    setNewOption({ label: '', value: '' });
  };

  const handleRemoveOption = (index) => {
    setFormData(prev => ({
      ...prev,
      options: prev.options.filter((_, i) => i !== index),
    }));
  };

  const renderConstraintConfig = () => {
    switch (formData.uiType) {
      case 'select':
        return (
          <div className="space-y-3">
            <div className="text-sm font-medium text-gray-700">选项列表</div>
            <div className="space-y-2">
              {formData.options.map((opt, idx) => (
                <div key={idx} className="flex items-center gap-2 p-2 bg-gray-50 rounded border border-gray-200">
                  <input
                    type="text"
                    value={opt.label}
                    onChange={(e) => {
                      const newOptions = [...formData.options];
                      newOptions[idx].label = e.target.value;
                      setFormData(prev => ({ ...prev, options: newOptions }));
                    }}
                    placeholder="显示文本"
                    className="flex-1 text-sm border border-gray-300 rounded px-2 py-1"
                  />
                  <input
                    type="text"
                    value={opt.value}
                    onChange={(e) => {
                      const newOptions = [...formData.options];
                      newOptions[idx].value = e.target.value;
                      setFormData(prev => ({ ...prev, options: newOptions }));
                    }}
                    placeholder="值"
                    className="flex-1 text-sm border border-gray-300 rounded px-2 py-1"
                  />
                  <button
                    onClick={() => handleRemoveOption(idx)}
                    className="text-red-500 hover:text-red-700 p-1"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={newOption.label}
                onChange={(e) => setNewOption(prev => ({ ...prev, label: e.target.value }))}
                placeholder="选项显示文本"
                className="flex-1 text-sm border border-gray-300 rounded px-2 py-1"
              />
              <input
                type="text"
                value={newOption.value}
                onChange={(e) => setNewOption(prev => ({ ...prev, value: e.target.value }))}
                placeholder="选项值"
                className="flex-1 text-sm border border-gray-300 rounded px-2 py-1"
              />
              <button
                onClick={handleAddOption}
                className="flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-600 rounded text-sm hover:bg-blue-100"
              >
                <Plus className="w-3 h-3" />
                添加
              </button>
            </div>
          </div>
        );

      case 'input':
      case 'textarea':
        return (
          <div className="space-y-3">
            <div className="text-sm font-medium text-gray-700">输入提示</div>
            <input
              type="text"
              value={formData.placeholder}
              onChange={(e) => setFormData(prev => ({ ...prev, placeholder: e.target.value }))}
              placeholder="例如：请输入描述信息..."
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
            />
          </div>
        );

      case 'slider':
      case 'number':
        return (
          <div className="space-y-3">
            <div className="text-sm font-medium text-gray-700">数值范围</div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-xs text-gray-500">最小值</label>
                <input
                  type="number"
                  value={formData.min}
                  onChange={(e) => setFormData(prev => ({ ...prev, min: Number(e.target.value) }))}
                  className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500">最大值</label>
                <input
                  type="number"
                  value={formData.max}
                  onChange={(e) => setFormData(prev => ({ ...prev, max: Number(e.target.value) }))}
                  className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500">步长</label>
                <input
                  type="number"
                  value={formData.step}
                  onChange={(e) => setFormData(prev => ({ ...prev, step: Number(e.target.value) }))}
                  className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                />
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const toggleSection = (section) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* 头部 */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">
            {editIndex !== undefined ? '编辑业务参数' : '添加业务参数'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* 内容区 - 可滚动 */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* 基础配置 */}
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <button
              onClick={() => toggleSection('basic')}
              className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
            >
              <span className="text-sm font-medium text-gray-700">📋 基础配置</span>
              {expandedSection === 'basic' ? (
                <ChevronUp className="w-4 h-4 text-gray-500" />
              ) : (
                <ChevronDown className="w-4 h-4 text-gray-500" />
              )}
            </button>
            {expandedSection === 'basic' && (
              <div className="p-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    变量标识 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.key}
                    onChange={(e) => setFormData(prev => ({ ...prev, key: e.target.value }))}
                    placeholder="例如：style、max_tokens"
                    className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <p className="text-xs text-gray-500 mt-1">用于请求体占位符，如 {"{{style}}"}，只能包含字母、数字和下划线</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    显示文本 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.label}
                    onChange={(e) => setFormData(prev => ({ ...prev, label: e.target.value }))}
                    placeholder="例如：文案风格、最大 Token 数"
                    className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <p className="text-xs text-gray-500 mt-1">前端用户看到的名称</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    交互类型 <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {UI_TYPES.map((type) => (
                      <button
                        key={type.value}
                        onClick={() => setFormData(prev => ({ ...prev, uiType: type.value }))}
                        className={`p-3 rounded-lg border-2 transition-all text-sm ${
                          formData.uiType === type.value
                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="text-lg mb-1">{type.icon}</div>
                        <div>{type.label}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="required"
                    checked={formData.required}
                    onChange={(e) => setFormData(prev => ({ ...prev, required: e.target.checked }))}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="required" className="text-sm text-gray-700">
                    必填项
                  </label>
                </div>
              </div>
            )}
          </div>

          {/* 数据约束 */}
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <button
              onClick={() => toggleSection('constraint')}
              className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
            >
              <span className="text-sm font-medium text-gray-700">🔧 数据约束（{UI_TYPES.find(t => t.value === formData.uiType)?.label}）</span>
              {expandedSection === 'constraint' ? (
                <ChevronUp className="w-4 h-4 text-gray-500" />
              ) : (
                <ChevronDown className="w-4 h-4 text-gray-500" />
              )}
            </button>
            {expandedSection === 'constraint' && (
              <div className="p-4">
                {renderConstraintConfig()}
              </div>
            )}
          </div>

          {/* 默认值 */}
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <button
              onClick={() => toggleSection('default')}
              className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
            >
              <span className="text-sm font-medium text-gray-700">⚙️ 默认值</span>
              {expandedSection === 'default' ? (
                <ChevronUp className="w-4 h-4 text-gray-500" />
              ) : (
                <ChevronDown className="w-4 h-4 text-gray-500" />
              )}
            </button>
            {expandedSection === 'default' && (
              <div className="p-4">
                {formData.uiType === 'switch' ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.defaultValue}
                      onChange={(e) => setFormData(prev => ({ ...prev, defaultValue: e.target.checked }))}
                      className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">默认{formData.defaultValue ? '开启' : '关闭'}</span>
                  </div>
                ) : formData.uiType === 'select' ? (
                  <select
                    value={formData.defaultValue}
                    onChange={(e) => setFormData(prev => ({ ...prev, defaultValue: e.target.value }))}
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                  >
                    <option value="">请选择默认值</option>
                    {formData.options.map((opt, idx) => (
                      <option key={idx} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type={formData.uiType === 'number' || formData.uiType === 'slider' ? 'number' : 'text'}
                    value={formData.defaultValue}
                    onChange={(e) => setFormData(prev => ({ ...prev, defaultValue: e.target.value }))}
                    placeholder="默认值"
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                  />
                )}
              </div>
            )}
          </div>
        </div>

        {/* 底部按钮 */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            取消
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            保存
          </button>
        </div>
      </div>
    </div>
  );
}
