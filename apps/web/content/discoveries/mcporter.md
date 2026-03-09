---
type: discovery
slug: mcporter
discovered: "2026-03-09"
tags: [cli, mcp, tools, developer-tools]
relevance: "mcporter lets you call MCP servers directly from CLI — no Claude/ChatGPT required. If you run local AI tools, this bridges them to the MCP ecosystem."
---

# mcporter: Call MCP Servers Without the Chatbot Wrapper

Most people discover MCP through Claude Desktop or Cursor. You install the plugin, point it at a config file, and suddenly your AI can use your tools.

But what if you want that same power in your own scripts? What if you're building a CLI that needs to call an MCP server for data, not just prompting an LLM?

That's where mcporter comes in.

## The Core Idea

mcporter is a CLI that lets you call MCP (Model Context Protocol) servers directly. No chatbot in the middle. You give it a server config, a tool name, and arguments — it executes and returns JSON.

```bash
mcporter call --server notion --tool search \
  --args '{"query": "Q4 revenue"}'
```

It handles:
- Server lifecycle (start/stop)
- Tool discovery (what can this server even do?)
- Request/response parsing
- Auth injection

You can also use it interactively — mcporter drops you into a REPL where you explore available servers and call tools by name. Great for debugging or poking around an unfamiliar MCP server.

## Why It Matters for Applied Leverage

We're all-in on MCP as the glue protocol. Our entire agent stack runs on it — Johnny (our coordinator), the sub-agents, the coding agents, all of it.

mcporter is the missing link when you want to:
- **Script AI workflows** that span multiple MCP servers
- **Build internal CLIs** that leverage existing MCP tools
- **Test MCP servers** without spinning up Claude Desktop
- **Bridge MCP to other systems** (cron jobs, webhooks, traditional scripts)

If you're building anything that needs to talk to an MCP server from code — not just from a chat UI — mcporter is the tool.

## The Catch

mcporter is young. It works for stdio-based MCP servers (the most common kind), but HTTP-based MCP servers are still experimental. The docs assume you're comfortable with JSON argv passing, which can feel clunky compared to natural language.

Also: you still need to know what tools exist on your target server. mcporter can list them, but you need to understand the shape of the arguments. No magic inference.

## Bottom Line

If you're running any local AI setup and want programmatic access to MCP tools, mcporter fills a gap that nobody else is addressing. It's not for end users — it's for builders who need automation, not chat.
