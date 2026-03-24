"use client";

import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Play, Brain, Zap, Code, Workflow, MessageSquare } from 'lucide-react';
import type { ToolNode } from '../../../types/AgentType';

interface ToolPaletteProps {
  onAddNode: (node: ToolNode) => void;
}

const ToolPalette: React.FC<ToolPaletteProps> = ({ onAddNode }) => {
  const tools = [
    { type: 'llm' as const, label: 'LLM', icon: Brain, desc: 'AI Language Model' },
    { type: 'api' as const, label: 'API', icon: Zap, desc: 'API Call' },
    { type: 'code' as const, label: 'Code', icon: Code, desc: 'Custom Code' },
    { type: 'agent' as const, label: 'Agent', icon: Play, desc: 'Sub-Agent' },
    { type: 'workflow' as const, label: 'Workflow', icon: Workflow, desc: 'Workflow Node' },
    { type: 'userApproval' as const, label: 'User Approval', icon: MessageSquare, desc: 'Wait for User' },
  ];

  return (
    <div className="p-4 space-y-2 border-r">
      <h3 className="font-semibold text-sm mb-4">Tool Palette</h3>
      {tools.map((tool) => (
        <Button
          key={tool.type}
          variant="outline"
          size="sm"
          className="w-full justify-start"
          onClick={() => onAddNode({
            id: `tool-${tool.type}-${Date.now()}`,
            type: tool.type,
            position: { x: 300, y: 200 },
            config: { name: tool.label },
          })}
        >
          <tool.icon className="h-4 w-4 mr-2" />
          {tool.label}
          <span className="ml-auto text-xs opacity-75">{tool.desc}</span>
        </Button>
      ))}
    </div>
  );
};

export default ToolPalette;

