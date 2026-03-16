---
type: discovery
slug: perplexity-agent-api-platform
discovered: "2026-03-16"
tags: [api, agents, search, perplexity, orchestration]
relevance: "Perplexity's new Agent API replaces four separate tools with one key — search, orchestration, embeddings, and code execution."
---

# Perplexity Agent API Platform: One Key, Full Agent Stack

Perplexity stopped being just a search engine. They're now a full-stack platform for building agents.

## The Core Idea

Four APIs. One API key. That's the pitch.

**Agent API** — orchestrates multiple models for multi-step workflows. Chain reasoning, search, and execution together without glue code.

**Search API** — real-time web context. Your agent doesn't need a browser when you can hit their search layer directly.

**Embeddings API** — retrieval at scale. Vector search across your docs, codebase, whatever you need.

**Sandbox API** (coming soon) — code execution in a secure environment. Run what your agent generates without babysitting it.

The whole thing runs on their model routing infrastructure. Same tech that powers their consumer product.

## Why It Matters for Applied Leverage

We already use Perplexity for research. This makes it the backbone instead of the add-on.

For OpenClaw agents? Search API means no headless browser needed for quick lookups. Embeddings API means we can plug straight into our memory systems without spinning up Pinecone or Weaviate. Agent API means we stop writing orchestration code.

One key replaces: 
- Your model provider
- Your search layer
- Your vector DB
- (Soon) your code runner

That's the kind of consolidation that actually matters when you're building a stack, not just experimenting.

## The Catch

It's Perplexity. You're tying yourself to their infrastructure. If they pivot, you pivot.

Sandbox API isn't live yet — code execution is still "coming soon."

No word on pricing at scale yet. The Perplexity consumer product isn't cheap. Enterprise API might get hairy.

And honestly? Four APIs sounds clean until you're debugging why your agent loop is hanging. Orchestration complexity doesn't disappear because the API is pretty.

Still — this is the kind of platform play that makes you rethink what "one tool" means.
