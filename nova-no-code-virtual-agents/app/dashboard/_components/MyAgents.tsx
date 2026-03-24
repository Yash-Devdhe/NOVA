"use client";

import React, { useContext, useState, useEffect } from "react";
import { useConvex } from "convex/react";
import { useRouter } from "next/navigation";
import { UserDetailContext } from "@/context/UserDetailsContext";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
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

  const handleAgentClick = (agent: Agent) => {
    router.push(`/agent-builder/${agent.agentId}`);
  };

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
                  {moment(agent._creationTime).fromNow()}
                </p>
              </div>
            </div>
          </div>
        ))}

        {/* Show message if no agents exist */}
        {agentList.length === 0 && (
            <p className="text-gray-400 text-sm italic">No agents created yet.</p>
        )}
      </div>
    </div>
  );
};

export default MyAgents;
