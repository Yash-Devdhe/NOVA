"use client";

import React, { useContext, useState, useEffect } from 'react';
import { useConvex } from 'convex/react';
import { UserDetailContext } from '@/context/UserDetailsContext';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Bot, MessageCircle, Clock, ChevronRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import AgentChat from '../_components/AgentChat';
import type { Agent } from '@/types/AgentType';

interface ChatPreview {
  agentId: string;
  agentName: string;
  lastMessagePreview: string;
  lastTimestamp: number;
  unreadCount: number;
}

export default function ChatsPage() {
  const { userDetail } = useContext(UserDetailContext);
  const convex = useConvex();
  const [agents, setAgents] = useState<Agent[]>([]);
  const [chatPreviews, setChatPreviews] = useState<ChatPreview[]>([]);
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const userId = userDetail?._id as Id<'UserTable'>;

  useEffect(() => {
    if (!userId) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        const agentsList = await convex.query(api.agent.GetUserAgents, { userId });
        setAgents(agentsList);

        // Generate chat previews (last message per agent)
        const previews = await Promise.all(
          agentsList.map(async (agent: Agent) => {
            const history = await convex.query(api.agent.GetAgentChatHistory, {
              agentId: agent.agentId,
              userId
            });
            const lastMsg = history[history.length - 1];
            return {
              agentId: agent.agentId,
              agentName: agent.name,
              lastMessagePreview: lastMsg ? lastMsg.message.substring(0, 50) + '...' : 'No messages yet',
              lastTimestamp: lastMsg ? lastMsg.timestamp : 0,
              unreadCount: 0 // TODO: implement unread logic
            };
          })
        );
        setChatPreviews(previews);
      } catch (error) {
        console.error('Error fetching chats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userId, convex]);

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading chats...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Chats</h1>
          <p className="text-slate-500">Your conversations with AI agents</p>
        </div>
        <Button asChild>
          <Link href="/dashboard">
            <ChevronRight className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Link>
        </Button>
      </div>

      {agents.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Bot className="mx-auto h-12 w-12 text-slate-400 mb-4" />
            <h3 className="text-lg font-semibold mb-2">No chats yet</h3>
            <p className="text-slate-500 mb-6">Create an agent to start chatting.</p>
            <Button asChild>
              <Link href="/dashboard">
                Create Agent
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Chat List */}
          <div className="lg:col-span-1 space-y-3">
            <div className="p-4 bg-slate-50 rounded-xl">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <MessageCircle className="h-5 w-5" />
                Recent Chats
              </h3>
              {chatPreviews.map((preview) => (
                <Button
                  key={preview.agentId}
                  variant={selectedAgentId === preview.agentId ? 'default' : 'ghost'}
                  className="w-full justify-start h-auto p-3 mb-2 text-left"
                  onClick={() => setSelectedAgentId(preview.agentId)}
                >
                  <Avatar className="h-8 w-8 mr-3 flex-shrink-0">
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-blue-600 text-white text-xs">
                      AI
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{preview.agentName}</div>
                    <div className="text-xs text-slate-500 truncate">{preview.lastMessagePreview}</div>
                  </div>
                  <div className="flex flex-col items-end ml-2">
                    <div className="text-xs text-slate-400">
                      {new Date(preview.lastTimestamp).toLocaleDateString()}
                    </div>
                    {preview.unreadCount > 0 && (
                      <Badge variant="destructive" className="text-xs mt-1">
                        {preview.unreadCount}
                      </Badge>
                    )}
                  </div>
                </Button>
              ))}
            </div>
          </div>

          {/* Active Chat */}
          <div className="lg:col-span-3">
            {selectedAgentId ? (
              <AgentChat agentId={selectedAgentId} className="h-[70vh]" />
            ) : (
              <Card className="h-[70vh] flex items-center justify-center">
                <CardContent className="text-center">
                  <MessageCircle className="mx-auto h-16 w-16 text-slate-400 mb-6" />
                  <h3 className="text-xl font-semibold mb-2">Select a chat</h3>
                  <p className="text-slate-500">Choose a conversation from the sidebar to get started</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
