/**
 * Better Auth + Convex integration — ADR-0075
 * GitHub OAuth for os.appliedleverage.io — owner-only access
 */
import { createClient, type GenericCtx } from "@convex-dev/better-auth";
import { convex } from "@convex-dev/better-auth/plugins";
import { components } from "./_generated/api";
import { DataModel } from "./_generated/dataModel";
import { query } from "./_generated/server";
import { betterAuth } from "better-auth/minimal";
import authConfig from "./auth.config";

const siteUrl = process.env.SITE_URL!;

// Component client — handles Convex ↔ Better Auth integration
export const authComponent = createClient<DataModel>(components.betterAuth);

export const createAuth = (ctx: GenericCtx<DataModel>) => {
  return betterAuth({
    baseURL: siteUrl,
    database: authComponent.adapter(ctx),
    socialProviders: {
      github: {
        clientId: process.env.GITHUB_CLIENT_ID!,
        clientSecret: process.env.GITHUB_CLIENT_SECRET!,
      },
    },
    plugins: [
      convex({ authConfig }),
    ],
  });
};

/** Get current authenticated user */
export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    return authComponent.getAuthUser(ctx);
  },
});

/** Check if current user is the owner (Lucas, GitHub ID 3947311) */
export const isOwner = query({
  args: {},
  handler: async (ctx) => {
    let user;
    try {
      user = await authComponent.getAuthUser(ctx);
    } catch {
      // No valid session token — not authenticated
      return false;
    }
    if (!user) return false;
    // Only Lucas (GitHub ID 3947311) can access protected pages
    const account = await ctx.runQuery(
      components.betterAuth.adapter.findOne,
      {
        model: "account",
        where: [
          { field: "userId", value: user._id },
          { field: "providerId", value: "github" },
          { field: "accountId", value: "3947311" },
        ],
      }
    );
    return !!account;
  },
});
