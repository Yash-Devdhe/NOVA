import { mutation, query } from "./_generated/server"
import { v } from "convex/values"

export const CreateAgent = mutation({
  args: {
    name: v.string(),
    agentId: v.string(),
    userId: v.id("UserTable"),
  },
  handler: async (ctx, args) => {
    const result = await ctx.db.insert('AgentTable', {
      agentId: args.agentId,
      name: args.name,
      published: false,
      userId: args.userId,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    })
    return result;
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
