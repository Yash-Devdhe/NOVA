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
  Loader2,
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
  Layers,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  HelpCircle,
  BookOpen,
  Settings,
  Zap,
  Target,
  ChevronRight,
  Star,
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
  type?: "text" | "guide" | "tool_info";
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
    details: "The Start node is where your agent's workflow begins. Every agent must have exactly one Start node. You can configure the start node to accept user input parameters.",
  },
  {
    type: "end",
    label: "End",
    icon: Square,
    color: "bg-gradient-to-br from-red-400 to-red-600",
    description: "Ending point of the workflow",
    shadow: "shadow-red-500/25",
    details: "The End node marks where your agent's workflow terminates. You can have multiple End nodes in different branches. The agent stops executing when it reaches an End node.",
  },
  {
    type: "if",
    label: "If/Else",
    icon: GitBranch,
    color: "bg-gradient-to-br from-purple-400 to-purple-600",
    description: "Conditional branching",
    shadow: "shadow-purple-500/25",
    details: "The If/Else node allows your agent to make decisions based on conditions. You can set up boolean expressions that evaluate to true or false, directing the flow to different branches.",
  },
  {
    type: "while",
    label: "While Loop",
    icon: RefreshCw,
    color: "bg-gradient-to-br from-blue-400 to-blue-600",
    description: "Repeat until condition is met",
    shadow: "shadow-blue-500/25",
    details: "The While Loop node repeats a set of actions until a specified condition is met. Use it for iterative processes like fetching paginated data or retrying failed operations.",
  },
  {
    type: "agent",
    label: "Agent",
    icon: Bot,
    color: "bg-gradient-to-br from-yellow-400 to-yellow-600",
    description: "Call another agent with custom settings",
    shadow: "shadow-yellow-500/25",
    details: "The Agent node lets you call another agent within your workflow. This enables modular agent design where specialized agents handle specific tasks.",
  },
  {
    type: "api",
    label: "API",
    icon: Globe,
    color: "bg-gradient-to-br from-teal-400 to-teal-600",
    description: "Call an external API endpoint",
    shadow: "shadow-teal-500/25",
    details: "The API node enables your agent to communicate with external services. Configure HTTP method, headers, body, and authentication. Supports REST APIs with JSON responses.",
  },
  {
    type: "llm",
    label: "LLM",
    icon: MessageSquare,
    color: "bg-gradient-to-br from-indigo-400 to-indigo-600",
    description: "Large Language Model",
    shadow: "shadow-indigo-500/25",
    details: "The LLM node uses AI language models to process and generate text. Configure the model (GPT-4, Gemini, etc.), system prompts, and output formatting options.",
  },
  {
    type: "userApproval",
    label: "User Approval",
    icon: CheckCircle,
    color: "bg-gradient-to-br from-pink-400 to-pink-600",
    description: "Pause for human approval",
    shadow: "shadow-pink-500/25",
    details: "The User Approval node pauses workflow execution until a human approves the action. Useful for sensitive operations, billing, or critical decisions.",
  },
  {
    type: "workflow",
    label: "Sub-Workflow",
    icon: Workflow,
    color: "bg-gradient-to-br from-orange-400 to-orange-600",
    description: "Call another workflow",
    shadow: "shadow-orange-500/25",
    details: "The Sub-Workflow node lets you call another workflow as a function. This enables reusability and organization of complex agent logic.",
  },
];

// Guidelines for creating agents
const agentGuidelines = [
  {
    title: "Define Clear Objectives",
    content: "Start by clearly defining what you want your agent to accomplish. Break down complex tasks into smaller, manageable steps.",
  },
  {
    title: "Design the Workflow",
    content: "Map out the decision points and flow of your agent using If/Else nodes. Consider all possible paths and edge cases.",
  },
  {
    title: "Configure API Tools",
    content: "Add API nodes to connect to external services. Ensure you have the necessary API keys and understand the response formats.",
  },
  {
    title: "Set Up LLM Prompts",
    content: "Write clear, specific prompts for your LLM nodes. Include context, examples, and output format instructions.",
  },
  {
    title: "Handle Errors",
    content: "Use If nodes to check for errors and define fallback behavior. Don't let your agent fail silently.",
  },
  {
    title: "Test Thoroughly",
    content: "Use the Preview feature to test your agent with various inputs. Iterate on your design based on test results.",
  },
];

const AgentPreviewModal: React.FC<AgentPreviewModalProps> = ({
  open,
  onOpenChange,
}) => {
  const [chatPrompt, setChatPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [openAIKey, setOpenAIKey] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content: "Welcome to NOVA! 🎉 I'm your AI assistant here to help you create amazing agents.\n\nI can help you with:\n\n📖 **Guidelines** - Learn how to build professional agents\n🔧 **Tool Information** - Understand each tool's purpose and usage\n💬 **Real-time Chat** - Ask me anything about agent creation\n\n**Getting Started:**\n1. Click 'Tools' to learn about all available building blocks\n2. Click 'Guidelines' for step-by-step agent creation tips\n3. Or just chat with me directly!\n\nWhat would you like to explore?",
      timestamp: new Date(),
      type: "text",
    },
  ]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  
  // Speech-to-text state
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const recognitionRef = useRef<any>(null);
  
  // Text-to-speech state
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speechSynthesis, setSpeechSynthesis] = useState<SpeechSynthesis | null>(null);

  useEffect(() => {
    if (!open) return;
    
    // Check for speech recognition support
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      setSpeechSupported(true);
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';
      
      recognitionRef.current.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((result: any) => result[0])
          .map((result: any) => result.transcript)
          .join('');
        
        setChatPrompt(transcript);
      };
      
      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
    
    // Check for speech synthesis support
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      setSpeechSynthesis(window.speechSynthesis);
    }
    
    // Load stored API key
    const stored = localStorage.getItem("dashboard-preview-keys");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setOpenAIKey(parsed.openAIKey || "");
      } catch {
        // Ignore corrupted localStorage values
      }
    }
  }, [open]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const persistKeys = () => {
    localStorage.setItem(
      "dashboard-preview-keys",
      JSON.stringify({ openAIKey })
    );
  };

  // Speech recognition functions
  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  // Text-to-speech function
  const speakMessage = (text: string) => {
    if (speechSynthesis && !isSpeaking) {
      // Cancel any ongoing speech
      speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1;
      utterance.pitch = 1;
      
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      
      speechSynthesis.speak(utterance);
    }
  };

  const stopSpeaking = () => {
    if (speechSynthesis) {
      speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  const handleSendMessage = async () => {
    if (!chatPrompt.trim() || isGenerating) return;

    const currentPrompt = chatPrompt.trim();
    
    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: currentPrompt,
      timestamp: new Date(),
      type: "text",
    };

    setMessages((prev) => [...prev, userMessage]);
    setChatPrompt("");
    setIsGenerating(true);
    persistKeys();

    try {
      const response = await fetch("/api/openai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: currentPrompt,
          type: "chat",
          providerApiKey: openAIKey || undefined,
          systemPrompt: `You are NOVA, a helpful AI assistant specialized in helping users create AI agents. 

You have knowledge about:
1. Agent Builder - A no-code platform for creating AI agents
2. Available Tools: Start, End, If/Else, While Loop, Agent, API, LLM, User Approval, Sub-Workflow
3. Best practices for designing agent workflows

Guidelines for users:
- Always be helpful and concise
- When users ask about tools, provide detailed explanations
- When users ask for guidelines, explain the agent creation process
- Use a friendly, professional tone
- Format your responses with markdown for better readability`,
        }),
      });

      const data = await response.json();

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.message || "I'm here to help! Ask me about creating agents or the available tools.",
        timestamp: new Date(),
        type: "text",
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "I encountered an error. Please try again or check your API key configuration.",
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

  const handleToolClick = (tool: typeof tools[0]) => {
    const toolInfoMessage: Message = {
      id: Date.now().toString(),
      role: "assistant",
      content: `**${tool.label} Tool**\n\n${tool.details}\n\nYou can use this tool in the Agent Builder to ${tool.description.toLowerCase()}.`,
      timestamp: new Date(),
      type: "tool_info",
    };
    setMessages((prev) => [...prev, toolInfoMessage]);
  };

  const handleGuidelineClick = (index: number) => {
    const guideline = agentGuidelines[index];
    const guidelineMessage: Message = {
      id: Date.now().toString(),
      role: "assistant",
      content: `**${guideline.title}**\n\n${guideline.content}`,
      timestamp: new Date(),
      type: "guide",
    };
    setMessages((prev) => [...prev, guidelineMessage]);
  };

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
                  NOVA AI Assistant
                </DialogTitle>
                <DialogDescription className="text-white/80 text-xs">
                  Your AI guide for creating professional agents
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
            {/* Left Panel - Tools & Guidelines */}
            <ResizablePanel defaultSize={28} minSize={20} maxSize={35}>
              <div className="h-full border-r bg-gradient-to-b from-white to-gray-50">
                <Tabs defaultValue="tools" className="h-full flex flex-col">
                  <div className="border-b bg-white/50 backdrop-blur-sm">
                    <TabsList className="bg-transparent gap-2 h-12 w-full justify-start px-2">
                      <TabsTrigger
                        value="tools"
                        className="gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-violet-600 data-[state=active]:to-purple-600 data-[state=active]:text-white"
                      >
                        <Layers className="h-4 w-4" />
                        Tools
                      </TabsTrigger>
                      <TabsTrigger
                        value="guides"
                        className="gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-violet-600 data-[state=active]:to-purple-600 data-[state=active]:text-white"
                      >
                        <BookOpen className="h-4 w-4" />
                        Guides
                      </TabsTrigger>
                    </TabsList>
                  </div>

                  <TabsContent value="tools" className="flex-1 m-0 overflow-hidden">
                    <ScrollArea className="h-[calc(100%-60px)]">
                      <div className="p-4 space-y-3">
                        {tools.map((tool, index) => (
                          <div
                            key={tool.type}
                            onClick={() => handleToolClick(tool)}
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
                      </div>
                    </ScrollArea>
                  </TabsContent>

                  <TabsContent value="guides" className="flex-1 m-0 overflow-hidden">
                    <ScrollArea className="h-[calc(100%-60px)]">
                      <div className="p-4 space-y-3">
                        {agentGuidelines.map((guide, index) => (
                          <div
                            key={index}
                            onClick={() => handleGuidelineClick(index)}
                            className="p-4 rounded-xl border bg-white hover:bg-gradient-to-r hover:from-violet-50 hover:to-pink-50 cursor-pointer transition-all hover:shadow-lg hover:scale-[1.02] group"
                          >
                            <div className="flex items-center gap-3 mb-2">
                              <div className="p-2 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 shadow-lg shadow-purple-500/30">
                                <Target className="h-4 w-4 text-white" />
                              </div>
                              <p className="font-semibold text-sm text-gray-800">{guide.title}</p>
                            </div>
                            <p className="text-xs text-gray-500 line-clamp-2">{guide.content}</p>
                            <ChevronRight className="h-4 w-4 text-gray-300 ml-auto mt-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </TabsContent>
                </Tabs>
              </div>
            </ResizablePanel>

            <ResizableHandle className="bg-gradient-to-b from-violet-200 via-purple-200 to-pink-200 w-1" />

            {/* Right Panel - Chat UI */}
            <ResizablePanel defaultSize={72} minSize={40}>
              <div className="h-full flex flex-col bg-white">
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
                              : message.type === "tool_info"
                              ? "bg-gradient-to-br from-teal-50 to-cyan-50 text-gray-900 border border-teal-200 shadow-sm"
                              : message.type === "guide"
                              ? "bg-gradient-to-br from-amber-50 to-yellow-50 text-gray-900 border border-amber-200 shadow-sm"
                              : "bg-gradient-to-br from-gray-50 to-gray-100 text-gray-900 border border-gray-200 shadow-sm"
                          }`}
                        >
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
                              <div className="flex gap-2">
                                <button
                                  onClick={() => speakMessage(message.content)}
                                  className="hover:text-violet-600 transition-colors"
                                  title="Read aloud"
                                >
                                  {isSpeaking ? (
                                    <VolumeX className="h-3 w-3" />
                                  ) : (
                                    <Volume2 className="h-3 w-3" />
                                  )}
                                </button>
                                <button
                                  onClick={() =>
                                    copyToClipboard(
                                      message.content,
                                      message.id
                                    )
                                  }
                                  className="hover:text-violet-600 transition-colors"
                                >
                                  {copiedId === message.id ? (
                                    <Check className="h-3 w-3" />
                                  ) : (
                                    <Copy className="h-3 w-3" />
                                  )}
                                </button>
                              </div>
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
                        placeholder="Type your message or click mic to speak..."
                        className="pr-24 h-12 rounded-xl border-2 border-violet-200 focus:border-violet-500 focus:ring-violet-200"
                        disabled={isGenerating}
                      />
                      <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
                        {speechSupported && (
                          <button
                            onClick={isListening ? stopListening : startListening}
                            className={`p-2 rounded-lg transition-colors ${
                              isListening
                                ? "bg-red-100 text-red-600 animate-pulse"
                                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                            }`}
                            title={isListening ? "Stop listening" : "Start voice input"}
                          >
                            {isListening ? (
                              <MicOff className="h-4 w-4" />
                            ) : (
                              <Mic className="h-4 w-4" />
                            )}
                          </button>
                        )}
                      </div>
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
                  
                  {/* Voice status indicator */}
                  {isListening && (
                    <div className="flex items-center gap-2 mt-2 text-sm text-red-500">
                      <Mic className="h-4 w-4 animate-pulse" />
                      <span>Listening... Speak now</span>
                    </div>
                  )}
                </div>
              </div>
            </ResizablePanel>
          </ResizablePanelGroup>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AgentPreviewModal;

