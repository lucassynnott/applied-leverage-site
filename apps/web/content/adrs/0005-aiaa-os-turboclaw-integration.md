---
status: proposed
date: 2026-02-27
decision-makers: Lucas Synnott
---

# AIAA OS — TurboClaw integration for per-student OpenClaw deployment

## Context and Problem Statement

AIAA teaches agency owners to use AI agents, but students struggle with deployment infrastructure. Three existing repos contain pieces of the solution: TurboClaw (per-user deployment), Agentcy-OS (gateway engine with 29 channel extensions), and ClawsOS (145 agency directives + dashboard). These need to be unified into a single product that gives each AIAA student their own AI agent with pre-loaded agency workflows.

## Decision

Fork `turbostarter/openclaw` (TurboClaw) as the deployment foundation and integrate it with AIAA-specific content:

1. **Custom Docker image** — Build on official OpenClaw image, bake in 145 agency directives from ClawsOS + 286 skill bibles from Agentcy-OS + AIAA-branded AGENTS.md/SOUL.md templates
2. **Extended config generation** — Expand `getGatewayConfig()` to inject agency context files (profile, brand voice, services, ideal client) alongside the standard openclaw.json
3. **Agency setup wizard** — Dashboard form that captures agency details and writes context files to the instance STATE_DIR before container start
4. **Workflow dashboard** — Port ClawsOS workflow browser (categories, detail pages, "Run" button) into TurboClaw's Next.js app

Architecture: TurboClaw control plane → Docker container per student → OpenClaw with pre-loaded AIAA content → Connected via Telegram/Discord/Slack

## Consequences

* Good, because students go from signup to running agent in under 60 seconds
* Good, because 145 pre-built workflows eliminate the "what do I do with this" problem
* Good, because TurboClaw already handles the hard infra (SSH, Docker, Caddy, HTTPS)
* Bad, because maintaining a custom Docker image adds build/release overhead
* Bad, because shared API keys across instances need rate limiting and cost tracking
* Neutral, because the product can be monetized as a standalone SaaS or bundled with AIAA enrollment

## Implementation Plan

### Phase 1: POC (1-2 days)
- Fork turbostarter/openclaw
- Build custom Docker image with directives
- Deploy one test instance on VPS
- Verify: chat works, agent has agency context

### Phase 2: Agency Setup (2-3 days)
- Setup wizard in dashboard
- Context file generation and injection

### Phase 3: Workflow Dashboard (3-5 days)
- Port ClawsOS components to Next.js
- Chat panel integration

### Phase 4: Billing (3-5 days)
- Stripe subscriptions, usage metering

### Phase 5: Launch (2-3 days)
- Landing page, templates, monitoring

### Affected repos
- `turbostarter/openclaw` (fork) → core deployment
- `lucassynnott/clawsos` → directives source
- `lucassynnott/Claws-Agentcy-OS` → skill bibles source

### Verification
- [ ] Custom Docker image builds and starts
- [ ] Instance deploys from dashboard with agency context
- [ ] Agent responds with agency-aware context
- [ ] 145 workflows browsable in dashboard
- [ ] Stripe checkout → auto-deploy flow works end-to-end

## More Information

Full plan at `/nas/vault/people/workspaces/johnny/plans/aiaa-os-plan.md`
