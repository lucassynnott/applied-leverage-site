---
type: discovery
slug: xint
discovered: "2026-03-06"
tags: [x, twitter, cli, tools, intelligence, content, research]
relevance: "xint gives you programmatic access to X/Twitter — search, monitor, analyze, all from CLI."
---

# xint: Your X Intelligence CLI

If you're serious about content, you need to know what's happening on X. Not just checking manually — that's a time sink. xint turns the entire platform into a queryable database you can script against.

## The Core Idea

xint is a CLI that wraps X's API (via xAI's Grok) into a powerful command-line tool. It's not a client for posting — it's for *intelligence*. Think of it as Google Alerts met `grep` met your personal research assistant.

Key capabilities:
- **search** — Query tweets by keyword, filter by recency, engagement, or author
- **watch** — Monitor topics in real-time with polling intervals
- **analyze** — Run Grok AI analysis on any query result
- **thread** — Fetch full conversation threads (including long tweets and articles)
- **tui** — Interactive menu for common workflows
- **stream** — Live filtered stream for keywords or authors
- **mcp-server** — Expose all this to AI agents via MCP

No OAuth required for read operations. Just install and query.

## Why It Matters for Applied Leverage

We're building an audience. That means:
1. Knowing what topics are trending in our niche
2. Tracking competitors and collaborators
3. Finding leads before they find us
4. Monitoring our own mentions

xint makes this automatic. Here's what we're already doing with it:
- `xint search 'AI agents'` each morning to surface new tools and frameworks
- `xint watch` on competitor accounts to catch product launches
- `xint analyze` on search results to get AI-synthesized insights
- Feeding data into our content pipeline for discovery posts

It's the surveillance system for our market intelligence. And because it's a CLI, we chain it into scripts, cron jobs, and agent workflows. No clicking required.

## The Catch

- Write-heavy operations need OAuth setup (read-only works out of the box)
- X's API rate limits exist — xint handles them, but you feel them at scale
- The AI analysis feature uses xAI's Grok, which has its own quotas
- Not a replacement for actually being on the platform — it's a research layer, not engagement

If you're just looking to post tweets, use the official app or Twitter API directly. If you need to *monitor, analyze, and react* — this is your tool.
