"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Play, Save, Copy, Check } from "lucide-react";

interface CodeEditorProps {
  code: string;
  onChange: (code: string) => void;
}

const CodeEditor: React.FC<CodeEditorProps> = ({ code, onChange }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRun = () => {
    try {
      // For safety, we'll just evaluate in a controlled manner
      // In production, this would be sent to a sandboxed environment
      console.log("Running code:", code);
      alert("Code execution would happen here. This is a demo.");
    } catch (error) {
      console.error("Code execution error:", error);
    }
  };

  const lineNumbers = code.split("\n").map((_, i) => i + 1);

  return (
    <div className="h-full flex flex-col bg-gray-900">
      {/* Editor Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-gray-800 border-b border-gray-700">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
          </div>
          <span className="text-gray-400 text-sm ml-2">custom-agent.js</span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCopy}
            className="text-gray-400 hover:text-white"
          >
            {copied ? (
              <Check className="h-4 w-4" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRun}
            className="text-gray-400 hover:text-white"
          >
            <Play className="h-4 w-4 mr-1" />
            Run
          </Button>
        </div>
      </div>

      {/* Editor Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Line Numbers */}
        <div className="w-12 bg-gray-800 border-r border-gray-700 text-right py-4">
          {lineNumbers.map((num) => (
            <div
              key={num}
              className="text-gray-500 text-sm pr-2 leading-6 font-mono"
            >
              {num}
            </div>
          ))}
        </div>

        {/* Code Area */}
        <textarea
          value={code}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 bg-gray-900 text-gray-100 p-4 font-mono text-sm leading-6 resize-none focus:outline-none"
          spellCheck={false}
          placeholder="// Write your custom agent code here..."
        />
      </div>

      {/* Editor Footer */}
      <div className="px-4 py-2 bg-gray-800 border-t border-gray-700 flex items-center justify-between">
        <span className="text-gray-500 text-xs">
          JavaScript • UTF-8 • {code.split("\n").length} lines
        </span>
        <div className="flex items-center gap-4">
          <span className="text-gray-500 text-xs">Ln 1, Col 1</span>
        </div>
      </div>

      {/* Helper Panel */}
      <div className="bg-gray-800 border-t border-gray-700 p-4">
        <h4 className="text-gray-400 text-sm font-medium mb-2">Available APIs</h4>
        <div className="grid grid-cols-2 gap-2 text-xs font-mono">
          <div className="text-blue-400">context.get(key)</div>
          <div className="text-blue-400">context.set(key, val)</div>
          <div className="text-blue-400">agent.call(name, args)</div>
          <div className="text-blue-400">http.get(url)</div>
          <div className="text-blue-400">http.post(url, body)</div>
          <div className="text-blue-400">db.query(table)</div>
        </div>
      </div>
    </div>
  );
};

export default CodeEditor;
