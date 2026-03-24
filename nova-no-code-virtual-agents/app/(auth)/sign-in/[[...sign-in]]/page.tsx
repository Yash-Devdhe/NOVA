"use client"

import { useAuth } from "@clerk/nextjs"
import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { SignIn } from '@clerk/nextjs'

export default function Page() {
  const { userId } = useAuth()
  const router = useRouter()

  useEffect(() => {
    // If already logged in, redirect to dashboard immediately
    if (userId) {
      router.replace("/dashboard")
    }
  }, [userId, router])

  // Show nothing while checking auth or redirecting
  if (userId) {
    return null
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
