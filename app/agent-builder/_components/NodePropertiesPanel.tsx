"use client";

<<<<<<< HEAD
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { ToolNode } from '../../../types/AgentType';

interface NodePropertiesPanelProps {
  agentId: string;
  onSave: (settings: any) => void;
  selectedNode?: ToolNode;
}

const NodePropertiesPanel: React.FC<NodePropertiesPanelProps> = ({ agentId, onSave }) => {
  return (
    <div className="p-4 space-y-4 border-l">
      <h3 className="font-semibold text-sm mb-4">Node Properties</h3>
      <div className="space-y-3">
        <div>
          <Label className="text-xs font-medium">Agent ID</Label>
          <Input value={agentId} readOnly className="text-xs mt-1 bg-gray-100" />
        </div>
        <div>
          <Label className="text-xs font-medium">API Keys</Label>
          <Input placeholder="OpenAI Key..." className="text-xs mt-1" />
        </div>
        <div>
          <Label className="text-xs font-medium">Settings</Label>
          <Input placeholder="Node specific settings" className="text-xs mt-1" />
        </div>
      </div>
      <button 
        className="w-full bg-blue-500 hover:bg-blue-600 text-white text-xs py-2 rounded-md font-medium"
        onClick={() => onSave({ agentId })}
      >
        Save Settings
      </button>
=======
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Save, Key, Globe, MapPin, Cloud, Music, Video, Copy, Check, ExternalLink, AlertCircle } from "lucide-react";

interface AgentSettingsProps {
  onSave?: (settings: AgentSettings) => void;
  agentId?: string;
}

export interface AgentSettings {
  agentName: string;
  instructions: string;
  includeChatHistory: boolean;
  model: string;
  outputFormat: "text" | "json";
  jsonSchema?: string;
  apiKeys?: Record<string, string>;
  videoLimit?: number;
  imageLimit?: number;
}

// Supported API services
const API_SERVICES = [
  {
    id: 'openweathermap',
    name: 'OpenWeatherMap',
    description: 'Weather data API',
    icon: Cloud,
    placeholder: 'Enter your OpenWeatherMap API key',
    link: 'https://openweathermap.org/api',
    free: true,
  },
  {
    id: 'google_maps',
    name: 'Google Maps',
    description: 'Maps, directions, geocoding',
    icon: MapPin,
    placeholder: 'Enter your Google Maps API key',
    link: 'https://developers.google.com/maps',
    free: false,
  },
  {
    id: 'openai',
    name: 'OpenAI',
    description: 'GPT, DALL-E, TTS',
    icon: Globe,
    placeholder: 'Enter your OpenAI API key (sk-...)',
    link: 'https://platform.openai.com/api-keys',
    free: false,
  },
  {
    id: 'replicate',
    name: 'Replicate',
    description: 'Video generation AI',
    icon: Video,
    placeholder: 'Enter your Replicate API key',
    link: 'https://replicate.com/account/api-tokens',
    free: false,
  },
  {
    id: 'freepublicapis',
    name: 'FreePublicAPIs',
    description: 'Collection of free public APIs',
    icon: Globe,
    placeholder: 'Enter your FreePublicAPIs key (if required)',
    link: 'https://www.freepublicapis.com/api',
    free: true,
  },
];

const NodePropertiesPanel: React.FC<AgentSettingsProps> = ({ onSave, agentId }) => {
  const [agentName, setAgentName] = useState("");
  const [instructions, setInstructions] = useState("");
  const [includeChatHistory, setIncludeChatHistory] = useState(false);
  const [model, setModel] = useState("gpt-5");
  const [outputFormat, setOutputFormat] = useState<"text" | "json">("text");
  const [jsonSchema, setJsonSchema] = useState("");
  const [sliderValue, setSliderValue] = useState([0]);
  
  // API Keys state
  const [apiKeys, setApiKeys] = useState<Record<string, string>>({});
  const [showApiKey, setShowApiKey] = useState<Record<string, boolean>>({});
  const [savedApiKeys, setSavedApiKeys] = useState<Record<string, string>>({});
  
  // Media limits
  const [videoLimit, setVideoLimit] = useState(3);
  const [imageLimit, setImageLimit] = useState(10);
  
  // Copy feedback
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Load saved API keys from localStorage
  useEffect(() => {
    if (agentId) {
      const saved = localStorage.getItem(`agent-api-keys-${agentId}`);
      if (saved) {
        const parsed = JSON.parse(saved);
        setSavedApiKeys(parsed);
        setApiKeys(parsed);
      }
      
      const savedLimits = localStorage.getItem(`agent-media-limits-${agentId}`);
      if (savedLimits) {
        const limits = JSON.parse(savedLimits);
        setVideoLimit(limits.videoLimit || 3);
        setImageLimit(limits.imageLimit || 10);
      }
    }
  }, [agentId]);

  const handleSliderChange = (value: number[]) => {
    setSliderValue(value);
    setOutputFormat(value[0] === 0 ? "text" : "json");
  };

  const handleApiKeyChange = (serviceId: string, value: string) => {
    setApiKeys(prev => ({ ...prev, [serviceId]: value }));
  };

  const toggleShowApiKey = (serviceId: string) => {
    setShowApiKey(prev => ({ ...prev, [serviceId]: !prev[serviceId] }));
  };

  const saveApiKeys = () => {
    if (agentId) {
      localStorage.setItem(`agent-api-keys-${agentId}`, JSON.stringify(apiKeys));
      localStorage.setItem(`agent-media-limits-${agentId}`, JSON.stringify({ videoLimit, imageLimit }));
      setSavedApiKeys(apiKeys);
      alert("API keys and limits saved successfully!");
    }
  };

  const handleSave = () => {
    const settings: AgentSettings = {
      agentName,
      instructions,
      includeChatHistory,
      model,
      outputFormat,
      jsonSchema: outputFormat === "json" ? jsonSchema : undefined,
      apiKeys: savedApiKeys,
      videoLimit,
      imageLimit,
    };
    if (onSave) {
      onSave(settings);
    }
    alert("Agent settings saved successfully!");
  };

  const hasApiKey = (serviceId: string) => {
    return !!savedApiKeys[serviceId];
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

      {/* Tabs */}
      <Tabs defaultValue="settings" className="flex-1 flex flex-col">
        <TabsList className="grid grid-cols-3 mx-4 mt-2">
          <TabsTrigger value="settings">Settings</TabsTrigger>
          <TabsTrigger value="apis">API Keys</TabsTrigger>
          <TabsTrigger value="limits">Limits</TabsTrigger>
        </TabsList>

        {/* Settings Tab */}
        <TabsContent value="settings" className="flex-1 overflow-y-auto p-4 space-y-6 m-0">
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
        </TabsContent>

        {/* API Keys Tab */}
        <TabsContent value="apis" className="flex-1 overflow-y-auto p-4 space-y-4 m-0">
          <div className="text-sm text-gray-500 mb-4">
            Add your API keys to enable real-time data for your agent. Keys are stored locally on your device.
          </div>

          {API_SERVICES.map((service) => {
            const Icon = service.icon;
            const isConfigured = hasApiKey(service.id);
            
            return (
              <Card key={service.id} className={isConfigured ? "border-green-200 bg-green-50" : ""}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Icon className="h-4 w-4" />
                    {service.name}
                    {service.free && <Badge variant="outline" className="ml-2 text-xs">Free</Badge>}
                    {isConfigured && <Badge variant="secondary" className="ml-2 text-xs bg-green-100 text-green-700">Configured</Badge>}
                  </CardTitle>
                  <CardDescription className="text-xs">{service.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="relative">
                      <Input
                        type={showApiKey[service.id] ? "text" : "password"}
                        placeholder={service.placeholder}
                        value={apiKeys[service.id] || ""}
                        onChange={(e) => handleApiKeyChange(service.id, e.target.value)}
                        className="pr-10 font-mono text-sm"
                      />
                      <button
                        type="button"
                        onClick={() => toggleShowApiKey(service.id)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 text-xs"
                      >
                        {showApiKey[service.id] ? "Hide" : "Show"}
                      </button>
                    </div>
                    <a
                      href={service.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-blue-600 hover:underline"
                    >
                      Get API Key <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                </CardContent>
              </Card>
            );
          })}

          <Button onClick={saveApiKeys} className="w-full mt-4">
            <Save className="h-4 w-4 mr-2" />
            Save API Keys
          </Button>

          {/* Info Box */}
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="pt-4">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5" />
                <div className="text-xs text-blue-700">
                  <p className="font-medium mb-1">Privacy Note</p>
                  <p>API keys are stored locally in your browser. They are never sent to our servers. When you chat with your agent, the keys are used directly from your browser to make API calls.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Limits Tab */}
        <TabsContent value="limits" className="flex-1 overflow-y-auto p-4 space-y-6 m-0">
          <div className="text-sm text-gray-500 mb-4">
            Set usage limits for media generation (similar to Gemini's 2-3 video limit).
          </div>

          {/* Video Limit */}
          <div>
            <Label className="text-sm font-medium flex items-center gap-2">
              <Video className="h-4 w-4" />
              Video Generation Limit
            </Label>
            <p className="text-xs text-gray-500 mb-2">Maximum videos that can be generated per day</p>
            <div className="flex items-center gap-4">
              <Slider
                value={[videoLimit]}
                onValueChange={(value) => setVideoLimit(value[0])}
                min={1}
                max={10}
                step={1}
                className="flex-1"
              />
              <Input
                type="number"
                value={videoLimit}
                onChange={(e) => setVideoLimit(parseInt(e.target.value) || 1)}
                className="w-16"
                min={1}
                max={10}
              />
            </div>
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>1</span>
              <span>10</span>
            </div>
          </div>

          {/* Image Limit */}
          <div>
            <Label className="text-sm font-medium flex items-center gap-2">
              <Cloud className="h-4 w-4" />
              Image Generation Limit
            </Label>
            <p className="text-xs text-gray-500 mb-2">Maximum images that can be generated per day</p>
            <div className="flex items-center gap-4">
              <Slider
                value={[imageLimit]}
                onValueChange={(value) => setImageLimit(value[0])}
                min={1}
                max={50}
                step={1}
                className="flex-1"
              />
              <Input
                type="number"
                value={imageLimit}
                onChange={(e) => setImageLimit(parseInt(e.target.value) || 1)}
                className="w-16"
                min={1}
                max={50}
              />
            </div>
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>1</span>
              <span>50</span>
            </div>
          </div>

          <Button onClick={saveApiKeys} className="w-full">
            <Save className="h-4 w-4 mr-2" />
            Save Limits
          </Button>

          {/* Current Usage Info */}
          <Card className="bg-gray-50">
            <CardHeader>
              <CardTitle className="text-sm">Current Usage</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Videos Generated:</span>
                <span className="font-medium">0 / {videoLimit}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Images Generated:</span>
                <span className="font-medium">0 / {imageLimit}</span>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Limits reset daily at midnight.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

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
>>>>>>> fcb949d08971b4acc79fa3a18c05ce7fbe16e9e1
    </div>
  );
};

export default NodePropertiesPanel;
<<<<<<< HEAD

=======
>>>>>>> fcb949d08971b4acc79fa3a18c05ce7fbe16e9e1
