---
type: discovery
slug: cloudflare-moltworker-openclaw-hosting
discovered: "2026-02-28"
tags: [tool, ai, agents, cloudflare, hosting, infrastructure, openclaw]
relevance: "Cloudflare Moltworker lets you self-host OpenClaw on edge infrastructure for ~\$35/month — no Mac Mini required."
---

# Cloudflare Moltworker: OpenClaw Without the Hardware

Everyone's been buying Mac Minis to run personal AI agents. Cloudflare looked at that trend and said "what if you didn't need new hardware?"

[Moltworker](https://github.com/cloudflare/moltworker) is their answer — a middleware Worker that runs [OpenClaw](https://github.com/openclaw/openclaw) (the project formerly known as Moltbot/Clawdbot) inside Cloudflare's Sandbox containers. Same multi-channel agent, same skill system, same gateway architecture. Just... in the cloud, not your closet.

## The Economics Are Interesting

Always-on runs about **\$35/month** (\$5 Workers plan + ~\$30 compute). But here's the thing — if you're only running it active 4 hours/day, you're looking at roughly **\$10-11/month**. That's competitive with a \$600 Mac Mini amortized over a couple years, except you don't own the depreciation.

The container sleeps when idle (configurable), cold starts take 1-2 minutes, and R2 storage keeps your memory/conversations persistent across restarts. For an always-available agent that handles async tasks via Telegram/Discord/Slack, this is genuinely viable.

## What's Actually Running

- **Sandbox container**: 0.5 vCPU, 4GB RAM, 8GB disk — standard-1 instance
- **AI Gateway**: Routes to Anthropic/OpenAI with caching, fallbacks, cost tracking
- **Browser Rendering**: Headless Chrome via CDP proxy for web automation
- **Zero Trust Access**: JWT-protected admin UI and API routes
- **R2**: Persistent storage for configs, paired devices, conversation history

They even wired up a CDP shim so OpenClaw's browser automation works through Cloudflare's Browser Rendering API instead of local Chrome. Clever workaround.

## The Catch

It's a **proof of concept**, not a Cloudflare product. The repo says "may break without notice." You're essentially running experimental infrastructure on top of beta infrastructure (Sandboxes only hit general availability recently).

Also: you're trading hardware headaches for cloud vendor lock-in. If Cloudflare changes pricing or Sandboxes get deprecated, you're migrating. But that's the trade-off for zero server management.

## Key Ideas

- **Serverless agents are feasible now**: Between Sandboxes and persistent R2 storage, you can run stateful AI agents on pure serverless infrastructure
- **Cost-optimal for intermittent use**: 4 hours/day usage drops this into "why not?" territory vs. dedicated hardware
- **Multi-layer auth by default**: Cloudflare Access + device pairing + gateway tokens — this is how you expose an AI agent to the internet without getting owned
- **Browser automation via API**: CDP proxy to Browser Rendering is a pattern we'll see more of as agents need to "see" the web
- **Unified billing matters**: AI Gateway's credit system means one less API key to rotate

## Links

- [Moltworker GitHub](https://github.com/cloudflare/moltworker)
- [Cloudflare announcement post](https://blog.cloudflare.com/moltworker-self-hosted-ai-agent/)
- [Sandbox SDK docs](https://developers.cloudflare.com/sandbox/)
- [OpenClaw repo](https://github.com/openclaw/openclaw)
- [AI Gateway pricing](https://developers.cloudflare.com/ai-gateway/reference/pricing/)
