"use client"

import { useContext, useEffect, useMemo, useState } from "react"
import { useConvex } from "convex/react"
import { api } from "@/convex/_generated/api"
import { Id } from "@/convex/_generated/dataModel"
import { UserDetailContext } from "@/context/UserDetailsContext"
import type { Agent } from "../../../types/AgentType"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function DataPage() {
  const { userDetail } = useContext(UserDetailContext)
  const convex = useConvex()
  const [agents, setAgents] = useState<Agent[]>([])

  useEffect(() => {
    if (!userDetail?._id) return

    const load = async () => {
      const rows = await convex.query(api.agent.GetUserAgents, {
        userId: userDetail._id as Id<"UserTable">,
      })
      setAgents(rows || [])
    }
    load()
  }, [userDetail?._id, convex])

  const summary = useMemo(
    () => ({
      totalAgents: agents.length,
      savedAgents: agents.length,
      draftAgents: agents.filter((agent) => !agent.published).length,
    }),
    [agents]
  )

  return (
    <section className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-slate-900">Data</h2>
        <p className="text-slate-600">Live account data backed by Convex.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Total Agents</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-bold">{summary.totalAgents}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Saved Agents</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-bold">{summary.savedAgents}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Draft</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-bold">{summary.draftAgents}</CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Account Snapshot</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p>
            <span className="font-semibold">User:</span> {userDetail?.name || "-"}
          </p>
          <p>
            <span className="font-semibold">Email:</span> {userDetail?.email || "-"}
          </p>
          <p>
            <span className="font-semibold">Current Credits:</span> {userDetail?.token ?? 0}
          </p>
        </CardContent>
      </Card>
    </section>
  )
}
