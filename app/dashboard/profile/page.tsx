"use client"

import { useContext, useEffect, useState } from "react"
import moment from "moment"
import { useConvex } from "convex/react"
import { api } from "@/convex/_generated/api"
import { Id } from "@/convex/_generated/dataModel"
import { UserDetailContext } from "@/context/UserDetailsContext"
<<<<<<< HEAD
import type { Agent } from "../../../types/AgentType"
=======
import { Agent } from "../../../types/AgentType"
>>>>>>> fcb949d08971b4acc79fa3a18c05ce7fbe16e9e1
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BadgeCheck, Bot, Coins, Mail, User } from "lucide-react"

export default function ProfilePage() {
  const { userDetail } = useContext(UserDetailContext)
  const convex = useConvex()
  const [agentList, setAgentList] = useState<Agent[]>([])

  useEffect(() => {
    if (!userDetail?._id) return

    const load = async () => {
      const agents = await convex.query(api.agent.GetUserAgents, {
        userId: userDetail._id as Id<"UserTable">,
      })
      setAgentList(agents || [])
    }
    load()
  }, [userDetail?._id, convex])

  return (
    <section className="w-full space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-gradient-to-r from-white via-slate-50 to-blue-50 p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-900">Profile Dashboard</h1>
        <p className="mt-1 text-sm text-slate-600">
          Account details and complete agent creation history.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-slate-200 shadow-sm">
          <CardContent className="flex items-center gap-3 p-5">
            <div className="rounded-lg bg-blue-100 p-2 text-blue-700">
              <User className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-slate-500">User Name</p>
              <p className="font-semibold text-slate-900">{userDetail?.name || "-"}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-slate-200 shadow-sm">
          <CardContent className="flex items-center gap-3 p-5">
            <div className="rounded-lg bg-emerald-100 p-2 text-emerald-700">
              <Mail className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-slate-500">Email</p>
              <p className="font-semibold text-slate-900">{userDetail?.email || "-"}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-slate-200 shadow-sm">
          <CardContent className="flex items-center justify-between p-5">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-amber-100 p-2 text-amber-700">
                <Coins className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs text-slate-500">Credits</p>
                <p className="font-semibold text-slate-900">{userDetail?.token ?? 0}</p>
              </div>
            </div>
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-1 text-xs font-medium text-emerald-700">
              <BadgeCheck className="h-3.5 w-3.5" />
              Active
            </span>
          </CardContent>
        </Card>
      </div>

      <Card className="border-slate-200 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Created Agent History</CardTitle>
          <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-1 text-xs text-slate-700">
            <Bot className="h-3.5 w-3.5" />
            Total {agentList.length}
          </span>
        </CardHeader>
        <CardContent>
          {agentList.length === 0 ? (
            <p className="text-sm text-slate-500">No agents created yet.</p>
          ) : (
            <div className="space-y-3">
              {agentList.map((agent) => (
                <div
                  key={agent._id}
                  className="grid grid-cols-1 items-center gap-3 rounded-lg border border-slate-200 p-4 md:grid-cols-[1fr_auto]"
                >
                  <div>
                    <p className="font-semibold text-slate-900">{agent.name}</p>
                    <p className="text-xs text-slate-500">{agent.agentId}</p>
                  </div>
                  <p className="text-sm font-medium text-slate-600">
                    {moment(agent._creationTime).format("lll")}
                  </p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </section>
  )
}
