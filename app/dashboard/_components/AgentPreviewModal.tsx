"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
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
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable";
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
  Wand2,
  Zap,
  Target,
  Layers,
  Clock,
  TrendingUp,
  ChevronRight,
  Star,
  ZapIcon,
  AlertCircle,
} from "lucide-react";

// Tool type definitions
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
  isGenerating?: boolean;
}

interface GenerationProgress {
  stage: "queued" | "processing" | "enhancing" | "finalizing" | "complete";
  progress: number;
  message: string;
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
    color: "bg-gradient-to-br from-green-400 to-green-600",
    description: "Starting point of the workflow",
    shadow: "shadow-green-500/25",
  },
  {
    type: "end",
    label: "End",
    icon: Square,
    color: "bg-gradient-to-br from-red-400 to-red-600",
    description: "Ending point of the workflow",
    shadow: "shadow-red-500/25",
  },
  {
    type: "if",
    label: "If/Else",
    icon: GitBranch,
    color: "bg-gradient-to-br from-purple-400 to-purple-600",
    description: "Conditional branching",
    shadow: "shadow-purple-500/25",
  },
  {
    type: "while",
    label: "While Loop",
    icon: RefreshCw,
    color: "bg-gradient-to-br from-blue-400 to-blue-600",
    description: "Repeat until condition is met",
    shadow: "shadow-blue-500/25",
  },
  {
    type: "edge",
    label: "Edge",
    icon: ArrowRight,
    color: "bg-gradient-to-br from-cyan-400 to-cyan-600",
    description: "Connect two nodes",
    shadow: "shadow-cyan-500/25",
  },
  {
    type: "agent",
    label: "Agent",
    icon: Bot,
    color: "bg-gradient-to-br from-yellow-400 to-yellow-600",
    description: "Call another agent with custom settings",
    shadow: "shadow-yellow-500/25",
  },
  {
    type: "api",
    label: "API",
    icon: Globe,
    color: "bg-gradient-to-br from-teal-400 to-teal-600",
    description: "Call an external API endpoint",
    shadow: "shadow-teal-500/25",
  },
  {
    type: "llm",
    label: "LLM",
    icon: MessageSquare,
    color: "bg-gradient-to-br from-indigo-400 to-indigo-600",
    description: "Large Language Model",
    shadow: "shadow-indigo-500/25",
  },
  {
    type: "userApproval",
    label: "User Approval",
    icon: CheckCircle,
    color: "bg-gradient-to-br from-pink-400 to-pink-600",
    description: "Pause for human approval",
    shadow: "shadow-pink-500/25",
  },
  {
    type: "workflow",
    label: "Sub-Workflow",
    icon: Workflow,
    color: "bg-gradient-to-br from-orange-400 to-orange-600",
    description: "Call another workflow",
    shadow: "shadow-orange-500/25",
  },
];

const generationStages = [
  { stage: "queued", message: "Queuing your request...", progress: 10 },
  { stage: "processing", message: "Processing your prompt...", progress: 30 },
  { stage: "enhancing", message: "Enhancing details...", progress: 60 },
  { stage: "finalizing", message: "Finalizing output...", progress: 85 },
  { stage: "complete", message: "Generation complete!", progress: 100 },
];

const AgentPreviewModal: React.FC<AgentPreviewModalProps> = ({
  open,
  onOpenChange,
}) => {
  const [activeTab, setActiveTab] = useState("chat");
  const [chatPrompt, setChatPrompt] = useState("");
  const [generationPrompt, setGenerationPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [openAIKey, setOpenAIKey] = useState("");
  const [replicateKey, setReplicateKey] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content: "Welcome to NOVA! 🎉 I'm your AI agent assistant. You can chat with me about building agents, ask me to explain tools, or I can help you generate stunning images and videos in real-time. What would you like to do today?",
      timestamp: new Date(),
      type: "text",
    },
  ]);
  const [generationType, setGenerationType] = useState<"chat" | "image" | "video">("chat");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [generationProgress, setGenerationProgress] = useState<GenerationProgress | null>(null);
  const [streamingContent, setStreamingContent] = useState("");
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!open) return;
    const stored = localStorage.getItem("dashboard-preview-keys");
    if (!stored) return;
    try {
      const parsed = JSON.parse(stored);
      setOpenAIKey(parsed.openAIKey || "");
      setReplicateKey(parsed.replicateKey || "");
    } catch {
      // Ignore corrupted localStorage values
    }
  }, [open]);

  // Reset states when modal closes
  useEffect(() => {
    if (!open) {
      setGenerationProgress(null);
      setStreamingContent("");
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
    }
  }, [open]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamingContent]);

  const persistKeys = () => {
    localStorage.setItem(
      "dashboard-preview-keys",
      JSON.stringify({ openAIKey, replicateKey })
    );
  };

  const simulateProgress = useCallback(() => {
    let currentStage = 0;
    setGenerationProgress({
      stage: generationStages[0].stage as GenerationProgress["stage"],
      progress: 0,
      message: generationStages[0].message,
    });

    progressIntervalRef.current = setInterval(() => {
      currentStage++;
      if (currentStage < generationStages.length) {
        setGenerationProgress({
          stage: generationStages[currentStage].stage as GenerationProgress["stage"],
          progress: generationStages[currentStage].progress,
          message: generationStages[currentStage].message,
        });
      } else {
        if (progressIntervalRef.current) {
          clearInterval(progressIntervalRef.current);
          progressIntervalRef.current = null;
        }
      }
    }, 1500);
  }, []);

  const handleSendMessage = async () => {
    const currentPrompt =
      activeTab === "generate" ? generationPrompt.trim() : chatPrompt.trim();
    if (!currentPrompt) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: currentPrompt,
      timestamp: new Date(),
      type: "text",
    };

    setMessages((prev) => [...prev, userMessage]);
    if (activeTab === "generate") {
      setGenerationPrompt("");
    } else {
      setChatPrompt("");
    }
    setIsGenerating(true);
    persistKeys();

    // Start progress simulation for generation
    if (activeTab === "generate") {
      simulateProgress();
    }

    try {
      let response: Response;
      if (activeTab === "generate" && generationType === "video") {
        response = await fetch("/api/video", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            prompt: currentPrompt,
            apiKey: replicateKey || undefined,
            userId: "dashboard-preview",
          }),
        });
      } else {
        response = await fetch("/api/openai", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            prompt: currentPrompt,
            type: activeTab === "generate" ? generationType : "chat",
            providerApiKey: openAIKey || undefined,
            systemPrompt:
              "You are NOVA dashboard preview assistant. Give practical guidance for creating professional agents and workflows.",
          }),
        });
      }

      const data = await response.json();

      // Clear progress simulation
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
      setGenerationProgress(null);

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content:
          data.message ||
          data.videoUrl ||
          data.url ||
          data.error ||
          "Something went wrong",
        timestamp: new Date(),
        type:
          data.type ||
          (activeTab === "generate" && generationType === "video"
            ? "video"
            : activeTab === "generate" && generationType === "image"
            ? "image"
            : "text"),
        mediaUrl: data.url || data.videoUrl,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      // Clear progress on error
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
      setGenerationProgress(null);

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

  // Animated gradient background
  const gradientBg = "bg-gradient-to-br from-violet-50 via-purple-50 to-pink-50";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl h-[90vh] p-0 overflow-hidden bg-gradient-to-br from-white to-gray-50">
        {/* Header with gradient */}
        <div className="bg-gradient-to-r from-violet-600 via-purple-600 to-pink-600 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <div>
                <DialogTitle className="flex items-center gap-2 text-white">
                  <Bot className="h-5 w-5" />
                  NOVA Agent Preview
                </DialogTitle>
                <DialogDescription className="text-white/80 text-xs">
                  Preview your AI agent with tools and chat interface
                </DialogDescription>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="px-3 py-1 bg-white/20 rounded-full backdrop-blur-sm">
                <span className="text-xs text-white font-medium">Live Demo</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 h-full overflow-hidden">
          <ResizablePanelGroup className="h-full">
            {/* Left Panel - Agent Tools Preview */}
            <ResizablePanel defaultSize={28} minSize={20} maxSize={35}>
              <div className="h-full border-r bg-gradient-to-b from-white to-gray-50">
                <div className="p-4 border-b bg-white/50 backdrop-blur-sm">
                  <h2 className="font-bold text-lg flex items-center gap-2 bg-gradient-to-r from-violet-600 to-pink-600 bg-clip-text text-transparent">
                    <Layers className="h-4 w-4 text-violet-600" />
                    Agent Tools
                  </h2>
                  <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                    <Target className="h-3 w-3" />
                    Available tools for your agent
                  </p>
                </div>
                <ScrollArea className="h-[calc(100%-60px)]">
                  <div className="p-4 space-y-3">
                    {tools.map((tool, index) => (
                      <div
                        key={tool.type}
                        className="flex items-center gap-3 p-3 rounded-xl border bg-white hover:bg-gradient-to-r hover:from-violet-50 hover:to-pink-50 cursor-pointer transition-all hover:shadow-lg hover:scale-[1.02] group"
                        style={{ animationDelay: `${index * 50}ms` }}
                      >
                        <div className={`p-2.5 rounded-xl ${tool.color} ${tool.shadow} shadow-lg group-hover:scale-110 transition-transform`}>
                          <tool.icon className="h-4 w-4 text-white" />
                        </div>
                        <div>
                          <p className="font-semibold text-sm text-gray-800">{tool.label}</p>
                          <p className="text-xs text-gray-500">
                            {tool.description}
                          </p>
                        </div>
                        <ChevronRight className="h-4 w-4 text-gray-300 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    ))}

                    {/* Feature Cards */}
                    <div className="mt-6 space-y-3">
                      <div className="p-4 bg-gradient-to-r from-violet-100 to-purple-100 rounded-xl border border-violet-200">
                        <div className="flex items-center gap-2 mb-2">
                          <ZapIcon className="h-4 w-4 text-violet-600" />
                          <h3 className="font-semibold text-sm text-violet-800">Real-time Generation</h3>
                        </div>
                        <p className="text-xs text-violet-600">
                          Generate images and videos instantly with AI
                        </p>
                      </div>
                      <div className="p-4 bg-gradient-to-r from-pink-100 to-rose-100 rounded-xl border border-pink-200">
                        <div className="flex items-center gap-2 mb-2">
                          <TrendingUp className="h-4 w-4 text-pink-600" />
                          <h3 className="font-semibold text-sm text-pink-800">Live Progress</h3>
                        </div>
                        <p className="text-xs text-pink-600">
                          Track your generation in real-time
                        </p>
                      </div>
                      <div className="p-4 bg-gradient-to-r from-blue-100 to-cyan-100 rounded-xl border border-blue-200">
                        <div className="flex items-center gap-2 mb-2">
                          <Clock className="h-4 w-4 text-blue-600" />
                          <h3 className="font-semibold text-sm text-blue-800">Quick Export</h3>
                        </div>
                        <p className="text-xs text-blue-600">
                          Copy and use generated content instantly
                        </p>
                      </div>
                    </div>
                  </div>
                </ScrollArea>
              </div>
            </ResizablePanel>

            <ResizableHandle className="bg-gradient-to-b from-violet-200 via-purple-200 to-pink-200 w-1" />

            {/* Right Panel - Chat UI */}
            <ResizablePanel defaultSize={72} minSize={40}>
              <div className="h-full flex flex-col bg-white">
                <Tabs
                  value={activeTab}
                  onValueChange={setActiveTab}
                  className="flex-1 flex flex-col"
                >
                  <div className="border-b bg-gradient-to-r from-violet-50/50 to-pink-50/50 px-4">
                    <TabsList className="bg-transparent gap-2 h-14">
                      <TabsTrigger
                        value="chat"
                        className="gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-violet-600 data-[state=active]:to-purple-600 data-[state=active]:text-white px-6"
                      >
                        <MessageSquare className="h-4 w-4" />
                        Chat
                      </TabsTrigger>
                      <TabsTrigger
                        value="generate"
                        className="gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-pink-600 data-[state=active]:to-rose-600 data-[state=active]:text-white px-6"
                      >
                        <Wand2 className="h-4 w-4" />
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
                              <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-purple-500/30">
                                <Bot className="h-5 w-5 text-white" />
                              </div>
                            )}
                            <div
                              className={`max-w-[80%] rounded-2xl p-4 ${
                                message.role === "user"
                                  ? "bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-lg shadow-purple-500/30"
                                  : "bg-gradient-to-br from-gray-50 to-gray-100 text-gray-900 border border-gray-200 shadow-sm"
                              }`}
                            >
                              {message.type === "image" && message.mediaUrl && (
                                <div className="mb-3">
                                  <img
                                    src={message.mediaUrl}
                                    alt="Generated"
                                    className="rounded-xl w-full shadow-lg"
                                  />
                                </div>
                              )}
                              {message.type === "video" && message.mediaUrl && (
                                <div className="mb-3">
                                  <video
                                    src={message.mediaUrl}
                                    controls
                                    className="rounded-xl w-full shadow-lg"
                                  />
                                </div>
                              )}
                              <p className="text-sm whitespace-pre-wrap leading-relaxed">
                                {message.content}
                              </p>
                              <div
                                className={`flex items-center justify-between mt-3 pt-2 border-t ${
                                  message.role === "user"
                                    ? "border-white/20"
                                    : "border-gray-200"
                                }`}
                              >
                                <span className="text-xs opacity-70">
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
                                    className="ml-2 hover:text-violet-600 transition-colors"
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
                              <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center flex-shrink-0 shadow-md">
                                <User className="h-5 w-5 text-gray-600" />
                              </div>
                            )}
                          </div>
                        ))}
                        {isGenerating && (
                          <div className="flex gap-3 justify-start">
                            <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-500/30">
                              <Bot className="h-5 w-5 text-white" />
                            </div>
                            <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-4 border border-gray-200">
                              <div className="flex items-center gap-2">
                                <Loader2 className="h-4 w-4 animate-spin text-violet-600" />
                                <span className="text-sm text-gray-600">Thinking...</span>
                              </div>
                            </div>
                          </div>
                        )}
                        <div ref={messagesEndRef} />
                      </div>
                    </ScrollArea>

                    {/* Chat Input */}
                    <div className="p-4 border-t bg-white/80 backdrop-blur-sm">
                      <div className="flex gap-2 items-center">
                        <div className="flex-1 relative">
                          <Input
                            value={chatPrompt}
                            onChange={(e) => setChatPrompt(e.target.value)}
                            onKeyDown={handleKeyPress}
                            placeholder="Type your message..."
                            className="pr-12 h-12 rounded-xl border-2 border-violet-200 focus:border-violet-500 focus:ring-violet-200"
                            disabled={isGenerating}
                          />
                        </div>
                        <Button
                          onClick={handleSendMessage}
                          disabled={isGenerating || !chatPrompt.trim()}
                          className="h-12 w-12 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 shadow-lg shadow-purple-500/30 transition-all hover:scale-105"
                        >
                          {isGenerating ? (
                            <Loader2 className="h-5 w-5 animate-spin" />
                          ) : (
                            <Send className="h-5 w-5" />
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
                    <ScrollArea className="flex-1">
                      <div className="p-6">
                        <div className="max-w-2xl mx-auto space-y-6">
                          {/* Header */}
                          <div className="text-center mb-8">
                            <div className="inline-flex items-center justify-center p-3 bg-gradient-to-r from-violet-100 to-pink-100 rounded-2xl mb-4">
                              <Sparkles className="h-6 w-6 text-violet-600" />
                            </div>
                            <h3 className="text-2xl font-bold bg-gradient-to-r from-violet-600 to-pink-600 bg-clip-text text-transparent">
                              Create Images & Videos
                            </h3>
                            <p className="text-gray-500 mt-2">
                              Describe what you want to generate
                            </p>
                          </div>

                          {/* Progress Indicator */}
                          {generationProgress && (
                            <div className="p-6 bg-gradient-to-r from-violet-50 to-pink-50 rounded-2xl border border-violet-200">
                              <div className="flex items-center justify-between mb-3">
                                <span className="font-semibold text-violet-800 flex items-center gap-2">
                                  <Zap className="h-4 w-4" />
                                  {generationProgress.message}
                                </span>
                                <span className="text-sm font-bold text-violet-600">
                                  {generationProgress.progress}%
                                </span>
                              </div>
                              <div className="h-3 bg-violet-200 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-gradient-to-r from-violet-500 via-purple-500 to-pink-500 rounded-full transition-all duration-500"
                                  style={{ width: `${generationProgress.progress}%` }}
                                />
                              </div>
                              <div className="flex justify-between mt-2 text-xs text-violet-600">
                                <span className={generationProgress.stage === "queued" ? "font-bold" : ""}>Queued</span>
                                <span className={generationProgress.stage === "processing" ? "font-bold" : ""}>Processing</span>
                                <span className={generationProgress.stage === "enhancing" ? "font-bold" : ""}>Enhancing</span>
                                <span className={generationProgress.stage === "finalizing" ? "font-bold" : ""}>Finalizing</span>
                                <span className={generationProgress.stage === "complete" ? "font-bold" : ""}>Complete</span>
                              </div>
                            </div>
                          )}

                          {/* Generation Type Selection */}
                          <div className="flex gap-4 justify-center">
                            <Button
                              variant={generationType === "image" ? "default" : "outline"}
                              onClick={() => setGenerationType("image")}
                              className={`gap-2 px-6 py-3 rounded-xl ${
                                generationType === "image"
                                  ? "bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 shadow-lg shadow-purple-500/30"
                                  : "border-2 border-violet-200 hover:border-violet-400"
                              }`}
                            >
                              <ImageIcon className="h-5 w-5" />
                              Generate Image
                            </Button>
                            <Button
                              variant={generationType === "video" ? "default" : "outline"}
                              onClick={() => setGenerationType("video")}
                              className={`gap-2 px-6 py-3 rounded-xl ${
                                generationType === "video"
                                  ? "bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700 shadow-lg shadow-rose-500/30"
                                  : "border-2 border-pink-200 hover:border-pink-400"
                              }`}
                            >
                              <Video className="h-5 w-5" />
                              Generate Video
                            </Button>
                          </div>

                          {/* API Keys */}
                          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div className="space-y-2 p-4 bg-white rounded-xl border-2 border-violet-100 hover:border-violet-300 transition-colors">
                              <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                                OpenAI Key (images)
                              </label>
                              <Input
                                type="password"
                                value={openAIKey}
                                onChange={(e) => setOpenAIKey(e.target.value)}
                                placeholder="sk-..."
                                className="border-violet-200 focus:border-violet-500"
                              />
                            </div>
                            <div className="space-y-2 p-4 bg-white rounded-xl border-2 border-pink-100 hover:border-pink-300 transition-colors">
                              <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                <span className="w-2 h-2 bg-pink-500 rounded-full"></span>
                                Replicate Key (videos)
                              </label>
                              <Input
                                type="password"
                                value={replicateKey}
                                onChange={(e) => setReplicateKey(e.target.value)}
                                placeholder="r8_..."
                                className="border-pink-200 focus:border-pink-500"
                              />
                            </div>
                          </div>

                          {/* Prompt Input */}
                          <div className="space-y-3 p-5 bg-white rounded-2xl border-2 border-gray-100 hover:border-violet-200 transition-colors">
                            <label className="text-sm font-semibold flex items-center gap-2">
                              <Star className="h-4 w-4 text-violet-500" />
                              Describe your {generationType}:
                            </label>
                            <Textarea
                              value={generationPrompt}
                              onChange={(e) => setGenerationPrompt(e.target.value)}
                              placeholder={
                                generationType === "image"
                                  ? "A beautiful sunset over mountains with vibrant orange and pink colors, hyper-realistic, 8k quality..."
                                  : "An animated scene of a robot walking through a futuristic city, cinematic lighting, high quality..."
                              }
                              className="min-h-[140px] resize-none border-gray-200 focus:border-violet-500 rounded-xl"
                              disabled={isGenerating}
                            />
                            <p className="text-xs text-gray-400 flex items-center gap-1">
                              <AlertCircle className="h-3 w-3" />
                              Be specific for better results
                            </p>
                          </div>

                          {/* Generate Button */}
                          <Button
                            onClick={handleSendMessage}
                            disabled={isGenerating || !generationPrompt.trim()}
                            className="w-full gap-2 py-6 text-lg rounded-2xl bg-gradient-to-r from-violet-600 via-purple-600 to-pink-600 hover:from-violet-700 hover:via-purple-700 hover:to-pink-700 shadow-xl shadow-purple-500/25 transition-all hover:scale-[1.02] hover:shadow-2xl"
                            size="lg"
                          >
                            {isGenerating ? (
                              <>
                                <Loader2 className="h-5 w-5 animate-spin" />
                                Generating...
                              </>
                            ) : (
                              <>
                                <Wand2 className="h-5 w-5" />
                                Generate {generationType === "image" ? "Image" : "Video"}
                              </>
                            )}
                          </Button>

                          {/* Results Display */}
                          {messages.length > 1 && (
                            <div className="mt-8 space-y-4">
                              <h4 className="font-bold text-lg flex items-center gap-2">
                                <Star className="h-5 w-5 text-yellow-500" />
                                Generated Results:
                              </h4>
                              <div className="grid grid-cols-1 gap-4">
                                {messages
                                  .filter(
                                    (m) =>
                                      m.role === "assistant" &&
                                      (m.type === "image" || m.type === "video")
                                  )
                                  .slice(-4)
                                  .reverse()
                                  .map((message) => (
                                    <div
                                      key={message.id}
                                      className="border-2 border-gray-100 rounded-2xl p-4 bg-white hover:border-violet-200 transition-all hover:shadow-lg"
                                    >
                                      {message.type === "image" &&
                                        message.mediaUrl && (
                                          <div className="relative group">
                                            <img
                                              src={message.mediaUrl}
                                              alt="Generated"
                                              className="rounded-xl w-full shadow-md"
                                            />
                                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center">
                                              <Button
                                                variant="secondary"
                                                size="sm"
                                                onClick={() =>
                                                  copyToClipboard(
                                                    message.mediaUrl!,
                                                    message.id + "-url"
                                                  )
                                                }
                                              >
                                                Copy URL
                                              </Button>
                                            </div>
                                          </div>
                                        )}
                                      {message.type === "video" && (
                                        <div className="space-y-3">
                                          {message.mediaUrl ? (
                                            <div className="relative group">
                                              <video
                                                src={message.mediaUrl}
                                                controls
                                                className="w-full rounded-xl shadow-md"
                                              />
                                              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center">
                                                <Button
                                                  variant="secondary"
                                                  size="sm"
                                                  onClick={() =>
                                                    copyToClipboard(
                                                      message.mediaUrl!,
                                                      message.id + "-url"
                                                    )
                                                  }
                                                >
                                                  Copy URL
                                                </Button>
                                              </div>
                                            </div>
                                          ) : null}
                                          <p className="text-sm text-gray-600 flex items-center gap-2">
                                            <Video className="h-4 w-4" />
                                            {message.content}
                                          </p>
                                        </div>
                                      )}
                                    </div>
                                  ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </ScrollArea>
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

