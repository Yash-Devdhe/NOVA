/**
 * Agent Type Definitions
 */

export interface Agent {
  _id: string;
  _creationTime: number;
  agentId: string;
  name: string;
  published?: boolean;
  userId: string;
}

/**
 * Agent Builder Types
 */

export interface ToolNode {
  id: string;
  type: "start" | "end" | "if" | "else" | "while" | "agent" | "llm" | "code" | "workflow" | "edge" | "api" | "userApproval";
  position: { x: number; y: number };
  config: Record<string, any>;
  data?: Record<string, any>;
  createdAt?: number;
}

export interface EdgeNode {
  id: string;
  source: string;
  target: string;
  type?: string;
}
