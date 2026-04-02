// Mock API 响应数据 - 用于测试
export const mockResponses = {
  // Dify 平台响应示例
  dify: {
    success: {
      event: "message",
      data: {
        id: "msg-123456",
        answer: "您好！我是客服助手，很高兴为您服务。请问有什么可以帮助您的？",
        conversation_id: "conv-789012",
        created_at: 1704067200,
      }
    },
    streaming: {
      chunks: [
        { event: "message", data: { answer: "您好！" } },
        { event: "message", data: { answer: "我是客服助手，" } },
        { event: "message", data: { answer: "很高兴为您服务。" } },
        { event: "message", data: { answer: "请问有什么可以帮助您的？" } }
      ]
    }
  },
  
  // Coze 平台响应示例
  coze: {
    success: {
      code: 0,
      msg: "success",
      data: {
        id: "7123456789",
        content: "这是一个智能回复内容",
        role: "assistant",
        type: "answer"
      }
    }
  },
  
  // 九天平台响应示例
  jiutian: {
    success: {
      code: 200,
      message: "操作成功",
      data: {
        result: {
          text: "智能回复内容",
          confidence: 0.95,
          intent: "greeting"
        }
      }
    }
  },
  
  // JSONPlaceholder 测试 API
  jsonplaceholder: {
    post: {
      userId: 1,
      id: 1,
      title: "sunt aut facere repellat provident occaecati excepturi optio reprehenderit",
      body: "quia et suscipit\nsuscipit recusandae consequuntur expedita et cum\nreprehenderit molestiae ut ut quas totam\nnostrum rerum est autem sunt rem eveniet architecto"
    }
  }
};

// 预配置示例 - 快速测试
export const exampleConfigs = {
  dify: {
    agentInfo: {
      name: "客服助手",
      tags: ["客服", "AI", "自动回复"],
      description: "用于处理用户咨询的智能客服助手，支持多轮对话和意图识别",
      avatar: null
    },
    apiConfig: {
      queryFrequency: "1h",
      apiType: "dify",
      apiName: "Dify 客服 API",
      apiUrl: "https://api.dify.ai/v1/chat-messages",
      apiDescription: "Dify 平台对话接口",
      authType: "API_KEY",
      apiKey: "app-xxxxxxxxxxxxx",
      bearerToken: "",
      method: "POST",
      headers: [
        { key: "Content-Type", value: "application/json" }
      ],
      body: `{
  "inputs": {},
  "query": "{{USER_INPUT}}",
  "response_mode": "streaming",
  "conversation_id": "{{SESSION_ID}}",
  "user": "{{USER_ID}}"
}`,
      isStreaming: true
    },
    inputParams: {
      bodyTemplate: `{
  "inputs": {},
  "query": "{{USER_INPUT}}",
  "response_mode": "streaming",
  "conversation_id": "{{SESSION_ID}}",
  "user": "{{USER_ID}}"
}`,
      businessParams: []
    },
    outputVariables: [
      {
        name: "var_answer",
        jsonPath: "$.data.answer",
        type: "text",
        description: "AI 回复的文本内容"
      }
    ]
  },
  
  coze: {
    agentInfo: {
      name: "Coze 智能助手",
      tags: ["Coze", "Bot"],
      description: "基于 Coze 平台的智能对话机器人",
      avatar: null
    },
    apiConfig: {
      queryFrequency: "1h",
      apiType: "coze",
      apiName: "Coze Chat API",
      apiUrl: "https://api.coze.com/v1/chat",
      apiDescription: "Coze 平台对话接口",
      authType: "BEARER_TOKEN",
      apiKey: "",
      bearerToken: "pat_xxxxxxxxxxxxx",
      method: "POST",
      headers: [
        { key: "Content-Type", value: "application/json" }
      ],
      body: `{
  "bot_id": "7123456789",
  "user_id": "{{USER_ID}}",
  "conversation_id": "{{SESSION_ID}}",
  "query": "{{USER_INPUT}}"
}`,
      isStreaming: false
    },
    inputParams: {
      bodyTemplate: `{
  "bot_id": "7123456789",
  "user_id": "{{USER_ID}}",
  "conversation_id": "{{SESSION_ID}}",
  "query": "{{USER_INPUT}}"
}`,
      businessParams: []
    },
    outputVariables: [
      {
        name: "var_content",
        jsonPath: "$.data.content",
        type: "text",
        description: "Bot 回复内容"
      }
    ]
  }
};

// 工具函数：模拟 API 调用
export async function mockApiCall(config, userInput = 'test') {
  // 模拟网络延迟
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  const { apiType, apiUrl } = config.apiConfig;
  
  // 如果是真实的 JSONPlaceholder URL
  if (apiUrl.includes('jsonplaceholder')) {
    const response = await fetch(apiUrl);
    return await response.json();
  }
  
  // 返回对应平台的 Mock 数据
  switch (apiType) {
    case 'dify':
      return mockResponses.dify.success;
    case 'coze':
      return mockResponses.coze.success;
    case 'jiutian':
      return mockResponses.jiutian.success;
    default:
      return {
        message: "Mock response - 请配置真实的 API 地址",
        config: config.apiConfig,
        userInput
      };
  }
}

// 工具函数：加载示例配置
export function loadExampleConfig(platform) {
  return exampleConfigs[platform] || null;
}
