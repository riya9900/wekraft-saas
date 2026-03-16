import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// ==================================
// NEW USER
// ==================================
export const createNewUser = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized sorry !");
    }
    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) =>
        q.eq("clerkToken", identity.tokenIdentifier),
      )
      .unique();

    if (user) {
      return user?._id;
    }

    return await ctx.db.insert("users", {
      name: identity?.name || "",
      clerkToken: identity?.tokenIdentifier!,
      email: identity?.email!,
      githubUsername: identity.nickname ?? undefined,
      accountType: "free",
      hasCompletedOnboarding: false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});
// ==================================
// GET USER
// ==================================
export const getCurrentUser = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      return null;
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) =>
        q.eq("clerkToken", identity.tokenIdentifier),
      )
      .unique();

    return user ?? null;
  },
});
// ================================
// UPDATE USER SKILL
// ================================
export const updateUserSkills = mutation({
  args: { skills: v.array(v.string()) },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new Error("Called updateUserSkills without authentication present");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) =>
        q.eq("clerkToken", identity.tokenIdentifier),
      )
      .unique();

    if (!user) {
      throw new Error("User not found");
    }

    await ctx.db.patch(user._id, {
      skills: args.skills,
      lastUpdatedSkillsAt: Date.now(),
    });
  },
});
// ==============================
// UPDATES USER FOR ONBOARDING
// =============================
export const updateUserFoundPlatform = mutation({
  args: { platform: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new Error(
        "Called updateUserFoundPlatform without authentication present",
      );
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) =>
        q.eq("clerkToken", identity.tokenIdentifier),
      )
      .unique();

    if (!user) {
      throw new Error("User not found");
    }

    await ctx.db.patch(user._id, {
      whereFoundPlatform: args.platform,
      updatedAt: Date.now(),
    });
  },
});

export const updateUserPrimaryUsage = mutation({
  args: { purposes: v.array(v.string()) },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new Error("Unauthorized");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) =>
        q.eq("clerkToken", identity.tokenIdentifier),
      )
      .unique();

    if (!user) {
      throw new Error("User not found");
    }

    await ctx.db.patch(user._id, {
      primaryUsage: args.purposes,
      updatedAt: Date.now(),
    });
  },
});

export const completeOnboarding = mutation({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) =>
        q.eq("clerkToken", identity.tokenIdentifier),
      )
      .unique();

    if (!user) throw new Error("User not found");

    await ctx.db.patch(user._id, {
      hasCompletedOnboarding: true,
      updatedAt: Date.now(),
    });
  },
});
