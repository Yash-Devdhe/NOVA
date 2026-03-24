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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Save, Code2 } from 'lucide-react';
import { ToolApiKeyInput } from './ToolApiKeyInput';

interface CodeToolSettingsProps {
  nodeId: string;
  agentId: string;
  initialConfig?: Record<string, any>;
  onSave: (config: any) => void;
  onClose: () => void;
}

/**
 * Code Tool Settings
 * Configuration panel for executing custom code
 */
const CodeToolSettings: React.FC<CodeToolSettingsProps> = ({
  nodeId,
  agentId,
  initialConfig = {},
  onSave,
}) => {
  const [name, setName] = useState(initialConfig.name || 'Custom Code');
  const [language, setLanguage] = useState(initialConfig.language || 'javascript');
  const [code, setCode] = useState(initialConfig.code || '');
  const [description, setDescription] = useState(initialConfig.description || '');
  const [apiKeyConfig, setApiKeyConfig] = useState(
    initialConfig.apiKeyConfig || {
      useApiKey: false,
      apiKey: '',
      headerType: 'bearer',
    }
  );
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) {
      alert('Tool name is required');
      return;
    }

    if (!code.trim()) {
      alert('Code is required');
      return;
    }

    if (apiKeyConfig.useApiKey && !apiKeyConfig.apiKey.trim()) {
      alert('API Key is required when enabled');
      return;
    }

    setSaving(true);
    try {
      const config = {
        name,
        language,
        code,
        description,
        apiKeyConfig,
        nodeId,
        agentId,
        savedAt: Date.now(),
      };

      console.log('Code Tool Settings Saved:', { toolType: 'code', nodeId, agentId, config });
      onSave(config);
      alert('✓ Code configuration saved successfully!');
    } catch (error) {
      console.error('Error saving Code settings:', error);
      alert('✗ Error saving settings. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const getLanguageColor = (lang: string) => {
    switch (lang) {
      case 'javascript':
        return 'bg-yellow-100 text-yellow-700 border-yellow-300';
      case 'python':
        return 'bg-blue-100 text-blue-700 border-blue-300';
      case 'typescript':
        return 'bg-blue-100 text-blue-700 border-blue-300';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  return (
    <div className="h-full flex flex-col bg-gradient-to-b from-orange-50 to-white">
      <div className="p-4 border-b bg-white shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Code2 className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <h3 className="font-semibold text-lg text-gray-900">Code Tool</h3>
              <p className="text-sm text-gray-500">Execute custom code logic</p>
            </div>
          </div>
          <Badge variant="outline" className={`text-xs font-normal border ${getLanguageColor(language)}`}>
            {language.toUpperCase()}
          </Badge>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <Card className="border-gray-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Configuration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-xs font-medium text-gray-700">Tool Name</Label>
              <Input
                placeholder="e.g., Calculate Discount, Transform Data"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1"
              />
            </div>

            <div>
              <Label className="text-xs font-medium text-gray-700">Language</Label>
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="javascript">JavaScript</SelectItem>
                  <SelectItem value="python">Python</SelectItem>
                  <SelectItem value="typescript">TypeScript</SelectItem>
                  <SelectItem value="sql">SQL</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-xs font-medium text-gray-700">Description</Label>
              <Input
                placeholder="What does this code do?"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="mt-1"
              />
            </div>
          </CardContent>
        </Card>

        <Card className="border-gray-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Code Editor</CardTitle>
            <CardDescription>Write your {language.toUpperCase()} code here</CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder={`// Write your ${language} code here...`}
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="mt-1 font-mono text-sm border-gray-300 focus:border-orange-500"
              rows={10}
            />
            <p className="text-xs text-gray-500 mt-2">
              Use [[variable]] syntax to access variables from previous steps
            </p>
          </CardContent>
        </Card>

        <ToolApiKeyInput
          value={apiKeyConfig}
          onChange={setApiKeyConfig}
          showLabel={true}
          tooltip="Optional: Add API key if your code needs to make authenticated API calls"
        />

        <Card className="border-amber-200 bg-amber-50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-amber-900">⚠️ Code Safety</CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-amber-800 space-y-1">
            <p>• Code runs in a sandboxed environment</p>
            <p>• Maximum execution time: 30 seconds</p>
            <p>• Access to variables from previous nodes</p>
            <p>• Sensitive data should be handled securely</p>
          </CardContent>
        </Card>
      </div>

      <div className="p-4 border-t bg-white shadow-lg">
        <Button
          className="w-full bg-orange-600 hover:bg-orange-700 text-white font-medium"
          onClick={handleSave}
          disabled={saving}
        >
          <Save className="h-4 w-4 mr-2" />
          {saving ? 'Saving...' : 'Save Configuration'}
        </Button>
        <p className="text-xs text-gray-500 text-center mt-2">Code will be executed on workflow run</p>
      </div>
    </div>
  );
};

export default CodeToolSettings;
