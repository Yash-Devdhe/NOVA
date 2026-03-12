"use client"

import { useAuth } from "@clerk/nextjs"
import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { SignIn } from '@clerk/nextjs'

export default function Page() {
  const { userId, isLoaded } = useAuth()
  const router = useRouter()

  useEffect(() => {
    // If already logged in, redirect to dashboard immediately
    if (isLoaded && userId) {
      router.replace("/dashboard")
    }
  }, [userId, router, isLoaded])

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center h-screen bg-white">
        <div className="flex items-center gap-3 text-slate-600">
          <span className="h-2 w-2 rounded-full bg-slate-400 animate-pulse" />
          <span>Loading sign in...</span>
        </div>
      </div>
    )
  }

  if (userId) {
    return (
      <div className="flex items-center justify-center h-screen bg-white">
        <div className="flex items-center gap-3 text-slate-600">
          <span className="h-2 w-2 rounded-full bg-slate-400 animate-pulse" />
          <span>Redirecting to dashboard...</span>
        </div>
      </div>
    )
  }

  return (
  <div className='flex items-center justify-center h-screen bg-white'>
    <SignIn 
      forceRedirectUrl="/dashboard" 
      appearance={{
        elements: {
          rootBox: {
            width: '100%',
            maxWidth: '400px'
          }
        }
      }}
    />
  </div>
  )
}
