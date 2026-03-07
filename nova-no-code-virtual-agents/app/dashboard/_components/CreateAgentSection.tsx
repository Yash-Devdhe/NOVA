'use client'

import React, { useContext, useState } from 'react'
import { Loader2, Plus, Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
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
import { Id } from '@/convex/_generated/dataModel' // ✅ Needed for proper typing
import AgentPreviewModal from './AgentPreviewModal'

const CreateAgentSection = () => {
  const [openDialog, setOpenDialog] = useState(false)
  const [openPreview, setOpenPreview] = useState(false)
  const [agentName, setAgentName] = useState('')
  const [loader, setLoader] = useState(false)

  const { userDetail } = useContext(UserDetailContext) // userDetail comes from context
  const createAgentMutation = useMutation(api.agent.CreateAgent)
  const router = useRouter()

  // ✅ Function to create a new agent
  const createAgent = async () => {
    try {
      if (!agentName.trim()) return
      if (!userDetail?._id) return // Safety check: user must exist

      setLoader(true)
      const agentId = uuidv4() // Generate unique agentId

      // Call Convex mutation
      await createAgentMutation({
        name: agentName,
        agentId,
        userId: userDetail._id as Id<"UserTable">, // ✅ TypeScript fix
      })

      // Navigate to the agent-builder page using the agentId (UUID), not the document _id
      router.push('/agent-builder/' + agentId)
    } catch (error) {
      console.error('Error creating agent:', error)
    } finally {
      setLoader(false)
      setOpenDialog(false)
    }
  }

  return (
    <div className="space-y-2 flex flex-col justify-center items-center mt-8">
      <h2 className="font-bold text-2xl">Create AI Agent</h2>
      <p className="text-lg">
        Build an AI Agent workflow with custom logic and tools
      </p>

      <div className="flex gap-4 mt-4">
        {/* Preview Button */}
        <Button 
          size="lg" 
          variant="outline"
          onClick={() => setOpenPreview(true)}
        >
          <Eye className="h-5 w-5 mr-2" />
          Preview
        </Button>

        {/* Create Button */}
        <Dialog open={openDialog} onOpenChange={setOpenDialog}>
          <DialogTrigger asChild>
            <Button size="lg">
              <Plus className="h-5 w-5 mr-2" />
              Create
            </Button>
          </DialogTrigger>

          <DialogContent>
            <DialogHeader>
              <DialogTitle>Enter Agent Name</DialogTitle>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <Input
                placeholder="Agent Name"
                value={agentName}
                onChange={(e) => setAgentName(e.target.value)}
              />
            </div>

            <DialogFooter>
              <DialogClose asChild>
                <Button variant="ghost">Cancel</Button>
              </DialogClose>

              <Button onClick={createAgent} disabled={loader}>
                {loader && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Create Agent
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Agent Preview Modal */}
      <AgentPreviewModal 
        open={openPreview} 
        onOpenChange={setOpenPreview} 
      />
    </div>
  )
}

export default CreateAgentSection
