"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Save, Globe, Key } from "lucide-react";

interface APIToolSettingsProps {
  nodeId: string;
  agentId: string;
  initialConfig?: {
    name?: string;
    method?: string;
    apiUrl?: string;
    includeApiKey?: boolean;
    apiKey?: string;
    bodyParams?: string;
  };
  onSave: (config: any) => void;
  onClose: () => void;
}

/**
 * APIToolSettings Component
 * Settings panel for API tool - opens when clicking on API tool
 * Contains: API Agent (bold), Call external API endpoint, Name, Request Method dropdown, API URL, Include API Key switch, Body Parameters (JSON) for POST, API Key field (masked), Save button
 */
const APIToolSettings: React.FC<APIToolSettingsProps> = ({
  nodeId,
  agentId,
  initialConfig = {},
  onSave,
  onClose,
}) => {
  const [name, setName] = useState(initialConfig.name || "");
  const [method, setMethod] = useState(initialConfig.method || "GET");
  const [apiUrl, setApiUrl] = useState(initialConfig.apiUrl || "");
  const [includeApiKey, setIncludeApiKey] = useState(initialConfig.includeApiKey || false);
  const [apiKey, setApiKey] = useState(initialConfig.apiKey || "");
  const [bodyParams, setBodyParams] = useState(initialConfig.bodyParams || "");
  const [showApiKey, setShowApiKey] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      const config = {
        name,
        method,
        apiUrl,
        includeApiKey,
        apiKey: includeApiKey ? apiKey : "",
        bodyParams: method === "POST" ? bodyParams : "",
        nodeId,
        agentId,
        savedAt: Date.now(),
      };
      
      // Log to console as required
      console.log("API Tool Settings Saved:", {
        toolType: "api",
        nodeId,
        agentId,
        config: {
          ...config,
          apiKey: config.apiKey ? "[HIDDEN]" : "",
        },
        timestamp: new Date().toISOString(),
      });
      
      onSave(config);
      alert("API settings saved successfully!");
    } catch (error) {
      console.error("Error saving API settings:", error);
      alert("Error saving settings");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b bg-teal-50">
        <div className="flex items-center gap-2">
          <Globe className="h-5 w-5 text-teal-600" />
          <h3 className="font-semibold text-lg text-teal-900">API Agent</h3>
        </div>
        <p className="text-sm text-teal-700 mt-1">
          Call an external API endpoint with your chosen method
        </p>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Name */}
        <div>
          <Label className="text-sm font-medium">Name</Label>
          <Input
            placeholder="Enter API name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1"
          />
        </div>

        {/* Request Method */}
        <div>
          <Label className="text-sm font-medium">Request Method</Label>
          <Select value={method} onValueChange={setMethod}>
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="Select method" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="GET">GET</SelectItem>
              <SelectItem value="POST">POST</SelectItem>
              <SelectItem value="PUT">PUT</SelectItem>
              <SelectItem value="DELETE">DELETE</SelectItem>
              <SelectItem value="PATCH">PATCH</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* API URL */}
        <div>
          <Label className="text-sm font-medium">API URL</Label>
          <Input
            placeholder="https://api.example.com/endpoint"
            value={apiUrl}
            onChange={(e) => setApiUrl(e.target.value)}
            className="mt-1"
          />
        </div>

        {/* Include API Key Switch */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Key className="h-4 w-4 text-gray-500" />
            <Label className="text-sm font-medium">Include API Key</Label>
          </div>
          <Switch
            checked={includeApiKey}
            onCheckedChange={setIncludeApiKey}
          />
        </div>

        {/* API Key - Only shown when includeApiKey is true */}
        {includeApiKey && (
          <div>
            <Label className="text-sm font-medium">
              API Key <span className="text-red-500">*</span>
            </Label>
            <div className="relative mt-1">
              <Input
                type={showApiKey ? "text" : "password"}
                placeholder="Enter your API key"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowApiKey(!showApiKey)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showApiKey ? "Hide" : "Show"}
              </button>
            </div>
          </div>
        )}

        {/* Body Parameters - Only shown when method is POST */}
        {method === "POST" && (
          <div>
            <Label className="text-sm font-medium">Body Parameters (JSON)</Label>
            <Textarea
              placeholder='{"key": "value"}'
              value={bodyParams}
              onChange={(e) => setBodyParams(e.target.value)}
              className="mt-1 font-mono"
              rows={4}
            />
          </div>
        )}
      </div>

      {/* Footer - Save button */}
      <div className="p-4 border-t">
        <Button
          className="w-full bg-teal-600 hover:bg-teal-700"
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

export default APIToolSettings;
