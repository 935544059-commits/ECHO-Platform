import { useState, useRef } from 'react';
import { useConfig } from '../context/ConfigContext';
import { Upload, X, AlertCircle } from 'lucide-react';

export default function AgentInfoPanel() {
  const { config, updateAgentInfo, addTag, removeTag } = useConfig();
  const [tagInput, setTagInput] = useState('');
  const [errors, setErrors] = useState({});
  const fileInputRef = useRef(null);

  const validateField = (field, value) => {
    if (field === 'name' && !value.trim()) {
      return '请输入智能体名称';
    }
    if (field === 'description' && value.length > 100) {
      return '描述不能超过 100 字';
    }
    return null;
  };

  const handleChange = (field, value) => {
    const error = validateField(field, value);
    setErrors(prev => ({
      ...prev,
      [field]: error
    }));
    updateAgentInfo({ [field]: value });
  };

  const handleAddTag = (e) => {
    e.preventDefault();
    if (tagInput.trim()) {
      addTag(tagInput.trim());
      setTagInput('');
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setErrors(prev => ({
          ...prev,
          avatar: '图片大小不能超过 2M'
        }));
        return;
      }
      
      setErrors(prev => ({ ...prev, avatar: null }));
      const reader = new FileReader();
      reader.onload = (e) => {
        updateAgentInfo({ avatar: e.target.result });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="card-light p-6">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* 头像上传区 */}
        <div className="lg:col-span-1">
          <div className="flex flex-col items-center">
            <div 
              className={`w-24 h-24 rounded-lg bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center cursor-pointer hover:opacity-90 transition-opacity overflow-hidden ${errors.avatar ? 'ring-2 ring-red-500' : ''}`}
              onClick={() => fileInputRef.current?.click()}
            >
              {config.agentInfo.avatar ? (
                <img src={config.agentInfo.avatar} alt="Agent Avatar" className="w-full h-full object-cover" />
              ) : (
                <Upload className="w-8 h-8 text-white" />
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
            <p className="text-xs text-gray-500 mt-2 text-center">
              图片格式支持<br/>jpg/jpeg/png，<br/>大小不超过 2M
            </p>
            {errors.avatar && (
              <div className="flex items-center gap-1 mt-1 text-xs text-red-500">
                <AlertCircle className="w-3 h-3" />
                {errors.avatar}
              </div>
            )}
          </div>
        </div>

        {/* 基本信息表单 */}
        <div className="lg:col-span-3 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="form-label-required">智能体名称</label>
              <input
                type="text"
                value={config.agentInfo.name}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="请输入"
                className={`input-light ${errors.name ? 'border-red-500' : ''}`}
              />
              {errors.name && (
                <div className="flex items-center gap-1 mt-1 text-xs text-red-500">
                  <AlertCircle className="w-3 h-3" />
                  {errors.name}
                </div>
              )}
            </div>
            
            <div>
              <label className="form-label-required">智能体标签</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddTag(e);
                    }
                  }}
                  placeholder="请输入标签"
                  className="input-light flex-1"
                />
                <button
                  onClick={handleAddTag}
                  className="btn-secondary"
                  type="button"
                >
                  +
                </button>
              </div>
              {config.agentInfo.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {config.agentInfo.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded"
                    >
                      {tag}
                      <button
                        onClick={() => removeTag(index)}
                        className="hover:text-blue-900"
                        type="button"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="form-label-required">能力描述</label>
            <textarea
              value={config.agentInfo.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="该字段用于语义路由匹配，请仔细输入能力特征词或业务定义。建议涵盖核心实体（如：IP 承载网、B 域账单）及操作意图（如：诊断、查询、汇总）"
              rows={3}
              maxLength={100}
              className={`input-light resize-none ${errors.description ? 'border-red-500' : ''}`}
            />
            <div className={`text-right text-xs mt-1 ${config.agentInfo.description.length > 100 ? 'text-red-500' : 'text-gray-400'}`}>
              {config.agentInfo.description.length} / 100
            </div>
            {errors.description && (
              <div className="flex items-center gap-1 mt-1 text-xs text-red-500">
                <AlertCircle className="w-3 h-3" />
                {errors.description}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
