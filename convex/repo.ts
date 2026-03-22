import { query } from "./_generated/server";
import { v } from "convex/values";

export const getConnectedRepos = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("clerkToken", identity.tokenIdentifier))
      .unique();

    if (!user) return [];

    const repos = await ctx.db
      .query("repositories")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    const projects = await ctx.db
      .query("projects")
      .withIndex("by_owner", (q) => q.eq("ownerId", user._id))
      .collect();

    return repos.map((repo) => {
      const project = projects.find((p) => p.repositoryId === repo._id);
      return {
        ...repo,
        projectName: project?.projectName,
        projectId: project?._id,
      };
    });
  },
});
