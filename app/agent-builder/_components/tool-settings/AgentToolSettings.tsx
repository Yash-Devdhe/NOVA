<<<<<<< HEAD
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
=======
"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Save, Bot } from "lucide-react";
>>>>>>> fcb949d08971b4acc79fa3a18c05ce7fbe16e9e1

interface AgentToolSettingsProps {
  nodeId: string;
  agentId: string;
<<<<<<< HEAD
  initialConfig?: Record<string, any>;
=======
  initialConfig?: {
    agentName?: string;
    workflowOutput?: string;
    output?: string;
  };
>>>>>>> fcb949d08971b4acc79fa3a18c05ce7fbe16e9e1
  onSave: (config: any) => void;
  onClose: () => void;
}

/**
<<<<<<< HEAD
 * Agent Tool Settings Component
 * Settings panel for Agent subflow tool with API key support
=======
 * AgentToolSettings Component
 * Settings panel for Agent tool - opens when clicking on Agent tool
 * Contains: Agent label (bold), Choose workflow output, Output label, TextArea with placeholder {name:string}, Save button
>>>>>>> fcb949d08971b4acc79fa3a18c05ce7fbe16e9e1
 */
const AgentToolSettings: React.FC<AgentToolSettingsProps> = ({
  nodeId,
  agentId,
  initialConfig = {},
  onSave,
<<<<<<< HEAD
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

=======
  onClose,
}) => {
  const [agentName, setAgentName] = useState(initialConfig.agentName || "");
  const [workflowOutput, setWorkflowOutput] = useState(initialConfig.workflowOutput || "default");
  const [output, setOutput] = useState(initialConfig.output || "");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
>>>>>>> fcb949d08971b4acc79fa3a18c05ce7fbe16e9e1
    setSaving(true);
    try {
      const config = {
        agentName,
        workflowOutput,
        output,
<<<<<<< HEAD
        apiKeyConfig,
=======
>>>>>>> fcb949d08971b4acc79fa3a18c05ce7fbe16e9e1
        nodeId,
        agentId,
        savedAt: Date.now(),
      };
<<<<<<< HEAD

      console.log('Agent Tool Settings Saved:', {
        toolType: 'agent',
=======
      
      // Log to console as required
      console.log("Agent Tool Settings Saved:", {
        toolType: "agent",
>>>>>>> fcb949d08971b4acc79fa3a18c05ce7fbe16e9e1
        nodeId,
        agentId,
        config,
        timestamp: new Date().toISOString(),
      });
<<<<<<< HEAD

      onSave(config);
      alert('✓ Agent configuration saved successfully!');
    } catch (error) {
      console.error('Error saving agent settings:', error);
      alert('✗ Error saving settings. Please try again.');
=======
      
      onSave(config);
      alert("Agent settings saved successfully!");
    } catch (error) {
      console.error("Error saving agent settings:", error);
      alert("Error saving settings");
>>>>>>> fcb949d08971b4acc79fa3a18c05ce7fbe16e9e1
    } finally {
      setSaving(false);
    }
  };

  return (
<<<<<<< HEAD
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
=======
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b bg-yellow-50">
        <div className="flex items-center gap-2">
          <Bot className="h-5 w-5 text-yellow-600" />
          <h3 className="font-semibold text-lg text-yellow-900">Agent</h3>
        </div>
        <p className="text-sm text-yellow-700 mt-1">
          Configure the agent tool settings
        </p>
>>>>>>> fcb949d08971b4acc79fa3a18c05ce7fbe16e9e1
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
<<<<<<< HEAD
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
=======
        {/* Agent Name */}
        <div>
          <Label className="text-sm font-medium">Agent Name</Label>
          <Input
            placeholder="Enter agent name"
            value={agentName}
            onChange={(e) => setAgentName(e.target.value)}
            className="mt-1"
          />
        </div>

        {/* Choose Workflow Output */}
        <div>
          <Label className="text-sm font-medium">Choose Workflow Output</Label>
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
        </div>

        {/* Output Label and TextArea */}
        <div>
          <Label className="text-sm font-medium">Output</Label>
          <Textarea
            placeholder="{name:string}"
            value={output}
            onChange={(e) => setOutput(e.target.value)}
            className="mt-1 font-mono"
            rows={4}
          />
        </div>
      </div>

      {/* Footer - Save button */}
      <div className="p-4 border-t">
        <Button
          className="w-full bg-yellow-600 hover:bg-yellow-700"
>>>>>>> fcb949d08971b4acc79fa3a18c05ce7fbe16e9e1
          onClick={handleSave}
          disabled={saving}
        >
          <Save className="h-4 w-4 mr-2" />
<<<<<<< HEAD
          {saving ? 'Saving...' : 'Save Configuration'}
        </Button>
        <p className="text-xs text-gray-500 text-center mt-2">Changes will be saved to this node</p>
=======
          {saving ? "Saving..." : "Save"}
        </Button>
>>>>>>> fcb949d08971b4acc79fa3a18c05ce7fbe16e9e1
      </div>
    </div>
  );
};

export default AgentToolSettings;
