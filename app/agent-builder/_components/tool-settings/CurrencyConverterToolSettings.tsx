'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Save } from 'lucide-react';
import { ToolApiKeyInput } from './ToolApiKeyInput';

interface CurrencyConverterToolSettingsProps {
  nodeId: string;
  agentId: string;
  initialConfig?: Record<string, any>;
  onSave: (config: any) => void;
  onClose: () => void;
}

/**
 * Currency Converter Tool Settings
 * Professional configuration panel for currency conversion API
 */
const CurrencyConverterToolSettings: React.FC<CurrencyConverterToolSettingsProps> = ({
  nodeId,
  agentId,
  initialConfig = {},
  onSave,
}) => {
  const [name, setName] = useState(initialConfig.name || 'Currency Converter');
  const [description, setDescription] = useState(
    initialConfig.description ||
      'Convert between any two currencies with real-time exchange rates'
  );
  const [apiKeyConfig, setApiKeyConfig] = useState(
    initialConfig.apiKeyConfig || {
      useApiKey: false,
      apiKey: '',
      headerType: 'bearer',
    }
  );
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (apiKeyConfig.useApiKey && !apiKeyConfig.apiKey.trim()) {
      alert('API Key is required when enabled');
      return;
    }

    setSaving(true);
    try {
      const config = {
        name,
        description,
        apiKeyConfig,
        toolType: 'currency-converter',
        apiUrl: '/api/currency-converter',
        method: 'POST',
        nodeId,
        agentId,
        savedAt: Date.now(),
      };

      console.log('Currency Converter Tool Settings Saved:', {
        toolType: 'currency-converter',
        nodeId,
        agentId,
        config,
      });
      onSave(config);
      alert('✓ Currency Converter configured successfully!');
    } catch (error) {
      console.error('Error saving Currency Converter settings:', error);
      alert('✗ Error saving settings. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="h-full flex flex-col bg-gradient-to-b from-purple-50 to-white">
      <div className="p-4 border-b bg-white shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <span className="text-xl">💱</span>
            </div>
            <div>
              <h3 className="font-semibold text-lg text-gray-900">Currency Converter</h3>
              <p className="text-sm text-gray-500">Real-time exchange rates</p>
            </div>
          </div>
          <Badge variant="outline" className="bg-purple-100 text-purple-700 border-purple-300">
            Ready
          </Badge>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <Card className="border-gray-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Tool Configuration</CardTitle>
            <CardDescription>Customize your currency converter tool</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-xs font-medium text-gray-700">Tool Name</Label>
              <Input
                placeholder="Currency Converter"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 border-gray-300"
              />
              <p className="text-xs text-gray-500 mt-1">Display name for this tool</p>
            </div>

            <div>
              <Label className="text-xs font-medium text-gray-700">Description</Label>
              <Input
                placeholder="Describe what this tool does"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="mt-1 border-gray-300"
              />
              <p className="text-xs text-gray-500 mt-1">Helps users understand the tool's purpose</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-gray-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">API Features</CardTitle>
            <CardDescription>Advanced configuration options</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-xs text-green-700 font-medium">✓ Free Service</p>
              <p className="text-xs text-green-600 mt-1">No API key required to use the tool</p>
            </div>

            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg space-y-1">
              <p className="text-xs text-blue-700 font-medium">📊 Supported Features</p>
              <ul className="text-xs text-blue-600 mt-2 space-y-1">
                <li>• 150+ world currencies</li>
                <li>• Real-time exchange rates</li>
                <li>• Automatic fallback provider</li>
                <li>• 5-minute response caching</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <ToolApiKeyInput
          value={apiKeyConfig}
          onChange={setApiKeyConfig}
          showLabel={true}
          tooltip="Optional: Add API key for enhanced rate limits or premium features"
        />

        <Card className="border-amber-200 bg-amber-50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-amber-900">💡 Usage Tips</CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-amber-800 space-y-2">
            <p>• Pass parameters: from, to, amount</p>
            <p>• Example: {"{ from: 'USD', to: 'EUR', amount: 100 }"}</p>
            <p>• Response includes: convertedAmount, rate, timestamp</p>
            <p>• API endpoint: /api/currency-converter</p>
          </CardContent>
        </Card>
      </div>

      <div className="p-4 border-t bg-white shadow-lg">
        <Button
          className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium"
          onClick={handleSave}
          disabled={saving}
        >
          <Save className="h-4 w-4 mr-2" />
          {saving ? 'Saving...' : 'Save Configuration'}
        </Button>
        <p className="text-xs text-gray-500 text-center mt-2">
          Your configuration will be saved to this agent node
        </p>
      </div>
    </div>
  );
};

export default CurrencyConverterToolSettings;
