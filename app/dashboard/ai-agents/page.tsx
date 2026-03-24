import MyAgents from "../_components/MyAgents"

export default function AiAgentsPage() {
  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-3xl font-bold text-slate-900">AI Agents</h2>
        <p className="text-slate-600">All agents created by your account appear here in real time.</p>
      </div>
      <MyAgents />
    </section>
  )
}
