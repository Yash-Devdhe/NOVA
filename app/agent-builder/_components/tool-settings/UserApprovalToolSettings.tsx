"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Save, UserCheck, CheckCircle, XCircle, MessageSquare, AlertTriangle } from "lucide-react";

interface UserApprovalToolSettingsProps {
  nodeId: string;
  agentId: string;
  initialConfig?: {
    name?: string;
    message?: string;
    options?: string[];
    selectedOption?: string;
  };
  onSave: (config: any) => void;
  onClose: () => void;
}

/**
 * UserApprovalToolSettings Component
 * Settings panel for User Approval tool with Accept/Reject options
 */
const UserApprovalToolSettings: React.FC<UserApprovalToolSettingsProps> = ({
  nodeId,
  agentId,
  initialConfig = {},
  onSave,
  onClose,
}) => {
  const [name, setName] = useState(initialConfig.name || "");
  const [message, setMessage] = useState(initialConfig.message || "");
  const [selectedOption, setSelectedOption] = useState(initialConfig.selectedOption || "accept");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      const config = {
        name,
        message,
        options: ["Accept", "Deny"],
        selectedOption,
        nodeId,
        agentId,
        savedAt: Date.now(),
      };
      
      console.log("User Approval Tool Settings Saved:", {
        toolType: "userApproval",
        nodeId,
        agentId,
        config,
        timestamp: new Date().toISOString(),
      });
      
      onSave(config);
      alert("User Approval settings saved successfully!");
    } catch (error) {
      console.error("Error saving user approval settings:", error);
      alert("Error saving settings");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="p-4 border-b bg-white shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-pink-100 rounded-lg">
              <UserCheck className="h-5 w-5 text-pink-600" />
            </div>
            <div>
              <h3 className="font-semibold text-lg text-gray-900">User Approval</h3>
              <p className="text-sm text-gray-500">
                Pause for human approval or rejection
              </p>
            </div>
          </div>
          <Badge variant="outline" className="bg-pink-50 text-pink-700 border-pink-200">
            Required
          </Badge>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Approval Options Card */}
        <Card className="border-gray-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              Approval Options
            </CardTitle>
            <CardDescription>
              User will choose one of these options
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RadioGroup 
              value={selectedOption} 
              onValueChange={setSelectedOption}
              className="grid grid-cols-2 gap-3"
            >
              <label 
                className={`flex flex-col items-center justify-center p-4 rounded-lg border-2 cursor-pointer transition-all ${
                  selectedOption === "accept" 
                    ? "border-green-500 bg-green-50" 
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <RadioGroupItem value="accept" className="sr-only" />
                <div className={`p-3 rounded-full mb-2 ${
                  selectedOption === "accept" ? "bg-green-100" : "bg-gray-100"
                }`}>
                  <CheckCircle className={`h-6 w-6 ${
                    selectedOption === "accept" ? "text-green-600" : "text-gray-400"
                  }`} />
                </div>
                <span className={`font-medium ${
                  selectedOption === "accept" ? "text-green-700" : "text-gray-700"
                }`}>Accept</span>
                <span className="text-xs text-gray-500 mt-1">Proceed with action</span>
              </label>

              <label 
                className={`flex flex-col items-center justify-center p-4 rounded-lg border-2 cursor-pointer transition-all ${
                  selectedOption === "deny" 
                    ? "border-red-500 bg-red-50" 
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <RadioGroupItem value="deny" className="sr-only" />
                <div className={`p-3 rounded-full mb-2 ${
                  selectedOption === "deny" ? "bg-red-100" : "bg-gray-100"
                }`}>
                  <XCircle className={`h-6 w-6 ${
                    selectedOption === "deny" ? "text-red-600" : "text-gray-400"
                  }`} />
                </div>
                <span className={`font-medium ${
                  selectedOption === "deny" ? "text-red-700" : "text-gray-700"
                }`}>Deny</span>
                <span className="text-xs text-gray-500 mt-1">Stop and reject</span>
              </label>
            </RadioGroup>
          </CardContent>
        </Card>

        {/* Configuration Card */}
        <Card className="border-gray-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Configuration</CardTitle>
            <CardDescription>
              Set up the approval request details
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Name */}
            <div>
              <Label className="text-xs font-medium text-gray-700">Approval Step Name</Label>
              <Input
                placeholder="e.g., Approve Payment"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1"
              />
            </div>

            {/* Message to User */}
            <div>
              <Label className="text-xs font-medium text-gray-700 flex items-center gap-2">
                <MessageSquare className="h-3 w-3" />
                Message to Show User
              </Label>
              <Textarea
                placeholder="Describe what the user needs to approve or deny..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="mt-1"
                rows={4}
              />
              <p className="text-xs text-gray-500 mt-1">
                This message will be displayed to the user when they need to make a decision
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Preview Card */}
        <Card className="border-gray-200 bg-gradient-to-br from-pink-50 to-rose-50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-pink-600" />
              Preview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="p-4 bg-white rounded-lg border border-pink-100 shadow-sm">
              <p className="text-sm text-gray-600 mb-3">
                {message || "Your approval message will appear here..."}
              </p>
              <div className="flex gap-2">
                <Button 
                  variant="default" 
                  className="flex-1 bg-green-600 hover:bg-green-700"
                  size="sm"
                >
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Accept
                </Button>
                <Button 
                  variant="destructive" 
                  className="flex-1"
                  size="sm"
                >
                  <XCircle className="h-4 w-4 mr-1" />
                  Deny
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Footer */}
      <div className="p-4 border-t bg-white">
        <Button
          className="w-full bg-pink-600 hover:bg-pink-700"
          onClick={handleSave}
          disabled={saving}
        >
          <Save className="h-4 w-4 mr-2" />
          {saving ? "Saving..." : "Save Configuration"}
        </Button>
      </div>
    </div>
  );
};

export default UserApprovalToolSettings;

