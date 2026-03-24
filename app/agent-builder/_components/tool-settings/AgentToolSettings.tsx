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
import { Save, Bot } from 'lucide-react';
import { ToolApiKeyInput } from './ToolApiKeyInput';

interface AgentToolSettingsProps {
  nodeId: string;
  agentId: string;
  initialConfig?: Record<string, any>;
  onSave: (config: any) => void;
  onClose: () => void;
}

/**
 * Agent Tool Settings Component
 * Settings panel for Agent subflow tool with API key support
 */
const AgentToolSettings: React.FC<AgentToolSettingsProps> = ({
  nodeId,
  agentId,
  initialConfig = {},
  onSave,
}) => {
  const [agentName, setAgentName] = useState(initialConfig.agentName || '');
  const [workflowOutput, setWorkflowOutput] = useState(initialConfig.workflowOutput || 'default');
  const [output, setOutput] = useState(initialConfig.output || '');
  const [apiKeyConfig, setApiKeyConfig] = useState(
    initialConfig.apiKeyConfig || {
      useApiKey: false,
      apiKey: '',
      headerType: 'bearer',
    }
  );
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!agentName.trim()) {
      alert('Agent name is required');
      return;
    }

    if (apiKeyConfig.useApiKey && !apiKeyConfig.apiKey.trim()) {
      alert('API Key is required when enabled');
      return;
    }

    setSaving(true);
    try {
      const config = {
        agentName,
        workflowOutput,
        output,
        apiKeyConfig,
        nodeId,
        agentId,
        savedAt: Date.now(),
      };

      console.log('Agent Tool Settings Saved:', {
        toolType: 'agent',
        nodeId,
        agentId,
        config,
        timestamp: new Date().toISOString(),
      });

      onSave(config);
      alert('✓ Agent configuration saved successfully!');
    } catch (error) {
      console.error('Error saving agent settings:', error);
      alert('✗ Error saving settings. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="h-full flex flex-col bg-gradient-to-b from-yellow-50 to-white">
      {/* Header */}
      <div className="p-4 border-b bg-white shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Bot className="h-5 w-5 text-yellow-600" />
            </div>
            <div>
              <h3 className="font-semibold text-lg text-gray-900">Agent Tool</h3>
              <p className="text-sm text-gray-500">Configure subagent workflow</p>
            </div>
          </div>
          <Badge variant="outline" className="bg-yellow-100 text-yellow-700 border-yellow-300">
            Subflow
          </Badge>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <Card className="border-gray-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Agent Configuration</CardTitle>
            <CardDescription>Name and configure your subagent</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Agent Name */}
            <div>
              <Label className="text-xs font-medium text-gray-700">Agent Name</Label>
              <Input
                placeholder="Enter agent name"
                value={agentName}
                onChange={(e) => setAgentName(e.target.value)}
                className="mt-1"
              />
              <p className="text-xs text-gray-500 mt-1">Choose a descriptive name for this sub-agent</p>
            </div>

            {/* Choose Workflow Output */}
            <div>
              <Label className="text-xs font-medium text-gray-700">Workflow Output Type</Label>
              <Select value={workflowOutput} onValueChange={setWorkflowOutput}>
            <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select workflow output" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="default">Default Output</SelectItem>
                <SelectItem value="json">JSON Output</SelectItem>
                <SelectItem value="text">Text Output</SelectItem>
                <SelectItem value="custom">Custom Output</SelectItem>
              </SelectContent>
            </Select>
              <p className="text-xs text-gray-500 mt-1">Choose the format of the workflow output</p>
            </div>

            {/* Output Label and TextArea */}
            <div>
              <Label className="text-xs font-medium text-gray-700">Output Template</Label>
              <Textarea
                placeholder='{name: "string", status: "success"}'
                value={output}
                onChange={(e) => setOutput(e.target.value)}
                className="mt-1 font-mono text-sm"
                rows={4}
              />
              <p className="text-xs text-gray-500 mt-1">Define the output structure (JSON format)</p>
            </div>
          </CardContent>
        </Card>

        <ToolApiKeyInput
          value={apiKeyConfig}
          onChange={setApiKeyConfig}
          showLabel={true}
          tooltip="Optional: Add API key if this sub-agent needs to call external APIs"
        />
      </div>

      {/* Footer - Save button */}
      <div className="p-4 border-t bg-white shadow-lg">
        <Button
          className="w-full bg-yellow-600 hover:bg-yellow-700 text-white font-medium"
          onClick={handleSave}
          disabled={saving}
        >
          <Save className="h-4 w-4 mr-2" />
          {saving ? 'Saving...' : 'Save Configuration'}
        </Button>
        <p className="text-xs text-gray-500 text-center mt-2">Changes will be saved to this node</p>
      </div>
    </div>
  );
};

export default AgentToolSettings;
