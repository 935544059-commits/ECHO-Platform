import { JSONPath } from 'jsonpath-plus';

export function parseResponse(json, mapping) {
  const result = {};
  
  for (const [varName, path] of Object.entries(mapping)) {
    try {
      const value = JSONPath({ path, json, wrap: false });
      result[varName] = value;
    } catch (error) {
      console.error(`Failed to extract ${varName} with path ${path}:`, error);
      result[varName] = null;
    }
  }
  
  return result;
}

export function extractValue(json, path) {
  try {
    return JSONPath({ path, json, wrap: false });
  } catch (error) {
    console.error(`Failed to extract value with path ${path}:`, error);
    return null;
  }
}

export function buildMappingFromVariables(variables) {
  const mapping = {};
  for (const variable of variables) {
    mapping[variable.name] = variable.path;
  }
  return mapping;
}

export class SSEParser {
  constructor(onData, onError, onComplete) {
    this.buffer = '';
    this.onData = onData;
    this.onError = onError;
    this.onComplete = onComplete;
  }

  parse(chunk) {
    this.buffer += chunk;
    const lines = this.buffer.split('\n');
    this.buffer = lines.pop() || '';

    for (const line of lines) {
      if (line.startsWith('data: ')) {
        const data = line.slice(6);
        if (data === '[DONE]') {
          this.onComplete?.();
          return;
        }
        try {
          const json = JSON.parse(data);
          this.onData(json);
        } catch (e) {
          this.onError?.(e);
        }
      }
    }
  }

  flush() {
    if (this.buffer.trim()) {
      this.parse('\n');
    }
  }
}

export function replaceVariables(template, variables) {
  let result = template;
  for (const [key, value] of Object.entries(variables)) {
    const regex = new RegExp(`{{${key}}}`, 'g');
    result = result.replace(regex, value);
  }
  return result;
}

export function getJsonPath(nodePath) {
  if (!nodePath || nodePath.length === 0) return '$';
  
  let path = '$';
  for (const segment of nodePath) {
    if (typeof segment === 'number') {
      path += `[${segment}]`;
    } else {
      path += `.${segment}`;
    }
  }
  return path;
}
