"use client";

import React from "react";
import { ToolNode } from "../[agentId]/page";
import { 
  GitBranch, 
  RefreshCw, 
  Bot, 
  Code, 
  MessageSquare, 
  Workflow,
  Play,
  Square,
  ArrowRight,
  Globe,
  CheckCircle,
  XCircle
} from "lucide-react";

interface ToolPaletteProps {
  onAddNode: (node: ToolNode) => void;
}

/**
 * ToolPalette Component
 * Displays available tools that users can add to their agent workflow
 * Tools include: Start, End, If/Else, While Loop, Edge, Agent, LLM, API, UserApproval, Sub-Workflow
 */
const tools = [
  {
    type: "start",
    label: "Start",
    icon: Play,
    color: "bg-green-100 text-green-600",
    description: "Starting point of the workflow",
  },
  {
    type: "end",
    label: "End",
    icon: Square,
    color: "bg-red-100 text-red-600",
    description: "Ending point of the workflow",
  },
  {
    type: "if",
    label: "If/Else",
    icon: GitBranch,
    color: "bg-purple-100 text-purple-600",
    description: "Conditional branching",
  },
  {
    type: "while",
    label: "While Loop",
    icon: RefreshCw,
    color: "bg-blue-100 text-blue-600",
    description: "Repeat until condition is met",
  },
  {
    type: "edge",
    label: "Edge",
    icon: ArrowRight,
    color: "bg-cyan-100 text-cyan-600",
    description: "Connect two nodes",
  },
  {
    type: "agent",
    label: "Agent",
    icon: Bot,
    color: "bg-yellow-100 text-yellow-600",
    description: "Call another agent with custom settings",
  },
  {
    type: "api",
    label: "API",
    icon: Globe,
    color: "bg-teal-100 text-teal-600",
    description: "Call an external API endpoint",
  },
  {
    type: "llm",
    label: "LLM",
    icon: MessageSquare,
    color: "bg-indigo-100 text-indigo-600",
    description: "Large Language Model",
  },
  {
    type: "userApproval",
    label: "User Approval",
    icon: CheckCircle,
    color: "bg-pink-100 text-pink-600",
    description: "Pause for human approval",
  },
  {
    type: "workflow",
    label: "Sub-Workflow",
    icon: Workflow,
    color: "bg-orange-100 text-orange-600",
    description: "Call another workflow",
  },
];

const ToolPalette: React.FC<ToolPaletteProps> = ({ onAddNode }) => {
  const handleDragStart = (e: React.DragEvent, toolType: string) => {
    e.dataTransfer.setData("toolType", toolType);
    e.dataTransfer.effectAllowed = "copy";
  };

  const handleClick = (toolType: string) => {
    const newNode: ToolNode = {
      id: `${toolType}-${Date.now()}`,
      type: toolType as ToolNode["type"],
      position: { x: 150 + Math.random() * 200, y: 150 + Math.random() * 200 },
      config: getDefaultConfig(toolType),
    };
    onAddNode(newNode);
  };

  const getDefaultConfig = (type: string): Record<string, any> => {
    switch (type) {
      case "if":
        return { condition: "", elseCondition: "" };
      case "while":
        return { condition: "" };
      case "edge":
        return { source: "", target: "" };
      case "agent":
        return { agentId: "", action: "", params: {} };
      case "llm":
        return { model: "gpt-4", prompt: "", temperature: 0.7 };
      case "code":
        return { language: "javascript", code: "" };
      case "workflow":
        return { workflowId: "", input: {} };
      default:
        return {};
    }
  };

  return (
    <div className="p-4">
      <h2 className="font-semibold text-lg mb-4">Toolbox</h2>
      <p className="text-sm text-gray-500 mb-4">
        Click or drag tools to add them to the canvas
      </p>
      <div className="space-y-2">
        {tools.map((tool) => (
          <div
            key={tool.type}
            draggable
            onDragStart={(e) => handleDragStart(e, tool.type)}
            onClick={() => handleClick(tool.type)}
            className="flex items-center gap-3 p-3 rounded-lg border bg-white hover:bg-gray-50 cursor-pointer transition-all hover:shadow-md"
          >
            <div className={`p-2 rounded-lg ${tool.color}`}>
              <tool.icon className="h-5 w-5" />
            </div>
            <div>
              <p className="font-medium text-sm">{tool.label}</p>
              <p className="text-xs text-gray-500">{tool.description}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h3 className="font-medium text-sm text-blue-800 mb-2">Quick Tips</h3>
        <ul className="text-xs text-blue-600 space-y-1">
          <li>• Click to add a tool</li>
          <li>• Drag to reposition</li>
          <li>•</li>
          <li>• Select to edit properties Connect nodes by dragging</li>
        </ul>
      </div>
    </div>
  );
};

export default ToolPalette;
