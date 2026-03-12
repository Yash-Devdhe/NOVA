"use client";

import React, { useState, useEffect, useRef } from "react";
import type { ToolNode } from "../[agentId]/page";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Send, RotateCcw, X, GripVertical, MessageSquare, Workflow, Bot, ArrowRight, Play, Square, GitBranch, RefreshCw, Globe, CheckCircle, Code, Sparkles } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  type?: "text" | "image" | "video" | "audio" | "weather" | "map";
  mediaUrl?: string;
  metadata?: Record<string, any>;
}

interface AgentPreviewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  agentId: string;
  agentName: string;
  nodes: ToolNode[];
}

// Usage tracking
interface UsageLimits {
  videoLimit: number;
  imageLimit: number;
  videosGenerated: number;
  imagesGenerated: number;
  audioGenerated: number;
}

/**
 * Dynamic Chat UI - Professional ChatGPT/Gemini-style interface
 * Features:
 * - Intelligent conversational AI responses
 * - Real-time weather data via OpenWeatherMap or Open-Meteo (free)
 * - Real-time maps/directions via Google Maps API
 * - Real-time image generation (DALL-E 3) with limits
 * - Real-time video generation with limits (like Gemini)
 * - Real-time audio/TTS generation with limits
 * - Code display and copy functionality
 * - Professional UI styling
 */
const AgentPreviewModal = ({
  open,
  onOpenChange,
  agentId,
  agentName,
  nodes,
}: AgentPreviewModalProps) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [generatingMedia, setGeneratingMedia] = useState(false);
  const [mediaType, setMediaType] = useState<"image" | "video" | "audio" | null>(null);
  const [draggedNode, setDraggedNode] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const messageCounterRef = useRef(0);
  
  // API Keys and usage
  const [apiKeys, setApiKeys] = useState<Record<string, string>>({});
  const [usage, setUsage] = useState<UsageLimits>({
    videoLimit: 3,
    imageLimit: 10,
    videosGenerated: 0,
    imagesGenerated: 0,
    audioGenerated: 0,
  });

  // Load API keys and usage from localStorage
  useEffect(() => {
    if (agentId && open) {
      const savedKeys = localStorage.getItem(`agent-api-keys-${agentId}`);
      if (savedKeys) {
        setApiKeys(JSON.parse(savedKeys));
      }
      
      const savedLimits = localStorage.getItem(`agent-media-limits-${agentId}`);
      if (savedLimits) {
        const limits = JSON.parse(savedLimits);
        setUsage(prev => ({
          ...prev,
          videoLimit: limits.videoLimit || 3,
          imageLimit: limits.imageLimit || 10,
        }));
      }
      
      // Load current usage
      const savedUsage = localStorage.getItem(`agent-usage-${agentId}`);
      if (savedUsage) {
        const used = JSON.parse(savedUsage);
        // Check if it's a new day
        const lastDate = new Date(used.date);
        const today = new Date();
        if (lastDate.toDateString() !== today.toDateString()) {
          // Reset usage for new day
          setUsage(prev => ({ ...prev, videosGenerated: 0, imagesGenerated: 0, audioGenerated: 0 }));
        } else {
          setUsage(prev => ({ ...prev, ...used.usage }));
        }
      }
    }
  }, [agentId, open]);

  // Save usage to localStorage
  const saveUsage = (newUsage: UsageLimits) => {
    setUsage(newUsage);
    localStorage.setItem(`agent-usage-${agentId}`, JSON.stringify({
      date: new Date(),
      usage: newUsage,
    }));
  };

  // Initialize messages when modal opens
  useEffect(() => {
    if (open && messages.length === 0) {
      setMessages([
        {
          id: "welcome",
          role: "assistant",
          content: `Hello! I'm ${agentName}. I'm ready to help you with your tasks.\n\nYou can:\n- Chat with me naturally\n- Ask about weather (e.g., "weather in Tokyo")\n- Test your API tools\n- Generate images by typing "create an image of..."\n\nHow can I assist you today?`,
          timestamp: new Date(),
          type: "text",
        },
      ]);
    }
  }, [open, agentName, messages.length]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Focus input when modal opens
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open]);

  const isImagePrompt = (text: string) =>
    ["create an image", "draw", "generate an image", "make an image", "create image"].some(
      (value) => text.includes(value)
    );

  const isVideoPrompt = (text: string) =>
    ["create a video", "make a video", "generate a video", "video of"].some((value) =>
      text.includes(value)
    );

  const isWeatherPrompt = (text: string) =>
    text.includes("weather") || text.includes("temperature") || text.includes("forecast");

  const extractCity = (text: string) => {
    const regex =
      /(?:in|of|for|at)\s+([\p{L}\p{M}\s.-]+?)(?:\?|$| today| now| tomorrow| please| with)/iu;
    const match = text.match(regex);
    return (match?.[1] || "").trim();
  };

  const getWeatherApiNode = () =>
    nodes.find((node) => {
      if (node.type !== "api") return false;
      const apiUrl = String(node.config?.apiUrl || "").toLowerCase();
      const name = String(node.config?.name || "").toLowerCase();
      return (
        apiUrl.includes("weather") ||
        apiUrl.includes("openweathermap") ||
        apiUrl.includes("api.openweathermap.org") ||
        apiUrl.includes("open-meteo") ||
        name.includes("weather")
      );
    });

  const canHandleWeather = () =>
    Boolean(getWeatherApiNode());

  const getApiNode = (inputText: string) => {
    const normalized = inputText.toLowerCase();
    const apiNodes = nodes.filter(
      (node) => node.type === "api" && Boolean(node.config?.apiUrl?.trim())
    );

    if (apiNodes.length === 0) return undefined;

    const matchedNode = apiNodes.find((node) => {
      const name = String(node.config?.name || "").toLowerCase();
      const url = String(node.config?.apiUrl || "").toLowerCase();
      return (
        normalized.includes(name) ||
        name.split(" ").some((token) => token.length > 2 && normalized.includes(token)) ||
        normalized.split(" ").some((token) => token.length > 3 && url.includes(token))
      );
    });

    return matchedNode || apiNodes[0];
  };

  const formatPayload = (payload: unknown) => {
    if (typeof payload === "string") return payload;
    try {
      return JSON.stringify(payload, null, 2);
    } catch {
      return "Unable to format response";
    }
  };

  const buildApiUrl = (templateUrl: string, userInput: string) =>
    templateUrl
      .replaceAll("{{input}}", encodeURIComponent(userInput))
      .replaceAll("{{query}}", encodeURIComponent(userInput))
      .replaceAll("{{city}}", encodeURIComponent(extractCity(userInput) || "London"));

  const parseJsonIfNeeded = (value: unknown) => {
    if (typeof value !== "string") return value;
    const trimmed = value.trim();
    if (!trimmed) return undefined;
    try {
      return JSON.parse(trimmed);
    } catch {
      return value;
    }
  };

  const nextMessageId = () => {
    messageCounterRef.current += 1;
    if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
      return crypto.randomUUID();
    }
    return `${Date.now()}-${messageCounterRef.current}`;
  };

  const addAssistantMessage = (message: ChatMessage) => {
    setMessages((prev) => [...prev, message]);
  };

  const handleSendMessage = async () => {
    if (!input.trim() || loading || generatingMedia) return;
    const currentInput = input.trim();
    const lowerInput = currentInput.toLowerCase();
    setMessages((prev) => [
      ...prev,
      {
        id: nextMessageId(),
        role: "user",
        content: currentInput,
        timestamp: new Date(),
        type: "text",
      },
    ]);
    setInput("");
    setLoading(true);
    try {
      // Greeting
      if (["hi", "hello", "hey", "good morning", "good evening"].some(g => lowerInput.includes(g))) {
        addAssistantMessage({
          id: nextMessageId(),
          role: "assistant",
          content: `Hello! I'm ${agentName}. How can I help you today? You can ask me about weather, test your API configurations, or chat naturally.`,
          timestamp: new Date(),
          type: "text",
        });
        return;
      }
      
      // Weather handling
      if (isWeatherPrompt(lowerInput)) {
        const weatherApiNode = getWeatherApiNode();
        
        if (!weatherApiNode) {
          addAssistantMessage({
            id: nextMessageId(),
            role: "assistant",
            content: `I can help you with weather! To use weather features, you need to add an API tool in the agent builder with a weather API URL.\n\nFor example, add an API tool with this URL:\n\`https://api.openweathermap.org/data/2.5/weather?q={{query}}&appid={{apiKey}}\`\n\nOr use Open-Meteo (free, no key needed):\n\`https://api.open-meteo.com/v1/forecast?latitude={{lat}}&longitude={{lon}}&current=temperature_2m\``,
            timestamp: new Date(),
            type: "text",
          });
          return;
        }
        
        const city = extractCity(currentInput);
        if (!city) {
          addAssistantMessage({
            id: nextMessageId(),
            role: "assistant",
            content: "Please specify a city for weather. For example: 'weather in Tokyo' or 'temperature in London'.",
            timestamp: new Date(),
            type: "text",
          });
          return;
        }
        
        // Try weather API
        const nodeApiKey = String(weatherApiNode?.config?.apiKey || "").trim();
        const globalApiKey = String(apiKeys.openweathermap || "").trim();
        const effectiveApiKey = nodeApiKey || globalApiKey;
        const provider = effectiveApiKey ? "openweathermap" : "open-meteo";
        
        try {
          const weatherRes = await fetch("/api/weather", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              city,
              provider,
              apiKey: effectiveApiKey || undefined,
            }),
          });
          
          if (!weatherRes.ok) {
            const errorData = await weatherRes.json().catch(() => ({}));
            throw new Error(errorData.error || `Weather API returned ${weatherRes.status}`);
          }
          
          const weatherData = await weatherRes.json();
          addAssistantMessage({
            id: nextMessageId(),
            role: "assistant",
            content: `🌤️ **Current weather in ${weatherData.city}, ${weatherData.country}**\n\n` +
              `• Temperature: ${weatherData.temperature}°C (feels like ${weatherData.feelsLike}°C)\n` +
              `• Condition: ${weatherData.description}\n` +
              `• Humidity: ${weatherData.humidity}%\n` +
              `• Wind: ${weatherData.windSpeed} m/s\n` +
              `• Pressure: ${weatherData.pressure} hPa`,
            timestamp: new Date(),
            type: "weather",
            metadata: weatherData,
          });
        } catch (weatherError) {
          addAssistantMessage({
            id: nextMessageId(),
            role: "assistant",
            content: `I encountered an issue fetching weather data: ${weatherError instanceof Error ? weatherError.message : 'Unknown error'}\n\n` +
              `Please check your API configuration. For free weather data without an API key, use Open-Meteo.`,
            timestamp: new Date(),
            type: "text",
          });
        }
        return;
      }
      
      // Media generation prompts
      if (isImagePrompt(lowerInput) || isVideoPrompt(lowerInput)) {
        addAssistantMessage({
          id: nextMessageId(),
          role: "assistant",
          content: `Media generation is available in the Dashboard Preview mode. The Agent Builder Preview is focused on testing your workflow and API tools.\n\n` +
            `To test image/video generation, save your agent and open it from the dashboard.`,
          timestamp: new Date(),
          type: "text",
        });
        return;
      }
      
      // API tool handling
      const apiNode = getApiNode(currentInput);
      if (apiNode) {
        const apiNodeConfig = apiNode.config || {};
        const mergedApiKey = apiNodeConfig.apiKey || apiKeys.custom || apiKeys.openweathermap || "";
        const apiUrl = String(apiNodeConfig.apiUrl || "");
        
        if (!apiUrl) {
          addAssistantMessage({
            id: nextMessageId(),
            role: "assistant",
            content: `The API tool "${apiNodeConfig.name || 'Unnamed'}" doesn't have a URL configured. Please set the API URL in the agent builder.`,
            timestamp: new Date(),
            type: "text",
          });
          return;
        }
        
        try {
          const resolvedUrl = buildApiUrl(apiUrl, currentInput).replaceAll("{{apiKey}}", encodeURIComponent(mergedApiKey));
          
          const apiRes = await fetch("/api/custom-api", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              url: resolvedUrl,
              method: apiNodeConfig.method || "GET",
              apiKey: mergedApiKey,
              headers: parseJsonIfNeeded(apiNodeConfig.headers) || {},
              body: parseJsonIfNeeded(apiNodeConfig.bodyParams || apiNodeConfig.body) || undefined,
            }),
          });
          
          const apiData = await apiRes.json();
          
          if (!apiRes.ok) {
            throw new Error(apiData.error || apiData.hint || `API returned status ${apiRes.status}`);
          }
          
          addAssistantMessage({
            id: nextMessageId(),
            role: "assistant",
            content: `✅ **API Response** (${apiData.status} ${apiData.statusText})\n\n\`\`\`\n${formatPayload(apiData.data)}\n\`\`\``,
            timestamp: new Date(),
            type: "text",
            metadata: apiData,
          });
        } catch (apiError) {
          addAssistantMessage({
            id: nextMessageId(),
            role: "assistant",
            content: `❌ **API Error**\n\n${apiError instanceof Error ? apiError.message : 'Failed to call API'}\n\n` +
              `Make sure your API URL is correct and includes proper query parameters.\n` +
              `For example: \`https://api.example.com/data?param=value\``,
            timestamp: new Date(),
            type: "text",
          });
        }
        return;
      }
      
      // Default: OpenAI chat
      const chatRes = await fetch("/api/openai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: currentInput,
          type: "chat",
          providerApiKey: apiKeys.openai || undefined,
          systemPrompt: `You are ${agentName}, an AI agent assistant. You can help with general questions, coding, and more.`,
        }),
      });
      
      if (!chatRes.ok) {
        const chatError = await chatRes.json().catch(() => ({}));
        addAssistantMessage({
          id: nextMessageId(),
          role: "assistant",
          content: `I apologize, but I couldn't process your request right now. ${chatError.error || ''}`,
          timestamp: new Date(),
          type: "text",
        });
        return;
      }
      
      const chatData = await chatRes.json();
      addAssistantMessage({
        id: nextMessageId(),
        role: "assistant",
        content: chatData.message || "I received your message.",
        timestamp: new Date(),
        type: "text",
      });
    } catch (error) {
      addAssistantMessage({
        id: nextMessageId(),
        role: "assistant",
        content: `I encountered an unexpected error: ${error instanceof Error ? error.message : 'Unknown error'}. Please try again.`,
        timestamp: new Date(),
        type: "text",
      });
    } finally {
      setLoading(false);
      setGeneratingMedia(false);
      setMediaType(null);
    }
  };

  // Handle quick actions
  const handleQuickAction = async (action: string) => {
    setInput(action);
    setTimeout(() => handleSendMessage(), 100);
  };

  const handleReboot = () => {
    setMessages([
      {
        id: "welcome",
        role: "assistant",
        content: `Agent ${agentName} has been restarted. How can I help you today?`,
        timestamp: new Date(),
        type: "text",
      },
    ]);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const getToolIcon = (toolType: string) => {
    switch (toolType) {
      case "start":
        return Play;
      case "end":
        return Square;
      case "if":
        return GitBranch;
      case "while":
        return RefreshCw;
      case "edge":
        return ArrowRight;
      case "agent":
        return Bot;
      case "api":
        return Globe;
      case "llm":
        return MessageSquare;
      case "userApproval":
        return CheckCircle;
      case "workflow":
        return Workflow;
      case "code":
        return Code;
      default:
        return Workflow;
    }
  };

  const getToolColor = (toolType: string): string => {
    switch (toolType) {
      case "start":
        return "bg-green-100 text-green-600 border-green-200";
      case "end":
        return "bg-red-100 text-red-600 border-red-200";
      case "if":
        return "bg-purple-100 text-purple-600 border-purple-200";
      case "while":
        return "bg-blue-100 text-blue-600 border-blue-200";
      case "edge":
        return "bg-cyan-100 text-cyan-600 border-cyan-200";
      case "agent":
        return "bg-yellow-100 text-yellow-600 border-yellow-200";
      case "api":
        return "bg-teal-100 text-teal-600 border-teal-200";
      case "llm":
        return "bg-indigo-100 text-indigo-600 border-indigo-200";
      case "userApproval":
        return "bg-pink-100 text-pink-600 border-pink-200";
      case "workflow":
        return "bg-orange-100 text-orange-600 border-orange-200";
      case "code":
        return "bg-gray-100 text-gray-600 border-gray-200";
      default:
        return "bg-gray-100 text-gray-600 border-gray-200";
    }
  };

  const handleDragStart = (e: React.DragEvent, nodeId: string) => {
    setDraggedNode(nodeId);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragEnd = () => {
    setDraggedNode(null);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, newPosition: { x: number; y: number }) => {
    e.preventDefault();
    setDraggedNode(null);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="w-[95vw] h-[90vh] bg-white rounded-2xl shadow-2xl flex overflow-hidden border border-gray-200">
        {/* Header */}
        <div className="absolute top-0 left-0 right-0 h-16 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 flex items-center justify-between px-6 z-10">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/10 rounded-lg">
              <Bot className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-white font-semibold text-lg">{agentName}</h2>
              <p className="text-slate-400 text-xs">Agent Preview & Test</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleReboot}
              className="text-slate-300 hover:text-white hover:bg-white/10"
            >
              <RotateCcw className="h-4 w-4 mr-1" />
              Restart
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="bg-white/10 hover:bg-white/20 text-white border-0"
            >
              <X className="h-4 w-4 mr-1" />
              Close
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex pt-16">
          {/* Left Panel - Chat UI */}
          <div className="w-[450px] flex flex-col bg-white border-r">
            {/* Chat Header */}
            <div className="h-14 border-b bg-slate-50 flex items-center justify-between px-4">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-slate-600" />
                <span className="font-medium text-slate-700">Chat</span>
              </div>
              <span className="text-xs text-slate-400">{nodes.length} tools configured</span>
            </div>

            {/* Messages */}
            <div className="flex-1 p-4 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-slate-100">
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                        message.role === "user"
                          ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white"
                          : "bg-slate-100 text-slate-800"
                      }`}
                    >
                      {/* Image content */}
                      {message.type === "image" && message.mediaUrl && (
                        <div className="mb-2">
                          <img 
                            src={message.mediaUrl} 
                            alt="Generated" 
                            className="rounded-lg max-w-full h-auto"
                          />
                        </div>
                      )}
                      
                      {/* Video content */}
                      {message.type === "video" && message.mediaUrl && (
                        <div className="mb-2">
                          <video 
                            src={message.mediaUrl} 
                            controls 
                            className="rounded-lg max-w-full h-auto"
                          />
                        </div>
                      )}
                      
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                      <p className={`text-xs mt-2 ${message.role === "user" ? "text-blue-200" : "text-slate-400"}`}>
                        {formatTime(message.timestamp)}
                      </p>
                    </div>
                  </div>
                ))}
                {(loading || generatingMedia) && (
                  <div className="flex justify-start">
                    <div className="bg-slate-100 rounded-2xl px-4 py-3 flex items-center gap-2">
                      <Loader2 className="h-5 w-5 animate-spin text-slate-500" />
                      <span className="text-sm text-slate-500">
                        {generatingMedia 
                          ? (mediaType === "image" ? "Generating image..." : "Generating video...")
                          : "Thinking..."
                        }
                      </span>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </div>

            {/* Quick Actions */}
            <div className="px-4 py-2 border-t bg-slate-50 flex gap-2 flex-wrap">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleQuickAction("Hi")}
                className="text-xs h-7"
              >
                Say Hi
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleQuickAction("Weather in Mumbai")}
                className="text-xs h-7"
              >
                Test Weather
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleQuickAction("What can you do?")}
                className="text-xs h-7"
              >
                Help
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="text-xs h-7">
                    More
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => handleQuickAction("What can you do?")}>
                    What can you do?
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleQuickAction("Help me with coding")}>
                    Help with coding
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleQuickAction("Tell me a joke")}>
                    Tell me a joke
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Input */}
            <div className="p-4 border-t bg-slate-50">
              <div className="flex gap-2">
                <Input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                  placeholder="Message your agent..."
                  className="flex-1 bg-white border-slate-200 focus:ring-blue-500"
                  disabled={loading || generatingMedia}
                />
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      disabled={loading || generatingMedia}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <Sparkles className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={() => setInput("Test my API with query: example")}
                    >
                      Test API
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setInput("Validate workflow logic")}>
                      Validate Workflow
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <Button
                  onClick={handleSendMessage}
                  disabled={loading || generatingMedia || !input.trim()}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Right Panel - Workflow Preview */}
          <div className="flex-1 bg-slate-50 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-slate-100">
            <div className="p-4 border-b bg-white">
              <h3 className="font-semibold text-slate-700 flex items-center gap-2">
                <Workflow className="h-4 w-4" />
                Workflow Preview
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Drag nodes to rearrange. This is a preview only - no modifications are saved.
              </p>
            </div>

            <div className="p-6">
              {nodes.length === 0 ? (
                <div className="text-center py-16">
                  <Workflow className="h-16 w-16 mx-auto text-slate-300 mb-4" />
                  <p className="text-slate-400">No tools have been added to this agent yet.</p>
                  <p className="text-slate-300 text-sm mt-2">
                    Go to the agent builder to add tools and create your workflow.
                  </p>
                </div>
              ) : (
                <div className="relative min-h-[500px]">
                  {/* Connection Lines SVG */}
                  {nodes.length > 1 && (
                    <svg className="absolute inset-0 w-full h-full pointer-events-none">
                      {nodes.slice(0, -1).map((node: ToolNode, index: number) => {
                        const nextNode = nodes[index + 1];
                        return (
                          <line
                            key={`connection-${index}`}
                            x1={node.position.x + 100}
                            y1={node.position.y + 40}
                            x2={nextNode.position.x}
                            y2={nextNode.position.y + 40}
                            stroke="#94a3b8"
                            strokeWidth="2"
                            strokeDasharray="5,5"
                          />
                        );
                      })}
                    </svg>
                  )}

                  {/* Nodes */}
                  <div className="space-y-4">
                    {nodes.map((node: ToolNode, index: number) => {
                      const Icon = getToolIcon(node.type);
                      const colorClass = getToolColor(node.type);
                      const isDragging = draggedNode === node.id;

                      return (
                        <div
                          key={node.id}
                          draggable
                          onDragStart={(e) => handleDragStart(e, node.id)}
                          onDragEnd={handleDragEnd}
                          onDragOver={handleDragOver}
                          onDrop={(e) => handleDrop(e, { x: 150, y: index * 120 + 100 })}
                          className={`
                            relative flex items-center gap-4 p-4 rounded-xl border-2 bg-white shadow-sm cursor-move
                            transition-all duration-200
                            ${isDragging ? "opacity-50 scale-105 shadow-lg" : "hover:shadow-md"}
                            ${colorClass}
                          `}
                          style={{
                            marginLeft: `${node.position.x}px`,
                            marginTop: `${index === 0 ? 0 : 20}px`,
                          }}
                        >
                          {/* Node Number */}
                          <div className="absolute -left-3 w-6 h-6 bg-slate-800 text-white rounded-full flex items-center justify-center text-xs font-bold">
                            {index + 1}
                          </div>

                          {/* Grip Handle */}
                          <GripVertical className="h-5 w-5 text-slate-400 flex-shrink-0" />

                          {/* Icon */}
                          <div className={`p-2 rounded-lg ${colorClass}`}>
                            <Icon className="h-5 w-5" />
                          </div>

                          {/* Content */}
                          <div className="flex-1">
                            <h4 className="font-semibold text-slate-800 capitalize">
                              {node.type}
                            </h4>
                            {node.config?.name && (
                              <p className="text-sm text-slate-500">{node.config.name}</p>
                            )}
                            {node.config?.prompt && (
                              <p className="text-xs text-slate-400 mt-1 line-clamp-1">
                                {node.config.prompt}
                              </p>
                            )}
                          </div>

                          {/* Arrow to next */}
                          {index < nodes.length - 1 && (
                            <ArrowRight className="h-5 w-5 text-slate-400 flex-shrink-0" />
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Flow indicator */}
                  <div className="mt-8 text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-full text-blue-600 text-sm">
                      <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
                      Flow executes from top to bottom
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgentPreviewModal;

