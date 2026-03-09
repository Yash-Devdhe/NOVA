// Code Generator for NOVA Agents
// Generates runnable JavaScript/TypeScript code from agent flow nodes

import { ToolNode } from "../app/agent-builder/[agentId]/page";

export interface GeneratedCode {
  javascript: string;
  python: string;
  typescript: string;
}

export function generateCodeFromNodes(agentName: string, nodes: ToolNode[], apiKeys: Record<string, string> = {}): GeneratedCode {
  const javascript = generateJavaScript(agentName, nodes, apiKeys);
  const python = generatePython(agentName, nodes, apiKeys);
  const typescript = generateTypeScript(agentName, nodes, apiKeys);

  return { javascript, python, typescript };
}

function generateJavaScript(agentName: string, nodes: ToolNode[], apiKeys: Record<string, string>): string {
  let code = `/**
 * NOVA Agent: ${agentName}
 * Generated from NOVA No-Code Virtual Agents Platform
 * 
 * This code can be run in Node.js or browser environments
 */

`;

  // Add API key configuration
  if (Object.keys(apiKeys).length > 0) {
    code += `// API Configuration\n`;
    code += `const API_KEYS = {\n`;
    Object.entries(apiKeys).forEach(([key, value]) => {
      code += `  ${key}: "${value.substring(0, 8)}...", // ${value.length} chars\n`;
    });
    code += `};\n\n`;
  }

  code += `// Agent Configuration\n`;
  code += `const AGENT_CONFIG = {\n`;
  code += `  name: "${agentName}",\n`;
  code += `  createdAt: new Date(),\n`;
  code += `  nodeCount: ${nodes.length},\n`;
  code += `};\n\n`;

  // Generate node handlers
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
        code += `    // LLM Node - Using OpenAI GPT\n`;
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
        if (node.config?.apiUrl) {
          code += `    const apiUrl = "${node.config.apiUrl}";\n`;
        }
        code += `    const response = await fetch("/api/custom-api", {\n`;
        code += `      method: "POST",\n`;
        code += `      headers: { "Content-Type": "application/json" },\n`;
        code += `      body: JSON.stringify({\n`;
        code += `        url: "${node.config?.apiUrl || ''}",\n`;
        code += `        method: "${node.config?.method || 'GET'}",\n`;
        code += `        apiKey: API_KEYS.${node.config?.apiKeyType || 'openai'}\n`;
        code += `      })\n`;
        code += `    });\n`;
        code += `    const data = await response.json();\n`;
        code += `    return { success: true, data, next: "${index < nodes.length - 1 ? `node_${index + 2}` : 'end'}" };\n`;
        break;
      case 'userApproval':
        code += `    // User Approval Node\n`;
        code += `    const approval = await waitForUserApproval(context);\n`;
        code += `    return { approved: approval, next: approval ? "${index < nodes.length - 1 ? `node_${index + 2}` : 'end'}" : null };\n`;
        break;
      case 'if':
        code += `    // If/Else Condition Node\n`;
        code += `    const condition = ${node.config?.condition || 'true'};\n`;
        code += `    return { condition, next: condition ? "${index < nodes.length - 1 ? `node_${index + 2}` : 'end'}" : null };\n`;
        break;
      case 'while':
        code += `    // While Loop Node\n`;
        code += `    const loopCondition = ${node.config?.condition || 'false'};\n`;
        code += `    return { loop: loopCondition, next: loopCondition ? "self" : "${index < nodes.length - 1 ? `node_${index + 2}` : 'end'}" };\n`;
        break;
      case 'end':
        code += `    console.log("✅ Agent completed");\n`;
        code += `    return { success: true, done: true };\n`;
        break;
      default:
        code += `    // ${node.type} node\n`;
        code += `    return { success: true, next: "${index < nodes.length - 1 ? `node_${index + 2}` : 'end'}" };\n`;
    }
    
    code += `  },\n`;
  });

  code += `};\n\n`;

  // Main agent runner
  code += `// Main Agent Runner\n`;
  code += `async function runAgent(input) {\n`;
  code += `  const context = { input, state: {}, history: [] };\n`;
  code += `  let currentNode = "start_1";\n`;
  code += `  \n`;
  code += `  while (currentNode && currentNode !== "end_1") {\n`;
  code += `    const handler = nodeHandlers[currentNode];\n`;
  code += `    if (!handler) break;\n`;
  code += `    \n`;
  code += `    const result = await handler(context);\n`;
  code += `    context.history.push({ node: currentNode, result });\n`;
  code += `    \n`;
  code += `    if (result.done) break;\n`;
  code += `    currentNode = result.next;\n`;
  code += `  }\n`;
  code += `  \n`;
  code += `  return context;\n`;
  code += `}\n\n`;

  // Helper functions
  code += `// Helper Functions\n`;
  code += `async function waitForUserApproval(context) {\n`;
  code += `  // In a real implementation, this would wait for user input\n`;
  code += `  return new Promise((resolve) => {\n`;
  code += `    console.log("Waiting for user approval...");\n`;
  code += `    // For demo, auto-approve after 5 seconds\n`;
  code += `    setTimeout(() => resolve(true), 5000);\n`;
  code += `  });\n`;
  code += `}\n\n`;

  // Weather API helper
  code += `// Weather API Helper\n`;
  code += `async function getWeather(city, apiKey) {\n`;
  code += `  const response = await fetch("/api/weather", {\n`;
  code += `    method: "POST",\n`;
  code += `    headers: { "Content-Type": "application/json" },\n`;
  code += `    body: JSON.stringify({ city, apiKey })\n`;
  code += `  });\n`;
  code += `  return await response.json();\n`;
  code += `}\n\n`;

  // Maps API helper
  code += `// Maps API Helper\n`;
  code += `async function getDirections(origin, destination, apiKey) {\n`;
  code += `  const response = await fetch("/api/maps", {\n`;
  code += `    method: "POST",\n`;
  code += `    headers: { "Content-Type": "application/json" },\n`;
  code += `    body: JSON.stringify({ action: "directions", origin, destination, apiKey })\n`;
  code += `  });\n`;
  code += `  return await response.json();\n`;
  code += `}\n\n`;

  // Video generation helper
  code += `// Video Generation Helper\n`;
  code += `async function generateVideo(prompt, userId) {\n`;
  code += `  const response = await fetch("/api/video", {\n`;
  code += `    method: "POST",\n`;
  code += `    headers: { "Content-Type": "application/json" },\n`;
  code += `    body: JSON.stringify({ prompt, userId })\n`;
  code += `  });\n`;
  code += `  return await response.json();\n`;
  code += `}\n\n`;

  // Audio generation helper
  code += `// Audio Generation Helper\n`;
  code += `async function generateAudio(text, userId) {\n`;
  code += `  const response = await fetch("/api/audio", {\n`;
  code += `    method: "POST",\n`;
  code += `    headers: { "Content-Type": "application/json" },\n`;
  code += `    body: JSON.stringify({ text, userId })\n`;
  code += `  });\n`;
  code += `  return await response.json();\n`;
  code += `}\n\n`;

  // Export and example usage
  code += `// Export for use in other modules\n`;
  code += `module.exports = { runAgent, getWeather, getDirections, generateVideo, generateAudio, AGENT_CONFIG };\n\n`;

  code += `// Example Usage\n`;
  code += `// runAgent("What's the weather in New York?").then(console.log);\n`;

  return code;
}

function generatePython(agentName: string, nodes: ToolNode[], apiKeys: Record<string, string>): string {
  let code = `"""
NOVA Agent: ${agentName}
Generated from NOVA No-Code Virtual Agents Platform

This code can be run in Python environments with required dependencies:
pip install requests aiohttp

Usage:
    python ${agentName.toLowerCase().replace(/\s+/g, '_')}_agent.py
"""

import asyncio
import requests
from typing import Dict, Any, Optional
from datetime import datetime

`;

  // Add API key configuration
  if (Object.keys(apiKeys).length > 0) {
    code += `# API Configuration\n`;
    code += `API_KEYS = {\n`;
    Object.entries(apiKeys).forEach(([key, value]) => {
      code += `    "${key}": "${value.substring(0, 8)}...",  # ${value.length} chars\n`;
    });
    code += `}\n\n`;
  }

  code += `# Agent Configuration\n`;
  code += `AGENT_CONFIG = {\n`;
  code += `    "name": "${agentName}",\n`;
  code += `    "created_at": datetime.now().isoformat(),\n`;
  code += `    "node_count": ${nodes.length},\n`;
  code += `}\n\n`;

  // Generate node handler classes
  code += `# Node Handlers\n`;
  code += `class AgentRunner:\n`;
  code += `    def __init__(self, config: Dict[str, Any] = None):\n`;
  code += `        self.config = config or {}\n`;
  code += `        self.context = {"state": {}, "history": []}\n`;
  code += `\n`;

  nodes.forEach((node, index) => {
    const methodName = `handle_${node.type}_${index + 1}`;
    code += `    async def ${methodName}(self) -> Dict[str, Any]:\n`;
    
    switch (node.type) {
      case 'start':
        code += `        print("🚀 Agent started: ${agentName}")\n`;
        code += `        return {"success": True, "next": "llm_2"}\n`;
        break;
      case 'llm':
        code += `        # LLM Node - Using OpenAI GPT\n`;
        code += `        prompt = self.context.get("input", "Hello")\n`;
        code += `        response = requests.post(\n`;
        code += `            "/api/openai",\n`;
        code += `            json={"prompt": prompt, "type": "chat"}\n`;
        code += `        )\n`;
        code += `        data = response.json()\n`;
        code += `        return {"success": True, "output": data.get("message"), "next": "api_3"}\n`;
        break;
      case 'api':
        code += `        # API Node - ${node.config?.name || 'Custom API'}\n`;
        code += `        response = requests.post(\n`;
        code += `            "/api/custom-api",\n`;
        code += `            json={\n`;
        code += `                "url": "${node.config?.apiUrl || ''}",\n`;
        code += `                "method": "${node.config?.method || 'GET'}"\n`;
        code += `            }\n`;
        code += `        )\n`;
        code += `        data = response.json()\n`;
        code += `        return {"success": True, "data": data, "next": "${index < nodes.length - 1 ? `node_${index + 2}` : 'end'}"}\n`;
        break;
      default:
        code += `        # ${node.type} node\n`;
        code += `        return {"success": True, "next": "${index < nodes.length - 1 ? `node_${index + 2}` : 'end'}"}\n`;
    }
    code += `\n`;
  });

  // Main runner
  code += `    async def run(self, input_text: str) -> Dict[str, Any]:\n`;
  code += `        self.context["input"] = input_text\n`;
  code += `        current_node = "start_1"\n`;
  code += `        \n`;
  code += `        while current_node and current_node != "end_1":\n`;
  code += `            handler = getattr(self, f"handle_{current_node}", None)\n`;
  code += `            if not handler:\n`;
  code += `                break\n`;
  code += `            \n`;
  code += `            result = await handler()\n`;
  code += `            self.context["history"].append({"node": current_node, "result": result})\n`;
  code += `            \n`;
  code += `            if result.get("done"):\n`;
  code += `                break\n`;
  code += `            current_node = result.get("next")\n`;
  code += `        \n`;
  code += `        return self.context\n`;
  code += `\n`;

  // Helper methods
  code += `    async def get_weather(self, city: str, api_key: str = None) -> Dict[str, Any]:\n`;
  code += `        response = requests.post(\n`;
  code += `            "/api/weather",\n`;
  code += `            json={"city": city, "apiKey": api_key}\n`;
  code += `        )\n`;
  code += `        return response.json()\n`;
  code += `\n`;

  code += `    async def get_directions(self, origin: str, destination: str, api_key: str) -> Dict[str, Any]:\n`;
  code += `        response = requests.post(\n`;
  code += `            "/api/maps",\n`;
  code += `            json={"action": "directions", "origin": origin, "destination": destination, "apiKey": api_key}\n`;
  code += `        )\n`;
  code += `        return response.json()\n`;
  code += `\n`;

  code += `    async def generate_video(self, prompt: str, user_id: str) -> Dict[str, Any]:\n`;
  code += `        response = requests.post(\n`;
  code += `            "/api/video",\n`;
  code += `            json={"prompt": prompt, "userId": user_id}\n`;
  code += `        )\n`;
  code += `        return response.json()\n`;
  code += `\n`;

  code += `    async def generate_audio(self, text: str, user_id: str) -> Dict[str, Any]:\n`;
  code += `        response = requests.post(\n`;
  code += `            "/api/audio",\n`;
  code += `            json={"text": text, "userId": user_id}\n`;
  code += `        )\n`;
  code += `        return response.json()\n`;
  code += `\n`;

  code += `# Main execution\n`;
  code += `if __name__ == "__main__":\n`;
  code += `    agent = AgentRunner(AGENT_CONFIG)\n`;
  code += `    result = asyncio.run(agent.run("Hello"))\n`;
  code += `    print(result)\n`;

  return code;
}

function generateTypeScript(agentName: string, nodes: ToolNode[], apiKeys: Record<string, string>): string {
  let code = `/**
 * NOVA Agent: ${agentName}
 * Generated from NOVA No-Code Virtual Agents Platform
 * 
 * This code can be run in Node.js or browser environments
 * TypeScript version with full type support
 */

`;

  // Add types
  code += `// Types\n`;
  code += `interface AgentContext {\n`;
  code += `  input: string;\n`;
  code += `  state: Record<string, any>;\n`;
  code += `  history: Array<{ node: string; result: any }>;\n`;
  code += `}\n\n`;
  code += `interface NodeResult {\n`;
  code += `  success: boolean;\n`;
  code += `  output?: any;\n`;
  code += `  next?: string | null;\n`;
  code += `  done?: boolean;\n`;
  code += `}\n\n`;

  // Add API key configuration
  if (Object.keys(apiKeys).length > 0) {
    code += `// API Configuration\n`;
    code += `const API_KEYS: Record<string, string> = {\n`;
    Object.entries(apiKeys).forEach(([key, value]) => {
      code += `  ${key}: "${value.substring(0, 8)}...", // ${value.length} chars\n`;
    });
    code += `};\n\n`;
  }

  code += `// Agent Configuration\n`;
  code += `const AGENT_CONFIG = {\n`;
  code += `  name: "${agentName}",\n`;
  code += `  createdAt: new Date(),\n`;
  code += `  nodeCount: ${nodes.length},\n`;
  code += `} as const;\n\n`;

  // Generate node handlers
  code += `// Node Handlers\n`;
  code += `const nodeHandlers: Record<string, (context: AgentContext) => Promise<NodeResult>> = {\n`;

  nodes.forEach((node, index) => {
    const handlerName = `${node.type}_${index + 1}`;
    code += `  "${handlerName}": async (context: AgentContext): Promise<NodeResult> => {\n`;
    
    switch (node.type) {
      case 'start':
        code += `    console.log("🚀 Agent started: ${agentName}");\n`;
        code += `    return { success: true, next: "llm_2" };\n`;
        break;
      case 'llm':
        code += `    // LLM Node - Using OpenAI GPT\n`;
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
        code += `    const apiResponse = await fetch("/api/custom-api", {\n`;
        code += `      method: "POST",\n`;
        code += `      headers: { "Content-Type": "application/json" },\n`;
        code += `      body: JSON.stringify({\n`;
        code += `        url: "${node.config?.apiUrl || ''}",\n`;
        code += `        method: "${node.config?.method || 'GET'}"\n`;
        code += `      })\n`;
        code += `    });\n`;
        code += `    const apiData = await apiResponse.json();\n`;
        code += `    return { success: true, data: apiData, next: "${index < nodes.length - 1 ? `node_${index + 2}` : 'end'}" };\n`;
        break;
      default:
        code += `    // ${node.type} node\n`;
        code += `    return { success: true, next: "${index < nodes.length - 1 ? `node_${index + 2}` : 'end'}" };\n`;
    }
    
    code += `  },\n`;
  });

  code += `};\n\n`;

  // Main agent runner
  code += `// Main Agent Runner\n`;
  code += `async function runAgent(input: string): Promise<AgentContext> {\n`;
  code += `  const context: AgentContext = { input, state: {}, history: [] };\n`;
  code += `  let currentNode: string | null = "start_1";\n`;
  code += `  \n`;
  code += `  while (currentNode && currentNode !== "end_1") {\n`;
  code += `    const handler = nodeHandlers[currentNode];\n`;
  code += `    if (!handler) break;\n`;
  code += `    \n`;
  code += `    const result = await handler(context);\n`;
  code += `    context.history.push({ node: currentNode, result });\n`;
  code += `    \n`;
  code += `    if (result.done) break;\n`;
  code += `    currentNode = result.next ?? null;\n`;
  code += `  }\n`;
  code += `  \n`;
  code += `  return context;\n`;
  code += `}\n\n`;

  // Helper functions with types
  code += `// Helper Functions\n`;
  code += `async function getWeather(city: string, apiKey?: string): Promise<any> {\n`;
  code += `  const response = await fetch("/api/weather", {\n`;
  code += `    method: "POST",\n`;
  code += `    headers: { "Content-Type": "application/json" },\n`;
  code += `    body: JSON.stringify({ city, apiKey })\n`;
  code += `  });\n`;
  code += `  return await response.json();\n`;
  code += `}\n\n`;

  code += `async function getDirections(origin: string, destination: string, apiKey: string): Promise<any> {\n`;
  code += `  const response = await fetch("/api/maps", {\n`;
  code += `    method: "POST",\n`;
  code += `    headers: { "Content-Type": "application/json" },\n`;
  code += `    body: JSON.stringify({ action: "directions", origin, destination, apiKey })\n`;
  code += `  });\n`;
  code += `  return await response.json();\n`;
  code += `}\n\n`;

  code += `async function generateVideo(prompt: string, userId: string): Promise<any> {\n`;
  code += `  const response = await fetch("/api/video", {\n`;
  code += `    method: "POST",\n`;
  code += `    headers: { "Content-Type": "application/json" },\n`;
  code += `    body: JSON.stringify({ prompt, userId })\n`;
  code += `  });\n`;
  code += `  return await response.json();\n`;
  code += `}\n\n`;

  code += `async function generateAudio(text: string, userId: string): Promise<any> {\n`;
  code += `  const response = await fetch("/api/audio", {\n`;
  code += `    method: "POST",\n`;
  code += `    headers: { "Content-Type": "application/json" },\n`;
  code += `    body: JSON.stringify({ text, userId })\n`;
  code += `  });\n`;
  code += `  return await response.json();\n`;
  code += `}\n\n`;

  // Export
  code += `// Export for use in other modules\n`;
  code += `export { runAgent, getWeather, getDirections, generateVideo, generateAudio, AGENT_CONFIG };\n\n`;

  code += `// Example Usage\n`;
  code += `// runAgent("What's the weather in New York?").then(console.log);\n`;

  return code;
}

