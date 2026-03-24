"use client";

import React, { useContext, useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { useMutation, useQuery } from "convex/react";
import { useRouter } from "next/navigation";
import { UserDetailContext } from "@/context/UserDetailsContext";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import type { Agent } from "../../../types/AgentType";
import { GitBranchPlus, MessageCircle, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import moment from "moment";

const MyAgents = () => {
  const { userDetail } = useContext(UserDetailContext);
  const router = useRouter();
  const { toast } = useToast();
  const [deletingAgent, setDeletingAgent] = useState<string | null>(null);

  const agentList = (useQuery(
    api.agent.GetUserAgents,
    userDetail?._id ? { userId: userDetail._id as Id<"UserTable"> } : "skip"
  ) || []) as Agent[];

  const deleteAgentMutation = useMutation(api.agent.DeleteAgent);

  const deleteAgent = async (agentId: string) => {
    if (!userDetail?._id) return;

    try {
      setDeletingAgent(agentId);
      await deleteAgentMutation({
        agentId,
        userId: userDetail._id as Id<"UserTable">,
      });

      toast({
        title: "Agent deleted",
        description: "Agent and related chat history were removed.",
      });
    } catch (error) {
      toast({
        title: "Delete failed",
        description: error instanceof Error ? error.message : "Failed to delete agent",
        variant: "destructive",
      });
    } finally {
      setDeletingAgent(null);
    }
  };

  const handleAgentClick = (agent: Agent) => {
    router.push(`/agent-builder/${agent.agentId}`);
  };

  const handleChatClick = (agent: Agent, e: React.MouseEvent) => {
    e.stopPropagation();
    router.push(`/dashboard/chats/${agent.agentId}`);
  };

  return (
    <div className="w-full">
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 mt-6">
        {agentList.map((agent) => (
          <div
            key={agent._id}
            onClick={() => handleAgentClick(agent)}
            className="group relative flex min-h-[140px] cursor-pointer flex-col items-start rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition-all hover:border-blue-300 hover:shadow-md"
          >
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-12 top-3 h-8 w-8 p-0 opacity-0 transition-all group-hover:opacity-100"
              onClick={(e) => handleChatClick(agent, e)}
            >
              <MessageCircle className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              disabled={deletingAgent === agent.agentId}
              className="absolute right-3 top-3 h-8 w-8 p-0 opacity-0 transition-all group-hover:opacity-100"
              onClick={(e) => {
                e.stopPropagation();
                void deleteAgent(agent.agentId);
              }}
            >
              <Trash2 className="h-4 w-4" />
            </Button>

            <div className="flex-1 w-full">
              <div className="mb-3 rounded-lg bg-yellow-100 p-2 transition-colors group-hover:bg-yellow-200">
                <GitBranchPlus className="h-6 w-6 text-gray-700" />
              </div>

              <div className="flex flex-col gap-1">
                <h2 className="text-lg font-semibold text-gray-900 transition-colors group-hover:text-blue-600">
                  {agent.name}
                </h2>
                <p className="text-sm font-medium text-gray-400">
                  {moment(agent._creationTime).fromNow()}
                </p>
              </div>
            </div>
          </div>
        ))}

        {agentList.length === 0 && (
          <p className="text-sm italic text-gray-400">No agents created yet.</p>
        )}
      </div>
    </div>
  );
};

export default MyAgents;
