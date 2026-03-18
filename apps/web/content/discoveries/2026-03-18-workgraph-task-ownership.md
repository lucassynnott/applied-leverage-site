---
type: discovery
slug: workgraph-task-ownership
discovered: "2026-03-18"
tags: [coordination, multi-agent, task-management, ownership, applied-leverage]
relevance: "Workgraph is how we know who owns what across our agent fleet - critical for multi-agent coordination."
---

# Workgraph: Task Ownership That Actually Works

Most agent fleets are chaos. Tasks get dropped, duplicated, or abandoned because no one knows who's responsible for what. We built Workgraph to fix that.

## The Situation

When you have multiple AI agents working in parallel, you need answers fast:
- Who owns this task?
- What's blocked?
- What's next for each agent?
- Who can I hand this off to?

Most people solve this with a shared Notion doc or a Trello board. That works until you have 5+ agents generating tasks faster than humans can update columns.

## How It Works

Workgraph is a lightweight task ownership layer purpose-built for agent fleets.

The concepts are simple:
- **Actors** (agents or humans) claim threads
- **Threads** represent work items with clear ownership
- **Lenses** show different views: all, mine, blocked, ready

The CLI:
```
wg-ops.sh brief <actor>      # What is this actor working on?
wg-ops.sh status            # Full battlefield view
wg-ops.sh next <actor>       # What's next for this agent?
wg-ops.sh claim <thread> <actor>  # Assign ownership
```

It lives at `/nas/vault/workgraph` and integrates with our Slack communication bus. When an agent completes a task, it updates the graph. When a human needs to intervene, they can see exactly what's pending.

## Why It Matters

The governance gap is real. Most agent teams we've seen have no idea what their agents are actually doing at any given moment. They're flying blind.

With Workgraph:
- Every task has lineage (auditability)
- Ownership transfers cleanly between agents (handoffs)
- You can see what's stuck instantly (blocker detection)
- Humans can see and claim work when needed (human-in-the-loop)

## The Trade-offs

It's not a general-purpose project management tool. Workgraph is designed for agent fleets, not human teams. If you need Gantt charts or calendar views, look elsewhere.

It also assumes your agents can update state. If your agents don't have a way to write back to the graph, you get stale data. We've solved this by having our agents emit completion events that Workgraph consumes.

## The Real Talk

We didn't set out to build a PM tool. We built Workgraph because we kept losing track of what our agents were doing. The fifth time a task got stuck because no one knew it existed was the fifth time too many.

If you're running a multi-agent system and you don't know who owns what, you're not running a fleet. You're running a fire drill.
