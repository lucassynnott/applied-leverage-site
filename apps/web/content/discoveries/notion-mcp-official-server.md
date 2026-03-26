---
type: discovery
slug: notion-mcp-official-server
discovered: "2026-03-26"
tags: [notion, mcp, integration, automation, ai-agents]
relevance: "Notion's official MCP server lets AI agents read/write databases directly — no more API tokens scattered across scripts."
---

# Notion MCP Server: Native AI Access to Your Workspace

Notion dropped an official MCP server. Not a community plugin. The actual Notion team built it, hosted it at mcp.notion.com, opened it up via OAuth.

If you've been wiring AI agents to Notion through API tokens and custom scripts, this changes things.

## The Old Way

You wanted your agent to read a database? Create a page? Update a property?

You had to:
1. Create a Notion integration at developers.notion.com
2. Get your API key
3. Share your database with that integration
4. Write code to hit the Notion API
5. Handle rate limits, pagination, token refresh

It's tedious. You never do it right the first time, and then you have a brittle script running in production that breaks every few months when Notion changes their API.

## The New Way

With the official MCP server:

```json
{
  "notion": {
    "url": "https://mcp.notion.com/mcp"
  }
}
```

That's it. OAuth authentication. Access to whatever databases you explicitly share. Read, write, update, search without touching a single API endpoint.

Your agent sees your Notion workspace the same way you do — databases, pages, properties, all in the native structure. No more parsing weird API responses or mapping object models.

## Why This Matters for Applied Leverage

We're running multi-agent systems that need access to project context, task lists, knowledge bases. Currently that's a mix of Obsidian vaults, Slack threads, and manual Notion updates.

Notion MCP means our agents can:
- Pull fresh context from the same Notion pages Lucas uses for planning
- Write task updates directly to shared databases without a human in the loop
- Create new project pages when agents spawn new workstreams

The agents meet Lucas where Lucas already works. That's the goal.

## The Catch

- **OAuth only.** Machine-to-machine without user context? Still on the classic API.
- **Rate limits apply.** Standard Notion limits — fine for most uses, but bulk-updating 10,000 rows will choke.
- **It's new.** mcp.notion.com launched recently. Bugs will surface. The API surface might shift.

Notion built this because every AI tool on the market was reverse-engineering their API anyway. Might as well make it official.