"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle2, Eye, EyeOff, Key, X } from 'lucide-react';

interface ApiKeyConfig {
  useApiKey: boolean;
  apiKey: string;
  keyName?: string;
  headerType?: 'bearer' | 'api-key' | 'custom';
}

interface DragApiKeyDropdownProps {
  toolType: string;
  toolLabel: string;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (apiKeyConfig: ApiKeyConfig) => void;
  initialConfig?: ApiKeyConfig;
}

export const DragApiKeyDropdown: React.FC<DragApiKeyDropdownProps> = ({
  toolType,
  toolLabel,
  isOpen,
  onClose,
  onConfirm,
  initialConfig,
}) => {
  const [showKey, setShowKey] = useState(false);
  const [config, setConfig] = useState<ApiKeyConfig>(
    initialConfig || {
      useApiKey: false,
      apiKey: '',
      headerType: 'bearer',
    }
  );

  const handleToggleApiKey = (useKey: boolean) => {
    setConfig(prev => ({
      ...prev,
      useApiKey: useKey,
      apiKey: useKey ? prev.apiKey : '',
    }));
  };

  const handleApiKeyChange = (newKey: string) => {
    setConfig(prev => ({
      ...prev,
      apiKey: newKey,
    }));
  };

  const handleHeaderTypeChange = (type: string) => {
    setConfig(prev => ({
      ...prev,
      headerType: type as 'bearer' | 'api-key' | 'custom',
    }));
  };

  const handleKeyNameChange = (name: string) => {
    setConfig(prev => ({
      ...prev,
      keyName: name,
    }));
  };

  const handleConfirm = () => {
    onConfirm(config);
    onClose();
  };

  const handleSkip = () => {
    onConfirm({ useApiKey: false, apiKey: '', headerType: 'bearer' });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <Card className="w-full max-w-md mx-4 border-blue-200 bg-white shadow-2xl">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-medium flex items-center gap-2">
              <Key className="h-5 w-5 text-blue-600" />
              Configure {toolLabel} Tool
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-sm text-slate-600">
            Optionally add API authentication for this tool
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Toggle API Key */}
          <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-100">
            <div>
              <Label className="text-sm font-medium text-gray-700">Include API Key</Label>
              <p className="text-xs text-gray-500 mt-1">Add authentication for your API call</p>
            </div>
            <Switch checked={config.useApiKey} onCheckedChange={handleToggleApiKey} />
          </div>

          {config.useApiKey && (
            <div className="space-y-3 p-3 bg-blue-50 rounded-lg border border-blue-100">
              {/* API Key Input */}
              <div>
                <Label className="text-xs font-semibold text-gray-700">API Key</Label>
                <div className="relative mt-1.5">
                  <Input
                    type={showKey ? 'text' : 'password'}
                    placeholder="Enter your API key (e.g., sk-...)"
                    value={config.apiKey}
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
                  value={config.headerType || 'bearer'}
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
              {config.headerType === 'custom' && (
                <div>
                  <Label className="text-xs font-semibold text-gray-700">Custom Header Name</Label>
                  <Input
                    placeholder="e.g., Authorization, API-Token, X-Custom-Key"
                    value={config.keyName || ''}
                    onChange={(e) => handleKeyNameChange(e.target.value)}
                    className="mt-1.5 border-blue-200 focus:border-blue-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Header will be sent as: {config.keyName || 'header-name'}: [your-key]
                  </p>
                </div>
              )}

              {/* Info Box */}
              <div className="p-2 bg-blue-100 rounded border border-blue-200">
                <p className="text-xs text-blue-800 flex items-start gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" />
                  <span>
                    {config.headerType === 'bearer' &&
                      'Will send: Authorization: Bearer [your-key]'}
                    {config.headerType === 'api-key' &&
                      'Will send: X-API-Key: [your-key]'}
                    {config.headerType === 'custom' &&
                      `Will send: ${config.keyName || 'header-name'}: [your-key]`}
                  </span>
                </p>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={handleSkip}
              className="flex-1"
            >
              Skip for Now
            </Button>
            <Button
              onClick={handleConfirm}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              Add Tool
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DragApiKeyDropdown;