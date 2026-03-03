"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Save, Square } from "lucide-react";

interface EndToolSettingsProps {
  nodeId: string;
  agentId: string;
  initialConfig?: {
    workflowOutput?: string;
    output?: string;
  };
  onSave: (config: any) => void;
  onClose: () => void;
}

/**
 * EndToolSettings Component
 * Settings panel for End tool - opens when clicking on End tool
 * Contains: End label (bold), Choose workflow output, Output label, TextArea with placeholder {name:string}, Save button
 */
const EndToolSettings: React.FC<EndToolSettingsProps> = ({
  nodeId,
  agentId,
  initialConfig = {},
  onSave,
  onClose,
}) => {
  const [workflowOutput, setWorkflowOutput] = useState(initialConfig.workflowOutput || "default");
  const [output, setOutput] = useState(initialConfig.output || "");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      const config = {
        workflowOutput,
        output,
        nodeId,
        agentId,
        savedAt: Date.now(),
      };
      
      // Log to console as required
      console.log("End Tool Settings Saved:", {
        toolType: "end",
        nodeId,
        agentId,
        config,
        timestamp: new Date().toISOString(),
      });
      
      onSave(config);
      alert("End settings saved successfully!");
    } catch (error) {
      console.error("Error saving end settings:", error);
      alert("Error saving settings");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b bg-red-50">
        <div className="flex items-center gap-2">
          <Square className="h-5 w-5 text-red-600" />
          <h3 className="font-semibold text-lg text-red-900">End</h3>
        </div>
        <p className="text-sm text-red-700 mt-1">
          Configure the workflow end point
        </p>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
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
          className="w-full bg-red-600 hover:bg-red-700"
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

export default EndToolSettings;
