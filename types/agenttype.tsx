import { Id } from "../nova-no-code-virtual-agents/convex/_generated/dataModel"
export type Agent={
    _id: Id<"AgentTable">,
    agentId:string,
    config?:any,
    published:boolean,
    name:string,
    userId:Id<"UserTable">,
    _creationTime: number,
}