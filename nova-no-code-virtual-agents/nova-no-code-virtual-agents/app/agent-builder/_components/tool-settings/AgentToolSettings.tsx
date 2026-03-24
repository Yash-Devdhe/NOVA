"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Save, Bot } from "lucide-react";

interface AgentToolSettingsProps {
  nodeId: string;
  agentId: string;
  initialConfig?: {
    agentName?: string;
    workflowOutput?: string;
    output?: string;
  };
  onSave: (config: any) => void;
  onClose: () => void;
}

/**
 * AgentToolSettings Component
 * Settings panel for Agent tool - opens when clicking on Agent tool
 * Contains: Agent label (bold), Choose workflow output, Output label, TextArea with placeholder {name:string}, Save button
 */
const AgentToolSettings: React.FC<AgentToolSettingsProps> = ({
  nodeId,
  agentId,
  initialConfig = {},
  onSave,
  onClose,
}) => {
  const [agentName, setAgentName] = useState(initialConfig.agentName || "");
  const [workflowOutput, setWorkflowOutput] = useState(initialConfig.workflowOutput || "default");
  const [output, setOutput] = useState(initialConfig.output || "");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      const config = {
        agentName,
        workflowOutput,
        output,
        nodeId,
        agentId,
        savedAt: Date.now(),
      };
      
      // Log to console as required
      console.log("Agent Tool Settings Saved:", {
        toolType: "agent",
        nodeId,
        agentId,
        config,
        timestamp: new Date().toISOString(),
      });
      
      onSave(config);
      alert("Agent settings saved successfully!");
    } catch (error) {
      console.error("Error saving agent settings:", error);
      alert("Error saving settings");
    } finally {
      setSaving(false);
    }
  };

  return (
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
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
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
          onClick={handleSave}
          disabled={saving}
        >
          <Save className="h-4 w-4 mr-2" />
          {saving ? "Saving..." : "Save"}
        </Button>
      </div>
    </div>
  );
};

export default AgentToolSettings;
