"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Save } from "lucide-react";

interface AgentSettingsProps {
  onSave?: (settings: AgentSettings) => void;
}

export interface AgentSettings {
  agentName: string;
  instructions: string;
  includeChatHistory: boolean;
  model: string;
  outputFormat: "text" | "json";
  jsonSchema?: string;
}

const NodePropertiesPanel: React.FC<AgentSettingsProps> = ({ onSave }) => {
  const [agentName, setAgentName] = useState("");
  const [instructions, setInstructions] = useState("");
  const [includeChatHistory, setIncludeChatHistory] = useState(false);
  const [model, setModel] = useState("gpt-5");
  const [outputFormat, setOutputFormat] = useState<"text" | "json">("text");
  const [jsonSchema, setJsonSchema] = useState("");
  const [sliderValue, setSliderValue] = useState([0]);

  const handleSliderChange = (value: number[]) => {
    setSliderValue(value);
    setOutputFormat(value[0] === 0 ? "text" : "json");
  };

  const handleSave = () => {
    const settings: AgentSettings = {
      agentName,
      instructions,
      includeChatHistory,
      model,
      outputFormat,
      jsonSchema: outputFormat === "json" ? jsonSchema : undefined,
    };
    if (onSave) {
      onSave(settings);
    }
    alert("Agent settings saved successfully!");
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b bg-gray-50">
        <h3 className="font-semibold text-lg">My Agent</h3>
        <p className="text-sm text-gray-500 mt-1">
          Call the model with your instructions and tools
        </p>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Agent Name */}
        <div>
          <Label className="text-sm font-medium">Agent Name</Label>
          <Input
            placeholder="Welcome Agent"
            value={agentName}
            onChange={(e) => setAgentName(e.target.value)}
            className="mt-1"
          />
        </div>

        {/* Instructions */}
        <div>
          <Label className="text-sm font-medium">Instructions</Label>
          <Textarea
            placeholder="Greeting Msg"
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
            className="mt-1"
            rows={4}
          />
        </div>

        {/* Include Chat History */}
        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium">Include chat history</Label>
          <Switch
            checked={includeChatHistory}
            onCheckedChange={setIncludeChatHistory}
          />
        </div>

        {/* Model */}
        <div>
          <Label className="text-sm font-medium">Model</Label>
          <Select value={model} onValueChange={setModel}>
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="Select model" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="gpt-5">GPT-5</SelectItem>
              <SelectItem value="gemini-pro">Gemini Pro</SelectItem>
              <SelectItem value="gemini-ultra">Gemini Ultra</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Output Format - Slider */}
        <div>
          <Label className="text-sm font-medium">Output format</Label>
          <div className="mt-2 space-y-3">
            <Slider
              value={sliderValue}
              onValueChange={handleSliderChange}
              min={0}
              max={1}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span className={sliderValue[0] === 0 ? "font-semibold text-black" : ""}>Text</span>
              <span className={sliderValue[0] === 1 ? "font-semibold text-black" : ""}>JSON</span>
            </div>
          </div>
        </div>

        {/* JSON Schema - Only shown when JSON is selected */}
        {outputFormat === "json" && (
          <div>
            <Label className="text-sm font-medium">Enter JSON Schema</Label>
            <Textarea
              placeholder='{"type": "object", "properties": {...}}'
              value={jsonSchema}
              onChange={(e) => setJsonSchema(e.target.value)}
              className="mt-1 font-mono text-sm"
              rows={6}
            />
          </div>
        )}
      </div>

      {/* Footer - Save button */}
      <div className="p-4 border-t">
        <Button
          className="w-full"
          onClick={handleSave}
        >
          <Save className="h-4 w-4 mr-2" />
          Save
        </Button>
      </div>
    </div>
  );
};

export default NodePropertiesPanel;
