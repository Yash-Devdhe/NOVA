// app/dashboard/page.tsx
"use client";
import CreateAgentSection from "./_components/CreateAgentSection";
import AiAgentTab from "./_components/AiAgentTab";

export default function DashboardPage() {
  return (
    <div className="mx-auto w-full space-y-8">
      <CreateAgentSection />
      <AiAgentTab />
    </div>
  )
}
