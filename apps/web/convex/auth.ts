/**
 * Better Auth + Convex integration
 * GitHub OAuth for os.appliedleverage.io — owner-only access
 *
 * NOTE: registerRoutes calls createAuth once at module init (for basePath extraction)
 * when process.env is empty. We provide a fallback secret for that init call.
 * The actual per-request calls get the real secret from process.env at runtime.
 */
import { createClient, type GenericCtx } from "@convex-dev/better-auth";
import { convex } from "@convex-dev/better-auth/plugins";
import { components } from "./_generated/api";
import { DataModel } from "./_generated/dataModel";
import { query } from "./_generated/server";
import { betterAuth } from "better-auth/minimal";
import authConfig from "./auth.config";

// Component client — handles Convex ↔ Better Auth integration
export const authComponent = createClient<DataModel>(components.betterAuth);

// Fallback secret for module init (registerRoutes calls createAuth to extract basePath).
// At runtime, process.env.BETTER_AUTH_SECRET is always used.
const INIT_FALLBACK = "convex-deploy-init-placeholder-not-used-at-runtime";

export const createAuth = (ctx: GenericCtx<DataModel>) => {
  return betterAuth({
    baseURL: process.env.SITE_URL || "https://os.appliedleverage.io",
    secret: process.env.BETTER_AUTH_SECRET || INIT_FALLBACK,
    database: authComponent.adapter(ctx),
    socialProviders: {
      github: {
        clientId: process.env.GITHUB_CLIENT_ID || "placeholder",
        clientSecret: process.env.GITHUB_CLIENT_SECRET || "placeholder",
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
      return false;
    }
    if (!user) return false;
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
