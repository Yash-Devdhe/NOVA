# NOVA Implementation Task Plan

## Task Summary
This document outlines the comprehensive plan for implementing multiple features in the NOVA agent builder project.

## Tasks to Complete

### 1. Add FreePublicAPIs URL to Agent Builder
- [ ] Add https://www.freepublicapis.com/api to API_SERVICES in NodePropertiesPanel.tsx
- [ ] Include proper icon and description

### 2. Credits Deduction on Agent Save
- [ ] Modify convex/agent.ts to deduct 1 credit when saving agent
- [ ] Update CreateAgent mutation to deduct 1 credit (change from 100 to 1)
- [ ] Add proper validation and error handling
- [ ] Update notification to reflect new deduction

### 3. Dashboard Data Page - Saved Agents
- [ ] Change "Published" to "Saved Agents" in dashboard/data/page.tsx
- [ ] Update the logic to show saved agents count
- [ ] Display saved agents list

### 4. Chat History Implementation
- [ ] Store chat messages in ChatHistoryTable (already exists in schema)
- [ ] Add chat history for Agent Preview Modal (agent-builder)
- [ ] Add chat history for NOVA Dashboard Preview
- [ ] Create convex mutations for saving chat history

### 5. Remove AgentToolsTable
- [ ] Remove AgentToolsTable from convex/schema.ts

### 6. NOVA AI Preview - Real-time Chat with Speech-to-Text
- [ ] Remove image generation from AgentPreviewModal.tsx
- [ ] Remove video generation from AgentPreviewModal.tsx
- [ ] Add real-time chat response (like Alexa)
- [ ] Add speech-to-text functionality (Web Speech API)
- [ ] Make UI professional and attractive
- [ ] Add guidelines for creating agents in chat
- [ ] Add information about all tools in real-time

### 7. Remove Image and Video Generation from Project
- [ ] Clean up related code from dashboard
- [ ] Update AgentPreviewModal in dashboard

### 8. GitHub Upload
- [ ] Upload updated code to GitHub repo named NOVA
- [ ] Account: Yash_Devdhe

## Implementation Notes

### Credits Deduction Logic
- Current: AGENT_CREATION_CREDIT_COST = 100
- New: AGENT_CREATION_CREDIT_COST = 1
- Apply on agent save/create

### Chat History Schema (Already exists)
```
ChatHistoryTable: {
  agentId: string,
  userId: id("UserTable"),
  message: string,
  sender: "user" | "agent",
  timestamp: number,
  metadata: optional(any)
}
```

### Tables to Remove
- AgentToolsTable (from schema.ts)

### Key Files to Modify
1. convex/schema.ts - Remove AgentToolsTable
2. convex/agent.ts - Credits deduction + chat history
3. app/agent-builder/_components/NodePropertiesPanel.tsx - Add API URL
4. app/dashboard/data/page.tsx - Saved agents display
5. app/dashboard/_components/AgentPreviewModal.tsx - Real-time chat + speech
6. app/agent-builder/_components/AgentPreviewModal.tsx - Chat history + real-time

## Status: IN PROGRESS

