import { createContext, useContext, useState, useCallback } from 'react';

const ConfigContext = createContext(null);

const initialConfig = {
  // 智能体基本信息
  agentInfo: {
    name: '',
    tags: [],
    description: '',
    avatar: null,
  },
  // API 配置
  apiConfig: {
    queryFrequency: '1h',
    apiType: 'dify',
    apiName: '',
    apiUrl: '',
    apiDescription: '',
    authType: 'API_KEY',
    apiKey: '',
    bearerToken: '',
    method: 'POST',
    headers: [{ key: 'Content-Type', value: 'application/json' }],
    body: '{\n  "query": "{{USER_INPUT}}"\n}',
    isStreaming: false,
  },
  // 入参配置
  inputParams: {
    bodyTemplate: '{\n  "query": "{{USER_INPUT}}"\n}',
    businessParams: [],
  },
  // 出参配置
  outputVariables: [],
  componentBindings: [],
  testResponse: null,
  testError: null,
  // 配置状态
  configStatus: 'incomplete', // 'incomplete' | 'tested' | 'complete'
};

export function ConfigProvider({ children }) {
  const [config, setConfig] = useState(initialConfig);
  const [isLoading, setIsLoading] = useState(false);

  const updateAgentInfo = useCallback((updates) => {
    setConfig(prev => ({
      ...prev,
      agentInfo: { ...prev.agentInfo, ...updates }
    }));
  }, []);

  const addTag = useCallback((tag) => {
    setConfig(prev => ({
      ...prev,
      agentInfo: {
        ...prev.agentInfo,
        tags: [...prev.agentInfo.tags, tag]
      }
    }));
  }, []);

  const removeTag = useCallback((index) => {
    setConfig(prev => ({
      ...prev,
      agentInfo: {
        ...prev.agentInfo,
        tags: prev.agentInfo.tags.filter((_, i) => i !== index)
      }
    }));
  }, []);

  const updateApiConfig = useCallback((updates) => {
    setConfig(prev => ({
      ...prev,
      apiConfig: { ...prev.apiConfig, ...updates }
    }));
  }, []);

  const addHeader = useCallback(() => {
    setConfig(prev => ({
      ...prev,
      apiConfig: {
        ...prev.apiConfig,
        headers: [...prev.apiConfig.headers, { key: '', value: '' }]
      }
    }));
  }, []);

  const updateHeader = useCallback((index, field, value) => {
    setConfig(prev => ({
      ...prev,
      apiConfig: {
        ...prev.apiConfig,
        headers: prev.apiConfig.headers.map((h, i) => 
          i === index ? { ...h, [field]: value } : h
        )
      }
    }));
  }, []);

  const removeHeader = useCallback((index) => {
    setConfig(prev => ({
      ...prev,
      apiConfig: {
        ...prev.apiConfig,
        headers: prev.apiConfig.headers.filter((_, i) => i !== index)
      }
    }));
  }, []);

  const updateInputParams = useCallback((updates) => {
    setConfig(prev => ({
      ...prev,
      inputParams: { ...prev.inputParams, ...updates }
    }));
  }, []);

  const updateBodyTemplate = useCallback((template) => {
    setConfig(prev => ({
      ...prev,
      inputParams: { ...prev.inputParams, bodyTemplate: template },
      apiConfig: { ...prev.apiConfig, body: template }
    }));
  }, []);

  const addBusinessParam = useCallback((param) => {
    setConfig(prev => ({
      ...prev,
      inputParams: {
        ...prev.inputParams,
        businessParams: [...prev.inputParams.businessParams, param]
      }
    }));
  }, []);

  const updateBusinessParam = useCallback((index, updates) => {
    setConfig(prev => ({
      ...prev,
      inputParams: {
        ...prev.inputParams,
        businessParams: prev.inputParams.businessParams.map((p, i) =>
          i === index ? { ...p, ...updates } : p
        )
      }
    }));
  }, []);

  const removeBusinessParam = useCallback((index) => {
    setConfig(prev => ({
      ...prev,
      inputParams: {
        ...prev.inputParams,
        businessParams: prev.inputParams.businessParams.filter((_, i) => i !== index)
      }
    }));
  }, []);

  const addOutputVariable = useCallback((variable) => {
    setConfig(prev => ({
      ...prev,
      outputVariables: [...prev.outputVariables, variable]
    }));
  }, []);

  const removeOutputVariable = useCallback((name) => {
    setConfig(prev => ({
      ...prev,
      outputVariables: prev.outputVariables.filter(v => v.name !== name),
      componentBindings: prev.componentBindings.filter(b => b.variableName !== name)
    }));
  }, []);

  const addComponentBinding = useCallback((binding) => {
    setConfig(prev => ({
      ...prev,
      componentBindings: [...prev.componentBindings.filter(b => b.componentType !== binding.componentType), binding]
    }));
  }, []);

  const updateComponentBinding = useCallback((componentType, variableName) => {
    setConfig(prev => ({
      ...prev,
      componentBindings: prev.componentBindings.map(b =>
        b.componentType === componentType ? { ...b, variableName } : b
      )
    }));
  }, []);

  const reorderComponents = useCallback((newOrder) => {
    setConfig(prev => ({
      ...prev,
      componentBindings: newOrder
    }));
  }, []);

  const setTestResponse = useCallback((response, error) => {
    setConfig(prev => ({
      ...prev,
      testResponse: response,
      testError: error,
      // 根据测试结果更新配置状态
      configStatus: response ? 'tested' : prev.configStatus
    }));
  }, []);

  const value = {
    config,
    isLoading,
    setIsLoading,
    updateAgentInfo,
    addTag,
    removeTag,
    updateApiConfig,
    addHeader,
    updateHeader,
    removeHeader,
    updateInputParams,
    updateBodyTemplate,
    addBusinessParam,
    updateBusinessParam,
    removeBusinessParam,
    addOutputVariable,
    removeOutputVariable,
    addComponentBinding,
    updateComponentBinding,
    reorderComponents,
    setTestResponse,
    setConfigStatus: (status) => setConfig(prev => ({ ...prev, configStatus: status })),
  };

  return (
    <ConfigContext.Provider value={value}>
      {children}
    </ConfigContext.Provider>
  );
}

export function useConfig() {
  const context = useContext(ConfigContext);
  if (!context) {
    throw new Error('useConfig must be used within a ConfigProvider');
  }
  return context;
}
