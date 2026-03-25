"use client";

import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import type { ToolNode } from '../../../types/agent-builder';

interface AgentPreviewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  agentId: string;
  agentName: string;
  nodes: ToolNode[];
}

const AgentPreviewModal: React.FC<AgentPreviewModalProps> = ({
  open,
  onOpenChange,
  agentId,
  agentName,
  nodes,
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col p-0">
        <DialogHeader className="p-6 border-b bg-gradient-to-r from-gray-50 to-slate-50">
          <DialogTitle className="text-xl font-bold text-slate-800">{agentName} Preview</DialogTitle>
        </DialogHeader>
        <div className="flex-1 overflow-auto p-6 bg-slate-900/50">
          <pre className="text-green-400 text-sm font-mono whitespace-pre-wrap">
            {`// Preview generated for Agent: ${agentName}
// Nodes: ${nodes.length}
// Ready to execute!`}
          </pre>
        </div>
        <div className="p-6 border-t bg-gray-50 flex gap-3">
          <Button 
            variant="outline"
            className="flex-1"
            onClick={() => onOpenChange(false)}
          >
            Close
          </Button>
          <Button className="flex-1 bg-green-600 hover:bg-green-700">
            Run Agent
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AgentPreviewModal;

