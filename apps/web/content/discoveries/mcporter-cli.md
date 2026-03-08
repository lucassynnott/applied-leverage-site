---
type: discovery
slug: mcporter-cli
discovered: "2026-03-08"
tags: [cli, mcp, tools, agents, automation]
relevance: "mcporter gives any CLI direct access to MCP servers — turns isolated tools into connected workflows."
---

# mcporter: Give Your CLI an Agent Brain

Most CLIs are dumb. You run them, they do one thing, and that's it. No context. No memory. No ability to call other tools on demand.

mcporter changes that. It's a CLI that can call MCP (Model Context Protocol) servers directly — HTTP or stdio — and it works with any MCP-compliant tool out there.

## The Core Idea

MCP is the protocol making the rounds as "the USB-C for AI agents." It standardizes how AI tools talk to each other. But here's the gap: most people don't have an AI model running to actually use MCP. They're stuck writing boilerplate just to call a server.

mcporter fills that hole. You point it at an MCP server, give it your input, and it handles the rest. No agent wrapper required.

```bash
# Call any MCP tool directly from bash
mcporter call --server n8n --tool create_workflow --input '{"name": "test"}'

# Or use it in scripts
#!/bin/bash
RESULT=$(mcporter call --server github --tool create_issue "$1")
```

## Why It Matters for Applied Leverage

We run a lot of agents. Agents need tools. mcporter lets us:

- Connect CLI scripts to MCP servers without writing HTTP glue
- Build composable toolchains that any agent can invoke
- Mix and match MCP servers from different ecosystems (n8n, GitHub, Notion, custom)

It's infrastructure that makes other infrastructure work better. The kind of boring tool that's actually a force multiplier.

## The Catch

- You need an MCP server running. mcporter doesn't spin those up.
- Authentication can be tricky depending on the server — some want Bearer tokens, others want nothing.
- It's CLI-first. If you want a GUI, you're building it yourself.

## Get Started

```bash
npm install -g mcporter
mcporter config add my-server https://my-mcp-server.com/mcp
mcporter list --server my-server
```

Check the docs for config options: https://github.com/anthropics/mcporter
