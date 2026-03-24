/**
 * API Key Configuration - Deployment & Integration Checklist
 * Complete guide for implementing API key support in NOVA
 */

/**
 * ============================================
 * DEPLOYMENT CHECKLIST
 * ============================================
 *
 * Pre-Implementation: ☐ All items
 * - ☐ Backup current code
 * - ☐ Review all changes with team
 * - ☐ Plan rollout strategy
 * - ☐ Set up monitoring
 * - ☐ Create rollback plan
 *
 * Phase 1: Component Setup (30 mins)
 * - ☐ Copy ToolApiKeyInput.tsx to /components/toolsettings/
 * - ☐ Copy apiKeyConfigUtils.ts to /lib/
 * - ☐ Copy types to appropriate location
 * - ☐ Update package.json if needed (should not need updates)
 * - ☐ Run: npm install (if dependencies changed)
 * - ☐ Verify no TypeScript errors: npx tsc --noEmit
 *
 * Phase 2: Tool Integration (1-2 hours)
 * - ☐ Update APIToolSettings.tsx
 *   - ☐ Import ToolApiKeyInput
 *   - ☐ Add apiKeyConfig state
 *   - ☐ Replace old auth section with ToolApiKeyInput
 *   - ☐ Update save handler
 *   - ☐ Test in agent builder
 *
 * - ☐ Create CurrencyConverterToolSettings.tsx
 *   - ☐ Copy template
 *   - ☐ Customize for currency converter
 *   - ☐ Add to tool palette
 *   - ☐ Test with/without API key
 *
 * - ☐ Create LLMToolSettings.tsx
 *   - ☐ Copy template
 *   - ☐ Add model selection
 *   - ☐ Add prompt fields
 *   - ☐ Integrate ToolApiKeyInput
 *   - ☐ Test with mock API
 *
 * - ☐ Create CodeToolSettings.tsx
 *   - ☐ Copy template
 *   - ☐ Add language selection
 *   - ☐ Add code editor
 *   - ☐ Integrate ToolApiKeyInput
 *   - ☐ Safety warnings
 *
 * - ☐ Update AgentToolSettings.tsx
 *   - ☐ Import ToolApiKeyInput
 *   - ☐ Add apiKeyConfig state
 *   - ☐ Integrate component
 *   - ☐ Test sub-agent calls
 *
 * - ☐ Update other tool settings (UserApprovalTool, etc)
 *   - ☐ Add ToolApiKeyInput if tool uses external APIs
 *   - ☐ Update handlers
 *   - ☐ Test configuration save/load
 *
 * Phase 3: Backend Integration (1-2 hours)
 * - ☐ Update /api/currency-converter/route.ts
 *   - ☐ Read apiKeyConfig from request
 *   - ☐ Use buildAuthHeaders in fetch calls
 *   - ☐ Handle errors gracefully
 *   - ☐ Test with real API key
 *
 * - ☐ Update other API routes
 *   - ☐ /api/openai/* routes
 *   - ☐ /api/custom-api/* routes
 *   - ☐ Any other tool routes
 *   - ☐ Include apiKeyConfig in request handling
 *
 * - ☐ Update tool execution logic
 *   - ☐ Pass apiKeyConfig through execution
 *   - ☐ Use buildAuthHeaders for external calls
 *   - ☐ Log (safely) authentication attempts
 *   - ☐ Handle auth errors (401, 403)
 *
 * Phase 4: Testing (1-2 hours)
 * - ☐ Unit tests
 *   - ☐ ToolApiKeyInput component
 *   - ☐ Validation functions
 *   - ☐ Header building
 *
 * - ☐ Integration tests
 *   - ☐ Tool settings save/load
 *   - ☐ API calls with auth
 *   - ☐ Error handling
 *
 * - ☐ Manual testing in agent builder
 *   - ☐ Add tool to canvas
 *   - ☐ Configure without API key
 *   - ☐ Configure with Bearer token
 *   - ☐ Configure with API key
 *   - ☐ Configure with custom header
 *   - ☐ Execute workflow
 *   - ☐ Verify API calls succeed
 *
 * - ☐ Test scenarios
 *   - ☐ No API key (public APIs)
 *   - ☐ Bearer token (OpenAI)
 *   - ☐ API key (Stripe)
 *   - ☐ Custom header (custom APIs)
 *   - ☐ Invalid key (should fail)
 *   - ☐ Key rotation
 *
 * Phase 5: Security Review (30 mins)
 * - ☐ Keys never logged in plaintext
 *   - ☐ Use sanitizeApiKeyConfig for logging
 *   - ☐ Check console/error messages
 *
 * - ☐ Keys only sent over HTTPS
 *   - ☐ Verify production deployment uses HTTPS
 *
 * - ☐ Keys stored securely
 *   - ☐ Consider encryption for stored configs
 *   - ☐ Access control on settings pages
 *
 * - ☐ Error messages don't reveal keys
 *   - ☐ Catch and handle auth errors safely
 *   - ☐ Show user-friendly error messages
 *
 * Phase 6: Documentation (30 mins)
 * - ☐ Update user documentation
 *   - ☐ How to add API key
 *   - ☐ Which APIs need keys
 *   - ☐ Where to get keys
 *
 * - ☐ Update developer documentation
 *   - ☐ Architecture overview
 *   - ☐ Implementation patterns
 *   - ☐ Type definitions
 *
 * - ☐ Create migration guide if needed
 *   - ☐ How to update existing workflows
 *   - ☐ Backward compatibility notes
 *
 * Phase 7: Deployment (30 mins)
 * - ☐ Create feature branch
 * - ☐ Create pull request
 * - ☐ Code review approval
 * - ☐ All tests passing
 * - ☐ Merge to develop
 * - ☐ Deploy to staging
 * - ☐ Smoke test on staging
 * - ☐ Deploy to production
 * - ☐ Monitor for errors
 *
 * Post-Deployment (1 hour)
 * - ☐ Monitor logs for errors
 * - ☐ Check user reports
 * - ☐ Verify API calls working
 * - ☐ Document any issues
 * - ☐ Release notes
 * - ☐ Announce to users
 *
 */

/**
 * ============================================
 * FILES CREATED/MODIFIED
 * ============================================
 */

const deploymentFiles = {
  created: [
    {
      path: 'components/toolsettings/ToolApiKeyInput.tsx',
      description: 'Reusable API key input component',
      size: '~180 lines',
      dependency: 'None',
    },
    {
      path: 'components/toolsettings/CurrencyConverterToolSettings.tsx',
      description: 'Currency converter tool configuration',
      size: '~280 lines',
      dependency: 'ToolApiKeyInput',
    },
    {
      path: 'components/toolsettings/LLMToolSettings.tsx',
      description: 'LLM tool configuration',
      size: '~260 lines',
      dependency: 'ToolApiKeyInput',
    },
    {
      path: 'components/toolsettings/CodeToolSettings.tsx',
      description: 'Code tool configuration',
      size: '~310 lines',
      dependency: 'ToolApiKeyInput',
    },
    {
      path: 'lib/apiKeyConfigUtils.ts',
      description: '20+ utility functions for API key handling',
      size: '~450 lines',
      dependency: 'None',
    },
    {
      path: 'lib/apiKeyConfigExamples.ts',
      description: 'Real-world implementation examples',
      size: '~400 lines',
      dependency: 'apiKeyConfigUtils',
    },
    {
      path: 'lib/apiKeyConfigTests.ts',
      description: 'Comprehensive test suite',
      size: '~800 lines',
      dependency: 'apiKeyConfigUtils',
    },
    {
      path: 'lib/API_KEY_QUICK_REFERENCE.ts',
      description: 'Copy-paste reference guide',
      size: '~300 lines',
      dependency: 'None',
    },
    {
      path: 'API_KEY_INTEGRATION_GUIDE.md',
      description: 'Complete integration documentation',
      size: '~900 lines',
      dependency: 'None',
    },
  ],

  modified: [
    {
      path: 'components/toolsettings/APIToolSettings.tsx',
      change: 'Replaced Switch with ToolApiKeyInput, updated handlers',
      backupRecommended: true,
    },
    {
      path: 'components/toolsettings/AgentToolSettings.tsx',
      change: 'Added ToolApiKeyInput, refactored state management',
      backupRecommended: true,
    },
    {
      path: 'app/api/currency-converter/route.ts',
      change: 'Added apiKeyConfig parameter handling',
      backupRecommended: true,
    },
  ],

  typeDefinitions: [
    {
      name: 'ApiKeyConfig',
      location: 'lib/types or inline in components',
      fields: [
        'useApiKey: boolean',
        'apiKey: string',
        'headerType: "bearer" | "api-key" | "custom"',
        'keyName?: string',
      ],
    },
    {
      name: 'ValidationResult',
      location: 'lib/types or inline',
      fields: ['valid: boolean', 'error?: string'],
    },
  ],
};

/**
 * ============================================
 * DEPLOYMENT STEPS
 * ============================================
 */

// STEP 1: Pre-flight checks
const preflight = {
  checks: [
    '✓ Backup current code',
    '✓ Review all code changes',
    '✓ Check git status is clean',
    '✓ Run npm install (if needed)',
    '✓ Verify TypeScript: npx tsc --noEmit',
    '✓ Run existing tests: npm test',
  ],

  command: `
# 1. Backup
git stash
git checkout -b feature/api-key-support

# 2. Copy new files
cp lib/apiKeyConfigUtils.ts components/toolsettings/ToolApiKeyInput.tsx ...

# 3. Type check
npx tsc --noEmit

# 4. Run tests
npm test
  `,
};

// STEP 2: Phase-by-phase integration
const integrationPhases = {
  phase1: {
    title: 'Component Setup',
    duration: '30 minutes',
    tasks: [
      'Copy ToolApiKeyInput.tsx',
      'Copy utility functions',
      'Verify TypeScript compilation',
    ],
  },

  phase2: {
    title: 'Tool Integration',
    duration: '1-2 hours',
    tasks: [
      'Update APIToolSettings.tsx',
      'Create CurrencyConverterToolSettings.tsx',
      'Create LLMToolSettings.tsx',
      'Create CodeToolSettings.tsx',
      'Update AgentToolSettings.tsx',
      'Test each tool configuration',
    ],
  },

  phase3: {
    title: 'Backend Integration',
    duration: '1-2 hours',
    tasks: [
      'Update API routes to read apiKeyConfig',
      'Use buildAuthHeaders in fetch calls',
      'Handle authentication errors',
      'Test with real API keys',
    ],
  },

  phase4: {
    title: 'Testing',
    duration: '1-2 hours',
    tasks: [
      'Unit tests for utilities',
      'Component tests',
      'Integration tests',
      'Manual testing in agent builder',
      'Test all authentication methods',
    ],
  },

  phase5: {
    title: 'Security Review',
    duration: '30 minutes',
    tasks: [
      'Verify keys not logged in plaintext',
      'Check HTTPS in production',
      'Review error messages',
      'Verify secure storage',
    ],
  },

  phase6: {
    title: 'Documentation',
    duration: '30 minutes',
    tasks: [
      'Update user docs',
      'Update developer docs',
      'Create migration guide',
      'Write release notes',
    ],
  },
};

// STEP 3: Testing strategy
const testingStrategy = {
  unitTests: {
    focus: [
      'buildAuthHeaders() with all header types',
      'validateApiKeyConfig() with valid/invalid inputs',
      'getHeaderPreview() output format',
      'sanitizeApiKeyConfig() masks keys properly',
    ],
    command: 'npm test -- apiKeyConfig',
  },

  integrationTests: {
    focus: [
      'Tool settings save/load cycle',
      'API calls with authentication headers',
      'Error handling for invalid keys',
      'Header type switching',
    ],
    command: 'npm test -- integration',
  },

  manualTests: {
    scenarios: [
      {
        name: 'No API key',
        steps: [
          'Add tool to canvas',
          'Leave API key disabled',
          'Execute workflow',
          'Verify public API call works',
        ],
      },
      {
        name: 'Bearer Token',
        steps: [
          'Add tool to canvas',
          'Enable API key',
          'Select Bearer type',
          'Enter API key',
          'Execute workflow',
          'Verify authenticated call succeeds',
        ],
      },
      {
        name: 'API Key Header',
        steps: [
          'Add tool to canvas',
          'Enable API key',
          'Select API-Key type',
          'Enter API key',
          'Verify X-API-Key header sent',
        ],
      },
      {
        name: 'Custom Header',
        steps: [
          'Add tool to canvas',
          'Enable API key',
          'Select Custom type',
          'Enter custom header name',
          'Enter API key value',
          'Verify custom header sent',
        ],
      },
      {
        name: 'Invalid Key',
        steps: [
          'Add tool to canvas',
          'Enable API key',
          'Enter invalid key',
          'Try to execute',
          'Verify error handling',
        ],
      },
    ],
  },
};

// STEP 4: Rollback plan
const rollbackPlan = {
  automatic: [
    'Monitor error rate',
    'Setup alerts for 401/403 errors',
    'Track performance metrics',
  ],

  manual: [
    'If errors > threshold:',
    '  1. Check error logs for patterns',
    '  2. Determine if rollback needed',
    '  3. git revert <commit>',
    '  4. Deploy previous version',
    '  5. Notify users',
  ],

  recovery: [
    'Create hotfix branch',
    'Fix identified issue',
    'Redeploy after testing',
  ],
};

/**
 * ============================================
 * CONFIGURATION EXAMPLES
 * ============================================
 */

// Example: How API keys are stored in tool config
const exampleToolConfig = {
  name: 'My API Tool',
  type: 'api',
  url: 'https://api.example.com/endpoint',

  // NEW: API Key Configuration
  apiKeyConfig: {
    useApiKey: true,
    apiKey: '*** MASKED ***', // Never store plaintext
    headerType: 'bearer',
  },

  // Other tool-specific config
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
};

// Example: How to handle in backend
const backendExample = `
// app/api/execute-tool/route.ts
export async function POST(request: NextRequest) {
  const { toolConfig } = await request.json();
  
  // Read API key config from tool
  const { apiKeyConfig, url } = toolConfig;
  
  // Build headers with authentication
  import { buildAuthHeaders } from '@/lib/apiKeyConfigUtils';
  const headers = {
    'Content-Type': 'application/json',
    ...buildAuthHeaders(apiKeyConfig),
  };
  
  // Make API call
  const response = await fetch(url, { headers });
  const data = await response.json();
  
  return NextResponse.json(data);
}
`;

/**
 * ============================================
 * MONITORING & ALERTS
 * ============================================
 */

const monitoring = {
  metrics: [
    'API calls with authentication headers',
    'API calls without authentication',
    'Failed authentication attempts (401/403)',
    'Invalid API key configurations',
    'Tool configuration save rate',
  ],

  alerts: [
    {
      condition: 'Error rate > 5%',
      action: 'Check logs for auth failures',
      severity: 'High',
    },
    {
      condition: '401/403 errors spike',
      action: 'Alert users about API key issues',
      severity: 'High',
    },
    {
      condition: 'Config validation failures > 10/hour',
      action: 'Review validation logic',
      severity: 'Medium',
    },
  ],

  logging: [
    'Log (sanitized) API key usage',
    'Log validation failures',
    'Log authentication attempts',
    'Never log actual API keys',
    'Use sanitizeApiKeyConfig for logging',
  ],
};

/**
 * ============================================
 * SUCCESS CRITERIA
 * ============================================
 */

const successCriteria = {
  functional: [
    '✓ Tools accept optional API key',
    '✓ All 3 header types work (bearer, api-key, custom)',
    '✓ API calls include correct headers',
    '✓ Settings save/load correctly',
    '✓ Invalid keys are rejected',
  ],

  technical: [
    '✓ No TypeScript errors',
    '✓ All tests passing',
    '✓ No security vulnerabilities',
    '✓ Performance not degraded',
    '✓ Backward compatible',
  ],

  usability: [
    '✓ Clear UI for adding API keys',
    '✓ Helpful error messages',
    '✓ Authentication status visible',
    '✓ Easy to switch between auth methods',
    '✓ Works with existing tools',
  ],

  security: [
    '✓ Keys never logged in plaintext',
    '✓ Keys sent only over HTTPS',
    '✓ Error messages don\'t reveal keys',
    '✓ Access control on settings',
    '✓ Secure key storage',
  ],
};

/**
 * ============================================
 * QUICK TROUBLESHOOTING
 * ============================================
 */

const troubleshooting = {
  problem1: {
    issue: 'API key not being sent in requests',
    cause: 'buildAuthHeaders not called or incorrectly',
    solution: 'Verify buildAuthHeaders is imported and called with apiKeyConfig',
    debug: 'console.log(buildAuthHeaders(apiKeyConfig))',
  },

  problem2: {
    issue: 'Wrong header name in requests',
    cause: 'Header type mismatch',
    solution: 'Verify headerType matches API requirements',
    debug: 'Use getHeaderPreview() to check auth preview',
  },

  problem3: {
    issue: 'Validation always failing',
    cause: 'Invalid configuration format',
    solution: 'Check apiKeyConfig has all required fields',
    debug: 'Log validation result: validateApiKeyConfig(config)',
  },

  problem4: {
    issue: 'Keys showing in logs',
    cause: 'Logging raw config instead of sanitized',
    solution: 'Use sanitizeApiKeyConfig() before logging',
    debug: 'console.log(sanitizeApiKeyConfig(config))',
  },

  problem5: {
    issue: 'Custom header not working',
    cause: 'keyName empty or missing',
    solution: 'Ensure keyName is set when using custom type',
    debug: 'Check apiKeyConfig.keyName is not empty',
  },
};

/**
 * ============================================
 * VERSION & COMPATIBILITY
 * ============================================
 */

const compatibility = {
  versions: {
    nodeMinVersion: '18.17.0',
    reactMinVersion: '18.0.0',
    nextMinVersion: '14.0.0',
    typescriptMinVersion: '5.0.0',
  },

  breakingChanges: [
    {
      change: 'APIToolSettings no longer uses separate includeApiKey/apiKey state',
      mitigation: 'Migration from old state to apiKeyConfig needed',
    },
  ],

  backwardCompatibility: [
    '✓ Old workflows continue to work without API keys',
    '✓ Existing tools can ignore apiKeyConfig',
    '✓ Can gradually migrate to new system',
  ],

  migration: `
// Old code:
const [includeApiKey, setIncludeApiKey] = useState(false);
const [apiKey, setApiKey] = useState('');

// Migrate to:
const [apiKeyConfig, setApiKeyConfig] = useState({
  useApiKey: false,
  apiKey: '',
  headerType: 'bearer' as const,
});
  `,
};

/**
 * ============================================
 * SIGN-OFF CHECKLIST
 * ============================================
 */

const signOff = {
  developer: [
    '☐ Code review completed',
    '☐ All tests passing',
    '☐ No security issues',
    '☐ Documentation updated',
  ],

  qa: [
    '☐ Functional tests passed',
    '☐ Security review completed',
    '☐ Performance acceptable',
    '☐ Backward compatibility verified',
  ],

  manager: [
    '☐ Rollout plan approved',
    '☐ Success criteria defined',
    '☐ Monitoring in place',
    '☐ Communication plan ready',
  ],

  finalDeployment: [
    '☐ All sign-offs completed',
    '☐ Monitoring active',
    '☐ Support team briefed',
    '☐ Ready to deploy',
  ],
};

export default {
  deploymentFiles,
  preflight,
  integrationPhases,
  testingStrategy,
  rollbackPlan,
  monitoring,
  successCriteria,
  troubleshooting,
  compatibility,
  signOff,
};
