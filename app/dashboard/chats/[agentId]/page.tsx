"use client";

import React from 'react';
import { notFound } from 'next/navigation';
import AgentChat from '../../_components/AgentChat';

interface AgentChatPageProps {
  params: Promise<{ agentId: string }>;
}

export default function AgentChatPage({ params }: AgentChatPageProps) {
  const { agentId } = React.use(params);

  // Validate agentId exists (basic check)
  if (!agentId || agentId.length < 5) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl text-white shadow-lg">
          AI Assistant
        </div>
        <div>
          <h1 className="text-3xl font-bold">Chat with Agent</h1>
          <p className="text-slate-500">Real-time conversation with your agent</p>
        </div>
      </div>
      <AgentChat agentId={agentId} className="h-[80vh] shadow-2xl" />
    </div>
  );
}
