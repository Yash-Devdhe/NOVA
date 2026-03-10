// AppHeader.tsx

import { UserButton } from "@clerk/nextjs"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import NotificationBell from "./NotificationBell"

export default function AppHeader() {
  return (
    <header className="w-full border-b border-slate-700/60 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 px-4 py-4 md:px-8">
      <div className="flex w-full items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-wide text-white">
              NOVA <span className="text-blue-400">Dashboard</span>
            </h1>
          </div>
        </div>

        <div className="hidden items-center gap-2 rounded-full bg-white/10 px-4 py-2 md:flex">
          <Search className="h-4 w-4 text-slate-300" />
          <Input
            placeholder="Search agents, tools..."
            className="w-80 border-0 bg-transparent text-white placeholder:text-slate-400 focus-visible:ring-0"
          />
        </div>

        <div className="flex items-center gap-4">
          <NotificationBell />
          <div className="h-8 w-[1px] bg-white/20"></div>
          <UserButton />
        </div>
      </div>
    </header>
  )
}
