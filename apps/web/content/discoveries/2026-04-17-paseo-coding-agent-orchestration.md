---
type: discovery
slug: 2026-04-17-paseo-coding-agent-orchestration
discovered: "2026-04-17"
tags: [coding-agents, paseo, claude-code, codex, opencode, orchestration, remote-access]
relevance: "Paseo pulls every coding agent on your machine — Claude Code, Codex, OpenCode — behind one daemon you can reach from your phone, laptop, or CLI. That's the shape we kept trying to build with tmux, ssh, and duct tape."
---

# Paseo: one daemon for every coding agent you run, reachable from anywhere

You spawn a Claude Code session on your workstation. You walk out the door. Now you're staring at your phone and the agent is eight minutes into a migration script you want to watch.

Today you have three bad options. SSH into the box from a terminal app and squint. Remote desktop and fight UI over cellular. Or just accept that agents only exist on the machine that launched them.

Paseo makes the fourth option real. One daemon on your machine runs every coding agent you have — Claude Code, Codex, OpenCode — and any client you want can connect to it: desktop app, mobile, web, CLI. End-to-end encrypted. No cloud in between. The code never leaves your machine.

## The core idea

Paseo is a local server plus a fleet of clients. The server is the daemon. It doesn't reimplement anyone else's agents. It spawns the official CLIs as subprocesses and wraps them with an orchestration layer: WebSocket API, MCP server, session state, voice input, worktree awareness.

From the outside it looks like one interface. Under the hood you're still running `claude`, `codex`, and `opencode` with your real credentials, your real config, your real dev environment. Paseo just adds the supervising layer the individual CLIs don't have.

The mobile flow is the headline trick. You open the desktop app on your laptop. It shows a QR code. You scan from your phone. You're now driving Claude Code on your laptop from the couch. Or from a hotel. Or from a meeting room where you suddenly need to ship something.

```
npm install -g @getpaseo/cli
paseo
```

That's the headless path. Prints a QR code in the terminal. Useful when your agents live on a Linux box, a Pi, or a remote server.

## The CLI is the quiet part

The mobile app gets the attention. The CLI is what matters if you already live in a multi-agent setup.

```
paseo run --provider claude/opus-4.6 "implement user authentication"
paseo run --provider codex/gpt-5.4 --worktree feature-x "implement feature X"

paseo ls                           # list running agents
paseo attach abc123                # stream live output
paseo send abc123 "also add tests" # follow-up task
```

Every agent running on the daemon is addressable. `paseo ls` shows you what's alive. `paseo attach` jumps you into one. `paseo send` fires a follow-up without restarting. And you can target a remote daemon with `--host workstation.local:6767`, which turns any machine you own into a submit-and-forget agent host.

This is the same shape we kept hacking together with tmux, screen sessions, and ad-hoc ssh. Paseo just makes it a primitive.

## Orchestration skills

The part that caught my eye — and the part the author admits is unstable — is the skills package:

```
npx skills add getpaseo/paseo
```

You get three slash commands that teach any coding agent how to drive other coding agents through the Paseo CLI:

- `/paseo-handoff` — plan with one agent, hand the implementation to another. Think Claude planning, Codex implementing.
- `/paseo-loop` — Ralph loops with teeth. Loop an agent against acceptance criteria, use a second agent to verify, cap at N iterations.
- `/paseo-orchestrator` — spin up a team and let them coordinate through a shared chat room. Opinionated about roles. Meant for Codex + Claude together.

If that reads familiar, yeah. It's the same pattern we wrote about with [Ralph loops](/discoveries/2026-04-12-ralph-loops-restartable-coding-agents) — restartable coding agents driven by acceptance criteria. Paseo gives you a supervising daemon to run them against, instead of a tmux window you'll lose to a laptop reboot.

## Why it matters for Applied Leverage

We already run multi-agent coding work. Our [gstack](/discoveries/2026-04-11-gstack-slash-command-engineering) dispatch routes coding tasks to ACP-spawned Claude Code sessions. Our [acpx](/discoveries/2026-03-15-acpx-agent-client-protocol) runtime gives those sessions a proper protocol surface. [Workgraph](/discoveries/2026-03-18-workgraph-task-ownership) tracks ownership.

What we don't have is a clean way to check in on a long-running coding agent from outside the workstation that spawned it. Right now that means SSH, `tail -f` on a log file, and hoping the session is still alive when I get back to the desk.

Paseo closes that loop. A daemon per workstation, any client can connect, agents keep running whether the laptop is asleep or not. It also exposes an MCP server, which means our other agents (Johnny, T-Bug, Goro) can talk to coding sessions through a supported protocol instead of scraping stdout.

The bigger shift is conceptual. Paseo treats coding agents as long-running services, not terminal sessions. A coding agent is closer to a build worker than a REPL. You submit work, walk away, check in later, maybe from a different device. Paseo is one of the few tools that ships that shape out of the box.

## The catch

A few honest ones.

The skills package is marked unstable. The author literally writes "might be coupled to my own setup, use at your own risk." If you adopt `/paseo-handoff` today, expect to rewrite against a new API in a month.

The default relay routes through Cloudflare. Fine for most people. If you're in a region where that's unreliable, there's already a self-hosted relay at `zenghongtu/paseo-relay` — one Go binary, one Docker command. But it's a moving part.

AGPL-3.0. Not a big deal for internal operator use. Matters if you want to repackage it as a commercial product — which you shouldn't, because paying boudra is a better use of money than reinventing Paseo.

And the thing it doesn't do: Paseo doesn't run the models. It wraps the CLIs that run the models. If Claude Code ships a breaking change, Paseo's Claude integration goes sideways until the wrapper catches up. That's the honest tradeoff of the subprocess-supervisor design. It's also why Paseo can add a new provider in a day — they don't have to reimplement anything.

## Where it fits

If you run one agent on one laptop, Paseo is overkill. Use the CLI directly.

If you run multiple agents across multiple machines, or you want to drive your workstation from your phone, or you're already doing Ralph loops with shell scripts and cron — this is the tool. 3.8k stars and 63 releases deep, the pattern lands.

Install it. Run one agent through it. You'll see why the shape is right.

- Repo: [getpaseo/paseo](https://github.com/getpaseo/paseo)
- Install: `npm install -g @getpaseo/cli`
- Desktop/mobile: [paseo.sh/download](https://paseo.sh/download)
