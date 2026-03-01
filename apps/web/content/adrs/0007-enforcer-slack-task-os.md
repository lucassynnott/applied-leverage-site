---
status: accepted
date: 2026-03-01
decision-makers: Lucas Synnott, Johnny Silverhand
---

# Enforcer: Slack-Native Task OS for AIAA+CLAWD

## Context and Problem Statement

AIAA+CLAWD needed a task management system where tasks could be dispatched to specific agents, tracked through stages, and verified with evidence URLs — all visible and controllable from Slack without leaving the interface.

## Decision Drivers

- Existing tools (Linear, Notion) require context-switching outside Slack
- Tasks need a machine-readable ledger agents can query programmatically
- Evidence-gated transitions prevent agents from marking tasks "done" without proof
- Only authorized users (Lucas, Johnny) should be able to dispatch tasks

## Considered Options

1. **Linear integration** — good UX, but external tool, webhook complexity, no direct agent-to-task binding
2. **Custom REST API** — flexible, but heavy infrastructure for a coordination layer
3. **Slack-native Python Bolt app (Enforcer)** — runs as systemd service, uses Socket Mode, pure Slack interface

## Decision Outcome

Chosen option: **Enforcer — Slack Bolt Python app running as systemd service**.

### Architecture

- **board_intake**: Parses `#task-board` messages, assigns T-IDs (T-00001+), writes to JSON ledger
- **coordinator_delegate**: Routes dispatched tasks to agent channels
- **board_watcher**: Monitors agent channels for `DONE T-XXXXX <evidence-url>` patterns, validates URL domain, transitions task state
- **Unified dispatcher**: Single `@app.event("message")` handler (Bolt limitation — only first handler fires)

### Evidence Domains (allowlist)
`github.com, linear.app, railway.app, vercel.app, notion.so, docs.google.com, drive.google.com, *.slack.com`

### Consequences

**Positive:**
- Zero UI outside Slack — full task OS from message interface
- Slash commands available (`/dispatch`, `/taskstatus`, `/audit`)
- Systemd auto-restart on crash, boot-enabled
- Ledger is plain JSON — any agent can read task state

**Negative:**
- Bolt single-handler limitation requires unified dispatcher pattern (learned the hard way)
- Socket Mode sessions go stale if channel privacy changes — requires service restart
- JSON ledger not suitable for >10K tasks (acceptable for current scale)

### Deployment

```bash
sudo systemctl status openclaw-enforcer
sudo systemctl restart openclaw-enforcer
tail -f ~/AIAA+CLAWD/enforcer/logs/enforcer.log
```
