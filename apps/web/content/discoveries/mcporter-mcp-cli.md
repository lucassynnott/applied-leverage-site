---
type: discovery
slug: mcporter-mcp-cli
discovered: "2026-03-04"
tags: [mcp, cli, tools, ai-agents, infrastructure]
relevance: "Direct MCP server invocation without the overhead — perfect for scripting agent workflows."
---

# mcporter: The CLI for MCP Servers

If you're building AI agents, you've probably hit this wall: you want to use an MCP server, but firing up a full client SDK feels like overkill. You're just trying to call a tool. mcporter solves that problem by giving you a dead-simple CLI to invoke any MCP server directly.

## The Core Idea

MCP (Model Context Protocol) is becoming the connective tissue for AI agent toolkits. But the existing client libraries assume you're building a full-blown agent with state, session management, and all that jazz. Sometimes you just want to:

```
mcporter call --server notion --tool search --args '{"query":"meeting notes"}'
```

That's it. That's the whole thing.

mcporter speaks HTTP and stdio — so it works with local MCP servers you run yourself, or remote ones behind an API endpoint. No vendor lock-in. No client SDK to wrestle with. Just a command line and the tools you need.

## Why It Matters for Applied Leverage

We're building toward a Zero Human Company. That means our agents need to talk to each other, to external services, to everything. MCP is the protocol that makes that possible. mcporter is the utility belt that makes it practical.

We're already using it to:
- Call Notion APIs through our own MCP wrapper
- Trigger n8n workflows from the command line
- Chain MCP tool calls in shell scripts for batch operations

It's the unsung utility that keeps the machine running.

## The Catch

- You still need an MCP server running (mcporter is the client, not the host)
- Error handling is still maturing — expect to parse JSON manually in some cases
- Not a replacement for a full agent framework when you need memory and orchestration

But if you need to invoke a tool from a script, a cron job, or another agent? This is the way.
