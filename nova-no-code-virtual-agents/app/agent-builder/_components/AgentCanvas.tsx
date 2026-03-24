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
  Globe,
  CheckCircle,
  Link,
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
  const [showApiKey, setShowApiKey] = useState(false);
  const [errors, setErrors] = useState<{ name?: string; apiUrl?: string }>({});

  const validateForm = () => {
    const newErrors: { name?: string; apiUrl?: string } = {};
    
    if (!name.trim()) {
      newErrors.name = "API call name is required";
    }
    
    if (!apiUrl.trim()) {
      newErrors.apiUrl = "API URL is required";
    } else if (!/^https?:\/\/.+/.test(apiUrl)) {
      newErrors.apiUrl = "Please enter a valid URL (http:// or https://)";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNameChange = (value: string) => {
    setName(value);
    setErrors(prev => ({ ...prev, name: undefined }));
    onUpdateNode({ ...node, config: { ...node.config, name: value } });
  };

  const handleApiUrlChange = (value: string) => {
    setApiUrl(value);
    setErrors(prev => ({ ...prev, apiUrl: undefined }));
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

  const handleSave = () => {
    if (validateForm()) {
      console.log("API Tool Settings Saved:", {
        toolType: "api",
        nodeId: node.id,
        config: { name, apiUrl, method, apiKey },
        timestamp: new Date().toISOString(),
      });
      onClose();
    }
  };

  const methodColors: Record<string, string> = {
    GET: "bg-green-100 text-green-700 border-green-200",
    POST: "bg-blue-100 text-blue-700 border-blue-200",
    PUT: "bg-yellow-100 text-yellow-700 border-yellow-200",
    DELETE: "bg-red-100 text-red-700 border-red-200",
    PATCH: "bg-purple-100 text-purple-700 border-purple-200",
  };

  return (
    <div className="absolute z-20 w-[360px] bg-white rounded-lg shadow-xl border border-teal-200 mt-2">
      <div className="flex items-center justify-between p-3 border-b bg-gradient-to-r from-teal-50 to-cyan-50 rounded-t-lg">
        <div className="flex items-center gap-2">
          <Globe className="h-4 w-4 text-teal-600" />
          <span className="font-bold text-sm text-teal-900">API Tool</span>
        </div>
        <button onClick={onClose} className="p-1 hover:bg-teal-100 rounded transition-colors">
          <X className="h-4 w-4 text-teal-600" />
        </button>
      </div>
      <div className="p-3 border-b bg-teal-50/30">
        <p className="text-xs text-teal-700">Configure external API endpoint to call</p>
      </div>
      <div className="p-4 space-y-4">
        {/* API Call Name */}
        <div>
          <Label className="text-xs font-medium text-gray-600 flex items-center gap-1">
            API Call Name
            <span className="text-red-500">*</span>
          </Label>
          <Input
            placeholder="e.g., Get Weather Data"
            value={name}
            onChange={(e) => handleNameChange(e.target.value)}
            className={`mt-1 text-sm ${errors.name ? "border-red-500 focus:ring-red-500" : ""}`}
          />
          {errors.name && (
            <p className="text-xs text-red-500 mt-1">{errors.name}</p>
          )}
        </div>

        {/* API URL */}
        <div>
          <Label className="text-xs font-medium text-gray-600 flex items-center gap-1">
            API URL
            <span className="text-red-500">*</span>
          </Label>
          <Input
            placeholder="https://api.example.com/data?q={{query}}"
            value={apiUrl}
            onChange={(e) => handleApiUrlChange(e.target.value)}
            className={`mt-1 text-sm font-mono ${errors.apiUrl ? "border-red-500 focus:ring-red-500" : ""}`}
          />
          {errors.apiUrl && (
            <p className="text-xs text-red-500 mt-1">{errors.apiUrl}</p>
          )}
          <p className="text-xs text-gray-400 mt-1">Use {"{{query}}"} for dynamic user input</p>
        </div>

        {/* HTTP Method */}
        <div>
          <Label className="text-xs font-medium text-gray-600">HTTP Method</Label>
          <div className="mt-1 flex gap-2">
            {["GET", "POST", "PUT", "DELETE", "PATCH"].map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => handleMethodChange(m)}
                className={`flex-1 py-2 px-3 text-xs font-medium rounded-md border transition-all ${
                  method === m
                    ? methodColors[m]
                    : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100"
                }`}
              >
                {m}
              </button>
            ))}
          </div>
        </div>

        {/* API Key */}
        <div>
          <Label className="text-xs font-medium text-gray-600">API Key (Optional)</Label>
          <div className="relative mt-1">
            <Input
              type={showApiKey ? "text" : "password"}
              placeholder="Enter API key if required"
              value={apiKey}
              onChange={(e) => handleApiKeyChange(e.target.value)}
              className="text-sm pr-10 font-mono"
            />
            <button
              type="button"
              onClick={() => setShowApiKey(!showApiKey)}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
            >
              {showApiKey ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              )}
            </button>
          </div>
          <p className="text-xs text-gray-400 mt-1">Leave empty if API doesn't require authentication</p>
        </div>
      </div>
      <div className="p-3 border-t bg-gray-50 rounded-b-lg">
        <button
          onClick={handleSave}
          className="w-full py-2 bg-teal-600 text-white rounded-lg font-medium text-sm hover:bg-teal-700 transition-colors"
        >
          Save Configuration
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
  
  // Connection state
  const [connectingFrom, setConnectingFrom] = useState<string | null>(null);
  const [mousePosition, setMousePosition] = useState<{ x: number; y: number } | null>(null);

  const handleMouseDown = (e: React.MouseEvent, node: ToolNode) => {
    if ((e.target as HTMLElement).closest(".delete-btn")) return;
    if ((e.target as HTMLElement).closest(".config-panel")) return;
    if ((e.target as HTMLElement).closest(".connection-dot")) return;
    
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

  // Handle connection dot click
  const handleConnectionClick = (e: React.MouseEvent, nodeId: string) => {
    e.stopPropagation();
    
    if (connectingFrom === null) {
      // Start connecting from this node
      setConnectingFrom(nodeId);
    } else if (connectingFrom !== nodeId) {
      // Complete connection to this node
      const sourceNode = nodes.find(n => n.id === connectingFrom);
      const targetNode = nodes.find(n => n.id === nodeId);
      
      if (sourceNode && targetNode) {
        // Add connection to source node
        const existingConnections = sourceNode.config?.connections || [];
        onUpdateNode({
          ...sourceNode,
          config: {
            ...sourceNode.config,
            connections: [...existingConnections, { targetId: nodeId }]
          }
        });
      }
      
      setConnectingFrom(null);
    } else {
      // Cancel connection
      setConnectingFrom(null);
    }
  };

  // Track mouse for connection line
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (connectingFrom && canvasRef.current) {
        const rect = canvasRef.current.getBoundingClientRect();
        setMousePosition({
          x: e.clientX - rect.left,
          y: e.clientY - rect.top,
        });
      }
    };

    if (connectingFrom) {
      window.addEventListener("mousemove", handleMouseMove);
    }

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, [connectingFrom]);

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
      setConnectingFrom(null);
    }
  };

  // Get connections from node config
  const getConnections = () => {
    const connections: Array<{ from: ToolNode; to: ToolNode }> = [];
    
    nodes.forEach(node => {
      const nodeConnections = node.config?.connections || [];
      nodeConnections.forEach((conn: { targetId: string }) => {
        const targetNode = nodes.find(n => n.id === conn.targetId);
        if (targetNode) {
          connections.push({ from: node, to: targetNode });
        }
      });
    });
    
    return connections;
  };

  const renderConnections = () => {
    return getConnections().map((conn, index) => (
      <line
        key={`connection-${conn.from.id}-${conn.to.id}-${index}`}
        x1={conn.from.position.x + 75}
        y1={conn.from.position.y + 40}
        x2={conn.to.position.x + 75}
        y2={conn.to.position.y}
        stroke="#06b6d4"
        strokeWidth="2"
        markerEnd="url(#arrowhead)"
      />
    ));
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
            <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
              <polygon points="0 0, 10 3.5, 0 7" fill="#06b6d4" />
            </marker>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      <svg className="absolute inset-0 w-full h-full pointer-events-none">
        {renderConnections()}
        
        {/* Draw temporary connection line while connecting */}
        {connectingFrom && mousePosition && (() => {
          const sourceNode = nodes.find(n => n.id === connectingFrom);
          if (!sourceNode) return null;
          return (
            <line
              x1={sourceNode.position.x + 75}
              y1={sourceNode.position.y + 40}
              x2={mousePosition.x}
              y2={mousePosition.y}
              stroke="#06b6d4"
              strokeWidth="2"
              strokeDasharray="5,5"
            />
          );
        })()}
      </svg>

      {nodes.map((node) => {
        const Icon = nodeIcons[node.type] || Code;
        const colorClass = nodeColors[node.type] || "bg-gray-100 border-gray-300";
        const isSelected = selectedNode?.id === node.id;
        const isIfNode = node.type === "if";
        const isWhileNode = node.type === "while";
        const isApiNode = node.type === "api";
        const isUserApprovalNode = node.type === "userApproval";
        const isConnecting = connectingFrom === node.id;

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
              } ${isConnecting ? "ring-2 ring-cyan-500 animate-pulse" : ""}`}
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
              
              {/* Connection dot at bottom */}
              {node.type !== "end" && (
                <div 
                  className="connection-dot absolute -bottom-3 left-1/2 transform -translate-x-1/2 w-6 h-6 bg-cyan-500 rounded-full flex items-center justify-center cursor-pointer hover:bg-cyan-600 hover:scale-125 transition-all shadow-md"
                  onClick={(e) => handleConnectionClick(e, node.id)}
                  title={isConnecting ? "Click to connect" : "Click to start connection"}
                >
                  <Link className="h-3 w-3 text-white" />
                </div>
              )}
              
              {/* Connection dot at top for receiving connections */}
              {node.type !== "start" && (
                <div 
                  className="connection-dot absolute -top-3 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-white border-2 border-cyan-500 rounded-full cursor-pointer hover:bg-cyan-100 transition-all"
                  onClick={(e) => handleConnectionClick(e, node.id)}
                  title="Click to connect here"
                />
              )}
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
          </div>
        );
      })}

      {/* Connection mode indicator */}
      {connectingFrom && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-cyan-500 text-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2 z-50">
          <Link className="h-4 w-4 animate-pulse" />
          <span className="text-sm font-medium">Click another node to connect, or click canvas to cancel</span>
        </div>
      )}

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

