"use client";

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
    </div>
  );
};

export default NodePropertiesPanel;

