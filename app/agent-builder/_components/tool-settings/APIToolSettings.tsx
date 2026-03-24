"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
<<<<<<< HEAD
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Save, Globe, Link, AlertCircle, CheckCircle2, GitBranch } from "lucide-react";
import { ToolApiKeyInput } from "./ToolApiKeyInput";
=======
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Save, Globe, Key, Link, AlertCircle, CheckCircle2, GitBranch } from "lucide-react";
>>>>>>> fcb949d08971b4acc79fa3a18c05ce7fbe16e9e1

interface APIToolSettingsProps {
  nodeId: string;
  agentId: string;
  initialConfig?: Record<string, any>;
  onSave: (config: any) => void;
  onClose: () => void;
}

const APIToolSettings: React.FC<APIToolSettingsProps> = ({ nodeId, agentId, initialConfig = {}, onSave }) => {
  const [name, setName] = useState(initialConfig.name || "");
  const [method, setMethod] = useState(initialConfig.method || "GET");
  const [apiUrl, setApiUrl] = useState(initialConfig.apiUrl || "");
<<<<<<< HEAD
  const [apiKeyConfig, setApiKeyConfig] = useState(
    initialConfig.apiKeyConfig || {
      useApiKey: false,
      apiKey: "",
      headerType: "bearer",
    }
  );
  const [bodyParams, setBodyParams] = useState(initialConfig.bodyParams || "");
=======
  const [includeApiKey, setIncludeApiKey] = useState(initialConfig.includeApiKey || false);
  const [apiKey, setApiKey] = useState(initialConfig.apiKey || "");
  const [bodyParams, setBodyParams] = useState(initialConfig.bodyParams || "");
  const [showApiKey, setShowApiKey] = useState(false);
>>>>>>> fcb949d08971b4acc79fa3a18c05ce7fbe16e9e1
  const [saving, setSaving] = useState(false);
  const [urlError, setUrlError] = useState("");
  const [conditionType, setConditionType] = useState(initialConfig.conditionType || "none");
  const [condition, setCondition] = useState(initialConfig.condition || "");
  const [elseCondition, setElseCondition] = useState(initialConfig.elseCondition || "");
  const [loopCondition, setLoopCondition] = useState(initialConfig.loopCondition || "");

  const validateUrl = (url: string) => {
    if (!url) return true;
    try {
      new URL(url);
      setUrlError("");
      return true;
    } catch {
      setUrlError("Please enter a valid URL");
      return false;
    }
  };

  const handleApiUrlChange = (value: string) => {
    setApiUrl(value);
    validateUrl(value);
  };

  const handleSave = async () => {
    if (!validateUrl(apiUrl)) {
      alert("Please enter a valid API URL");
      return;
    }
<<<<<<< HEAD

    if (apiKeyConfig.useApiKey && !apiKeyConfig.apiKey.trim()) {
      alert("API Key is required when enabled");
      return;
    }
=======
>>>>>>> fcb949d08971b4acc79fa3a18c05ce7fbe16e9e1
    
    setSaving(true);
    try {
      const config = {
        name,
        method,
        apiUrl,
<<<<<<< HEAD
        apiKeyConfig,
=======
        includeApiKey,
        apiKey: includeApiKey ? apiKey : "",
>>>>>>> fcb949d08971b4acc79fa3a18c05ce7fbe16e9e1
        bodyParams: method === "POST" ? bodyParams : "",
        conditionType,
        condition: conditionType === "if" ? condition : "",
        elseCondition: conditionType === "if" ? elseCondition : "",
        loopCondition: conditionType === "while" ? loopCondition : "",
        nodeId,
        agentId,
        savedAt: Date.now(),
      };
      
      console.log("API Tool Settings Saved:", { toolType: "api", nodeId, agentId, config });
      onSave(config);
<<<<<<< HEAD
      alert("✓ API settings saved successfully!");
    } catch (error) {
      console.error("Error saving API settings:", error);
      alert("✗ Error saving settings. Please try again.");
=======
      alert("API settings saved successfully!");
    } catch (error) {
      console.error("Error saving API settings:", error);
      alert("Error saving settings");
>>>>>>> fcb949d08971b4acc79fa3a18c05ce7fbe16e9e1
    } finally {
      setSaving(false);
    }
  };

  const getMethodColor = (m: string) => {
    switch (m) {
      case "GET": return "bg-green-100 text-green-700 border-green-200";
      case "POST": return "bg-blue-100 text-blue-700 border-blue-200";
      case "PUT": return "bg-orange-100 text-orange-700 border-orange-200";
      case "DELETE": return "bg-red-100 text-red-700 border-red-200";
      case "PATCH": return "bg-purple-100 text-purple-700 border-purple-200";
      default: return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  return (
    <div className="h-full flex flex-col bg-gray-50">
      <div className="p-4 border-b bg-white shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-teal-100 rounded-lg">
              <Globe className="h-5 w-5 text-teal-600" />
            </div>
            <div>
              <h3 className="font-semibold text-lg text-gray-900">API Tool</h3>
              <p className="text-sm text-gray-500">Configure external API endpoint</p>
            </div>
          </div>
          <Badge variant="outline" className={getMethodColor(method)}>{method}</Badge>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <Card className="border-gray-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <GitBranch className="h-4 w-4" />
              Flow Control
            </CardTitle>
            <CardDescription>Choose how this API call should be executed</CardDescription>
          </CardHeader>
          <CardContent>
            <Select value={conditionType} onValueChange={setConditionType}>
              <SelectTrigger>
                <SelectValue placeholder="Select flow type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Simple API Call</SelectItem>
                <SelectItem value="if">If/Else Condition</SelectItem>
                <SelectItem value="while">While Loop</SelectItem>
              </SelectContent>
            </Select>

            {conditionType === "if" && (
              <div className="mt-4 space-y-3">
                <div>
                  <Label className="text-xs font-medium text-gray-700">If Condition</Label>
                  <Textarea placeholder="e.g., response.status === 200" value={condition} onChange={(e) => setCondition(e.target.value)} className="mt-1 font-mono text-sm" rows={2} />
                </div>
                <div>
                  <Label className="text-xs font-medium text-gray-700">Else Condition</Label>
                  <Textarea placeholder="e.g., response.status !== 200" value={elseCondition} onChange={(e) => setElseCondition(e.target.value)} className="mt-1 font-mono text-sm" rows={2} />
                </div>
              </div>
            )}

            {conditionType === "while" && (
              <div className="mt-4">
                <Label className="text-xs font-medium text-gray-700">Loop Condition</Label>
                <Textarea placeholder="e.g., attempts less than 3" value={loopCondition} onChange={(e) => setLoopCondition(e.target.value)} className="mt-1 font-mono text-sm" rows={2} />
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-gray-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Link className="h-4 w-4" />
              API Endpoint
            </CardTitle>
            <CardDescription>Enter the full URL of the API you want to call</CardDescription>
          </CardHeader>
          <CardContent>
            <div>
              <Label className="text-xs font-medium text-gray-700">API URL</Label>
              <Input placeholder="https://api.example.com/v1/endpoint" value={apiUrl} onChange={(e) => handleApiUrlChange(e.target.value)} className="mt-1 font-mono text-sm" />
              {urlError && <p className="text-xs text-red-500 mt-1"><AlertCircle className="h-3 w-3 inline" /> {urlError}</p>}
            </div>
          </CardContent>
        </Card>

        <Card className="border-gray-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Request Configuration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-xs font-medium text-gray-700">Tool Name</Label>
              <Input placeholder="My API Call" value={name} onChange={(e) => setName(e.target.value)} className="mt-1" />
            </div>
            <div>
              <Label className="text-xs font-medium text-gray-700">HTTP Method</Label>
              <Select value={method} onValueChange={setMethod}>
                <SelectTrigger className="mt-1"><SelectValue placeholder="Select method" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="GET">GET - Retrieve data</SelectItem>
                  <SelectItem value="POST">POST - Create new data</SelectItem>
                  <SelectItem value="PUT">PUT - Update data</SelectItem>
                  <SelectItem value="DELETE">DELETE - Remove data</SelectItem>
                  <SelectItem value="PATCH">PATCH - Partial update</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

<<<<<<< HEAD
        <ToolApiKeyInput
          value={apiKeyConfig}
          onChange={setApiKeyConfig}
          tooltip="Add optional API authentication headers to your request"
        />
=======
        <Card className="border-gray-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Key className="h-4 w-4" />
              Authentication
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700">Include API Key</span>
              <Switch checked={includeApiKey} onCheckedChange={setIncludeApiKey} />
            </div>
            {includeApiKey && (
              <div>
                <Label className="text-xs font-medium text-gray-700">API Key</Label>
                <div className="relative mt-1">
                  <Input type={showApiKey ? "text" : "password"} placeholder="sk-..." value={apiKey} onChange={(e) => setApiKey(e.target.value)} className="pr-10 font-mono text-sm" />
                  <button type="button" onClick={() => setShowApiKey(!showApiKey)} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 text-sm">
                    {showApiKey ? "Hide" : "Show"}
                  </button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
>>>>>>> fcb949d08971b4acc79fa3a18c05ce7fbe16e9e1

        {method === "POST" && (
          <Card className="border-gray-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Request Body</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea placeholder='{"key": "value"}' value={bodyParams} onChange={(e) => setBodyParams(e.target.value)} className="mt-1 font-mono text-sm" rows={5} />
              <p className="text-xs text-gray-500 mt-2"><CheckCircle2 className="h-3 w-3 inline" /> Valid JSON required</p>
            </CardContent>
          </Card>
        )}
      </div>

      <div className="p-4 border-t bg-white">
        <Button className="w-full bg-teal-600 hover:bg-teal-700" onClick={handleSave} disabled={saving}>
          <Save className="h-4 w-4 mr-2" />
          {saving ? "Saving..." : "Save Configuration"}
        </Button>
      </div>
    </div>
  );
};

export default APIToolSettings;
