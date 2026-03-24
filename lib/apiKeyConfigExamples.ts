/**
 * API Key Configuration Implementation Examples
 * Real-world examples of how to use API keys across different tools
 */

import {
  buildAuthHeaders,
  validateApiKeyConfig,
  isApiKeyEnabled,
  getHeaderPreview,
} from '@/lib/apiKeyConfigUtils';

/**
 * Example 1: API Tool with Authentication
 */
export async function apiToolExample(config: any) {
  console.log('=== API Tool with API Key Example ===');

  // Validate API key configuration
  const validation = validateApiKeyConfig(config.apiKeyConfig);
  if (!validation.valid) {
    throw new Error(validation.error);
  }

  console.log('Header Preview:', getHeaderPreview(config.apiKeyConfig));

  // Build headers with authentication
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...buildAuthHeaders(config.apiKeyConfig),
  };

  console.log('Headers (no keys):', Object.keys(headers));

  // Make API call
  const response = await fetch(config.apiUrl, {
    method: config.method || 'GET',
    headers,
    body: config.method === 'POST' ? config.bodyParams : undefined,
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

/**
 * Example 2: Currency Converter with Optional API Key
 */
export async function currencyConverterExample(config: any) {
  console.log('=== Currency Converter with Optional API Key ===');

  const { from, to, amount } = config;

  // Build headers (API key is optional for this service)
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...buildAuthHeaders(config.apiKeyConfig),
  };

  const response = await fetch('/api/currency-converter', {
    method: 'POST',
    headers,
    body: JSON.stringify({ from, to, amount }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Conversion failed');
  }

  const data = await response.json();

  console.log(`✓ ${amount} ${from} = ${data.convertedAmount} ${to}`);
  if (isApiKeyEnabled(config.apiKeyConfig)) {
    console.log('✓ Used API key authentication');
  } else {
    console.log('✓ Public API call (no authentication)');
  }

  return data;
}

/**
 * Example 3: LLM Tool with API Key (Required)
 */
export async function llmToolExample(config: any) {
  console.log('=== LLM Tool with API Key ===');

  // Validate that API key is present
  if (!isApiKeyEnabled(config.apiKeyConfig)) {
    throw new Error('API key is required for LLM operations');
  }

  const { systemPrompt, userPrompt, model, temperature, maxTokens } = config;

  // Build headers with authentication (required)
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...buildAuthHeaders(config.apiKeyConfig),
  };

  // Determine API endpoint based on model
  let apiUrl = 'https://api.openai.com/v1/chat/completions';
  if (model.includes('claude')) {
    apiUrl = 'https://api.anthropic.com/v1/messages';
  } else if (model.includes('mistral')) {
    apiUrl = 'https://api.mistral.ai/v1/chat/completions';
  }

  const messages = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userPrompt },
  ];

  const response = await fetch(apiUrl, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      model,
      messages,
      temperature,
      max_tokens: maxTokens,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error?.message || 'LLM call failed');
  }

  const data = await response.json();
  console.log('✓ LLM response generated successfully');

  return {
    content: data.choices[0].message.content,
    model,
    tokensUsed: data.usage,
  };
}

/**
 * Example 4: Code Tool with API Access
 */
export async function codeToolExample(config: any, context: any) {
  console.log('=== Code Tool with API Key Context ===');

  const { language, code } = config;

  // Pass API key config to code context for potential API calls
  const codeContext = {
    ...context,
    apiKey: config.apiKeyConfig?.apiKey,
    apiHeaders: buildAuthHeaders(config.apiKeyConfig),
    hasAuth: isApiKeyEnabled(config.apiKeyConfig),
  };

  if (language === 'javascript') {
    // Create isolated function with API context
    const asyncFunction = new AsyncFunction(
      'context',
      `
      const { apiKey, apiHeaders, hasAuth, ...vars } = context;
      return (async () => {
        ${code}
      })();
    `
    );

    const result = await asyncFunction(codeContext);
    console.log('✓ Code executed successfully');
    return result;
  }

  throw new Error(`Language ${language} not supported in this example`);
}

/**
 * Example 5: Agent Tool with Sub-agent API Access
 */
export async function agentToolExample(config: any, parentContext: any) {
  console.log('=== Agent Tool with API Key Inheritance ===');

  const { agentName, output, apiKeyConfig } = config;

  // Sub-agent inherits parent's API key if configured
  const subAgentConfig = {
    agentName,
    apiKeyConfig: apiKeyConfig || parentContext.apiKeyConfig,
  };

  // Build execution context
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...buildAuthHeaders(subAgentConfig.apiKeyConfig),
  };

  console.log(`✓ Sub-agent configured: ${agentName}`);
  if (isApiKeyEnabled(subAgentConfig.apiKeyConfig)) {
    console.log('✓ API key inherited from parent or configured');
  }

  // Execute sub-agent with API context
  const response = await executeSubAgent(agentName, subAgentConfig, headers);

  return {
    agentName,
    result: response,
    authenticated: isApiKeyEnabled(apiKeyConfig),
  };
}

/**
 * Example 6: Weather API with Custom Authentication Header
 */
export async function weatherApiExample(config: any) {
  console.log('=== Weather API with Custom Header ===');

  const { city, apiKeyConfig } = config;

  // Validate configuration
  const validation = validateApiKeyConfig(apiKeyConfig);
  if (!validation.valid) {
    throw new Error(validation.error);
  }

  // Build headers
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...buildAuthHeaders(apiKeyConfig),
  };

  console.log('Authentication:', getHeaderPreview(apiKeyConfig));

  // Make API call
  const response = await fetch(
    `https://api.openweathermap.org/weather?q=${encodeURIComponent(city)}`,
    { headers }
  );

  if (!response.ok) {
    throw new Error(`Weather API error: ${response.status}`);
  }

  return response.json();
}

/**
 * Example 7: Handling Multiple API Keys
 */
export function multipleApiKeysExample() {
  console.log('=== Using Multiple API Keys in Workflow ===');

  const workflows = [
    {
      name: 'OpenAI',
      apiKeyConfig: {
        useApiKey: true,
        apiKey: 'sk-proj-...',
        headerType: 'bearer' as const,
      },
      expectedHeader: 'Authorization',
      expectedValue: 'Bearer sk-proj-...',
    },
    {
      name: 'Stripe',
      apiKeyConfig: {
        useApiKey: true,
        apiKey: 'sk_test_...',
        headerType: 'api-key' as const,
      },
      expectedHeader: 'X-API-Key',
      expectedValue: 'sk_test_...',
    },
    {
      name: 'Custom API',
      apiKeyConfig: {
        useApiKey: true,
        apiKey: 'my-token-123',
        headerType: 'custom' as const,
        keyName: 'X-Custom-Auth',
      },
      expectedHeader: 'X-Custom-Auth',
      expectedValue: 'my-token-123',
    },
  ];

  workflows.forEach((workflow) => {
    const headers = buildAuthHeaders(workflow.apiKeyConfig);
    console.log(`\n${workflow.name}:`);
    console.log(`  Expected: ${workflow.expectedHeader}: ${workflow.expectedValue}`);
    console.log(`  Preview: ${getHeaderPreview(workflow.apiKeyConfig)}`);
    console.log(`  Actual Headers:`, headers);
  });
}

/**
 * Example 8: Error Handling with API Keys
 */
export async function errorHandlingExample(config: any) {
  console.log('=== Error Handling with API Keys ===');

  try {
    // Validate config first
    const validation = validateApiKeyConfig(config.apiKeyConfig);
    if (!validation.valid) {
      console.error('❌ Configuration error:', validation.error);
      throw new Error(`Config error: ${validation.error}`);
    }

    // Build headers
    const headers = buildAuthHeaders(config.apiKeyConfig);
    console.log('✓ Headers prepared:', Object.keys(headers));

    // Try API call
    const response = await fetch('https://api.example.com/endpoint', {
      method: 'POST',
      headers,
      body: JSON.stringify(config.data),
    });

    if (!response.ok) {
      // Determine if it's an auth error
      if (response.status === 401 || response.status === 403) {
        console.error('❌ Authentication failed - check API key');
        throw new Error('Invalid API key or insufficient permissions');
      }

      const errorData = await response.json();
      throw new Error(errorData.message || `API error: ${response.status}`);
    }

    console.log('✓ Request successful');
    return response.json();
  } catch (error) {
    console.error('❌ Error:', error instanceof Error ? error.message : error);
    throw error;
  }
}

/**
 * Placeholder function for sub-agent execution
 */
async function executeSubAgent(
  agentName: string,
  config: any,
  headers: Record<string, string>
): Promise<any> {
  // This would be implemented in the actual agent system
  console.log(`Executing sub-agent: ${agentName}`);
  console.log('With headers:', Object.keys(headers));

  return { success: true, data: {} };
}

/**
 * Placeholder AsyncFunction (for code execution)
 */
declare function AsyncFunction(...args: any[]): any;

/**
 * Run all examples (for demonstration)
 */
export async function runAllExamples() {
  console.log('\n🚀 Running API Key Configuration Examples\n');
  console.log('=' .repeat(60));

  try {
    // Example 1
    console.log('\nExample 1: API Tool');
    await apiToolExample({
      apiUrl: 'https://api.example.com/data',
      method: 'GET',
      apiKeyConfig: {
        useApiKey: true,
        apiKey: 'sk-test-key-123',
        headerType: 'bearer',
      },
    });
  } catch (e) {
    console.error('Example 1 error (expected):', e);
  }

  try {
    // Example 2
    console.log('\nExample 2: Currency Converter');
    await currencyConverterExample({
      from: 'USD',
      to: 'EUR',
      amount: 100,
      apiKeyConfig: {
        useApiKey: false,
        apiKey: '',
      },
    });
  } catch (e) {
    console.error('Example 2 error:', e);
  }

  // Example 7 (doesn't require async)
  console.log('\nExample 7: Multiple API Keys');
  multipleApiKeysExample();

  // Example 8
  console.log('\nExample 8: Error Handling');
  try {
    await errorHandlingExample({
      apiKeyConfig: {
        useApiKey: true,
        apiKey: 'invalid-key',
        headerType: 'bearer',
      },
      data: {},
    });
  } catch (e) {
    console.error('Expected error:', e instanceof Error ? e.message : e);
  }

  console.log('\n' + '='.repeat(60));
  console.log('✓ Examples completed');
}

export default {
  apiToolExample,
  currencyConverterExample,
  llmToolExample,
  codeToolExample,
  agentToolExample,
  weatherApiExample,
  multipleApiKeysExample,
  errorHandlingExample,
  runAllExamples,
};
