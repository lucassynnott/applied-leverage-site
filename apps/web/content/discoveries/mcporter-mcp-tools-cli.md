---
type: discovery
slug: mcporter-mcp-tools-cli
discovered: "2026-03-12"
tags: [mcp, tools, cli, agents, infrastructure]
relevance: "mcporter turns any MCP server into a callable CLI — essential for scripting agent toolchains."
---

# mcporter: The MCP Tools CLI You Didn't Know You Needed

If you're building agent systems, you've probably hit this wall: great tools exist as MCP servers, but calling them from scripts or custom workflows feels like pulling teeth.

mcporter solves it. Clean. Simple. No ceremony.

## The Core Idea

mcporter is a CLI that interfaces directly with MCP servers. Not the "start a server and talk JSON-RPC" way — the "I just want to call a tool from bash" way.

```bash
# List what a server can do
mcporter list

# Call a tool directly
mcporter call --server notion "create page" --title "Launch Plan"
```

It handles auth, connection, and the JSON wrangling so you don't have to. Point it at a configured MCP server, ask for tools, call them by name. That's it.

## Why It Matters for Applied Leverage

We're all-in on agent infrastructure. OpenStinger handles memory. xint handles Twitter. But the glue — the part where you stitch together disparate tool ecosystems — has always been the messy middle.

mcporter is that glue.

- **Composable workflows**: Chain tools across servers without writing Python wrappers
- **Debugging**: Test MCP tools in terminal before wiring them into agents
- **CI/CD**: Run MCP tool calls in pipelines without spawning long-lived processes

It fits the Applied Leverage philosophy: leverage automation over manual work, build tools that make tools.

## The Catch

- It's only as good as your MCP server configuration. Bad server, bad experience.
- Not every server exposes clean interfaces. Some are idiosyncratic.
- Requires understanding how MCP actually works — it's not magic, it's infrastructure.

If you're already deep in the MCP ecosystem, you probably needed this years ago. If you're not, mcporter is a solid reason to start.
