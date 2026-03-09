"use client";

import React, { useState, useRef, useEffect } from "react";
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
  Trash2,
  X,
  ArrowRight,
  Globe,
  CheckCircle
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface AgentCanvasProps {
  nodes: ToolNode[];
  selectedNode: ToolNode | null;
  onNodeSelect: (node: ToolNode | null) => void;
  onUpdateNode: (node: ToolNode) => void;
  onDeleteNode: (nodeId: string) => void;
}

const nodeIcons: Record<string, React.ElementType> = {
  start: Play,
  end: Square,
  if: GitBranch,
  while: RefreshCw,
  edge: ArrowRight,
  agent: Bot,
  api: Globe,
  llm: MessageSquare,
  code: Code,
  workflow: Workflow,
  userApproval: CheckCircle,
};

const nodeColors: Record<string, string> = {
  start: "bg-green-100 border-green-300",
  end: "bg-red-100 border-red-300",
  if: "bg-purple-100 border-purple-300",
  while: "bg-blue-100 border-blue-300",
  edge: "bg-cyan-100 border-cyan-300",
  agent: "bg-yellow-100 border-yellow-300",
  api: "bg-teal-100 border-teal-300",
  llm: "bg-indigo-100 border-indigo-300",
  code: "bg-gray-100 border-gray-300",
  workflow: "bg-orange-100 border-orange-300",
  userApproval: "bg-pink-100 border-pink-300",
};

// If/Else Config Panel
const IfElseConfigPanel: React.FC<{
  node: ToolNode;
  onUpdateNode: (node: ToolNode) => void;
  onClose: () => void;
}> = ({ node, onUpdateNode, onClose }) => {
  const [condition, setCondition] = useState(node.config?.condition || "");

  const handleConditionChange = (value: string) => {
    setCondition(value);
    onUpdateNode({ ...node, config: { ...node.config, condition: value } });
  };

  const handleSave = () => {
    console.log("If/Else Tool Settings Saved:", {
      toolType: "if",
      nodeId: node.id,
      config: { condition },
      timestamp: new Date().toISOString(),
    });
    onClose();
  };

  return (
    <div className="absolute z-20 w-[320px] bg-white rounded-lg shadow-xl border border-purple-200 mt-2">
      <div className="flex items-center justify-between p-3 border-b bg-purple-50 rounded-t-lg">
        <div className="flex items-center gap-2">
          <GitBranch className="h-4 w-4 text-purple-600" />
          <span className="font-bold text-sm text-purple-900">If/Else</span>
        </div>
        <button onClick={onClose} className="p-1 hover:bg-purple-100 rounded">
          <X className="h-4 w-4 text-purple-600" />
        </button>
      </div>
      <div className="p-3 border-b bg-purple-50/50">
        <p className="text-xs text-purple-700">Create conditions to branch your workflow</p>
      </div>
      <div className="p-3 border-b">
        <Label className="text-xs font-medium text-gray-600">if</Label>
        <Input
          placeholder="Enter condition ex output='any condition'"
          value={condition}
          onChange={(e) => handleConditionChange(e.target.value)}
          className="mt-1 text-sm font-mono"
        />
      </div>
      <div className="p-3">
        <button
          onClick={handleSave}
          className="w-full py-2 bg-purple-600 text-white rounded-lg font-medium text-sm hover:bg-purple-700 transition-colors"
        >
          Save
        </button>
      </div>
    </div>
  );
};

// While Loop Config Panel
const WhileLoopConfigPanel: React.FC<{
  node: ToolNode;
  onUpdateNode: (node: ToolNode) => void;
  onClose: () => void;
}> = ({ node, onUpdateNode, onClose }) => {
  const [condition, setCondition] = useState(node.config?.condition || "");

  const handleConditionChange = (value: string) => {
    setCondition(value);
    onUpdateNode({ ...node, config: { ...node.config, condition: value } });
  };

  return (
    <div className="absolute z-20 w-[280px] bg-white rounded-lg shadow-xl border border-blue-200 mt-2">
      <div className="flex items-center justify-between p-3 border-b bg-blue-50 rounded-t-lg">
        <div className="flex items-center gap-2">
          <RefreshCw className="h-4 w-4 text-blue-600" />
          <span className="font-medium text-sm text-blue-900">While Loop</span>
        </div>
        <button onClick={onClose} className="p-1 hover:bg-blue-100 rounded">
          <X className="h-4 w-4 text-blue-600" />
        </button>
      </div>
      <div className="p-3">
        <Label className="text-xs font-medium text-gray-600">Condition</Label>
        <Input
          placeholder="e.g., counter < 10"
          value={condition}
          onChange={(e) => handleConditionChange(e.target.value)}
          className="mt-1 text-sm font-mono"
        />
      </div>
    </div>
  );
};

// API Config Panel
const APIConfigPanel: React.FC<{
  node: ToolNode;
  onUpdateNode: (node: ToolNode) => void;
  onClose: () => void;
}> = ({ node, onUpdateNode, onClose }) => {
  const [name, setName] = useState(node.config?.name || "");
  const [apiUrl, setApiUrl] = useState(node.config?.apiUrl || "");
  const [method, setMethod] = useState(node.config?.method || "GET");
  const [apiKey, setApiKey] = useState(node.config?.apiKey || "");

  const handleNameChange = (value: string) => {
    setName(value);
    onUpdateNode({ ...node, config: { ...node.config, name: value } });
  };

  const handleApiUrlChange = (value: string) => {
    setApiUrl(value);
    onUpdateNode({ ...node, config: { ...node.config, apiUrl: value } });
  };

  const handleMethodChange = (value: string) => {
    setMethod(value);
    onUpdateNode({ ...node, config: { ...node.config, method: value } });
  };

  const handleApiKeyChange = (value: string) => {
    setApiKey(value);
    onUpdateNode({ ...node, config: { ...node.config, apiKey: value } });
  };

  return (
    <div className="absolute z-20 w-[320px] bg-white rounded-lg shadow-xl border border-teal-200 mt-2">
      <div className="flex items-center justify-between p-3 border-b bg-teal-50 rounded-t-lg">
        <div className="flex items-center gap-2">
          <Globe className="h-4 w-4 text-teal-600" />
          <span className="font-bold text-sm text-teal-900">API Tool</span>
        </div>
        <button onClick={onClose} className="p-1 hover:bg-teal-100 rounded">
          <X className="h-4 w-4 text-teal-600" />
        </button>
      </div>
      <div className="p-3 border-b bg-teal-50/50">
        <p className="text-xs text-teal-700">Configure external API endpoint</p>
      </div>
      <div className="p-3 space-y-3">
        <div>
          <Label className="text-xs font-medium text-gray-600">Tool Name</Label>
          <Input
            placeholder="My API Call"
            value={name}
            onChange={(e) => handleNameChange(e.target.value)}
            className="mt-1 text-sm"
          />
        </div>
        <div>
          <Label className="text-xs font-medium text-gray-600">API URL</Label>
          <Input
            placeholder="https://api.example.com/endpoint"
            value={apiUrl}
            onChange={(e) => handleApiUrlChange(e.target.value)}
            className="mt-1 text-sm font-mono"
          />
        </div>
        <div>
          <Label className="text-xs font-medium text-gray-600">HTTP Method</Label>
          <select
            value={method}
            onChange={(e) => handleMethodChange(e.target.value)}
            className="mt-1 w-full p-2 text-sm border rounded"
          >
            <option value="GET">GET</option>
            <option value="POST">POST</option>
            <option value="PUT">PUT</option>
            <option value="DELETE">DELETE</option>
            <option value="PATCH">PATCH</option>
          </select>
        </div>
        <div>
          <Label className="text-xs font-medium text-gray-600">API Key</Label>
          <Input
            type="password"
            placeholder="Enter API key (optional)"
            value={apiKey}
            onChange={(e) => handleApiKeyChange(e.target.value)}
            className="mt-1 text-sm"
          />
        </div>
      </div>
      <div className="p-3">
        <button
          onClick={onClose}
          className="w-full py-2 bg-teal-600 text-white rounded-lg font-medium text-sm hover:bg-teal-700 transition-colors"
        >
          Save
        </button>
      </div>
    </div>
  );
};

// User Approval Config Panel
const UserApprovalConfigPanel: React.FC<{
  node: ToolNode;
  onUpdateNode: (node: ToolNode) => void;
  onClose: () => void;
}> = ({ node, onUpdateNode, onClose }) => {
  const [name, setName] = useState(node.config?.name || "");
  const [message, setMessage] = useState(node.config?.message || "");

  const handleNameChange = (value: string) => {
    setName(value);
    onUpdateNode({ ...node, config: { ...node.config, name: value } });
  };

  const handleMessageChange = (value: string) => {
    setMessage(value);
    onUpdateNode({ ...node, config: { ...node.config, message: value } });
  };

  return (
    <div className="absolute z-20 w-[320px] bg-white rounded-lg shadow-xl border border-pink-200 mt-2">
      <div className="flex items-center justify-between p-3 border-b bg-pink-50 rounded-t-lg">
        <div className="flex items-center gap-2">
          <CheckCircle className="h-4 w-4 text-pink-600" />
          <span className="font-bold text-sm text-pink-900">User Approval</span>
        </div>
        <button onClick={onClose} className="p-1 hover:bg-pink-100 rounded">
          <X className="h-4 w-4 text-pink-600" />
        </button>
      </div>
      <div className="p-3 border-b bg-pink-50/50">
        <p className="text-xs text-pink-700">Pause for human approval or rejection</p>
      </div>
      <div className="p-3 space-y-3">
        <div>
          <Label className="text-xs font-medium text-gray-600">Approval Step Name</Label>
          <Input
            placeholder="e.g., Approve Payment"
            value={name}
            onChange={(e) => handleNameChange(e.target.value)}
            className="mt-1 text-sm"
          />
        </div>
        <div>
          <Label className="text-xs font-medium text-gray-600">Message to Show User</Label>
          <textarea
            placeholder="Describe what the user needs to approve or deny..."
            value={message}
            onChange={(e) => handleMessageChange(e.target.value)}
            className="mt-1 w-full p-2 text-sm border rounded resize-none"
            rows={3}
          />
        </div>
      </div>
      <div className="p-3">
        <button
          onClick={onClose}
          className="w-full py-2 bg-pink-600 text-white rounded-lg font-medium text-sm hover:bg-pink-700 transition-colors"
        >
          Save
        </button>
      </div>
    </div>
  );
};

// Edge Config Panel
const EdgeConfigPanel: React.FC<{
  node: ToolNode;
  nodes: ToolNode[];
  onUpdateNode: (node: ToolNode) => void;
  onClose: () => void;
}> = ({ node, nodes, onUpdateNode, onClose }) => {
  const [source, setSource] = useState(node.config?.source || "");
  const [target, setTarget] = useState(node.config?.target || "");

  const handleSourceChange = (value: string) => {
    setSource(value);
    onUpdateNode({ ...node, config: { ...node.config, source: value } });
  };

  const handleTargetChange = (value: string) => {
    setTarget(value);
    onUpdateNode({ ...node, config: { ...node.config, target: value } });
  };

  const availableNodes = nodes.filter(n => n.type !== "edge");

  return (
    <div className="absolute z-20 w-[280px] bg-white rounded-lg shadow-xl border border-cyan-200 mt-2">
      <div className="flex items-center justify-between p-3 border-b bg-cyan-50 rounded-t-lg">
        <div className="flex items-center gap-2">
          <ArrowRight className="h-4 w-4 text-cyan-600" />
          <span className="font-medium text-sm text-cyan-900">Edge Connection</span>
        </div>
        <button onClick={onClose} className="p-1 hover:bg-cyan-100 rounded">
          <X className="h-4 w-4 text-cyan-600" />
        </button>
      </div>
      <div className="p-3 border-b">
        <Label className="text-xs font-medium text-gray-600">From Node</Label>
        <select
          value={source}
          onChange={(e) => handleSourceChange(e.target.value)}
          className="mt-1 w-full p-2 text-sm border rounded"
        >
          <option value="">Select source node</option>
          {availableNodes.map((n) => (
            <option key={n.id} value={n.id}>
              {n.type} - {n.id}
            </option>
          ))}
        </select>
      </div>
      <div className="p-3">
        <Label className="text-xs font-medium text-gray-600">To Node</Label>
        <select
          value={target}
          onChange={(e) => handleTargetChange(e.target.value)}
          className="mt-1 w-full p-2 text-sm border rounded"
        >
          <option value="">Select target node</option>
          {availableNodes.filter(n => n.id !== source).map((n) => (
            <option key={n.id} value={n.id}>
              {n.type} - {n.id}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

const AgentCanvas: React.FC<AgentCanvasProps> = ({
  nodes,
  selectedNode,
  onNodeSelect,
  onUpdateNode,
  onDeleteNode,
}) => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [dragNodeId, setDragNodeId] = useState<string | null>(null);

  const handleMouseDown = (e: React.MouseEvent, node: ToolNode) => {
    if ((e.target as HTMLElement).closest(".delete-btn")) return;
    if ((e.target as HTMLElement).closest(".config-panel")) return;
    
    e.stopPropagation();
    setIsDragging(true);
    setDragNodeId(node.id);
    
    const rect = (e.target as HTMLElement).closest('.node-card')?.getBoundingClientRect();
    if (rect) {
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
    }
    onNodeSelect(node);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging || !dragNodeId || !canvasRef.current) return;

      const canvasRect = canvasRef.current.getBoundingClientRect();
      const newX = e.clientX - canvasRect.left - dragOffset.x;
      const newY = e.clientY - canvasRect.top - dragOffset.y;

      const node = nodes.find((n) => n.id === dragNodeId);
      if (node) {
        onUpdateNode({
          ...node,
          position: { x: Math.max(0, newX), y: Math.max(0, newY) },
        });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setDragNodeId(null);
    };

    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, dragNodeId, dragOffset, nodes, onUpdateNode]);

  const handleCanvasClick = (e: React.MouseEvent) => {
    if (e.target === canvasRef.current || (e.target as HTMLElement).closest('.grid-background')) {
      onNodeSelect(null);
    }
  };

  const renderConnections = () => {
    return nodes.filter(n => n.type === "edge").map((edgeNode) => {
      const sourceNode = nodes.find(n => n.id === edgeNode.config?.source);
      const targetNode = nodes.find(n => n.id === edgeNode.config?.target);
      
      if (!sourceNode || !targetNode) return null;
      
      return (
        <line
          key={`edge-${edgeNode.id}`}
          x1={sourceNode.position.x + 75}
          y1={sourceNode.position.y + 40}
          x2={targetNode.position.x + 75}
          y2={targetNode.position.y}
          stroke="#06b6d4"
          strokeWidth="2"
        />
      );
    });
  };

  return (
    <div
      ref={canvasRef}
      className="w-full h-full bg-gray-50 relative overflow-auto"
      style={{
        backgroundImage: "radial-gradient(circle, #e5e7eb 1px, transparent 1px)",
        backgroundSize: "20px 20px",
      }}
      onClick={handleCanvasClick}
    >
      <div className="grid-background absolute inset-0 pointer-events-none">
        <svg className="w-full h-full">
          <defs>
            <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
              <circle cx="1" cy="1" r="1" fill="#d1d5db" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      <svg className="absolute inset-0 w-full h-full pointer-events-none">
        {renderConnections()}
      </svg>

      {nodes.map((node) => {
        const Icon = nodeIcons[node.type] || Code;
        const colorClass = nodeColors[node.type] || "bg-gray-100 border-gray-300";
        const isSelected = selectedNode?.id === node.id;
        const isIfNode = node.type === "if";
        const isWhileNode = node.type === "while";
        const isEdgeNode = node.type === "edge";
        const isApiNode = node.type === "api";
        const isUserApprovalNode = node.type === "userApproval";

        return (
          <div
            key={node.id}
            className="node-card absolute cursor-move transition-shadow"
            style={{
              left: node.position.x,
              top: node.position.y,
            }}
            onMouseDown={(e) => handleMouseDown(e, node)}
          >
            <div
              className={`w-[150px] rounded-lg border-2 p-3 ${colorClass} ${
                isSelected ? "ring-2 ring-blue-500 shadow-lg" : "shadow-md"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <Icon className="h-5 w-5" />
                <button
                  className="delete-btn opacity-0 hover:opacity-100 p-1 hover:bg-red-100 rounded transition-opacity"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteNode(node.id);
                  }}
                >
                  <Trash2 className="h-4 w-4 text-red-500" />
                </button>
              </div>
              <p className="font-medium text-sm capitalize">{node.type}</p>
              <p className="text-xs text-gray-500 mt-1 truncate">
                {node.config?.name || node.id}
              </p>
            </div>

            {isIfNode && isSelected && (
              <IfElseConfigPanel
                node={node}
                onUpdateNode={onUpdateNode}
                onClose={() => onNodeSelect(null)}
              />
            )}

            {isWhileNode && isSelected && (
              <WhileLoopConfigPanel
                node={node}
                onUpdateNode={onUpdateNode}
                onClose={() => onNodeSelect(null)}
              />
            )}

            {isApiNode && isSelected && (
              <APIConfigPanel
                node={node}
                onUpdateNode={onUpdateNode}
                onClose={() => onNodeSelect(null)}
              />
            )}

            {isUserApprovalNode && isSelected && (
              <UserApprovalConfigPanel
                node={node}
                onUpdateNode={onUpdateNode}
                onClose={() => onNodeSelect(null)}
              />
            )}

            {isEdgeNode && isSelected && (
              <EdgeConfigPanel
                node={node}
                nodes={nodes}
                onUpdateNode={onUpdateNode}
                onClose={() => onNodeSelect(null)}
              />
            )}
          </div>
        );
      })}

      {nodes.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-gray-400">
            <Workflow className="h-16 w-16 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium">No nodes added yet</p>
            <p className="text-sm">Click on a tool from the palette to get started</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default AgentCanvas;

