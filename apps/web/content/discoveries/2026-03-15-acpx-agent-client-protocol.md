---
type: discovery
slug: acpx-agent-client-protocol
discovered: "2026-03-15"
tags: [protocol, agents, coding, infrastructure, open-source]
relevance: "acpx gives you a first-class runtime for spawning and managing coding agents like Codex and Claude Code — no PTY hacks required."
---

# acpx: The Runtime Your Coding Agents Deserve

Stop managing coding agents with tmux and shell scripts. acpx (Agent Client Protocol eXecutable) gives you a clean runtime for spawning, tracking, and communicating with external coding agents.

## The Core Idea

acpx is an ACP (Agent Client Protocol) backend that treats external coding agents as first-class processes with proper lifecycle management. Instead of:
- Spawning agents in tmux sessions
- Polling process IDs
- Parsing stdout for signals

You get:
- Native process lifecycle (start, stop, resume)
- Structured message passing
- Session state management
- Tool registration API

## Why It Matters for Applied Leverage

We run Codex and Claude Code as coding agents. Originally, we used PTY hacks and tmux sessions — fragile, hard to monitor, no clean lifecycle. acpx replaced all of that with a proper protocol layer.

Now agents start, stop, and communicate through defined interfaces. Not shell scripts held together with prayers.

## The Catch

acpx requires agents to support the ACP protocol. If your coding agent of choice doesn't speak ACP, you're doing the integration work yourself. Not all tools have caught up yet.

Also: it's young. The protocol is still evolving. Expect some instability as interfaces settle.
