# T-Bug PRD: Port JoelClaw Inngest Pipeline for Applied Leverage

## Context

~/applied-leverage-site is a JoelClaw fork. The Inngest system-bus pipeline still has
Joel Hooks' hardcoded Mac paths throughout. Need to port to Lucas's Linux setup.

Viktor already handled the simple bash sync (scripts/sync-adrs.sh + cron). This PRD
covers the deeper Inngest pipeline work.

## Tasks

- [x] Fix hardcoded paths in packages/system-bus/src/inngest/functions/content-sync.ts
  - Replace /Users/joel/Vault/docs/decisions/ source with: process.env.AL_ADR_SOURCE ?? path.join(process.env.HOME, '.openclaw/workspace/adr')
  - Replace /Users/joel/Code/joelhooks/joelclaw/apps/web/content/adrs/ dest with: process.env.AL_ADR_DEST ?? path.join(process.env.HOME, 'applied-leverage-site/apps/web/content/adrs')
  - Replace /Users/joel/Vault/Resources/discoveries/ source with: process.env.AL_DISCOVERIES_SOURCE ?? path.join(process.env.HOME, '.openclaw/workspace/discoveries')
  - Replace /Users/joel/Code/joelhooks/joelclaw/apps/web/content/discoveries/ dest with: process.env.AL_DISCOVERIES_DEST ?? path.join(process.env.HOME, 'applied-leverage-site/apps/web/content/discoveries')
  - Replace REPO_ROOT = "/Users/joel/Code/joelhooks/joelclaw/" with: process.env.AL_SITE_ROOT ?? path.join(process.env.HOME, 'applied-leverage-site') + '/'
  - Fix all cwd references to use REPO_ROOT instead of the hardcoded string
  - Add import path from 'node:path' if not already there

- [x] Fix hardcoded paths in packages/system-bus/src/inngest/functions/discovery-capture.ts
  - Replace const VAULT_DISCOVERIES = HOME/Vault/Resources/discoveries with: process.env.AL_DISCOVERIES_SOURCE ?? path.join(process.env.HOME, '.openclaw/workspace/discoveries')
  - Add import path from 'node:path' if not already there

- [x] Create scripts/discover.ts — CLI to fire a discovery
  - Usage: bun scripts/discover.ts <url> [optional context]
  - Reads INNGEST_EVENT_KEY from .env at repo root
  - POSTs discovery/noted event to http://localhost:8288/e/<key> (Inngest Dev Server)
  - Falls back: if Inngest not reachable, write stub to ~/.openclaw/workspace/discoveries/<slug>.md
  - Event payload: { url, context: argv[2] ?? '', discoveredAt: new Date().toISOString() }
  - Add shebang: #!/usr/bin/env bun

- [x] Create ~/.config/systemd/user/applied-leverage-system-bus.service
  - ExecStart: runs ~/applied-leverage-site/packages/system-bus/start.sh
  - WorkingDirectory: ~/applied-leverage-site/packages/system-bus
  - Restart=on-failure, RestartSec=10
  - Do NOT enable or start the service — just create the file

- [x] Verify TypeScript compiles clean
  - Run: cd ~/applied-leverage-site && pnpm --filter system-bus check-types 2>&1 | tail -30

- [ ] Verify web build passes
  - Run: cd ~/applied-leverage-site && pnpm build 2>&1 | tail -30

- [ ] Commit and push
  - Message: feat: port Inngest pipeline paths for Applied Leverage Linux setup
  - Push to origin main

## Rules
- Do NOT touch scripts/sync-adrs.sh (Viktor's, leave it)
- Do NOT touch apps/web/next.config.js (just fixed, leave it)
- Use bun, not node
