"use client";

import React from 'react';
import { Textarea } from '@/components/ui/textarea';

interface CodeEditorProps {
  code: string;
  onChange: (code: string) => void;
  agentName: string;
  nodes: any[];
  apiKeys: Record<string, string>;
}

const CodeEditor: React.FC<CodeEditorProps> = ({ code, onChange, agentName }) => {
  return (
    <div className="flex-1 flex flex-col bg-gray-900 text-green-400 p-4 h-full">
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-white font-medium">Custom Code for {agentName}</h4>
      </div>
      <Textarea
        value={code}
        onChange={(e) => onChange(e.target.value)}
        className="flex-1 resize-none bg-black/50 border-none text-green-400 font-mono text-sm p-4 focus-visible:ring-2 ring-green-400 focus-visible:outline-none"
        placeholder="// Write custom agent logic here..."
      />
    </div>
  );
};

export default CodeEditor;

