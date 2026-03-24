"use client"

import { useAuth } from "@clerk/nextjs"
import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function Home() {
  const { userId, isLoaded } = useAuth()
  const router = useRouter()

  useEffect(() => {
    // Only redirect once auth is loaded
    if (isLoaded) {
      if (userId) {
        router.replace("/dashboard")
      } else {
        router.replace("/sign-in")
      }
    }
  }, [userId, router, isLoaded])

  // Show minimal loading while auth is being checked - faster than blank page
  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-50">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="w-12 h-12 bg-slate-200 rounded-full"></div>
          <div className="h-4 w-24 bg-slate-200 rounded"></div>
        </div>
      </div>
    )
  }

  return null
}
