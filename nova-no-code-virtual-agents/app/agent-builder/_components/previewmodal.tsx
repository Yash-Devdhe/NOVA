"use client";

import React, { useState, useEffect, useRef } from "react";
import { ToolNode } from "../[agentId]/page";
import { Button } from "@/components/ui/button";
import { X, Send, Loader2, RotateCcw, Bot } from "lucide-react";

interface PreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  agentId: string;
  agentName: string;
  nodes: ToolNode[];
  onPublish?: () => void;
}

/**
 * PreviewModal Component
 * Preview window which opens on clicking preview button in dashboard
 * Contains:
 * - Header with "Header" label, Close Preview and Publish buttons
 * - Center: Agent preview with all tools shown as per user created
 * - Right: Chat/Test Area where user can chat with that AI agent using OpenAI
 * - Professional and attractive styling like ChatGPT
 */
const PreviewModal: React.FC<PreviewModalProps> = ({
  isOpen,
  onClose,
  agentId,
  agentName,
  nodes,
  onPublish,
}) => {
  const [messages, setMessages] = useState<{ role: string; content: string; timestamp: Date }[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Log agent details when preview opens
  useEffect(() => {
    if (isOpen) {
      console.log("Agent Preview Opened:", {
        agentId,
        agentName,
        nodes: nodes.map(n => ({
          id: n.id,
          type: n.type,
          config: n.config,
        })),
        timestamp: new Date().toISOString(),
      });
    }
  }, [isOpen, agentId, agentName, nodes]);

  const handleSendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput("");
    setMessages(prev => [...prev, { role: "user", content: userMessage, timestamp: new Date() }]);
    setLoading(true);

    try {
      // Here you would integrate with OpenAI API
      // For now, we'll simulate a response
      console.log("Chat Message Sent:", {
        agentId,
        message: userMessage,
        timestamp: new Date().toISOString(),
      });

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      const agentResponse = `I received your message: "${userMessage}". This is a preview response. In production, this would connect to your configured AI agent with OpenAI.`;
      
      setMessages(prev => [...prev, { role: "assistant", content: agentResponse, timestamp: new Date() }]);
      
      console.log("Chat Response:", {
        agentId,
        response: agentResponse,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Error in chat:", error);
      setMessages(prev => [...prev, { 
        role: "assistant", 
        content: "Sorry, I encountered an error. Please try again.", 
        timestamp: new Date() 
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleReboot = () => {
    // Log reboot action
    console.log("Agent Rebooted:", {
      agentId,
      agentName,
      nodes: nodes.map(n => ({
        id: n.id,
        type: n.type,
        config: n.config,
      })),
      timestamp: new Date().toISOString(),
    });
    setMessages([]);
    alert("Agent rebooted successfully!");
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-[90vw] h-[90vh] bg-white rounded-xl shadow-2xl flex overflow-hidden">
        {/* Header */}
        <div className="absolute top-0 left-0 right-0 h-14 bg-gradient-to-r from-blue-600 to-blue-700 flex items-center justify-between px-4 z-10">
          <div className="flex items-center gap-2 text-white">
            <Bot className="h-5 w-5" />
            <span className="font-semibold">Header</span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={onClose}
              className="bg-white/20 hover:bg-white/30 text-white border-0"
            >
              <X className="h-4 w-4 mr-1" />
              Close Preview
            </Button>
            <Button
              size="sm"
              onClick={onPublish}
              className="bg-green-600 hover:bg-green-700"
            >
              Publish
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex pt-14">
          {/* Center: Agent Preview */}
          <div className="flex-1 border-r bg-gray-50 p-4 overflow-auto">
            <h3 className="font-semibold text-lg mb-4">Agent Preview</h3>
            <div className="space-y-3">
              {nodes.length === 0 ? (
                <p className="text-gray-400 text-center py-8">No tools added yet</p>
              ) : (
                nodes.map((node, index) => (
                  <div
                    key={node.id}
                    className="bg-white p-4 rounded-lg border shadow-sm"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-medium">
                        {index + 1}
                      </span>
                      <span className="font-medium capitalize">{node.type}</span>
                    </div>
                    <p className="text-sm text-gray-600">
                      {node.config?.name || node.id}
                    </p>
                    {node.config && Object.keys(node.config).length > 0 && (
                      <div className="mt-2 text-xs text-gray-400 font-mono">
                        {JSON.stringify(node.config, null, 2)}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Right: Chat/Test Area */}
          <div className="w-96 flex flex-col bg-white">
            {/* Chat Header */}
            <div className="h-14 border-b flex items-center justify-between px-4">
              <div className="flex items-center gap-2">
                <Bot className="h-5 w-5 text-blue-600" />
                <span className="font-medium">{agentName}</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleReboot}
                title="Reboot Agent"
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-auto p-4 space-y-4">
              {messages.length === 0 && (
                <div className="text-center text-gray-400 py-8">
                  <Bot className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>Start chatting with your agent</p>
                </div>
              )}
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                      message.role === "user"
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 text-gray-900"
                    }`}
                  >
                    <p className="text-sm">{message.content}</p>
                    <p className={`text-xs mt-1 ${message.role === "user" ? "text-blue-200" : "text-gray-400"}`}>
                      {formatTime(message.timestamp)}
                    </p>
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 rounded-2xl px-4 py-2">
                    <Loader2 className="h-5 w-5 animate-spin text-gray-500" />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                  placeholder="Message your agent..."
                  className="flex-1 px-4 py-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={loading || !input.trim()}
                  size="icon"
                  className="rounded-full"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PreviewModal;
