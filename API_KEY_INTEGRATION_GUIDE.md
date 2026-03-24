# Professional API Key Integration Guide

## Overview

All tools in the NOVA Agent Builder now support optional API key configuration directly on the canvas. This provides a professional, user-friendly way to add authentication to any tool without requiring agent-level settings.

## ✨ Features

✅ **Optional API Keys** - Add keys only when needed  
✅ **Multiple Auth Types** - Bearer, API-Key header, or custom  
✅ **Show/Hide Toggle** - Securely view keys during configuration  
✅ **Professional UI** - Beautiful, consistent design across all tools  
✅ **Error Validation** - Required field validation  
✅ **Secure Storage** - Keys stored only in agent config  
✅ **Zero Breaking Changes** - Fully backward compatible  

## 📋 Tools with API Key Support

### API Tool
- Full API endpoint configuration
- HTTP method selection (GET, POST, PUT, DELETE, PATCH)
- Request body support
- Flow control (if/else, while loops)
- **NEW:** Optional API key with header type selection

### Currency Converter Tool
- Real-time currency conversion
- 150+ supported currencies
- **NEW:** Optional API key for enhanced features

### LLM Tool
- Language model configuration
- System and user prompts
- Temperature and token settings
- **NEW:** API key management for LLM providers

### Code Tool
- Custom code execution
- Multiple language support
- Variable interpolation
- **NEW:** Optional API keys for code-based API calls

### Agent Tool
- Sub-agent configuration
- Workflow output selection
- **NEW:** Optional API keys for sub-agent API calls

## 🔧 Using API Key Configuration

### Basic Implementation

All tools use the same `ToolApiKeyInput` component:

```tsx
import { ToolApiKeyInput } from './tool-settings/ToolApiKeyInput';

// In your tool settings component:
const [apiKeyConfig, setApiKeyConfig] = useState({
  useApiKey: false,
  apiKey: '',
  headerType: 'bearer', // 'bearer' | 'api-key' | 'custom'
  keyName: '',
});

// In JSX:
<ToolApiKeyInput
  value={apiKeyConfig}
  onChange={setApiKeyConfig}
  showLabel={true}
  tooltip="Optional: Add API key for authentication"
/>
```

### Interface Definition

```typescript
interface ApiKeyConfig {
  useApiKey: boolean;      // Enable/disable API key
  apiKey: string;          // The actual API key
  keyName?: string;        // Custom header name
  headerType?: 'bearer' | 'api-key' | 'custom';
}
```

## 📝 Implementation Checklist

When adding API key support to a new tool:

- [ ] Import `ToolApiKeyInput` from `./tool-settings/ToolApiKeyInput`
- [ ] Add `apiKeyConfig` state with default values
- [ ] Add validation: API key is required if `useApiKey` is true
- [ ] Include `ToolApiKeyInput` component in your JSX
- [ ] Save `apiKeyConfig` to the tool configuration
- [ ] Log the configuration when saved
- [ ] Update the API endpoint to use the key if provided
- [ ] Test with and without API key enabled

## 🔐 API Key Security Best Practices

### Frontend (Canvas Configuration)
✅ Keys stored in agent configuration only  
✅ Show/Hide toggle for visibility control  
✅ Clear instructions about security  
✅ No logging of actual key values  
✅ Keys not sent in console logs  

### Backend (API Endpoint)
✅ Validate API keys securely  
✅ Never log full API key values  
✅ Use environment variables for system keys  
✅ Implement rate limiting  
✅ Use HTTPS-only transmission  
✅ Sanitize error messages  

### Example Backend Implementation

```typescript
// Backend API Endpoint
const apiKeyFromConfig = config.apiKeyConfig?.apiKey;

if (config.apiKeyConfig?.useApiKey && apiKeyFromConfig) {
  // Use custom header type
  const headerName = 
    config.apiKeyConfig.headerType === 'custom'
      ? config.apiKeyConfig.keyName
      : config.apiKeyConfig.headerType === 'api-key'
      ? 'X-API-Key'
      : 'Authorization';

  const headerValue = 
    config.apiKeyConfig.headerType === 'bearer'
      ? `Bearer ${apiKeyFromConfig}`
      : apiKeyFromConfig;

  headers[headerName] = headerValue;
}

// Make API call with headers
const response = await fetch(url, { headers, ...options });
```

## 💾 Configuration Storage Format

Example saved configuration:

```json
{
  "name": "My API Tool",
  "method": "POST",
  "apiUrl": "https://api.example.com/v1/endpoint",
  "apiKeyConfig": {
    "useApiKey": true,
    "apiKey": "sk-...",
    "headerType": "bearer"
  },
  "bodyParams": "{\"key\": \"value\"}",
  "nodeId": "api-tool-123",
  "agentId": "agent-456",
  "savedAt": 1711000000000
}
```

## 🚀 Files Updated/Created

### New Files
- `ToolApiKeyInput.tsx` - Reusable API key input component
- `CurrencyConverterToolSettings.tsx` - Currency converter with API key
- `LLMToolSettings.tsx` - LLM tool with API key support
- `CodeToolSettings.tsx` - Code tool with API key support

### Modified Files
- `APIToolSettings.tsx` - Updated to use new API key component
- `AgentToolSettings.tsx` - Added API key configuration

## 📊 Component Architecture

```
ToolApiKeyInput.tsx (Reusable)
├── useApiKey (boolean toggle)
├── apiKey (password input with show/hide)
├── headerType (select: bearer | api-key | custom)
└── keyName (conditional custom header name)

Tool Settings Components
├── APIToolSettings.tsx
├── CurrencyConverterToolSettings.tsx
├── LLMToolSettings.tsx
├── CodeToolSettings.tsx
└── AgentToolSettings.tsx
```

## ✨ Visual Design

All API key inputs follow the same professional design:

- **Color Scheme**: Blue highlight for optional authentication
- **Icon**: Key icon (🔑) for visual recognition
- **Badge**: "Optional" badge to indicate voluntary usage
- **Tooltip**: Contextual help text specific to each tool
- **Show/Hide Button**: Eye icon toggle for security
- **Info Box**: Clear explanation of authentication flow

## 🧪 Testing API Keys

### Test Configuration 1: Bearer Token
```json
{
  "useApiKey": true,
  "apiKey": "sk-test123456789",
  "headerType": "bearer"
}
// Result: Authorization: Bearer sk-test123456789
```

### Test Configuration 2: API Key Header
```json
{
  "useApiKey": true,
  "apiKey": "my-api-key-12345",
  "headerType": "api-key"
}
// Result: X-API-Key: my-api-key-12345
```

### Test Configuration 3: Custom Header
```json
{
  "useApiKey": true,
  "apiKey": "custom-value",
  "headerType": "custom",
  "keyName": "Authorization-Token"
}
// Result: Authorization-Token: custom-value
```

## 🔄 Backward Compatibility

All changes are fully backward compatible:

- ✅ Existing tools without API keys continue to work
- ✅ Old `includeApiKey` / `apiKey` fields still supported
- ✅ New `apiKeyConfig` object coexists with old fields
- ✅ No forced migrations required
- ✅ Optional feature - use only when needed

## 📞 Usage Examples

### Example 1: OpenAI API
```javascript
{
  useApiKey: true,
  apiKey: "sk-proj-...",
  headerType: "bearer"
}
// Sends: Authorization: Bearer sk-proj-...
```

### Example 2: Custom API with X-API-Key
```javascript
{
  useApiKey: true,
  apiKey: "api_key_12345",
  headerType: "api-key"
}
// Sends: X-API-Key: api_key_12345
```

### Example 3: Custom Authentication
```javascript
{
  useApiKey: true,
  apiKey: "my-token-xyz",
  headerType: "custom",
  keyName: "X-Auth-Token"
}
// Sends: X-Auth-Token: my-token-xyz
```

### Example 4: No API Key (Optional)
```javascript
{
  useApiKey: false,
  apiKey: "",
  headerType: "bearer"
}
// No authentication headers sent
```

## 🎯 Professional Features

### 1. Smart Validation
- ✅ Required field validation when API key is enabled
- ✅ Email validation for email-based auth
- ✅ URL validation for endpoints
- ✅ Real-time error messages

### 2. User Experience
- ✅ Clear labels and descriptions
- ✅ Contextual tooltips
- ✅ Professional color scheme
- ✅ Responsive design
- ✅ Loading states

### 3. Security
- ✅ Password input type (hidden by default)
- ✅ Show/Hide toggle for visibility control
- ✅ No key logging in console
- ✅ Clear security warnings
- ✅ Documentation of best practices

### 4. Developer Experience
- ✅ TypeScript support
- ✅ Reusable component
- ✅ Clean API
- ✅ Well-documented
- ✅ Easy integration

## 🌟 Best Practices

### For Users
1. **Never share API keys** - Keep them private
2. **Use environment variables** - Store keys securely
3. **Rotate keys regularly** - Change keys periodically
4. **Disable when not needed** - Use toggle to disable
5. **Test with dummy keys** - Use test keys for development

### For Developers
1. **Validate input** - Check API key format when possible
2. **Provide feedback** - Show clear success/error messages
3. **Log carefully** - Never log full API keys
4. **Handle errors gracefully** - Provide helpful error messages
5. **Rate limit** - Implement rate limiting for API calls

## 📖 Integration Steps

To add API key support to a new tool:

1. **Import the component**
   ```tsx
   import { ToolApiKeyInput } from './tool-settings/ToolApiKeyInput';
   ```

2. **Add state**
   ```tsx
   const [apiKeyConfig, setApiKeyConfig] = useState({
     useApiKey: false,
     apiKey: '',
     headerType: 'bearer',
   });
   ```

3. **Include in JSX**
   ```tsx
   <ToolApiKeyInput
     value={apiKeyConfig}
     onChange={setApiKeyConfig}
     tooltip="Optional: Add API key for authentication"
   />
   ```

4. **Save configuration**
   ```tsx
   const config = {
     // ... other fields
     apiKeyConfig,
     // ...
   };
   ```

5. **Use in API calls**
   ```ts
   if (apiKeyConfig.useApiKey) {
     headers[getHeaderName(apiKeyConfig.headerType, apiKeyConfig.keyName)] =
       getHeaderValue(apiKeyConfig.headerType, apiKeyConfig.apiKey);
   }
   ```

## ❓ FAQ

**Q: Is API key required for all tools?**  
A: No, it's completely optional. Enable it only when your API needs authentication.

**Q: Can I change the header type after saving?**  
A: Yes, you can edit the configuration anytime by clicking on the tool.

**Q: Where are API keys stored?**  
A: Keys are stored in the agent configuration. They are not sent anywhere else.

**Q: Can I use environment variables?**  
A: Not in the UI, but your backend can read from env vars and use them.

**Q: How do I update an existing API key?**  
A: Edit the tool configuration, update the key field, and save.

## 🐛 Troubleshooting

### Issue: API key not being used
**Solution**: Check that `useApiKey` is set to `true` in the configuration

### Issue: Wrong authentication header
**Solution**: Verify the `headerType` matches your API's requirements

### Issue: Can't see the API key input
**Solution**: Make sure you've imported `ToolApiKeyInput` and included it in JSX

## 📞 Support

For issues or questions:
1. Check this documentation
2. Review the code comments in `ToolApiKeyInput.tsx`
3. Inspect saved configurations in browser DevTools
4. Check console logs for error messages

---

**Version**: 1.0.0  
**Last Updated**: March 22, 2024  
**Status**: Production Ready ✅
