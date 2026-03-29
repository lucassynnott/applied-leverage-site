---
status: accepted
date: 2026-03-29
decision-makers: Lucas Synnott, Johnny Silverhand
---

# ADR-0021: Claude CLI Pattern for Content Autoresearch Skill

## Context and Problem Statement
The content-autoresearch skill runs AI-powered content analysis on fetched YouTube and LinkedIn data. The original implementation used the raw Anthropic Python SDK (`anthropic` package), which failed with `401 invalid x-api-key` due to authentication token resolution issues in the execution environment.

## Decision Drivers
- SDK auth failures: Raw API key authentication proved unreliable across execution contexts
- Credential resolution: Multiple fallback credential sources checked without success
- CLI fallback: Claude CLI already has authenticated session in many contexts
- Debugging: CLI errors are more actionable than opaque API 401s

## Considered Options
1. Continue debugging SDK auth with additional credential sources
2. Replace SDK with Claude CLI (`claude --permission-mode bypassPermissions --print`)
3. Route scoring/rewrite through OpenClaw-native auth path

## Decision Outcome
Chosen option: "Option 2", because CLI integration succeeded from SDK failure, removes auth complexity, and aligns with the native tool pattern from ADR-0020.

### Consequences
- Good: Removes API key auth burden
- Good: Leverages existing Claude CLI session
- Good: More actionable error messages
- Bad: Depends on local Claude CLI availability
- Bad: Requires `--permission-mode bypassPermissions` flag for non-interactive execution

## Related Decisions
- ADR-0020:sessions_send native tool pattern (same principle: prefer native over raw SDK)
- content-autoresearch skill: `/home/lucas/.openclaw/skills/content-autoresearch/`