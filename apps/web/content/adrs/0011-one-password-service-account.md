---
status: accepted
date: 2026-03-04
decision-makers: Lucas Synnott, Johnny Silverhand
---

# 1Password Service Account for Secret Management

## Context and Problem Statement

API keys and secrets were scattered across multiple locations: `.env` files, bashrc, systemd service files, and manually managed configs. No single source of truth, rotation was painful, and agents had inconsistent access to secrets. The previous setup made it easy to accidentally commit secrets or lose track of what was where.

## Decision Drivers

- Scattered secrets across multiple files and locations
- No programmatic access for agents beyond individual CLI lookups
- Manual rotation process — easy to miss updates
- Need for centralized audit trail of secret access
- Service account enables automated, auditable secret retrieval by agents

## Considered Options

1. **Status Quo (scattered `.env` files)** — easy to start, hard to maintain, high leak risk
2. **HashiCorp Vault** — powerful but overkill, complex setup, steep learning curve
3. **AWS Secrets Manager** — tied to AWS, not suitable for personal/agency use
4. **1Password Service Account** — CLI-native, human-readable, integrated with 1Password ecosystem, supports service accounts

## Decision Outcome

Chosen option: **1Password Service Account** as single source of truth for all secrets.

### Implementation

- Service account token obtained from 1Password admin console
- Token stored in environment variable `OP_SERVICE_ACCOUNT_TOKEN`
- Configured in multiple locations for redundancy:
  - `~/.bashrc` (user session)
  - `~/.openclaw/.env.1password` (OpenClaw environment)
  - systemd service environment file
- Verified access to Claws vault (50+ items)
- All future secrets: store in 1Password first, then inject via `op` CLI

### Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    1Password                            │
│                      (Claws Vault)                      │
│         [API Keys, Tokens, Credentials]                 │
└─────────────────────┬───────────────────────────────────┘
                      │ Service Account Token
                      ▼
┌─────────────────────────────────────────────────────────┐
│                 Agent Runtime                           │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐    │
│  │   op CLI    │  │  .env files │  │  bashrc     │    │
│  └─────────────┘  └─────────────┘  └─────────────┘    │
└─────────────────────────────────────────────────────────┘
```

### Usage Patterns

```bash
# Read a secret
op item get "OpenAI API Key" --format json

# Read password field
op item get "Notion API Key" --field password

# List all items in vault
op vault list
op item list --vault Claws
```

### Consequences

**Positive:**
- Single source of truth for all secrets
- Service account enables agent automation without human involvement
- Audit trail of secret access via 1Password
- Easy rotation — update in 1Password, agents pick up automatically
- 50+ items already migrated to Claws vault
- No more committed secrets in git

**Negative:**
- Requires 1Password subscription (team or business for service accounts)
- Network dependency — agents need access to 1Password API
- Service account has full vault access — need to secure the token itself
- Additional latency for secret retrieval (network call vs local file)

## Future Considerations

- Rotate service account token periodically
- Consider scoped service accounts if 1Password supports them (per-vault access)
- Document all secrets in Notion "API Keys Registry" page with 1Password references
- Evaluate `op run` for secrets injection during command execution
