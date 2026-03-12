import { mutation, query } from "./_generated/server"
import { v } from "convex/values"

const AGENT_CREATION_CREDIT_COST = 1

export const CreateAgent = mutation({
  args: {
    name: v.string(),
    agentId: v.string(),
    userId: v.id("UserTable"),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId)
    if (!user) {
      throw new Error("User not found")
    }

    const currentCredits = user.token ?? 0
    if (currentCredits < AGENT_CREATION_CREDIT_COST) {
      throw new Error(
        `Not enough credits. Agent creation requires ${AGENT_CREATION_CREDIT_COST} credits, but you have ${currentCredits}.`
      )
    }

    const result = await ctx.db.insert('AgentTable', {
      agentId: args.agentId,
      name: args.name,
      published: false,
      userId: args.userId,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    })

    const remainingCredits = currentCredits - AGENT_CREATION_CREDIT_COST
    await ctx.db.patch(args.userId, {
      token: remainingCredits,
    })

    await ctx.db.insert("NotificationsTable", {
      userId: args.userId,
      title: "Agent created",
      message: `${args.name} was created. ${AGENT_CREATION_CREDIT_COST} credits were deducted.`,
      type: "agent_created",
      isRead: false,
      createdAt: Date.now(),
    })

    return {
      agentDocumentId: result,
      remainingCredits,
      deductedCredits: AGENT_CREATION_CREDIT_COST,
    }
  },
})

export const GetUserAgents = query({
  args: {
    userId: v.id("UserTable"),
  },
  handler: async (ctx, args) => {
    const result = await ctx.db.query('AgentTable').filter(q => q.eq(q.field('userId'), args.userId)).order('desc').collect();
    return result;
  },
})

export const GetAgentById = query({
  args: {
    agentId: v.string(),
  },
  handler: async (ctx, args) => {
    const result = await ctx.db.query('AgentTable')
      .filter(q => q.eq(q.field('agentId'), args.agentId))
      .first();
    return result;
  },
})

export const UpdateAgentConfig = mutation({
  args: {
    agentId: v.string(),
    config: v.any(),
  },
  handler: async (ctx, args) => {
    const agent = await ctx.db.query('AgentTable')
      .filter(q => q.eq(q.field('agentId'), args.agentId))
      .first();
    
    if (!agent) {
      throw new Error("Agent not found");
    }
    
    await ctx.db.patch(agent._id, {
      config: args.config,
      updatedAt: Date.now(),
    });
    
    return agent._id;
  },
})

// Chat History Functions
export const SaveChatMessage = mutation({
  args: {
    agentId: v.string(),
    userId: v.id("UserTable"),
    message: v.string(),
    sender: v.string(),
    metadata: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const result = await ctx.db.insert('AgentChatHistoryTable', {
      agentId: args.agentId,
      userId: args.userId,
      message: args.message,
      sender: args.sender,
      timestamp: Date.now(),
      metadata: args.metadata,
    });
    return result;
  },
})

export const GetAgentChatHistory = query({
  args: {
    agentId: v.string(),
    userId: v.id("UserTable"),
  },
  handler: async (ctx, args) => {
    const result = await ctx.db.query('AgentChatHistoryTable')
      .filter(q => q.and(
        q.eq(q.field('agentId'), args.agentId),
        q.eq(q.field('userId'), args.userId)
      ))
      .order('asc')
      .collect();
    return result;
  },
})

export const ClearAgentChatHistory = mutation({
  args: {
    agentId: v.string(),
    userId: v.id("UserTable"),
  },
  handler: async (ctx, args) => {
    const chats = await ctx.db.query('AgentChatHistoryTable')
      .filter(q => q.and(
        q.eq(q.field('agentId'), args.agentId),
        q.eq(q.field('userId'), args.userId)
      ))
      .collect();
    
    for (const chat of chats) {
      await ctx.db.delete(chat._id);
    }
    return { cleared: true };
  },
})
