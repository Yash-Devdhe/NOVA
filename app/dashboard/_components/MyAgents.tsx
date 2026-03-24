"use client";

<<<<<<< HEAD
import React, { useContext, useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { useMutation, useQuery } from "convex/react";
=======
import React, { useContext, useState, useEffect } from "react";
import { useConvex } from "convex/react";
>>>>>>> fcb949d08971b4acc79fa3a18c05ce7fbe16e9e1
import { useRouter } from "next/navigation";
import { UserDetailContext } from "@/context/UserDetailsContext";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
<<<<<<< HEAD
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
=======
import { Agent } from "../../../types/AgentType";
import { GitBranchPlus } from "lucide-react";
import moment from 'moment';

const MyAgents = () => {
  const { userDetail } = useContext(UserDetailContext);
  const [agentList, setAgentList] = useState<Agent[]>([]);
  const convex = useConvex();
  const router = useRouter();

  useEffect(() => {
    if (!userDetail?._id) return;

    const fetchAgents = async () => {
      const result = await convex.query(api.agent.GetUserAgents, {
        userId: userDetail._id as Id<"UserTable">,
      });
      setAgentList(result);
    };

    fetchAgents();
  }, [userDetail, convex]);
>>>>>>> fcb949d08971b4acc79fa3a18c05ce7fbe16e9e1

  const handleAgentClick = (agent: Agent) => {
    router.push(`/agent-builder/${agent.agentId}`);
  };

<<<<<<< HEAD
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
=======
  return (
    <div className="w-full">
      {/* Container for the Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 mt-6">
        
        {agentList.map((agent, index) => (
          <div
            key={index}
            onClick={() => handleAgentClick(agent)}
            className="group flex flex-col items-start p-5 bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-md hover:border-blue-300 transition-all min-h-[140px] cursor-pointer"
          >
            {/* The Icon Box */}
            <div className="flex-1 w-full">
              <div className="p-2 bg-yellow-100 rounded-lg mb-3 group-hover:bg-yellow-200 transition-colors">
                <GitBranchPlus className="h-6 w-6 text-gray-700" />
              </div>

              {/* Agent Details */}
              <div className="flex flex-col gap-1">
                <h2 className="font-semibold text-gray-900 text-lg group-hover:text-blue-600 transition-colors">
                  {agent.name}
                </h2>
                <p className="text-sm text-gray-400 font-medium">
>>>>>>> fcb949d08971b4acc79fa3a18c05ce7fbe16e9e1
                  {moment(agent._creationTime).fromNow()}
                </p>
              </div>
            </div>
          </div>
        ))}

<<<<<<< HEAD
        {agentList.length === 0 && (
          <p className="text-sm italic text-gray-400">No agents created yet.</p>
=======
        {/* Show message if no agents exist */}
        {agentList.length === 0 && (
            <p className="text-gray-400 text-sm italic">No agents created yet.</p>
>>>>>>> fcb949d08971b4acc79fa3a18c05ce7fbe16e9e1
        )}
      </div>
    </div>
  );
};

export default MyAgents;
