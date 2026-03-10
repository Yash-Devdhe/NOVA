"use client";

import React from "react";
import { ToolNode } from "../[agentId]/page";
import {
  GitBranch,
  RefreshCw,
  Workflow,
  Play,
  Square,
  ArrowRight,
  Globe,
  CheckCircle,
} from "lucide-react";

interface ToolPaletteProps {
  onAddNode: (node: ToolNode) => void;
}

/**
 * ToolPalette Component
 * Displays available tools that users can add to their agent workflow
 * Tools include: Start, End, If/Else, While Loop, Edge, API, UserApproval, Sub-Workflow
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
    type: "api",
    label: "API",
    icon: Globe,
    color: "bg-teal-100 text-teal-600",
    description: "Call an external API endpoint",
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
      case "api":
        return { name: "", method: "GET", apiUrl: "", includeApiKey: false, apiKey: "", bodyParams: "" };
      case "userApproval":
        return { name: "", message: "", options: ["Accept", "Deny"], selectedOption: "accept" };
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
          <li>- Click to add a tool</li>
          <li>- Drag nodes to reposition them</li>
          <li>- Select a node to edit its properties</li>
          <li>- Use Edge to connect nodes</li>
        </ul>
      </div>
    </div>
  );
};

export default ToolPalette;
