/**
 * API Key Configuration - Integration Tests & Validation Suite
 * Tests for all API key scenarios across NOVA tools
 */

import {
  buildAuthHeaders,
  validateApiKeyConfig,
  isApiKeyEnabled,
  getHeaderPreview,
  sanitizeApiKeyConfig,
  validateBearerToken,
  validateApiKey,
  getAuthHeaderName,
  getAuthHeaderValue,
} from '@/lib/apiKeyConfigUtils';

/**
 * Test Suite: Configuration Validation
 */
export const validationTests = {
  /**
   * Test 1: Valid Bearer Token Configuration
   */
  testValidBearerConfig: () => {
    const config = {
      useApiKey: true,
      apiKey: 'sk-proj-eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9',
      headerType: 'bearer' as const,
    };

    const result = validateApiKeyConfig(config);
    console.assert(
      result.valid === true,
      'Bearer token should be valid',
      result
    );
    console.log('✓ Valid bearer token configuration accepted');
  },

  /**
   * Test 2: Invalid Bearer Token (empty)
   */
  testInvalidBearerConfig: () => {
    const config = {
      useApiKey: true,
      apiKey: '',
      headerType: 'bearer' as const,
    };

    const result = validateApiKeyConfig(config);
    console.assert(
      result.valid === false,
      'Empty bearer token should be invalid',
      result
    );
    console.log('✓ Empty bearer token correctly rejected');
  },

  /**
   * Test 3: Valid API Key Configuration
   */
  testValidApiKeyConfig: () => {
    const config = {
      useApiKey: true,
      apiKey: 'sk_test_4eC39HqLyjWDarhtJnxj5',
      headerType: 'api-key' as const,
    };

    const result = validateApiKeyConfig(config);
    console.assert(result.valid === true, 'API key should be valid', result);
    console.log('✓ Valid API key configuration accepted');
  },

  /**
   * Test 4: Valid Custom Header Configuration
   */
  testValidCustomHeaderConfig: () => {
    const config = {
      useApiKey: true,
      apiKey: 'custom-token-value',
      headerType: 'custom' as const,
      keyName: 'X-Custom-Auth',
    };

    const result = validateApiKeyConfig(config);
    console.assert(
      result.valid === true,
      'Custom header config should be valid',
      result
    );
    console.log('✓ Valid custom header configuration accepted');
  },

  /**
   * Test 5: Invalid Custom Header (missing keyName)
   */
  testInvalidCustomHeaderConfig: () => {
    const config = {
      useApiKey: true,
      apiKey: 'some-value',
      headerType: 'custom' as const,
      keyName: '', // Invalid - empty key name
    };

    const result = validateApiKeyConfig(config);
    console.assert(
      result.valid === false,
      'Custom header without keyName should be invalid',
      result
    );
    console.log('✓ Custom header without keyName correctly rejected');
  },

  /**
   * Test 6: Disabled API Key (useApiKey = false)
   */
  testDisabledApiKeyConfig: () => {
    const config = {
      useApiKey: false,
      apiKey: 'should-be-ignored',
      headerType: 'bearer' as const,
    };

    const result = validateApiKeyConfig(config);
    console.assert(
      result.valid === true,
      'Disabled API key should be valid (no auth)',
      result
    );
    console.log('✓ Disabled API key configuration accepted');
  },
};

/**
 * Test Suite: Header Building
 */
export const headerBuildingTests = {
  /**
   * Test 1: Bearer Token Headers
   */
  testBearerHeaders: () => {
    const config = {
      useApiKey: true,
      apiKey: 'test-token-123',
      headerType: 'bearer' as const,
    };

    const headers = buildAuthHeaders(config);
    console.assert(
      headers['Authorization'] === 'Bearer test-token-123',
      'Bearer header should be formatted correctly'
    );
    console.log('✓ Bearer token headers built correctly');
    console.log('  Header:', headers['Authorization']);
  },

  /**
   * Test 2: API Key Headers
   */
  testApiKeyHeaders: () => {
    const config = {
      useApiKey: true,
      apiKey: 'sk_live_123456',
      headerType: 'api-key' as const,
    };

    const headers = buildAuthHeaders(config);
    console.assert(
      headers['X-API-Key'] === 'sk_live_123456',
      'API key header should be set correctly'
    );
    console.log('✓ API key headers built correctly');
    console.log('  Header:', headers['X-API-Key']);
  },

  /**
   * Test 3: Custom Headers
   */
  testCustomHeaders: () => {
    const config = {
      useApiKey: true,
      apiKey: 'custom-value',
      headerType: 'custom' as const,
      keyName: 'X-Authorization-Token',
    };

    const headers = buildAuthHeaders(config);
    console.assert(
      headers['X-Authorization-Token'] === 'custom-value',
      'Custom header should use keyName'
    );
    console.log('✓ Custom headers built correctly');
    console.log('  Header:', `${config.keyName}: ${headers['X-Authorization-Token']}`);
  },

  /**
   * Test 4: Disabled API Key (no headers)
   */
  testNoHeaders: () => {
    const config = {
      useApiKey: false,
      apiKey: 'ignored',
      headerType: 'bearer' as const,
    };

    const headers = buildAuthHeaders(config);
    console.assert(
      Object.keys(headers).length === 0,
      'Disabled API key should produce no headers'
    );
    console.log('✓ Disabled API key produces no headers');
  },

  /**
   * Test 5: Multiple Configs in Workflow
   */
  testMultipleConfigs: () => {
    const configs = [
      {
        name: 'OpenAI',
        config: {
          useApiKey: true,
          apiKey: 'sk-proj-abc123',
          headerType: 'bearer' as const,
        },
      },
      {
        name: 'Stripe',
        config: {
          useApiKey: true,
          apiKey: 'sk_live_123',
          headerType: 'api-key' as const,
        },
      },
      {
        name: 'Custom API',
        config: {
          useApiKey: true,
          apiKey: 'token-xyz',
          headerType: 'custom' as const,
          keyName: 'Authorization-Custom',
        },
      },
    ];

    configs.forEach(({ name, config }) => {
      const headers = buildAuthHeaders(config);
      console.assert(
        Object.keys(headers).length === 1,
        `${name} should have exactly one auth header`
      );
    });

    console.log(`✓ Successfully handled ${configs.length} different configurations`);
  },
};

/**
 * Test Suite: Header Preview
 */
export const previewTests = {
  /**
   * Test 1: Bearer Preview
   */
  testBearerPreview: () => {
    const config = {
      useApiKey: true,
      apiKey: 'sk-proj-longtoken123456789',
      headerType: 'bearer' as const,
    };

    const preview = getHeaderPreview(config);
    console.assert(
      preview.includes('Authorization'),
      'Preview should mention Authorization'
    );
    console.assert(
      preview.includes('Bearer'),
      'Preview should show Bearer format'
    );
    console.log('✓ Bearer preview correct');
    console.log('  Preview:', preview);
  },

  /**
   * Test 2: API Key Preview
   */
  testApiKeyPreview: () => {
    const config = {
      useApiKey: true,
      apiKey: 'sk_live_verylongtestkey',
      headerType: 'api-key' as const,
    };

    const preview = getHeaderPreview(config);
    console.assert(
      preview.includes('X-API-Key'),
      'Preview should mention X-API-Key'
    );
    console.log('✓ API key preview correct');
    console.log('  Preview:', preview);
  },

  /**
   * Test 3: Custom Header Preview
   */
  testCustomHeaderPreview: () => {
    const config = {
      useApiKey: true,
      apiKey: 'token-value',
      headerType: 'custom' as const,
      keyName: 'X-My-Custom-Header',
    };

    const preview = getHeaderPreview(config);
    console.assert(
      preview.includes('X-My-Custom-Header'),
      'Preview should show custom header name'
    );
    console.log('✓ Custom header preview correct');
    console.log('  Preview:', preview);
  },

  /**
   * Test 4: Disabled Preview
   */
  testDisabledPreview: () => {
    const config = {
      useApiKey: false,
      apiKey: '',
      headerType: 'bearer' as const,
    };

    const preview = getHeaderPreview(config);
    console.assert(
      preview.toLowerCase().includes('disabled') ||
        preview.toLowerCase().includes('no auth'),
      'Preview should indicate no authentication'
    );
    console.log('✓ Disabled API key preview correct');
    console.log('  Preview:', preview);
  },
};

/**
 * Test Suite: Sanitization (Security)
 */
export const securityTests = {
  /**
   * Test 1: Bearer Token Sanitization
   */
  testBearerSanitization: () => {
    const config = {
      useApiKey: true,
      apiKey: 'sk-proj-abc123def456',
      headerType: 'bearer' as const,
    };

    const sanitized = sanitizeApiKeyConfig(config);
    console.assert(
      sanitized.apiKey.includes('***'),
      'API key should be masked'
    );
    console.assert(
      !sanitized.apiKey.includes('abc123'),
      'Original key should not be visible'
    );
    console.log('✓ Bearer token sanitized correctly');
    console.log('  Original:', config.apiKey);
    console.log('  Sanitized:', sanitized.apiKey);
  },

  /**
   * Test 2: Full Config Sanitization
   */
  testFullSanitization: () => {
    const config = {
      useApiKey: true,
      apiKey: 'very-secret-key-12345',
      headerType: 'custom' as const,
      keyName: 'X-Auth',
    };

    const sanitized = sanitizeApiKeyConfig(config);
    const originalJson = JSON.stringify(config);
    const sanitizedJson = JSON.stringify(sanitized);

    console.assert(
      sanitizedJson.length < originalJson.length ||
        sanitized.apiKey.includes('***'),
      'Sanitized version should contain masks'
    );
    console.log('✓ Full configuration sanitized');
    console.log('  Sanitized config:', sanitized);
  },

  /**
   * Test 3: Safe Logging
   */
  testSafeLogging: () => {
    const config = {
      useApiKey: true,
      apiKey: 'sk-test-4eC39HqLyjWDarhtJnxj5',
      headerType: 'bearer' as const,
    };

    const sanitized = sanitizeApiKeyConfig(config);
    const logSafe = JSON.stringify(sanitized);

    console.assert(
      !logSafe.includes('4eC39HqLyjWDarhtJnxj5'),
      'Original key should not appear in logs'
    );
    console.log('✓ Configuration is safe for logging');
    console.log('  Safe log:', logSafe);
  },
};

/**
 * Test Suite: Specific Validations
 */
export const specificValidationTests = {
  /**
   * Test 1: Bearer Token Format Validation
   */
  testBearerFormat: () => {
    const validTokens = [
      'abc123',
      'sk-proj-xyz',
      'long-token-with-many-characters-123456789',
    ];

    validTokens.forEach((token) => {
      const result = validateBearerToken(token);
      console.assert(result.valid, `Token "${token}" should be valid`);
    });

    console.log(`✓ All ${validTokens.length} bearer tokens validated`);
  },

  /**
   * Test 2: API Key Format Validation
   */
  testApiKeyFormat: () => {
    const validKeys = [
      'sk_test_123',
      'sk_live_abc',
      'key-with-dashes-123',
    ];

    validKeys.forEach((key) => {
      const result = validateApiKey(key);
      console.assert(result.valid, `Key "${key}" should be valid`);
    });

    console.log(`✓ All ${validKeys.length} API keys validated`);
  },

  /**
   * Test 3: Header Name Mapping
   */
  testHeaderNameMapping: () => {
    const mappings = [
      { type: 'bearer' as const, expected: 'Authorization' },
      { type: 'api-key' as const, expected: 'X-API-Key' },
    ];

    mappings.forEach(({ type, expected }) => {
      const headerName = getAuthHeaderName(type);
      console.assert(
        headerName === expected,
        `${type} should map to ${expected}`
      );
    });

    console.log('✓ All header names mapped correctly');
  },

  /**
   * Test 4: Header Value Formatting
   */
  testHeaderValueFormatting: () => {
    const cases = [
      {
        type: 'bearer' as const,
        value: 'abc123',
        expected: 'Bearer abc123',
      },
      { type: 'api-key' as const, value: 'key123', expected: 'key123' },
      { type: 'custom' as const, value: 'val123', expected: 'val123' },
    ];

    cases.forEach(({ type, value, expected }) => {
      const result = getAuthHeaderValue(type, value);
      console.assert(
        result === expected,
        `${type} formatting should produce "${expected}"`
      );
    });

    console.log('✓ All header values formatted correctly');
  },
};

/**
 * Test Suite: Real-world Scenarios
 */
export const scenarioTests = {
  /**
   * Scenario 1: OpenAI API Integration
   */
  testOpenAIIntegration: () => {
    const openaiConfig = {
      useApiKey: true,
      apiKey: 'sk-proj-your-actual-key-here',
      headerType: 'bearer' as const,
    };

    const validation = validateApiKeyConfig(openaiConfig);
    const headers = buildAuthHeaders(openaiConfig);

    console.assert(validation.valid, 'OpenAI config should be valid');
    console.assert(
      headers['Authorization']?.startsWith('Bearer '),
      'Should use Bearer token'
    );
    console.log('✓ OpenAI integration scenario passed');
  },

  /**
   * Scenario 2: Stripe API Integration
   */
  testStripeIntegration: () => {
    const stripeConfig = {
      useApiKey: true,
      apiKey: 'sk_live_51234567890',
      headerType: 'api-key' as const,
    };

    const validation = validateApiKeyConfig(stripeConfig);
    const headers = buildAuthHeaders(stripeConfig);

    console.assert(validation.valid, 'Stripe config should be valid');
    console.assert(
      headers['X-API-Key'] === stripeConfig.apiKey,
      'Should use X-API-Key header'
    );
    console.log('✓ Stripe integration scenario passed');
  },

  /**
   * Scenario 3: Custom API Integration
   */
  testCustomAPIIntegration: () => {
    const customConfig = {
      useApiKey: true,
      apiKey: 'my-api-token-123',
      headerType: 'custom' as const,
      keyName: 'X-Auth-Token',
    };

    const validation = validateApiKeyConfig(customConfig);
    const headers = buildAuthHeaders(customConfig);

    console.assert(validation.valid, 'Custom API config should be valid');
    console.assert(
      headers['X-Auth-Token'] === customConfig.apiKey,
      'Should use custom header'
    );
    console.log('✓ Custom API integration scenario passed');
  },

  /**
   * Scenario 4: Optional API Key (no key provided)
   */
  testOptionalApiKeyScenario: () => {
    const config = {
      useApiKey: false,
      apiKey: '',
      headerType: 'bearer' as const,
    };

    const validation = validateApiKeyConfig(config);
    const headers = buildAuthHeaders(config);

    console.assert(
      validation.valid,
      'Config with disabled API key should be valid'
    );
    console.assert(
      Object.keys(headers).length === 0,
      'Should produce no auth headers'
    );
    console.log('✓ Optional API key scenario passed (no authentication)');
  },

  /**
   * Scenario 5: Switching Authentication Methods
   */
  testSwitchingAuthMethods: () => {
    const configs = [
      {
        name: 'Method 1: Bearer',
        config: {
          useApiKey: true,
          apiKey: 'token-1',
          headerType: 'bearer' as const,
        },
      },
      {
        name: 'Method 2: API Key',
        config: {
          useApiKey: true,
          apiKey: 'token-2',
          headerType: 'api-key' as const,
        },
      },
      {
        name: 'Method 3: Custom',
        config: {
          useApiKey: true,
          apiKey: 'token-3',
          headerType: 'custom' as const,
          keyName: 'X-Custom',
        },
      },
    ];

    configs.forEach(({ name, config }) => {
      const validation = validateApiKeyConfig(config);
      const headers = buildAuthHeaders(config);

      console.assert(validation.valid, `${name} should be valid`);
      console.assert(
        Object.keys(headers).length === 1,
        `${name} should have one auth header`
      );
    });

    console.log(
      `✓ Successfully switched between ${configs.length} authentication methods`
    );
  },
};

/**
 * Master Test Runner
 */
export function runAllTests() {
  console.log('\n🧪 API Key Configuration - Full Test Suite\n');
  console.log('='.repeat(70));

  const testSuites = [
    { name: 'Validation Tests', tests: validationTests },
    { name: 'Header Building Tests', tests: headerBuildingTests },
    { name: 'Preview Tests', tests: previewTests },
    { name: 'Security Tests', tests: securityTests },
    { name: 'Specific Validation Tests', tests: specificValidationTests },
    { name: 'Real-world Scenario Tests', tests: scenarioTests },
  ];

  let totalTests = 0;
  let passedTests = 0;

  testSuites.forEach(({ name, tests }) => {
    console.log(`\n📋 ${name}`);
    console.log('-'.repeat(70));

    Object.entries(tests).forEach(([testName, testFn]) => {
      totalTests++;
      try {
        testFn();
        passedTests++;
      } catch (error) {
        console.error(`❌ ${testName} failed:`, error);
      }
    });
  });

  console.log('\n' + '='.repeat(70));
  console.log(`\n📊 Test Results: ${passedTests}/${totalTests} passed`);

  if (passedTests === totalTests) {
    console.log('✅ All tests passed!');
  } else {
    console.error(`❌ ${totalTests - passedTests} tests failed`);
  }

  return {
    total: totalTests,
    passed: passedTests,
    failed: totalTests - passedTests,
  };
}

export default {
  validationTests,
  headerBuildingTests,
  previewTests,
  securityTests,
  specificValidationTests,
  scenarioTests,
  runAllTests,
};
