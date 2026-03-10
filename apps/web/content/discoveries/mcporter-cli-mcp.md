---
type: discovery
slug: mcporter-cli-mcp
discovered: "2026-03-10"
tags: [cli, mcp, tools, developer-experience]
relevance: "mcporter lets you call any MCP server tool directly from the terminal — no code needed."
---

# mcporter: Call MCP Tools Without Writing Code

If you're building with MCP servers and tired of writing wrapper code just to test a tool, mcporter is the CLI you've been waiting for.

## The Core Idea

MCP (Model Context Protocol) is gaining traction. Every day there's a new server — Linear, Notion, Slack, custom internal tools. The problem: calling them usually means writing client code, handling auth, figuring out the schema.

mcporter skips all that. You give it a server and a tool call, it does the rest.

```bash
# List what's available on a server
mcporter list linear --schema

# Call a tool with simple key=value syntax
mcporter call linear.list_issues team=ENG limit:5

# Or use full function syntax
mcporter call "linear.create_issue(title: \"Bug fix needed\")"

# Even works with remote servers via URL
mcporter call https://api.example.com/mcp.fetch url:https://example.com
```

It handles stdio-based servers too, so your locally-running MCP servers work the same as hosted ones.

## Why It Matters for Applied Leverage

We're deep in agent territory. MCP is the glue between LLMs and your tools. The faster we can iterate on tool combinations, the faster we ship.

mcporter means:
- **Faster prototyping** — test tool calls before writing any code
- **Debugging** — call tools directly from terminal to see raw responses
- **CLI generation** — `mcporter generate-cli` builds a ready-to-use CLI from any MCP server

For a stack built on agents and automation, that's leverage.

## The Catch

- You still need the MCP server running (or a URL to hit)
- Auth can be tricky with some servers — mcporter supports OAuth but not every provider plays nice
- Schema introspection only works if the server implements it

But for quick tool exploration and CLI-driven workflows, it beats writing boilerplate every time.
