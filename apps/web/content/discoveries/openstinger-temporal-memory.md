---
type: discovery
slug: openstinger-temporal-memory
discovered: "2026-03-11"
tags: [memory, agents, knowledge-graph, infrastructure]
relevance: "OpenStinger gives agents long-term memory across sessions — no more starting from scratch every conversation."
---

# OpenStinger: Memory That Actually Works

Most agent setups have the memory depth of a goldfish. Each session starts empty. You repeat yourself. Context gets lost. OpenStinger fixes that.

## The Core Idea

OpenStinger is a bi-temporal knowledge graph that persists across all agent sessions. It automatically ingests conversation history, extracts entities (people, tools, companies), facts, and relationships — then lets you query any of it later.

It combines:
- **FalkorDB** for graph + vector storage
- **PostgreSQL** for audit trails  
- **Gemini embeddings** for semantic search (free, 3072 dims)
- **Claude** for entity extraction

## Why It Matters for Applied Leverage

We're running multiple agents across multiple sessions. Without memory, every new conversation is day one. With OpenStinger:

- "What did we decide about Skool?" — instant answer from last week's conversation
- "Who owns the billing integration?" — entity lookup across all sessions
- "Show me everything about Stripe" — hybrid semantic + keyword search

The agents actually remember what you built, what you decided, and who owns what.

## The Catch

- It's self-hosted — running FalkorDB, PostgreSQL, and the MCP server locally
- Initial setup takes some Docker config
- Embedding quality depends on Gemini's free tier (good, not great)
- Requires mcporter to call the MCP tools (adding another dependency)

## The Point

If you're running agents in production and you're not storing memory across sessions, you're wasting every conversation after it ends. OpenStinger isn't perfect, but it's the only open-source temporal graph I've found that actually works out of the box.

Run it. Your future self will thank you.
