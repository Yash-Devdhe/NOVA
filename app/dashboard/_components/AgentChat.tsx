"use client";

import React, { useContext, useEffect, useRef, useState } from "react";
import { useConvexAuth, useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { UserDetailContext } from "@/context/UserDetailsContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Bot, User, Loader2, Send, Copy, Check, MessageCircle, Layers, Wrench } from "lucide-react";
import type { CustomTool } from "@/types/agent-builder";

interface Message {
  _id: string;
  agentId: string;
  userId: string | Id<"UserTable">;
  message: string;
  sender: "user" | "agent";
  timestamp: number;
  metadata?: unknown;
}

interface AgentChatProps {
  agentId: string;
  className?: string;
}

type AgentConfigNode = {
  id: string;
  type?: string;
  data?: {
    label?: string;
    config?: Record<string, unknown>;
  };
  config?: Record<string, unknown>;
};

const baseTools = [
  { id: "start", name: "Start", description: "Workflow entry point" },
  { id: "llm", name: "LLM", description: "AI language model response" },
  { id: "api", name: "API", description: "External API call" },
  { id: "custom", name: "Custom Tool", description: "User-defined dashboard tool" },
];

export default function AgentChat({ agentId, className = "" }: AgentChatProps) {
  const { userDetail } = useContext(UserDetailContext);
  const { isAuthenticated } = useConvexAuth();
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const userId = userDetail?._id as Id<"UserTable">;

  const messages = (useQuery(
    api.agent.GetAgentChatSubscriptionData,
    userId ? { agentId, userId } : "skip"
  ) || []) as Message[];
  const customTools = (useQuery(api.agent.GetAgentCustomTools, { agentId }) || []) as CustomTool[];
  const agent = useQuery(api.agent.GetAgentById, { agentId });
  const saveMessage = useMutation(api.agent.SaveChatMessage);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isSending]);

  const getConfigNodes = () =>
    (((agent?.config as { nodes?: AgentConfigNode[] } | undefined)?.nodes) || []).filter(Boolean);

  const buildSystemPrompt = () => {
    const workflowNodes = getConfigNodes().map((node) => ({
      id: node.id,
      type: node.type || "default",
      label: node.data?.label || node.config?.name || "Node",
      config: node.data?.config || node.config || {},
    }));

    return [
      `You are ${agent?.name || "a NOVA agent"}.`,
      "Use the configured workflow and tools when answering.",
      workflowNodes.length
        ? `Workflow nodes:\n${JSON.stringify(workflowNodes, null, 2)}`
        : "Workflow nodes: none configured.",
      customTools.length
        ? `Custom tools:\n${JSON.stringify(customTools, null, 2)}`
        : "Custom tools: none configured.",
    ].join("\n\n");
  };

  const tryRunMatchingTool = async (messageText: string) => {
    const normalized = messageText.toLowerCase();

    const matchingCustomTool = customTools.find((tool) =>
      [tool.name, tool.id, tool.description]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(normalized) || normalized.includes(value.toLowerCase()))
    );

    const matchingApiNode = getConfigNodes().find((node) => {
      const config = (node.data?.config || node.config || {}) as Record<string, unknown>;
      const label = String(node.data?.label || config.name || "").toLowerCase();
      const apiUrl = String(config.apiUrl || "");
      return Boolean(apiUrl) && Boolean(label) && normalized.includes(label);
    });

    const toolConfig = matchingCustomTool
      ? {
          name: matchingCustomTool.name,
          apiUrl: matchingCustomTool.apiUrl,
          method: matchingCustomTool.method || "GET",
        }
      : matchingApiNode
        ? {
            name: String(
              matchingApiNode.data?.label ||
              (matchingApiNode.data?.config || matchingApiNode.config || {}).name ||
              "API Tool"
            ),
            apiUrl: String(
              (matchingApiNode.data?.config || matchingApiNode.config || {}).apiUrl || ""
            ),
            method: String(
              (matchingApiNode.data?.config || matchingApiNode.config || {}).method || "GET"
            ),
          }
        : null;

    if (!toolConfig?.apiUrl) {
      return null;
    }

    const response = await fetch("/api/custom-api", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        url: toolConfig.apiUrl,
        method: toolConfig.method,
        body: {
          prompt: messageText,
          input: messageText,
        },
        contentType: "application/json",
      }),
    });

    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.error || `Failed to call ${toolConfig.name}`);
    }

    return `Tool: ${toolConfig.name}\n${JSON.stringify(result.data ?? result, null, 2)}`;
  };

  const getAgentReply = async (messageText: string) => {
    const toolResult = await tryRunMatchingTool(messageText);
    if (toolResult) {
      return toolResult;
    }

    const response = await fetch("/api/openai", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        prompt: messageText,
        type: "chat",
        systemPrompt: buildSystemPrompt(),
      }),
    });

    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.error || "Unable to get an agent response");
    }

    return result.message || "No response received.";
  };

  const handleSend = async () => {
    if (!input.trim() || !isAuthenticated || !userId || isSending) return;

    const text = input.trim();
    setInput("");
    setIsSending(true);

    try {
      await saveMessage({
        agentId,
        userId,
        message: text,
        sender: "user",
      });

      const reply = await getAgentReply(text);

      await saveMessage({
        agentId,
        userId,
        message: reply,
        sender: "agent",
      });
    } catch (error) {
      await saveMessage({
        agentId,
        userId,
        message:
          error instanceof Error
            ? `Agent error: ${error.message}`
            : "Agent error: Unknown error",
        sender: "agent",
      });
    } finally {
      setIsSending(false);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const allTools = [
    ...baseTools,
    ...customTools.map((tool) => ({
      id: tool.id,
      name: tool.name,
      description: tool.description,
    })),
  ];

  return (
    <div className={`flex h-[600px] overflow-hidden rounded-2xl border bg-white shadow-lg ${className}`}>
      <div className="w-64 border-r bg-slate-50">
        <div className="border-b p-4">
          <h3 className="flex items-center gap-2 font-semibold">
            <Layers className="h-4 w-4" />
            Tools
          </h3>
        </div>
        <ScrollArea className="h-full">
          <div className="space-y-1 p-2">
            {allTools.map((tool) => (
              <button
                key={tool.id}
                className="flex w-full items-center gap-2 rounded-lg p-2 text-left text-sm hover:bg-slate-100"
                onClick={() => setInput((current) => `${current}${current ? " " : ""}${tool.name}`)}
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100">
                  {tool.id === "custom" ? (
                    <Wrench className="h-4 w-4 text-blue-600" />
                  ) : (
                    <Layers className="h-4 w-4 text-blue-600" />
                  )}
                </div>
                <div>
                  <div className="font-medium">{tool.name}</div>
                  <div className="text-xs text-slate-500">{tool.description}</div>
                </div>
              </button>
            ))}
            {customTools.length === 0 && (
              <p className="px-2 py-4 text-center text-xs text-slate-500">
                No custom tools. Add some in the dashboard.
              </p>
            )}
          </div>
        </ScrollArea>
      </div>

      <div className="flex flex-1 flex-col">
        <ScrollArea className="flex-1 p-6">
          {messages.length === 0 ? (
            <div className="flex h-64 flex-col items-center justify-center text-slate-500">
              <MessageCircle className="mb-4 h-12 w-12 opacity-50" />
              <p className="mb-1 text-lg font-medium">Start a conversation</p>
              <p className="text-sm">Your chat history will appear here</p>
            </div>
          ) : (
            messages.map((msg) => (
              <div
                key={msg._id}
                className={`mb-6 ${msg.sender === "user" ? "flex justify-end" : "flex gap-4"}`}
              >
                {msg.sender === "agent" && (
                  <Avatar className="h-10 w-10 flex-shrink-0">
                    <AvatarFallback className="bg-gradient-to-br from-slate-800 to-slate-700">
                      <Bot className="h-5 w-5 text-white" />
                    </AvatarFallback>
                  </Avatar>
                )}
                <div
                  className={`max-w-[70%] rounded-2xl p-4 shadow ${
                    msg.sender === "user"
                      ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white"
                      : "border border-slate-200 bg-white"
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.message}</p>
                  <div
                    className={`mt-3 flex items-center justify-between border-t pt-2 ${
                      msg.sender === "user" ? "border-white/30" : "border-slate-200"
                    }`}
                  >
                    <span className="text-xs opacity-75">
                      {new Date(msg.timestamp).toLocaleTimeString()}
                    </span>
                    <button
                      onClick={() => copyToClipboard(msg.message, msg._id)}
                      className="rounded-full p-1 transition hover:bg-black/5"
                    >
                      {copiedId === msg._id ? (
                        <Check className="h-3 w-3" />
                      ) : (
                        <Copy className="h-3 w-3" />
                      )}
                    </button>
                  </div>
                </div>
                {msg.sender === "user" && (
                  <Avatar className="order-first h-10 w-10 flex-shrink-0">
                    <AvatarImage src="" />
                    <AvatarFallback className="bg-slate-200">
                      <User className="h-5 w-5 text-slate-600" />
                    </AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))
          )}
          {isSending && (
            <div className="mb-6 flex gap-4">
              <Avatar className="h-10 w-10">
                <AvatarFallback className="bg-gradient-to-br from-slate-800 to-slate-700">
                  <Bot className="h-5 w-5 text-white" />
                </AvatarFallback>
              </Avatar>
              <div className="max-w-[70%] rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm text-slate-600">Agent is typing...</span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </ScrollArea>

        <div className="border-t bg-slate-50 p-6">
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
              placeholder="Type your message..."
              className="flex-1"
              disabled={!isAuthenticated || isSending}
            />
            <Button onClick={handleSend} disabled={!input.trim() || isSending || !isAuthenticated}>
              {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
