"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Play, Copy, Check, Download, FileCode } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface CodeEditorProps {
  code: string;
  onChange: (code: string) => void;
  agentName?: string;
  nodes?: any[];
  apiKeys?: Record<string, string>;
}

const CodeEditor: React.FC<CodeEditorProps> = ({ 
  code, 
  onChange, 
  agentName = "MyAgent", 
  nodes = [], 
  apiKeys = {} 
}) => {
  const [copied, setCopied] = useState(false);
  const [language, setLanguage] = useState("javascript");
  const [showGenerate, setShowGenerate] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const extensions: Record<string, string> = {
      javascript: "js",
      python: "py",
      typescript: "ts",
    };
    
    const blob = new Blob([code], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${agentName.toLowerCase().replace(/\s+/g, "_")}_agent.${extensions[language]}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleRun = () => {
    try {
      console.log("Running code:", code);
      alert("Code execution would happen here. This is a demo.");
    } catch (error) {
      console.error("Code execution error:", error);
    }
  };

  const generateCode = () => {
    let generatedCode = "";
    
    if (language === "javascript") {
      generatedCode = generateJavaScript(agentName, nodes, apiKeys);
    } else if (language === "python") {
      generatedCode = generatePython(agentName, nodes, apiKeys);
    } else if (language === "typescript") {
      generatedCode = generateTypeScript(agentName, nodes, apiKeys);
    }
    
    onChange(generatedCode);
    setShowGenerate(false);
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
          <span className="text-gray-400 text-sm ml-2">
            custom-agent.{language === 'javascript' ? 'js' : language === 'python' ? 'py' : 'ts'}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Select value={language} onValueChange={setLanguage}>
            <SelectTrigger className="w-32 h-7 bg-gray-700 border-gray-600 text-gray-300 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="javascript">JavaScript</SelectItem>
              <SelectItem value="python">Python</SelectItem>
              <SelectItem value="typescript">TypeScript</SelectItem>
            </SelectContent>
          </Select>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowGenerate(!showGenerate)}
            className="text-gray-400 hover:text-white"
          >
            <FileCode className="h-4 w-4 mr-1" />
            Generate
          </Button>
          
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
            onClick={handleDownload}
            className="text-gray-400 hover:text-white"
          >
            <Download className="h-4 w-4" />
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

      {/* Generate Code Panel */}
      {showGenerate && (
        <div className="bg-gray-800 border-b border-gray-700 p-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-gray-300 text-sm font-medium">Generate Agent Code</h4>
              <p className="text-gray-500 text-xs">Generate runnable code from your agent flow</p>
            </div>
            <Button size="sm" onClick={generateCode} className="bg-blue-600 hover:bg-blue-700">
              <FileCode className="h-4 w-4 mr-1" />
              Generate Code
            </Button>
          </div>
          <div className="mt-2 text-xs text-gray-500">
            Language: {language} | Nodes: {nodes.length} | Agent: {agentName}
          </div>
        </div>
      )}

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
          {language === 'javascript' ? 'JavaScript' : language === 'python' ? 'Python' : 'TypeScript'} • UTF-8 • {code.split("\n").length} lines
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
          <div className="text-green-400">getWeather(city)</div>
          <div className="text-green-400">getDirections(o, d)</div>
          <div className="text-purple-400">generateVideo(prompt)</div>
          <div className="text-purple-400">generateAudio(text)</div>
        </div>
      </div>
    </div>
  );
};

// Code generation functions
function generateJavaScript(agentName: string, nodes: any[], _apiKeys: Record<string, string>): string {
  let code = `/**
 * NOVA Agent: ${agentName}
 * Generated from NOVA No-Code Virtual Agents Platform
 * 
 * This code can be run in Node.js or browser environments
 */

`;

  code += `// Agent Configuration\n`;
  code += `const AGENT_CONFIG = {\n`;
  code += `  name: "${agentName}",\n`;
  code += `  createdAt: new Date(),\n`;
  code += `  nodeCount: ${nodes.length},\n`;
  code += `};\n\n`;

  code += `// Node Handlers\n`;
  code += `const nodeHandlers = {\n`;

  nodes.forEach((node, index) => {
    const handlerName = `${node.type}_${index + 1}`;
    code += `  ${handlerName}: async (context) => {\n`;
    
    switch (node.type) {
      case 'start':
        code += `    console.log("🚀 Agent started: ${agentName}");\n`;
        code += `    return { success: true, next: "llm_2" };\n`;
        break;
      case 'llm':
        code += `    // LLM Node\n`;
        code += `    const prompt = context.input || "Hello";\n`;
        code += `    const response = await fetch("/api/openai", {\n`;
        code += `      method: "POST",\n`;
        code += `      headers: { "Content-Type": "application/json" },\n`;
        code += `      body: JSON.stringify({ prompt, type: "chat" })\n`;
        code += `    });\n`;
        code += `    const data = await response.json();\n`;
        code += `    return { success: true, output: data.message, next: "api_3" };\n`;
        break;
      case 'api':
        code += `    // API Node - ${node.config?.name || 'Custom API'}\n`;
        code += `    const response = await fetch("/api/custom-api", {\n`;
        code += `      method: "POST",\n`;
        code += `      headers: { "Content-Type": "application/json" },\n`;
        code += `      body: JSON.stringify({\n`;
        code += `        url: "${node.config?.apiUrl || ''}",\n`;
        code += `        method: "${node.config?.method || 'GET'}"\n`;
        code += `      })\n`;
        code += `    });\n`;
        code += `    const data = await response.json();\n`;
        code += `    return { success: true, data, next: "${index < nodes.length - 1 ? `node_${index + 2}` : 'end'}" };\n`;
        break;
      case 'end':
        code += `    console.log("✅ Agent completed");\n`;
        code += `    return { success: true, done: true };\n`;
        break;
      default:
        code += `    return { success: true, next: "${index < nodes.length - 1 ? `node_${index + 2}` : 'end'}" };\n`;
    }
    
    code += `  },\n`;
  });

  code += `};\n\n`;

  code += `// Main Agent Runner\n`;
  code += `async function runAgent(input) {\n`;
  code += `  const context = { input, state: {}, history: [] };\n`;
  code += `  let currentNode = "start_1";\n`;
  code += `  \n`;
  code += `  while (currentNode && currentNode !== "end_1") {\n`;
  code += `    const handler = nodeHandlers[currentNode];\n`;
  code += `    if (!handler) break;\n`;
  code += `    const result = await handler(context);\n`;
  code += `    context.history.push({ node: currentNode, result });\n`;
  code += `    if (result.done) break;\n`;
  code += `    currentNode = result.next;\n`;
  code += `  }\n`;
  code += `  return context;\n`;
  code += `}\n\n`;

  code += `// Helper Functions\n`;
  code += `async function getWeather(city) {\n`;
  code += `  const response = await fetch("/api/weather", {\n`;
  code += `    method: "POST",\n`;
  code += `    headers: { "Content-Type": "application/json" },\n`;
  code += `    body: JSON.stringify({ city })\n`;
  code += `  });\n`;
  code += `  return await response.json();\n`;
  code += `}\n\n`;

  code += `async function getDirections(origin, destination) {\n`;
  code += `  const response = await fetch("/api/maps", {\n`;
  code += `    method: "POST",\n`;
  code += `    headers: { "Content-Type": "application/json" },\n`;
  code += `    body: JSON.stringify({ action: "directions", origin, destination })\n`;
  code += `  });\n`;
  code += `  return await response.json();\n`;
  code += `}\n\n`;

  code += `async function generateVideo(prompt, userId) {\n`;
  code += `  const response = await fetch("/api/video", {\n`;
  code += `    method: "POST",\n`;
  code += `    headers: { "Content-Type": "application/json" },\n`;
  code += `    body: JSON.stringify({ prompt, userId })\n`;
  code += `  });\n`;
  code += `  return await response.json();\n`;
  code += `}\n\n`;

  code += `async function generateAudio(text, userId) {\n`;
  code += `  const response = await fetch("/api/audio", {\n`;
  code += `    method: "POST",\n`;
  code += `    headers: { "Content-Type": "application/json" },\n`;
  code += `    body: JSON.stringify({ text, userId })\n`;
  code += `  });\n`;
  code += `  return await response.json();\n`;
  code += `}\n\n`;

  code += `module.exports = { runAgent, getWeather, getDirections, generateVideo, generateAudio, AGENT_CONFIG };\n`;

  return code;
}

function generatePython(agentName: string, nodes: any[], _apiKeys: Record<string, string>): string {
  let code = `"""
NOVA Agent: ${agentName}
Generated from NOVA No-Code Virtual Agents Platform
"""

import asyncio
import requests
from typing import Dict, Any
`;

  code += `\nAGENT_CONFIG = {\n`;
  code += `    "name": "${agentName}",\n`;
  code += `    "node_count": ${nodes.length},\n`;
  code += `}\n\n`;

  code += `class AgentRunner:\n`;
  code += `    def __init__(self):\n`;
  code += `        self.context = {"state": {}, "history": []}\n`;
  code += `\n`;

  code += `    async def run(self, input_text: str) -> Dict[str, Any]:\n`;
  code += `        self.context["input"] = input_text\n`;
  code += `        current_node = "start_1"\n`;
  code += `        while current_node and current_node != "end_1":\n`;
  code += `            result = await self.handle_node(current_node)\n`;
  code += `            self.context["history"].append({"node": current_node, "result": result})\n`;
  code += `            if result.get("done"):\n`;
  code += `                break\n`;
  code += `            current_node = result.get("next")\n`;
  code += `        return self.context\n`;
  code += `\n`;

  code += `    async def get_weather(self, city: str) -> Dict[str, Any]:\n`;
  code += `        response = requests.post("/api/weather", json={"city": city})\n`;
  code += `        return response.json()\n`;
  code += `\n`;

  code += `    async def get_directions(self, origin: str, destination: str) -> Dict[str, Any]:\n`;
  code += `        response = requests.post("/api/maps", json={"action": "directions", "origin": origin, "destination": destination})\n`;
  code += `        return response.json()\n`;
  code += `\n`;

  code += `if __name__ == "__main__":\n`;
  code += `    agent = AgentRunner()\n`;
  code += `    result = asyncio.run(agent.run("Hello"))\n`;
  code += `    print(result)\n`;

  return code;
}

function generateTypeScript(agentName: string, nodes: any[], _apiKeys: Record<string, string>): string {
  let code = `/**
 * NOVA Agent: ${agentName}
 * Generated from NOVA No-Code Virtual Agents Platform
 * TypeScript version
 */

`;

  code += `interface AgentContext {\n`;
  code += `  input: string;\n`;
  code += `  state: Record<string, any>;\n`;
  code += `  history: Array<{ node: string; result: any }>;\n`;
  code += `}\n\n`;

  code += `const AGENT_CONFIG = {\n`;
  code += `  name: "${agentName}",\n`;
  code += `  nodeCount: ${nodes.length},\n`;
  code += `};\n\n`;

  code += `async function runAgent(input: string): Promise<AgentContext> {\n`;
  code += `  const context: AgentContext = { input, state: {}, history: [] };\n`;
  code += `  let currentNode: string | null = "start_1";\n`;
  code += `  \n`;
  code += `  while (currentNode && currentNode !== "end_1") {\n`;
  code += `    const result = await handleNode(currentNode, context);\n`;
  code += `    context.history.push({ node: currentNode, result });\n`;
  code += `    if (result.done) break;\n`;
  code += `    currentNode = result.next ?? null;\n`;
  code += `  }\n`;
  code += `  return context;\n`;
  code += `}\n\n`;

  code += `async function getWeather(city: string): Promise<any> {\n`;
  code += `  const response = await fetch("/api/weather", {\n`;
  code += `    method: "POST",\n`;
  code += `    headers: { "Content-Type": "application/json" },\n`;
  code += `    body: JSON.stringify({ city })\n`;
  code += `  });\n`;
  code += `  return await response.json();\n`;
  code += `}\n\n`;

  code += `async function getDirections(origin: string, destination: string): Promise<any> {\n`;
  code += `  const response = await fetch("/api/maps", {\n`;
  code += `    method: "POST",\n`;
  code += `    headers: { "Content-Type": "application/json" },\n`;
  code += `    body: JSON.stringify({ action: "directions", origin, destination })\n`;
  code += `  });\n`;
  code += `  return await response.json();\n`;
  code += `}\n\n`;

  code += `export { runAgent, getWeather, getDirections, AGENT_CONFIG };\n`;

  return code;
}

export default CodeEditor;

