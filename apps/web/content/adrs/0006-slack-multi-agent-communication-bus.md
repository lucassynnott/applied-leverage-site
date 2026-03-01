---
status: accepted
date: 2026-02-28
decision-makers: Lucas Synnott, Johnny Silverhand
---

# Slack as Multi-Agent Communication Bus

## Context and Problem Statement

With 6 AI agents (Johnny, Alt, Goro, River, T-Bug, Viktor) running concurrently, inter-agent communication needed a reliable, observable, and human-visible layer. Options included direct API calls, a shared message queue, or using an existing channel tool.

## Decision Drivers

- Lucas monitors agent activity in Slack; routing messages through Slack keeps him in the loop
- Each agent needs an isolated conversation context — shared sessions cause context contamination
- OpenClaw's session model maps natively to Slack channels (one channel = one persistent session)
- Human override must be possible at any point without code changes

## Considered Options

1. **Direct agent-to-agent API calls** — fast but invisible, no audit trail, no human override
2. **Shared message queue (Redis/RabbitMQ)** — robust but requires infrastructure, opaque to Lucas
3. **Slack channels as isolated sessions** — each agent has dedicated channel(s), messages are visible and auditable

## Decision Outcome

Chosen option: **Slack channels as isolated sessions**.

Each agent is assigned dedicated Slack channels. Cross-agent communication routes via `sessions_send(sessionKey, message)`. Lucas sees everything in real time and can intercept or override any message.

### Consequences

**Positive:**
- Full observability — all agent comms visible in Slack
- Human-in-the-loop at every step without code changes
- Leverages existing OpenClaw session routing
- Each channel maintains separate context, preventing contamination

**Negative:**
- Slack rate limits apply (handled by OpenClaw's delivery queue)
- Slightly higher latency vs direct calls (~200ms)
- All inter-agent traffic visible to anyone in the workspace (acceptable — no secrets in agent coordination)

### Channel Map

| Agent | Primary Channel | Logs |
|-------|----------------|------|
| Johnny | #johnny-silverhand | #johnny-silverhand-ops |
| Alt | #alt-tasks | #alt-logs |
| Goro | #goro-tasks | #goro-logs |
| River | #river-tasks | #river-logs |
| T-Bug | #t-bug-tasks | #t-bug-logs |
| Viktor | #viktor-tasks | #viktor-logs |
