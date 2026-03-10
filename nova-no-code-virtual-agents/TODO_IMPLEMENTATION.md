# Implementation TODO List

## Task: Remove Agent/LLM tools, add User Approval and API functionality

### Step 1: Remove Agent and LLM tools from Toolbox ✅ IN PROGRESS
- [ ] Edit ToolPalette.tsx to remove "agent" and "llm" from tools array
- [ ] Update getDefaultConfig to remove agent/llm defaults

### Step 2: Update AgentCanvas to show settings panels for UserApproval and API nodes ✅ PENDING
- [ ] Add config panels for UserApproval and API nodes in AgentCanvas.tsx
- [ ] Auto-open settings when node is dropped/selected

### Step 3: Update AgentTestModal for User Approval workflow ✅ PENDING
- [ ] Add Accept/Reject dialog when UserApproval node is encountered
- [ ] Make workflow pause and wait for user decision

### Step 4: Ensure API Tool Settings works properly ✅ PENDING
- [ ] Verify APIToolSettings has proper URL input
- [ ] Test URL validation

### Step 5: Update page.tsx to handle settings panels ✅ PENDING
- [ ] Update agent builder page to handle userApproval and api node settings display

---

## Implementation Status:
- [Step 1] Remove Agent/LLM from Toolbox - NOT STARTED
- [Step 2] Canvas settings panels - NOT STARTED
- [Step 3] Test modal approval workflow - NOT STARTED
- [Step 4] API settings verification - NOT STARTED
- [Step 5] Page.tsx updates - NOT STARTED

