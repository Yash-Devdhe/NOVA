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

// Local Q&A System for Tool and Agent Information
function searchTools(query: string): string[] {
  const normalizedQuery = query.toLowerCase();
  const results: string[] = [];
  
  tools.forEach(tool => {
    const toolKeywords = [
      tool.label.toLowerCase(),
      tool.type.toLowerCase(),
      tool.description.toLowerCase(),
      tool.details.toLowerCase()
    ];
    
    const isMatch = toolKeywords.some(keyword => 
      keyword.includes(normalizedQuery) || 
      normalizedQuery.split(' ').some(word => word.length > 2 && keyword.includes(word))
    );
    
    if (isMatch || normalizedQuery.includes(tool.type) || normalizedQuery.includes(tool.label.toLowerCase())) {
      results.push(`**${tool.label} (${tool.type})**\n${tool.details}\n\n📝 ${tool.description}`);
    }
  });
  
  return results;
}

function searchGuidelines(query: string): string[] {
  const normalizedQuery = query.toLowerCase();
  const results: string[] = [];

  agentGuidelines.forEach((guide, index) => {
    const guideKeywords = [
      guide.title.toLowerCase(),
      guide.content.toLowerCase()
    ];
    
    const isMatch = guideKeywords.some(keyword => 
      keyword.includes(normalizedQuery) || 
      normalizedQuery.split(' ').some(word => word.length > 2 && keyword.includes(word))
    );
    
    if (isMatch || normalizedQuery.includes(guide.title.toLowerCase().split(' ')[0])) {
      results.push(`**${index + 1}. ${guide.title}**\n${guide.content}`);
    }
  });
  
  return results;
}

function generateLocalResponse(prompt: string): string | null {
  const normalized = prompt.toLowerCase();
  const toolResults = searchTools(normalized);
  const guidelineResults = searchGuidelines(normalized);
  
  // Check for specific tool queries
  if (normalized.includes('tool') || normalized.includes('api') || normalized.includes('node')) {
    if (toolResults.length > 0) {
      return `I found information about the following tools:\n\n${toolResults.join('\n\n---\n\n')}\n\n💡 You can click on any tool in the Tools panel to learn more about it!`;
    }
  }
  
  // Check for guideline queries
  if (normalized.includes('guide') || normalized.includes('how to') || normalized.includes('tutorial') || normalized.includes('create') || normalized.includes('build')) {
    if (guidelineResults.length > 0) {
      return `Here are some guidelines for creating agents:\n\n${guidelineResults.join('\n\n')}\n\n🚀 Ready to start building? Head to the Agent Builder to create your first agent!`;
    }
  }
  
  // Check for specific tool requests
  if (normalized.includes('start')) {
    const startTool = tools.find(t => t.type === 'start');
    if (startTool) return `**Start Node**\n${startTool.details}\n\n📝 ${startTool.description}`;
  }
  if (normalized.includes('end')) {
    const endTool = tools.find(t => t.type === 'end');
    if (endTool) return `**End Node**\n${endTool.details}\n\n📝 ${endTool.description}`;
  }
  if (normalized.includes('if') || normalized.includes('else') || normalized.includes('condition')) {
    const ifTool = tools.find(t => t.type === 'if');
    if (ifTool) return `**If/Else Node**\n${ifTool.details}\n\n📝 ${ifTool.description}`;
  }
  if (normalized.includes('while') || normalized.includes('loop') || normalized.includes('repeat')) {
    const whileTool = tools.find(t => t.type === 'while');
    if (whileTool) return `**While Loop Node**\n${whileTool.details}\n\n📝 ${whileTool.description}`;
  }
  if (normalized.includes('llm') || normalized.includes('gpt') || normalized.includes('language model') || normalized.includes('ai model')) {
    const llmTool = tools.find(t => t.type === 'llm');
    if (llmTool) return `**LLM Node**\n${llmTool.details}\n\n📝 ${llmTool.description}`;
  }
  if (normalized.includes('approval') || normalized.includes('human') || normalized.includes('confirm')) {
    const approvalTool = tools.find(t => t.type === 'userApproval');
    if (approvalTool) return `**User Approval Node**\n${approvalTool.details}\n\n📝 ${approvalTool.description}`;
  }
  if (normalized.includes('workflow') || normalized.includes('sub-workflow') || normalized.includes('sub workflow')) {
    const workflowTool = tools.find(t => t.type === 'workflow');
    if (workflowTool) return `**Sub-Workflow Node**\n${workflowTool.details}\n\n📝 ${workflowTool.description}`;
  }
  if (normalized.includes('agent') && !normalized.includes('api')) {
    const agentTool = tools.find(t => t.type === 'agent');
    if (agentTool) return `**Agent Node**\n${agentTool.details}\n\n📝 ${agentTool.description}`;
  }
  if (normalized.includes('api') || normalized.includes('http') || normalized.includes('external') || normalized.includes('endpoint')) {
    const apiTool = tools.find(t => t.type === 'api');
    if (apiTool) return `**API Node**\n${apiTool.details}\n\n📝 ${apiTool.description}\n\n🔑 To use API nodes, you'll need to configure:\n- API URL\n- HTTP Method (GET, POST, PUT, DELETE)\n- Headers (if needed)\n- API Key (for authentication)\n- Request body (for POST/PUT)`;
  }
  
  // If we found some relevant tools but no specific match
  if (toolResults.length > 0) {
    return `Here are some tools that might help:\n\n${toolResults.slice(0, 3).join('\n\n---\n\n')}\n\n💡 Type "show all tools" to see all available tools!`;
  }
  
  // Default responses based on keywords
  if (normalized.includes('hello') || normalized.includes('hi') || normalized.includes('hey')) {
    return "Hello! 👋 I'm here to help you create amazing AI agents. You can ask me about:\n\n🔧 **Tools** - Learn about Start, End, If/Else, LLM, API, and more\n📖 **Guidelines** - Get tips on building agents\n💬 **Anything else** - Just ask!";
  }
  
  if (normalized.includes('help')) {
    return `I can help you with:\n\n🔧 **Tool Information** - Ask "what is the API tool?" or "show me the LLM node"\n📖 **Guidelines** - Ask "how to create an agent" or "show me guidelines"\n💬 **General Questions** - Ask anything about agent building!\n\nWhat would you like to explore?`;
  }
  
  return null; // No local match found
}

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
      content: "! 🎉 I'mWelcome to NOVA your AI assistant here to help you create amazing agents.\n\nI can help you with:\n\n📖 **Guidelines** - Learn how to build professional agents\n🔧 **Tool Information** - Understand each tool's purpose and usage\n💬 **Real-time Chat** - Ask me anything about agent creation\n\n**Available Tools:**\n- **Start** - Where your agent begins\n- **End** - Where your agent finishes\n- **If/Else** - Make decisions\n- **While Loop** - Repeat actions\n- **Agent** - Call another agent\n- **API** - Connect to external services\n- **LLM** - Use AI language models\n- **User Approval** - Pause for human input\n- **Sub-Workflow** - Reusable workflows\n\n**Getting Started:**\n1. Click 'Tools' to learn about all available building blocks\n2. Click 'Guidelines' for step-by-step agent creation tips\n3. Or just chat with me directly!\n\nWhat would you like to explore?",
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
      // First try local response generation
      const localResponse = generateLocalResponse(currentPrompt);
      
      if (localResponse) {
        // Use local response
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: localResponse,
          timestamp: new Date(),
          type: "text",
        };
        setMessages((prev) => [...prev, assistantMessage]);
        setIsGenerating(false);
        return;
      }

      // If no local match, try API call
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

      // Check if API returned a fallback message
      const isFallback = data.provider === 'local-fallback' || !data.message || data.message.includes('Preview response');
      
      if (isFallback && openAIKey) {
        // API key exists but still got fallback - might be a different error
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: data.message || "I apologize, but I couldn't process your request at the moment. Please try again.",
          timestamp: new Date(),
          type: "text",
        };
        setMessages((prev) => [...prev, assistantMessage]);
      } else if (isFallback) {
        // No API key - provide a helpful response about tools
        const helpfulResponse = `I'd be happy to help you with that! Here are some things I can assist you with:\n\n🔧 **Tools Information** - Ask about any tool like "what is API?" or "how does LLM work?"\n📖 **Guidelines** - Ask "how to create an agent" or "show me guidelines"\n💡 **Best Practices** - Ask about error handling, testing, or workflow design\n\nYou can also click on the Tools or Guides tabs on the left to explore!\n\nTo enable AI-powered responses, you can add your OpenAI API key in the settings.`;
        
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: helpfulResponse,
          timestamp: new Date(),
          type: "text",
        };
        setMessages((prev) => [...prev, assistantMessage]);
      } else {
        // Successful API response
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: data.message,
          timestamp: new Date(),
          type: "text",
        };
        setMessages((prev) => [...prev, assistantMessage]);
      }
    } catch (error) {
      // On error, provide helpful local response
      const errorResponse = generateLocalResponse(currentPrompt);
      
      if (errorResponse) {
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: errorResponse,
          timestamp: new Date(),
          type: "text",
        };
        setMessages((prev) => [...prev, assistantMessage]);
      } else {
        const errorMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: "I encountered an error. Please try again or check your API key configuration. In the meantime, feel free to explore the Tools and Guides on the left panel!",
          timestamp: new Date(),
          type: "text",
        };
        setMessages((prev) => [...prev, errorMessage]);
      }
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

