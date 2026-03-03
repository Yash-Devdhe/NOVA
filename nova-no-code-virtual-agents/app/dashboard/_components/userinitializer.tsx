"use client"

import { useUser } from "@clerk/nextjs"
import { useContext, useEffect, useState } from "react"
import { UserDetailContext } from "@/context/UserDetailsContext"
import { useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"

export default function UserInitializer() {
  const { user, isLoaded } = useUser()
  const { userDetail, setUserDetail } = useContext(UserDetailContext)
  const [isInitialized, setIsInitialized] = useState(false)

  // Create user in Convex
  const createUserMutation = useMutation(api.user.CreateNewUser)

  useEffect(() => {
    // Wait for Clerk to load and user to be available
    if (!isLoaded || !user) return
    
    // If already initialized, don't run again
    if (isInitialized) return
    
    // Also check if we already have userDetail
    if (userDetail?._id) {
      setIsInitialized(true)
      return
    }

    const initializeUser = async () => {
      try {
        const email = user.emailAddresses?.[0]?.emailAddress
        const name = user.fullName || user.firstName || "User"

        if (!email) {
          console.error("No email found for user")
          return
        }

        // Create or get user from Convex
        const userData = await createUserMutation({
          name: name,
          email: email
        })

        if (userData && userData._id) {
          // Set user in context with the proper structure
          setUserDetail({
            _id: userData._id as string,
            name: userData.name,
            email: userData.email,
            token: userData.token
          })
          setIsInitialized(true)
        }
      } catch (error) {
        console.error("Error initializing user:", error)
      }
    }

    initializeUser()
  }, [isLoaded, user, isInitialized, createUserMutation, setUserDetail, userDetail])

  // This component doesn't render anything
  return null
}
