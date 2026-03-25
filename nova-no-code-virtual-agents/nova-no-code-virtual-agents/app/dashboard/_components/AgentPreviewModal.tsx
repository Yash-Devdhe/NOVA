"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Send,
  Bot,
  Image as ImageIcon,
  Video,
  Loader2,
  X,
  Copy,
  Check,
  User,
  Sparkles,
  MessageSquare,
  Play,
  Square,
  GitBranch,
  RefreshCw,
  Globe,
  CheckCircle,
  Workflow,
  Code,
  ArrowRight,
} from "lucide-react";

// Tool type definitions (same as in ToolPalette)
interface ToolNode {
  id: string;
  type: string;
  position: { x: number; y: number };
  config: Record<string, any>;
}

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  type?: "text" | "image" | "video";
  mediaUrl?: string;
}

interface AgentPreviewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

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

const AgentPreviewModal: React.FC<AgentPreviewModalProps> = ({
  open,
  onOpenChange,
}) => {
  const [activeTab, setActiveTab] = useState("chat");
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content: "Hello! I'm your AI agent assistant. You can chat with me about building agents, ask me to explain tools, or I can help you generate images and videos. What would you like to do?",
      timestamp: new Date(),
      type: "text",
    },
  ]);
  const [generationType, setGenerationType] = useState<"chat" | "image" | "video">("chat");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!prompt.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: prompt,
      timestamp: new Date(),
      type: "text",
    };

    setMessages((prev) => [...prev, userMessage]);
    setPrompt("");
    setIsGenerating(true);

    try {
      const response = await fetch("/api/openai", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: prompt,
          type: generationType === "chat" ? "chat" : generationType,
        }),
      });

      const data = await response.json();

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.message || data.url || data.error || "Something went wrong",
        timestamp: new Date(),
        type: data.type || "text",
        mediaUrl: data.url,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "Sorry, I encountered an error. Please try again.",
        timestamp: new Date(),
        type: "text",
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl h-[85vh] p-0 overflow-hidden">
        <DialogHeader className="p-4 border-b">
          <DialogTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5" />
            Agent Preview
          </DialogTitle>
          <DialogDescription>
            Preview your AI agent with tools and chat interface
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 h-full overflow-hidden">
          <ResizablePanelGroup className="h-full">
            {/* Left Panel - Agent Tools Preview */}
            <ResizablePanel defaultSize={30} minSize={20} maxSize={40}>
              <div className="h-full border-r bg-gray-50/50">
                <div className="p-4 border-b bg-white">
                  <h2 className="font-semibold text-lg flex items-center gap-2">
                    <Sparkles className="h-4 w-4" />
                    Agent Tools
                  </h2>
                  <p className="text-xs text-gray-500 mt-1">
                    Available tools for your agent
                  </p>
                </div>
                <ScrollArea className="h-[calc(100%-60px)] p-4">
                  <div className="space-y-2">
                    {tools.map((tool) => (
                      <div
                        key={tool.type}
                        className="flex items-center gap-3 p-3 rounded-lg border bg-white hover:bg-gray-50 cursor-pointer transition-all hover:shadow-md"
                      >
                        <div className={`p-2 rounded-lg ${tool.color}`}>
                          <tool.icon className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">{tool.label}</p>
                          <p className="text-xs text-gray-500">
                            {tool.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                    <h3 className="font-medium text-sm text-blue-800 mb-2">
                      Tool Descriptions
                    </h3>
                    <div className="space-y-2 text-xs text-blue-600">
                      <p>
                        <strong>Start:</strong> Entry point for your workflow
                      </p>
                      <p>
                        <strong>End:</strong> Exit point for your workflow
                      </p>
                      <p>
                        <strong>If/Else:</strong> Branch based on conditions
                      </p>
                      <p>
                        <strong>While Loop:</strong> Repeat until condition met
                      </p>
                      <p>
                        <strong>Agent:</strong> Call sub-agents
                      </p>
                      <p>
                        <strong>API:</strong> Connect to external services
                      </p>
                      <p>
                        <strong>LLM:</strong> Use AI language models
                      </p>
                      <p>
                        <strong>User Approval:</strong> Pause for human input
                      </p>
                    </div>
                  </div>
                </ScrollArea>
              </div>
            </ResizablePanel>

            <ResizableHandle className="bg-gray-200" />

            {/* Right Panel - Chat UI */}
            <ResizablePanel defaultSize={70} minSize={40}>
              <div className="h-full flex flex-col bg-white">
                <Tabs
                  value={activeTab}
                  onValueChange={setActiveTab}
                  className="flex-1 flex flex-col"
                >
                  <div className="border-b px-4">
                    <TabsList className="bg-transparent gap-4 h-12">
                      <TabsTrigger
                        value="chat"
                        className="gap-2 data-[state=active]:bg-blue-50"
                      >
                        <MessageSquare className="h-4 w-4" />
                        Chat
                      </TabsTrigger>
                      <TabsTrigger
                        value="generate"
                        className="gap-2 data-[state=active]:bg-blue-50"
                      >
                        <Sparkles className="h-4 w-4" />
                        Generate
                      </TabsTrigger>
                    </TabsList>
                  </div>

                  <TabsContent
                    value="chat"
                    className="flex-1 m-0 flex flex-col overflow-hidden"
                  >
                    {/* Messages Area */}
                    <ScrollArea className="flex-1 p-4">
                      <div className="space-y-4">
                        {messages.map((message) => (
                          <div
                            key={message.id}
                            className={`flex gap-3 ${
                              message.role === "user"
                                ? "justify-end"
                                : "justify-start"
                            }`}
                          >
                            {message.role === "assistant" && (
                              <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                                <Bot className="h-4 w-4 text-blue-600" />
                              </div>
                            )}
                            <div
                              className={`max-w-[80%] rounded-lg p-3 ${
                                message.role === "user"
                                  ? "bg-blue-600 text-white"
                                  : "bg-gray-100 text-gray-900"
                              }`}
                            >
                              {message.type === "image" && message.mediaUrl && (
                                <div className="mb-2">
                                  <img
                                    src={message.mediaUrl}
                                    alt="Generated"
                                    className="rounded-lg max-w-full"
                                  />
                                </div>
                              )}
                              <p className="text-sm whitespace-pre-wrap">
                                {message.content}
                              </p>
                              <div
                                className={`flex items-center justify-between mt-2 ${
                                  message.role === "user"
                                    ? "text-blue-200"
                                    : "text-gray-400"
                                }`}
                              >
                                <span className="text-xs">
                                  {message.timestamp.toLocaleTimeString()}
                                </span>
                                {message.role === "assistant" && (
                                  <button
                                    onClick={() =>
                                      copyToClipboard(
                                        message.content,
                                        message.id
                                      )
                                    }
                                    className="ml-2 hover:text-gray-600"
                                  >
                                    {copiedId === message.id ? (
                                      <Check className="h-3 w-3" />
                                    ) : (
                                      <Copy className="h-3 w-3" />
                                    )}
                                  </button>
                                )}
                              </div>
                            </div>
                            {message.role === "user" && (
                              <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                                <User className="h-4 w-4 text-gray-600" />
                              </div>
                            )}
                          </div>
                        ))}
                        {isGenerating && (
                          <div className="flex gap-3 justify-start">
                            <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                              <Bot className="h-4 w-4 text-blue-600" />
                            </div>
                            <div className="bg-gray-100 rounded-lg p-3">
                              <Loader2 className="h-4 w-4 animate-spin text-gray-500" />
                            </div>
                          </div>
                        )}
                        <div ref={messagesEndRef} />
                      </div>
                    </ScrollArea>

                    {/* Chat Input */}
                    <div className="p-4 border-t">
                      <div className="flex gap-2">
                        <Input
                          value={prompt}
                          onChange={(e) => setPrompt(e.target.value)}
                          onKeyPress={handleKeyPress}
                          placeholder="Type your message..."
                          className="flex-1"
                          disabled={isGenerating}
                        />
                        <Button
                          onClick={handleSendMessage}
                          disabled={isGenerating || !prompt.trim()}
                        >
                          {isGenerating ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Send className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent
                    value="generate"
                    className="flex-1 m-0 flex flex-col overflow-hidden"
                  >
                    {/* Generation Panel */}
                    <div className="flex-1 p-6 overflow-auto">
                      <div className="max-w-2xl mx-auto space-y-6">
                        <div className="text-center mb-6">
                          <h3 className="text-xl font-semibold flex items-center justify-center gap-2">
                            <Sparkles className="h-5 w-5" />
                            Create Images & Videos
                          </h3>
                          <p className="text-gray-500 mt-2">
                            Describe what you want to generate
                          </p>
                        </div>

                        {/* Generation Type Selection */}
                        <div className="flex gap-4 justify-center">
                          <Button
                            variant={generationType === "image" ? "default" : "outline"}
                            onClick={() => setGenerationType("image")}
                            className="gap-2"
                          >
                            <ImageIcon className="h-4 w-4" />
                            Generate Image
                          </Button>
                          <Button
                            variant={generationType === "video" ? "default" : "outline"}
                            onClick={() => setGenerationType("video")}
                            className="gap-2"
                          >
                            <Video className="h-4 w-4" />
                            Generate Video
                          </Button>
                        </div>

                        {/* Prompt Input */}
                        <div className="space-y-2">
                          <label className="text-sm font-medium">
                            Describe your {generationType}:
                          </label>
                          <Textarea
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            placeholder={
                              generationType === "image"
                                ? "A beautiful sunset over mountains with vibrant orange and pink colors..."
                                : "An animated scene of a robot walking through a futuristic city..."
                            }
                            className="min-h-[120px]"
                            disabled={isGenerating}
                          />
                        </div>

                        {/* Generate Button */}
                        <Button
                          onClick={handleSendMessage}
                          disabled={isGenerating || !prompt.trim()}
                          className="w-full gap-2"
                          size="lg"
                        >
                          {isGenerating ? (
                            <>
                              <Loader2 className="h-4 w-4 animate-spin" />
                              Generating...
                            </>
                          ) : (
                            <>
                              <Sparkles className="h-4 w-4" />
                              Generate {generationType === "image" ? "Image" : "Video"}
                            </>
                          )}
                        </Button>

                        {/* Results Display */}
                        {messages.length > 1 && (
                          <div className="mt-8 space-y-4">
                            <h4 className="font-medium">Generated Results:</h4>
                            {messages
                              .filter(
                                (m) =>
                                  m.role === "assistant" &&
                                  (m.type === "image" || m.type === "video")
                              )
                              .slice(-3)
                              .reverse()
                              .map((message) => (
                                <div
                                  key={message.id}
                                  className="border rounded-lg p-4"
                                >
                                  {message.type === "image" &&
                                    message.mediaUrl && (
                                      <img
                                        src={message.mediaUrl}
                                        alt="Generated"
                                        className="rounded-lg w-full"
                                      />
                                    )}
                                  {message.type === "video" && (
                                    <div className="text-center py-8 text-gray-500">
                                      <Video className="h-12 w-12 mx-auto mb-4" />
                                      <p>{message.content}</p>
                                    </div>
                                  )}
                                </div>
                              ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            </ResizablePanel>
          </ResizablePanelGroup>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AgentPreviewModal;
