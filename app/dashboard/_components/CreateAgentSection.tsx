'use client'

import React, { useContext, useState } from 'react'
import { Loader2, Plus, Eye, Sparkles, Wand2, Layers } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/use-toast'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog"
import { UserDetailContext } from '@/context/UserDetailsContext'
import { Input } from '@/components/ui/input'
import { useMutation } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { useRouter } from 'next/navigation'
import { v4 as uuidv4 } from 'uuid'
import { Id } from '@/convex/_generated/dataModel'
import AgentPreviewModal from './AgentPreviewModal'

const CreateAgentSection = () => {
  const [openDialog, setOpenDialog] = useState(false)
  const [openPreview, setOpenPreview] = useState(false)
  const [agentName, setAgentName] = useState('')
  const [loader, setLoader] = useState(false)

  const { userDetail, setUserDetail } = useContext(UserDetailContext)
  const createAgentMutation = useMutation(api.agent.CreateAgent)
  const router = useRouter()
  const { toast } = useToast()

  // ✅ Function to create a new agent
  const createAgent = async () => {
    try {
      if (!agentName.trim()) {
        toast({
          title: "Invalid name",
          description: "Agent name cannot be empty",
        })
        return
      }
      if (!userDetail?._id) {
        toast({
          title: "Not authenticated",
          description: "Please log in to create agents",
          variant: "destructive",
        })
        return
      }

      setLoader(true)
      const agentId = uuidv4() // Generate unique agentId

      // Call Convex mutation
      const result = await createAgentMutation({
        name: agentName,
        agentId,
        userId: userDetail._id as Id<"UserTable">, // ✅ TypeScript fix
      })

      setUserDetail((prev) =>
        prev
          ? {
              ...prev,
              token: result.remainingCredits,
            }
          : prev
      )
      setAgentName('')

      toast({
        title: "Agent created!",
        description: `${agentName} is ready. ${result.deductedCredits} credits used.`,
      })

      // Navigate to the agent-builder page using the agentId (UUID), not the document _id
      router.push('/agent-builder/' + agentId)
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Unable to create agent right now.'
      toast({
        title: "Failed to create agent",
        description: message,
        variant: "destructive",
      })
    } finally {
      setLoader(false)
      setOpenDialog(false)
    }
  }

  return (
    <div className="space-y-2 flex flex-col justify-center items-center mt-8">
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center p-4 bg-gradient-to-r from-violet-100 via-purple-100 to-pink-100 rounded-2xl mb-4">
          <Sparkles className="h-8 w-8 text-violet-600" />
        </div>
        <h2 className="font-bold text-3xl bg-gradient-to-r from-violet-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
          Create AI Agent
        </h2>
        <p className="text-lg text-gray-500 mt-2">
          Build an AI Agent workflow with custom logic and tools
        </p>
      </div>

      <div className="flex gap-4 mt-4">
        {/* Preview Button - Enhanced Styling */}
        <Button 
          size="lg" 
          variant="outline"
          onClick={() => setOpenPreview(true)}
          className="gap-2 px-8 py-6 text-lg rounded-2xl border-2 border-violet-200 hover:border-violet-400 hover:bg-gradient-to-r hover:from-violet-50 hover:to-purple-50 transition-all hover:shadow-lg hover:shadow-purple-500/20"
        >
          <Eye className="h-5 w-5" />
          Preview
        </Button>

        {/* Create Button - Enhanced Styling */}
        <Dialog open={openDialog} onOpenChange={setOpenDialog}>
          <DialogTrigger asChild>
            <Button size="lg" className="gap-2 px-8 py-6 text-lg rounded-2xl bg-gradient-to-r from-violet-600 via-purple-600 to-pink-600 hover:from-violet-700 hover:via-purple-700 hover:to-pink-700 shadow-xl shadow-purple-500/25 transition-all hover:scale-105 hover:shadow-2xl">
              <Plus className="h-5 w-5" />
              Create
            </Button>
          </DialogTrigger>

          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Wand2 className="h-5 w-5 text-violet-600" />
                Enter Agent Name
              </DialogTitle>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <Input
                placeholder="My Awesome Agent"
                value={agentName}
                onChange={(e) => setAgentName(e.target.value)}
                className="h-12 rounded-xl border-2 border-violet-200 focus:border-violet-500 focus:ring-violet-200 text-lg"
                autoFocus
              />
              <p className="text-xs text-gray-500">
                Give your agent a descriptive name to help you identify it later
              </p>
            </div>

            <DialogFooter>
              <DialogClose asChild>
                <Button variant="ghost" className="rounded-xl">
                  Cancel
                </Button>
              </DialogClose>

              <Button 
                onClick={createAgent} 
                disabled={loader || !agentName.trim()}
                className="rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700"
              >
                {loader && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Create Agent
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

        {/* Agent Preview Modal with sidebar tools + real-time */}
      <AgentPreviewModal 
        open={openPreview} 
        onOpenChange={setOpenPreview} 
      />
    </div>
  )
}

export default CreateAgentSection
