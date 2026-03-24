// @ts-nocheck
/**
 * API Key Configuration - Quick Reference Guide
 * Copy-paste solutions for common use cases
 */

/**
 * ============================================
 * QUICK START: 5-Minute Implementation Guide
 * ============================================
 */

// 1. Import the component
import { ToolApiKeyInput } from '@/components/toolsettings/ToolApiKeyInput';

// 2. Add to your tool settings component
export function MyToolSettings({ config, onSave }: Props) {
  const [apiKeyConfig, setApiKeyConfig] = useState(config.apiKeyConfig || {
    useApiKey: false,
    apiKey: '',
    headerType: 'bearer' as const,
  });

  return (
    <div>
      {/* Other fields... */}
      
      {/* Add the API key input */}
      <ToolApiKeyInput
        value={apiKeyConfig}
        onChange={setApiKeyConfig}
        showLabel={true}
        tooltip="Optional: Add your API key for enhanced features"
      />

      <button onClick={() => onSave({ ...config, apiKeyConfig })}>
        Save
      </button>
    </div>
  );
}

// 3. Use in your API call
import { buildAuthHeaders } from '@/lib/apiKeyConfigUtils';

const headers = {
  'Content-Type': 'application/json',
  ...buildAuthHeaders(apiKeyConfig),
};

/**
 * ============================================
 * COMMON PATTERNS
 * ============================================
 */

// PATTERN 1: Simple API Call with Optional Authentication
async function makeApiCall(url: string, apiKeyConfig: ApiKeyConfig) {
  const headers = {
    'Content-Type': 'application/json',
    ...buildAuthHeaders(apiKeyConfig),
  };

  const response = await fetch(url, { headers });
  return response.json();
}

// PATTERN 2: Form Submission with Validation
function handleSave(config: ToolConfig) {
  const validation = validateApiKeyConfig(config.apiKeyConfig);
  
  if (!validation.valid) {
    alert(`API Key Error: ${validation.error}`);
    return;
  }

  // Save configuration
  saveConfig(config);
  alert('Configuration saved successfully!');
}

// PATTERN 3: Show Authentication Status
function showAuthStatus(apiKeyConfig: ApiKeyConfig) {
  if (!isApiKeyEnabled(apiKeyConfig)) {
    return <p className="text-gray-500">No authentication configured</p>;
  }

  return (
    <p className="text-green-600">
      ✓ Authenticated ({getHeaderPreview(apiKeyConfig)})
    </p>
  );
}

// PATTERN 4: Different APIs with Different Auth Methods
const apiConfigs = {
  openai: {
    headerType: 'bearer' as const,
    example: 'sk-proj-ABC123...',
  },
  stripe: {
    headerType: 'api-key' as const,
    example: 'sk_live_ABC123...',
  },
  custom: {
    headerType: 'custom' as const,
    keyName: 'X-Custom-Auth',
    example: 'my-custom-token',
  },
};

// PATTERN 5: Handle API Errors
async function apiCallWithErrorHandling(config: any) {
  try {
    const headers = buildAuthHeaders(config.apiKeyConfig);
    const response = await fetch(config.url, { headers });

    if (response.status === 401 || response.status === 403) {
      throw new Error('Invalid API key - check your credentials');
    }

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    return response.json();
  } catch (error) {
    console.error('API call failed:', error);
    throw error;
  }
}

/**
 * ============================================
 * COMPONENT SNIPPETS
 * ============================================
 */

// SNIPPET 1: Minimal Tool Settings
export function MinimalToolSettings({ config, onSave }: Props) {
  const [name, setName] = useState(config.name);
  const [apiKeyConfig, setApiKeyConfig] = useState(config.apiKeyConfig);

  return (
    <div className="space-y-4">
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Tool name"
      />

      <ToolApiKeyInput value={apiKeyConfig} onChange={setApiKeyConfig} />

      <button onClick={() => onSave({ name, apiKeyConfig })}>
        Save Configuration
      </button>
    </div>
  );
}

// SNIPPET 2: Tool with Form Validation
export function ValidatedToolSettings({ config, onSave }: Props) {
  const [formData, setFormData] = useState(config);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSave = () => {
    const newErrors: Record<string, string> = {};

    // Validate API key if enabled
    if (formData.apiKeyConfig?.useApiKey) {
      const validation = validateApiKeyConfig(formData.apiKeyConfig);
      if (!validation.valid) {
        newErrors.apiKey = validation.error || 'Invalid API key configuration';
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSave(formData);
  };

  return (
    <div className="space-y-4">
      <ToolApiKeyInput
        value={formData.apiKeyConfig}
        onChange={(apiKeyConfig) =>
          setFormData({ ...formData, apiKeyConfig })
        }
      />

      {errors.apiKey && (
        <div className="text-red-600">{errors.apiKey}</div>
      )}

      <button onClick={handleSave}>Save</button>
    </div>
  );
}

// SNIPPET 3: Tool with Multiple Configuration Options
export function AdvancedToolSettings({ config, onSave }: Props) {
  const [settings, setSettings] = useState(config);

  return (
    <div className="space-y-6">
      {/* Basic settings */}
      <div>
        <label>Tool Name</label>
        <input
          value={settings.name}
          onChange={(e) =>
            setSettings({ ...settings, name: e.target.value })
          }
        />
      </div>

      {/* URL settings */}
      <div>
        <label>API URL</label>
        <input
          value={settings.url}
          onChange={(e) =>
            setSettings({ ...settings, url: e.target.value })
          }
          placeholder="https://api.example.com/endpoint"
        />
      </div>

      {/* API Key settings */}
      <ToolApiKeyInput
        value={settings.apiKeyConfig}
        onChange={(apiKeyConfig) =>
          setSettings({ ...settings, apiKeyConfig })
        }
        showLabel={true}
      />

      {/* Status display */}
      {isApiKeyEnabled(settings.apiKeyConfig) && (
        <div className="bg-blue-50 border border-blue-200 rounded p-3">
          <p className="text-sm text-blue-900">
            ✓ Authenticated with: {getHeaderPreview(settings.apiKeyConfig)}
          </p>
        </div>
      )}

      <button onClick={() => onSave(settings)}>
        Save Configuration
      </button>
    </div>
  );
}

/**
 * ============================================
 * BACKEND/API HANDLER PATTERNS
 * ============================================
 */

// PATTERN 1: Next.js API Route with Auth
// app/api/my-tool/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { apiKeyConfig, url, data } = body;

  // Build headers with authentication
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...buildAuthHeaders(apiKeyConfig),
  };

  // Make external API call
  const response = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify(data),
  });

  const result = await response.json();
  return NextResponse.json(result);
}

// PATTERN 2: Server Component Using API Keys
// app/components/ServerToolComponent.tsx
export async function ServerToolComponent({ toolConfig }: Props) {
  const { apiKeyConfig, url } = toolConfig;

  const headers = buildAuthHeaders(apiKeyConfig);
  const response = await fetch(url, { headers });
  const data = await response.json();

  return <div>{/* Render data */}</div>;
}

/**
 * ============================================
 * TESTING PATTERNS
 * ============================================
 */

// TEST 1: Unit test for component
import { render, screen, fireEvent } from '@testing-library/react';

describe('ToolApiKeyInput', () => {
  it('should show password input when enabled', () => {
    const config = {
      useApiKey: true,
      apiKey: 'test-key',
      headerType: 'bearer' as const,
    };

    const { getByType } = render(
      <ToolApiKeyInput value={config} onChange={() => {}} />
    );

    const input = getByType('password');
    expect(input).toBeInTheDocument();
  });

  it('should hide when disabled', () => {
    const config = {
      useApiKey: false,
      apiKey: '',
      headerType: 'bearer' as const,
    };

    const { queryByType } = render(
      <ToolApiKeyInput value={config} onChange={() => {}} />
    );

    expect(queryByType('password')).not.toBeInTheDocument();
  });
});

// TEST 2: Integration test
import { buildAuthHeaders, validateApiKeyConfig } from '@/lib/apiKeyConfigUtils';

describe('API Key Integration', () => {
  it('should build correct headers', () => {
    const config = {
      useApiKey: true,
      apiKey: 'sk-123',
      headerType: 'bearer' as const,
    };

    const headers = buildAuthHeaders(config);
    expect(headers['Authorization']).toBe('Bearer sk-123');
  });

  it('should validate configuration', () => {
    const config = {
      useApiKey: true,
      apiKey: '',
      headerType: 'bearer' as const,
    };

    const result = validateApiKeyConfig(config);
    expect(result.valid).toBe(false);
  });
});

/**
 * ============================================
 * TROUBLESHOOTING
 * ============================================
 */

// ISSUE 1: API key not being sent
// Solution: Verify buildAuthHeaders is called
const headers = buildAuthHeaders(apiKeyConfig);
console.log('Auth headers:', headers); // Check this in console

// ISSUE 2: Header names are wrong
// Solution: Use getAuthHeaderName utility
const headerName = getAuthHeaderName(apiKeyConfig.headerType);
console.log('Expected header:', headerName);

// ISSUE 3: Custom header not working
// Solution: Ensure keyName is set for custom type
if (apiKeyConfig.headerType === 'custom') {
  console.assert(apiKeyConfig.keyName, 'Custom header requires keyName');
}

// ISSUE 4: Validation failing
// Solution: Check validation error message
const validation = validateApiKeyConfig(config);
if (!validation.valid) {
  console.error('Validation error:', validation.error);
}

/**
 * ============================================
 * FILE ORGANIZATION
 * ============================================
 */

// Place files in this structure:
/*
src/
  components/
    toolsettings/
      ToolApiKeyInput.tsx      ← Reusable component
      APIToolSettings.tsx       ← Different tool settings
      CurrencyConverterToolSettings.tsx
      LLMToolSettings.tsx
      CodeToolSettings.tsx
      AgentToolSettings.tsx
  lib/
    apiKeyConfigUtils.ts       ← Utility functions
    apiKeyConfigExamples.ts    ← Usage examples
    apiKeyConfigTests.ts       ← Tests
  types/
    api-key-config.ts          ← Type definitions
*/

/**
 * ============================================
 * TYPE DEFINITIONS
 * ============================================
 */

// Use these TypeScript types
interface ApiKeyConfig {
  useApiKey: boolean;
  apiKey: string;
  headerType: 'bearer' | 'api-key' | 'custom';
  keyName?: string; // Required when headerType === 'custom'
}

interface ValidationResult {
  valid: boolean;
  error?: string;
}

interface ToolApiKeyInputProps {
  value: ApiKeyConfig;
  onChange: (config: ApiKeyConfig) => void;
  showLabel?: boolean;
  tooltip?: string;
}

/**
 * ============================================
 * IMPORTS CHECKLIST
 * ============================================
 */

// When setting up a new tool, use these imports:
import { ToolApiKeyInput } from '@/components/toolsettings/ToolApiKeyInput';
import {
  buildAuthHeaders,
  validateApiKeyConfig,
  isApiKeyEnabled,
  getHeaderPreview,
} from '@/lib/apiKeyConfigUtils';

// That's all you need!

/**
 * ============================================
 * MIGRATION FROM OLD CODE
 * ============================================
 */

// OLD CODE (don't use):
// const [includeApiKey, setIncludeApiKey] = useState(false);
// const [apiKey, setApiKey] = useState('');

// NEW CODE (use instead):
// const [apiKeyConfig, setApiKeyConfig] = useState({
//   useApiKey: false,
//   apiKey: '',
//   headerType: 'bearer' as const,
// });

// Reason: Consolidated config object, supports multiple auth types

export default {
  // Reference only, no exports needed
};
