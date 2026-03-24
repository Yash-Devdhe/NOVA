'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle2, Eye, EyeOff, Key, Save } from 'lucide-react';

interface ApiKeyConfig {
  useApiKey: boolean;
  apiKey: string;
  keyName?: string;
  headerType?: 'bearer' | 'api-key' | 'custom';
}

interface ToolApiKeyInputProps {
  value: ApiKeyConfig;
  onChange: (config: ApiKeyConfig) => void;
  showLabel?: boolean;
  tooltip?: string;
}

/**
 * Reusable API Key Input Component
 * Used across all tools to manage optional API key configuration
 */
export const ToolApiKeyInput: React.FC<ToolApiKeyInputProps> = ({
  value,
  onChange,
  showLabel = true,
  tooltip,
}) => {
  const [showKey, setShowKey] = useState(false);

  const handleToggleApiKey = (useKey: boolean) => {
    onChange({
      ...value,
      useApiKey: useKey,
      apiKey: useKey ? value.apiKey : '',
    });
  };

  const handleApiKeyChange = (newKey: string) => {
    onChange({
      ...value,
      apiKey: newKey,
    });
  };

  const handleHeaderTypeChange = (type: string) => {
    onChange({
      ...value,
      headerType: type as 'bearer' | 'api-key' | 'custom',
    });
  };

  const handleKeyNameChange = (name: string) => {
    onChange({
      ...value,
      keyName: name,
    });
  };

  return (
    <Card className="border-blue-200 bg-blue-50">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Key className="h-4 w-4 text-blue-600" />
          API Authentication
          <Badge variant="outline" className="ml-auto text-xs font-normal">Optional</Badge>
        </CardTitle>
        {tooltip && <CardDescription className="text-xs mt-1">{tooltip}</CardDescription>}
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Toggle API Key */}
        <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-blue-100">
          <div>
            <Label className="text-sm font-medium text-gray-700">Include API Key</Label>
            <p className="text-xs text-gray-500 mt-1">Add authentication for your API call</p>
          </div>
          <Switch checked={value.useApiKey} onCheckedChange={handleToggleApiKey} />
        </div>

        {value.useApiKey && (
          <div className="space-y-3 p-3 bg-white rounded-lg border border-blue-100">
            {/* API Key Input */}
            <div>
              <Label className="text-xs font-semibold text-gray-700">API Key</Label>
              <div className="relative mt-1.5">
                <Input
                  type={showKey ? 'text' : 'password'}
                  placeholder="Enter your API key (e.g., sk-...)"
                  value={value.apiKey}
                  onChange={(e) => handleApiKeyChange(e.target.value)}
                  className="pr-10 font-mono text-sm border-blue-200 focus:border-blue-500"
                />
                <button
                  type="button"
                  onClick={() => setShowKey(!showKey)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1">Your key is only stored in your agent configuration</p>
            </div>

            {/* Header Type Selection */}
            <div>
              <Label className="text-xs font-semibold text-gray-700">Authentication Type</Label>
              <Select
                value={value.headerType || 'bearer'}
                onValueChange={handleHeaderTypeChange}
              >
                <SelectTrigger className="mt-1.5 border-blue-200 focus:border-blue-500">
                  <SelectValue placeholder="Choose authentication method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bearer">
                    Bearer Token (Authorization: Bearer)
                  </SelectItem>
                  <SelectItem value="api-key">API Key Header (X-API-Key)</SelectItem>
                  <SelectItem value="custom">Custom Header</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Custom Header Name */}
            {value.headerType === 'custom' && (
              <div>
                <Label className="text-xs font-semibold text-gray-700">Custom Header Name</Label>
                <Input
                  placeholder="e.g., Authorization, API-Token, X-Custom-Key"
                  value={value.keyName || ''}
                  onChange={(e) => handleKeyNameChange(e.target.value)}
                  className="mt-1.5 border-blue-200 focus:border-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Header will be sent as: {value.keyName || 'header-name'}: {value.apiKey || 'api-key-value'}
                </p>
              </div>
            )}

            {/* Info Box */}
            <div className="p-2 bg-blue-100 rounded border border-blue-200">
              <p className="text-xs text-blue-800 flex items-start gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" />
                <span>
                  {value.headerType === 'bearer' &&
                    'Will send: Authorization: Bearer [your-key]'}
                  {value.headerType === 'api-key' &&
                    'Will send: X-API-Key: [your-key]'}
                  {value.headerType === 'custom' &&
                    `Will send: ${value.keyName || 'header-name'}: [your-key]`}
                </span>
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ToolApiKeyInput;
