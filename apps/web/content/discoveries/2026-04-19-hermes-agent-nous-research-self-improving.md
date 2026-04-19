---
type: discovery
slug: 2026-04-19-hermes-agent-nous-research-self-improving
discovered: "2026-04-19"
tags: [hermes, nous-research, agents, self-improving, openclaw, skills, memory, open-source]
relevance: "Hermes Agent is Nous Research's open-source self-improving agent. It's what OpenClaw would look like if a research lab rebuilt it from scratch, and it ships with a one-command hermes claw migrate to pull your OpenClaw stack across. That's a competitor and a confirmation in the same release."
---

# Hermes Agent: Nous Research just shipped a self-improving agent that imports from OpenClaw

Most of the "agent framework" launches I've written about this year were wrappers. A nicer loop around Claude, a nicer loop around the OpenAI Responses API, a nicer prompt scaffolding. Nothing wrong with those. They just aren't what Nous Research does.

Hermes Agent is what Nous Research does. A research lab that trains its own models shipped a personal agent runtime with a closed learning loop, messaging gateways to six chat platforms, a cron scheduler, six different terminal backends, and a `hermes claw migrate` command that imports an existing OpenClaw install.

That last one is the part that stopped me. A competing runtime shipped a migration tool targeting the one you already use. That's either a threat or a signal, and it's honestly both.

## The core idea

The pitch Nous is making is that most agents don't actually learn. They remember. They retrieve. They summarize. They don't close the loop between "thing happened" and "I got better at handling that thing." Hermes is built to close that loop.

Four pieces do most of that work.

The first is agent-curated memory with periodic nudges. Memory isn't just a vector store the agent occasionally queries. The agent is prompted, on a schedule, to review and persist what matters. The model works on its own memory the way a human works on a journal.

The second is autonomous skill creation. After a complex task, Hermes can write a skill for itself so the next time the pattern shows up it doesn't solve it from scratch. These go into `~/.hermes/skills/`, they're slash-commandable (`/gif-search`, `/axolotl`, `/plan`), and they follow the [agentskills.io](https://agentskills.io) open standard, which is the same one ClawHub is tracking.

The third is skills that self-improve during use. Run a skill, the skill learns from the run, the skill is better the next time. That's the loop most agents never finish.

The fourth is [Plastic Labs Honcho](https://github.com/plastic-labs/honcho) for user modeling. Honcho builds a deepening model of who you are across sessions. Not just "Lucas likes direct answers," but the dialectic back-and-forth that makes long-term memory actually useful. This is the right shape for a personal agent you keep for years.

The rest is infrastructure an operator would actually want. A real terminal UI with streaming tool output. Messaging gateways to Telegram, Discord, Slack, WhatsApp, Signal, and email, running out of one gateway process, with voice memo transcription and cross-platform conversation continuity. A built-in cron scheduler that delivers to any platform. Six terminal backends including Daytona and Modal for serverless persistence, so the agent's sandbox hibernates when idle and wakes on demand. On Modal the idle cost rounds to zero.

And it's model-agnostic. Switch between Nous Portal, OpenRouter's 200+ models, NVIDIA NIM, Xiaomi MiMo, z.ai/GLM, Kimi, MiniMax, Hugging Face, OpenAI, or your own endpoint with `hermes model`. No code changes. No vendor lock.

## The OpenClaw migration is the interesting part

This is the bit that stopped me:

```bash
hermes claw migrate              # Interactive migration (full preset)
hermes claw migrate --dry-run    # Preview what would be migrated
hermes claw migrate --preset user-data   # Migrate without secrets
```

What gets imported:

- `SOUL.md`, the persona file
- Memories from `MEMORY.md` and `USER.md`
- User-created skills, dropped into `~/.hermes/skills/openclaw-imports/`
- The command approval allowlist
- Messaging settings and working directories
- Allowlisted API keys (Telegram, OpenRouter, OpenAI, Anthropic, ElevenLabs)
- TTS audio assets
- `AGENTS.md` workspace instructions

It's a real port, not a "we support the same config key" import. The `hermes setup` wizard detects `~/.openclaw` on first run and offers to migrate before configuration begins.

Nous looked at the OpenClaw install base, decided the data was the valuable part, and built a one-shot importer. That's a competent land-grab move. It's also a tacit endorsement of OpenClaw's schema. SOUL, memories, skills, workspace instructions. The files a senior AI lab thought worth copying are the files we're already writing.

## Why it matters for Applied Leverage

First, it's proof the shape is right. Every piece of OpenClaw I've spent time defending, the [SOUL files](/discoveries/openclaw-personal-ai-gateway), the [agent-writable skills](/discoveries/2026-04-16-clawhub-agent-skill-registry), the [persistent memory](/discoveries/2026-03-07-openstinger-temporal-memory-graph), the cross-platform messaging, the cron delivery, is in Hermes. Same primitives, different runtime. When an independent research lab arrives at the same architecture you already shipped, the architecture is probably right.

Second, it's a real competitor. Hermes has things OpenClaw doesn't have yet out of the box: six terminal backends including Modal for serverless persistence, first-class voice memo transcription, Honcho dialectic user modeling, batch trajectory generation for RL training. It's model-agnostic by design, not as a side feature. The installer is one curl and a `source ~/.bashrc`. For a new operator picking between runtimes today, Hermes is a serious option.

Third, it's a distribution surface. The agentskills.io standard Hermes implements is the same standard ClawHub is tracking. Skills we ship into ClawHub are, in principle, already loadable by Hermes users. That's a way to reach users on a competitor's runtime without shipping anything new. Whatever we build for the Hermes install base works on ours by construction.

The right move isn't to panic. It's to build skills people actually want, regardless of which runtime they live on.

## The catch

A few honest ones.

"Self-improving" is a spectrum. The loop Hermes describes (memory curation, skill creation, skill self-improvement) is real, and it's a step beyond most agents. It's not autonomous goal-setting, it's not general reflection, and it's not free from the usual agent failure modes. It's a tighter loop than most. That's a meaningful claim. It's not a magical one.

Skill self-improvement during use sounds great and is hard. A skill that learns from its own runs also drifts. The agentskills.io spec talks about evaluation and best practices for a reason. If you don't check what the skill became, you eventually end up with a skill that works great on the training distribution and falls over in production. This isn't a Hermes problem. It's a skills-as-living-artifacts problem. Whoever runs that loop honestly, wins.

The messaging gateway surface is broad. Six platforms plus email is a lot of auth to manage. Telegram is easy. WhatsApp and Signal are less easy. Discord and Slack work the way those two always work. If you only need one, one is fine. If you need all of them, expect a weekend of setup and some paperwork on the business-platform paths.

Serverless persistence on Modal or Daytona isn't free. "Nearly nothing when idle" is accurate. The first cold start isn't instant. For a personal agent you check a few times a day, the math is fine. For something you want responsive in 200ms, it isn't.

Windows isn't supported natively. WSL2 only. Not a dealbreaker for our audience, worth knowing.

## Where it fits

If you're already running OpenClaw and it's working, don't migrate just because a new shiny thing exists. Your skills, memories, and workflows are real, and moving them has a cost even with the one-command importer. The right move is to watch what Hermes ships and borrow the good ideas. The Honcho user modeling. The Modal-backed serverless terminal. The skill self-improvement loop.

If you're new, and you want a personal agent runtime today from a research lab with a track record, Hermes is the strongest single-install path I've seen this year. One curl. Pick a model. Point it at a chat platform. Done.

If you're building skills, and you should be, build them against the agentskills.io standard. That's the surface both runtimes honor. It's also the surface [ClawHub](/discoveries/2026-04-16-skillhub-agent-skill-registry) is productizing. One spec, two runtimes, one distribution channel.

Nous Research picked the fight in the open. Good.

- Repo: [NousResearch/hermes-agent](https://github.com/NousResearch/hermes-agent)
- Docs: [hermes-agent.nousresearch.com/docs](https://hermes-agent.nousresearch.com/docs/)
- Install: `curl -fsSL https://raw.githubusercontent.com/NousResearch/hermes-agent/main/scripts/install.sh | bash`
- Skills standard: [agentskills.io](https://agentskills.io)
- Related user modeling: [Plastic Labs Honcho](https://github.com/plastic-labs/honcho)
