"use client"

import { useUser } from "@clerk/nextjs"
import { useContext, useEffect, useState } from "react"
import { UserDetailContext } from "@/context/UserDetailsContext"
import { useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
<<<<<<< HEAD
import { useToast } from "@/components/ui/use-toast"
=======
>>>>>>> fcb949d08971b4acc79fa3a18c05ce7fbe16e9e1

export default function UserInitializer() {
  const { user, isLoaded } = useUser()
  const { userDetail, setUserDetail } = useContext(UserDetailContext)
  const [isInitialized, setIsInitialized] = useState(false)
<<<<<<< HEAD
  const { toast } = useToast()
=======
>>>>>>> fcb949d08971b4acc79fa3a18c05ce7fbe16e9e1

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
<<<<<<< HEAD
          toast({
            title: "Initialization failed",
            description: "No email found for user",
            variant: "destructive",
          })
=======
          console.error("No email found for user")
>>>>>>> fcb949d08971b4acc79fa3a18c05ce7fbe16e9e1
          return
        }

        // Create or get user from Convex
<<<<<<< HEAD
        // User already exists or create silently - no notifications/toasts
=======
>>>>>>> fcb949d08971b4acc79fa3a18c05ce7fbe16e9e1
        const userData = await createUserMutation({
          name: name,
          email: email
        })

        if (userData && userData._id) {
<<<<<<< HEAD
=======
          // Set user in context with the proper structure
>>>>>>> fcb949d08971b4acc79fa3a18c05ce7fbe16e9e1
          setUserDetail({
            _id: userData._id as string,
            name: userData.name,
            email: userData.email,
            token: userData.token
          })
          setIsInitialized(true)
        }
      } catch (error) {
<<<<<<< HEAD
        toast({
          title: "Initialization error",
          description: error instanceof Error ? error.message : "Failed to initialize user",
          variant: "destructive",
        })
=======
        console.error("Error initializing user:", error)
>>>>>>> fcb949d08971b4acc79fa3a18c05ce7fbe16e9e1
      }
    }

    initializeUser()
<<<<<<< HEAD
  }, [isLoaded, user, isInitialized, createUserMutation, setUserDetail, userDetail, toast])
=======
  }, [isLoaded, user, isInitialized, createUserMutation, setUserDetail, userDetail])
>>>>>>> fcb949d08971b4acc79fa3a18c05ce7fbe16e9e1

  // This component doesn't render anything
  return null
}
