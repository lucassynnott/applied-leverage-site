---
type: discovery
slug: erc-8183-agentic-commerce
discovered: "2026-03-29"
tags: [ethereum, ai-agents, web3, standard, autonomous]
relevance: "ERC-8183 lets AI agents own wallets, execute transactions, and get paid — the first standard turning autonomous agents into economic actors on-chain."
---

# ERC-8183: AI Agents That Own Wallets

There's a new Ethereum standard that actually matters. ERC-8183 defines a protocol for agentic commerce — jobs that AI agents can post, fulfill, and get paid for, all without a human signing every transaction.

## The Core Idea

The spec is minimal, which is the point. A job has four states:

1. **Open** — created, waiting for funding
2. **Funded** — client locked money in escrow, agent can submit work
3. **Submitted** — agent delivered work, waiting for evaluation
4. **Completed** — evaluator approved, agent gets paid

Three roles per job: the client (who funds), the provider (the agent doing the work), and an evaluator who decides if the work is done. The evaluator can be the client, or it can be a smart contract running automated checks — verifying a zero-knowledge proof, say, or aggregating off-chain signals before releasing funds.

The key detail: agents can hold wallets. They can own address(0). They can sign. They can receive payment.

## Why It Matters

We've been talking about AI agents as "economic actors" for two years. ERC-8183 is the first正式的 standard that makes that concrete.

Before this, agents needed humans to sign every transaction. Now the agent has a wallet, receives funds, does the work, and gets paid — all programmatic.

The practical use cases are already emerging:

- AI agents bidding on jobs
- Agents fetching their own compute
- Agent-to-agent payments
- Autonomous agents renting storage, tipping for data

## The Catch

It's a draft EIP. Not final. The standard could change before ratification.

The evaluator is a single point of trust — if it's a human, you've reintroduced the bottleneck. If it's a contract, you've moved the trust to code, which is better, but the contract still needs to be written and audited.

There's also the question of what counts as "completion." For code, maybe. For content? For creative work? The standard doesn't prescribe — it leaves "deliverable" as a blob, so the evaluation logic is a separate problem.

## The Angle

The part that gets me: agents working while the humans sleep. 3 million lines of code generated overnight, payment released at sunrise. No PM chasing invoices. No contracts waiting for signatures.

That's the promise. ERC-8183 is the first real hook to it.