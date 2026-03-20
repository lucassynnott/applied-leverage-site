---
type: discovery
slug: engram-unified-memory-openclaw
discovered: "2026-03-20"
tags: [memory, agents, openclaw, context, architecture]
relevance: "We built it. It's now the memory layer for every agent in the stack."
---

# Engram: one plugin to replace three memory systems

There's a dirty secret in most agent stacks: memory is duct tape.

Semantic search here. Context compaction there. A graph database for entities. A markdown file for the human-readable layer. Each one built independently, each one with its own config, its own failure modes, its own idea of what "memory" means.

We ran that exact stack for months. Gigabrain for markdown-backed recall. Lossless Claw for context compression. OpenStinger for bi-temporal entity graphs. They all worked. They just didn't work *together*.

So we built Engram.

## What it is

Engram is an OpenClaw plugin that fills both the `memory` and `contextEngine` slots — which means it owns the full lifecycle: storing memories, recalling them, compacting context when sessions run long, extracting durable facts before anything disappears into a summary.

One SQLite database. No external services. Zero required config.

A few things worth knowing about how it actually works:

**Recall with class budgets.** Memories are classified as core facts, situational context, or decisions. Retrieval is budget-allocated across those classes, so a session doesn't get flooded with low-value recent noise when the important stuff is older. You can also lock recall around a specific person or project when that's what you're after.

**Pre-compaction extraction.** This was the biggest gap in the old stack. Before context gets compressed, Engram pulls durable facts out of the conversation. The previous setup lost things in the summarization step — accurate observations that just didn't survive the summary. That's gone now.

**Quality gates.** Junk filtering, exact and semantic deduplication at a 0.92 threshold, plausibility scoring, value classification with keep/archive/reject tiers. Bad memories don't get stored in the first place, so you're not cleaning up garbage later.

**World model.** Entity extraction builds a live registry of people, projects, orgs, and topics, with beliefs, confidence scores, and relationship tracking built up from accumulated memories over time.

**Cross-agent scope.** Every agent on the same instance shares the `shared` memory pool by default. One agent stores something, another recalls it. No wiring required.

## Why we built it

We run eight agents on one box. Until Engram, those agents had inconsistent views of the same facts. One would store a decision. Another would contradict it two sessions later because it was working from stale context.

Memory was a per-agent configuration problem, not a platform. Engram makes it the latter.

It also killed three external service dependencies. OpenStinger's FalkorDB and PostgreSQL stack is gone. Gigabrain's separate sync pipeline is gone. Lossless Claw runs inside Engram instead of alongside it.

## The trade-offs

The bi-temporal graph from OpenStinger is gone. Relationships between entities used to be queryable edges — you could traverse the graph. Now they're beliefs attached to entity profiles. Less powerful for complex relationship queries; more than sufficient for everything we actually needed.

SQLite is a single file. At our current agent count, that's fine. At 50+ concurrent agents with high write frequency, you'd hit contention. We're not there.

Migration was manual. OpenStinger memories needed to be re-ingested through the new pipeline. Most survived.

## Where it lives

In production since 2026-03-19. Config in `~/.openclaw/extensions/openclaw-memory/openclaw.plugin.json`. Install via `openclaw plugins install openclaw-memory`, restart the gateway, and it takes over both slots automatically.

The memory layer is finally boring. That's the point.
