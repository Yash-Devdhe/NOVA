"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Save, CheckCircle, XCircle, UserCheck } from "lucide-react";

interface UserApprovalToolSettingsProps {
  nodeId: string;
  agentId: string;
  initialConfig?: {
    name?: string;
    message?: string;
    options?: string[];
  };
  onSave: (config: any) => void;
  onClose: () => void;
}

/**
 * UserApprovalToolSettings Component
 * Settings panel for User Approval tool - opens when clicking on User Approval tool
 * Contains: User Approval (bold), Pause for human to approve/reject, Name textbox, Message textbox, Save button
 * Options: Deny and Accept
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
  const [options] = useState(initialConfig.options || ["Deny", "Accept"]);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      const config = {
        name,
        message,
        options,
        nodeId,
        agentId,
        savedAt: Date.now(),
      };
      
      // Log to console as required
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
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b bg-pink-50">
        <div className="flex items-center gap-2">
          <UserCheck className="h-5 w-5 text-pink-600" />
          <h3 className="font-semibold text-lg text-pink-900">User Approval</h3>
        </div>
        <p className="text-sm text-pink-700 mt-1">
          Pause for a human to approve or reject a step
        </p>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Options Display */}
        <div>
          <Label className="text-sm font-medium">Approval Options</Label>
          <div className="flex gap-2 mt-2">
            <div className="flex items-center gap-2 px-3 py-2 bg-green-100 rounded-lg">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium text-green-700">Accept</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-2 bg-red-100 rounded-lg">
              <XCircle className="h-4 w-4 text-red-600" />
              <span className="text-sm font-medium text-red-700">Deny</span>
            </div>
          </div>
        </div>

        {/* Name */}
        <div>
          <Label className="text-sm font-medium">Name</Label>
          <Input
            placeholder="Enter approval step name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1"
          />
        </div>

        {/* Message to User */}
        <div>
          <Label className="text-sm font-medium">Message to Show User</Label>
          <Textarea
            placeholder="Describe the message to show to the user"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="mt-1"
            rows={4}
          />
        </div>
      </div>

      {/* Footer - Save button */}
      <div className="p-4 border-t">
        <Button
          className="w-full bg-pink-600 hover:bg-pink-700"
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

export default UserApprovalToolSettings;
