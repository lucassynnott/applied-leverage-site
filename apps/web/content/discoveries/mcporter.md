---
type: discovery
slug: mcporter
discovered: "2026-03-05"
tags: [mcp, tools, agents, infrastructure, cli]
relevance: "mcporter is the CLI that makes MCP servers accessible to any workflow — no agent required."
---

# mcporter: MCP Servers Without the Headache

If you've been paying attention to the AI agent space, you've heard about MCP (Model Context Protocol). Anthropic made it open. Everyone's building servers. The problem? Actually using them was a pain in the ass.

Enter mcporter.

## The Core Idea

mcporter is a CLI that lets you list, configure, auth, and call MCP servers directly — HTTP or stdio, doesn't matter. It's the missing glue between "cool, there's an MCP server for that" and actually getting work done.

Think of it as the docker CLI but for MCP servers. You can:
- `mcporter list` — see what's installed
- `mcporter config` — add/edit server configs
- `mcporter call` — invoke a tool on any server
- Generate types, run ad-hoc servers, the whole thing

No agent required. No framework lock-in. Just pipes.

## Why It Matters for Applied Leverage

We're building a Zero Human Company. That means our agents need to talk to everything — Notion, GitHub, our own custom tools. MCP is the protocol that makes that possible.

mcporter is the utility layer that lets us:
1. Spin up new tool integrations fast
2. Test MCP servers without writing code
3. Hook external services into our agent workflows without dancing around authentication

It's not sexy. It's not going to blow up on Twitter. But it's the kind of infrastructure that stops you from reinventing the wheel every time you want your agent to do something new.

## The Catch

- If you're not running agents, mcporter does nothing for you
- The stdio servers require some setup (you gotta manage the processes yourself)
- Documentation could be better — it's a young tool

But if you're building agent infrastructure? This is a tool worth having in your belt.
