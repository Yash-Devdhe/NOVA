"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Save, RefreshCw, Image, Video, Loader2 } from "lucide-react";

interface WhileLoopToolSettingsProps {
  nodeId: string;
  agentId: string;
  initialConfig?: {
    condition?: string;
    enableMediaGeneration?: boolean;
    mediaType?: string;
    prompt?: string;
  };
  onSave: (config: any) => void;
  onClose: () => void;
}

/**
 * WhileLoopToolSettings Component
 * Settings panel for While Loop tool - opens when clicking on While Loop tool
 * Contains: While Loop label, condition input, image/video generation window with prompt
 */
const WhileLoopToolSettings: React.FC<WhileLoopToolSettingsProps> = ({
  nodeId,
  agentId,
  initialConfig = {},
  onSave,
  onClose,
}) => {
  const [condition, setCondition] = useState(initialConfig.condition || "");
  const [enableMediaGeneration, setEnableMediaGeneration] = useState(initialConfig.enableMediaGeneration || false);
  const [mediaType, setMediaType] = useState(initialConfig.mediaType || "image");
  const [prompt, setPrompt] = useState(initialConfig.prompt || "");
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleGenerateMedia = async () => {
    if (!prompt.trim()) {
      alert("Please enter a prompt");
      return;
    }

    setGenerating(true);
    try {
      // Here you would integrate with OpenAI's DALL-E for images or Sora for video
      // For now, we'll simulate the generation
      console.log("Generating media:", {
        mediaType,
        prompt,
        agentId,
        nodeId,
        timestamp: new Date().toISOString(),
      });

      // Simulate API call to OpenAI
      // In production, this would call your backend API
      await new Promise(resolve => setTimeout(resolve, 2000));

      alert(`${mediaType === "image" ? "Image" : "Video"} generation initiated! Check console for details.`);
    } catch (error) {
      console.error("Error generating media:", error);
      alert("Error generating media");
    } finally {
      setGenerating(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const config = {
        condition,
        enableMediaGeneration,
        mediaType: enableMediaGeneration ? mediaType : null,
        prompt: enableMediaGeneration ? prompt : "",
        nodeId,
        agentId,
        savedAt: Date.now(),
      };
      
      // Log to console as required
      console.log("While Loop Tool Settings Saved:", {
        toolType: "while",
        nodeId,
        agentId,
        config,
        timestamp: new Date().toISOString(),
      });
      
      onSave(config);
      alert("While Loop settings saved successfully!");
    } catch (error) {
      console.error("Error saving while loop settings:", error);
      alert("Error saving settings");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b bg-blue-50">
        <div className="flex items-center gap-2">
          <RefreshCw className="h-5 w-5 text-blue-600" />
          <h3 className="font-semibold text-lg text-blue-900">While Loop</h3>
        </div>
        <p className="text-sm text-blue-700 mt-1">
          Repeat until condition is met
        </p>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Condition */}
        <div>
          <Label className="text-sm font-medium">Condition</Label>
          <Textarea
            placeholder="Enter condition ex output=&#34;any condition&#34;"
            value={condition}
            onChange={(e) => setCondition(e.target.value)}
            className="mt-1 font-mono"
            rows={3}
          />
        </div>

        {/* Enable Image/Video Generation */}
        <div className="flex items-center justify-between">
          <div>
            <Label className="text-sm font-medium">Enable Image/Video Generation</Label>
            <p className="text-xs text-gray-500">Generate media within the loop</p>
          </div>
          <Switch
            checked={enableMediaGeneration}
            onCheckedChange={setEnableMediaGeneration}
          />
        </div>

        {/* Media Generation Window - Only shown when enabled */}
        {enableMediaGeneration && (
          <div className="border rounded-lg p-4 space-y-4 bg-gray-50">
            <div className="flex items-center gap-2">
              {mediaType === "image" ? (
                <Image className="h-5 w-5 text-purple-600" />
              ) : (
                <Video className="h-5 w-5 text-purple-600" />
              )}
              <span className="font-medium text-sm">Media Generation</span>
            </div>

            {/* Media Type Selection */}
            <div>
              <Label className="text-sm font-medium">Media Type</Label>
              <Select value={mediaType} onValueChange={setMediaType}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select media type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="image">Image (DALL-E)</SelectItem>
                  <SelectItem value="video">Video (Sora)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Prompt Input */}
            <div>
              <Label className="text-sm font-medium">Prompt</Label>
              <Textarea
                placeholder={`Enter prompt for ${mediaType} generation...`}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="mt-1"
                rows={4}
              />
            </div>

            {/* Generate Button */}
            <Button
              className="w-full"
              onClick={handleGenerateMedia}
              disabled={generating || !prompt.trim()}
            >
              {generating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  {mediaType === "image" ? (
                    <Image className="h-4 w-4 mr-2" />
                  ) : (
                    <Video className="h-4 w-4 mr-2" />
                  )}
                  Generate {mediaType === "image" ? "Image" : "Video"}
                </>
              )}
            </Button>
          </div>
        )}
      </div>

      {/* Footer - Save button */}
      <div className="p-4 border-t">
        <Button
          className="w-full bg-blue-600 hover:bg-blue-700"
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

export default WhileLoopToolSettings;
