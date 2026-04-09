---
type: discovery
slug: 2026-04-09-squid-agentic-pipeline-framework
discovered: "2026-04-09"
tags: [squid, pipelines, agents, orchestration, yaml]
relevance: "Squid turns messy multi-agent glue code into a restartable pipeline we can test, gate, and run across runtimes."
---

# Squid: pipelines for agents without the bash spaghetti

Most agent workflows start as a harmless little script.

Then the rot sets in. One agent writes. Another reviews. A human needs to approve something. A bad score should kick the work back for another pass. Somebody wants parallel branches. Somebody else wants logs. Now you've got a fragile pile of shell glue pretending to be a system.

Squid is built for that exact mess.

## The core idea

Squid is an agentic pipeline framework that lets you define multi-step workflows in YAML.

That sounds boring until you look at what the steps can actually do. A pipeline can run shell commands, spawn agents, wait on approval gates, branch on conditions, fan work out in parallel, loop over items, and jump backward with `restart:` when a quality check fails. It also supports sub-pipelines, which is the difference between a workflow and a hairball.

The important bit is that agent work is native to the model. You're not bolting AI calls onto a CI tool that barely understands what you're doing. Squid already expects a workflow to include spawned agents, human approval, retries, and iterative refinement.

## Why it matters for Applied Leverage

This is the layer between "we have agents" and "we have an operating system."

A lot of what we do already has pipeline shape. Content moves through drafting, cleanup, quality control, approval, publishing, and reporting. Coding work does the same thing in a different costume: build, review, test, gate, ship. The weak point is usually not the agents. It's the orchestration logic living in shell scripts, cron prompts, or one person's brain.

Squid gives that logic structure.

A few parts are especially useful:

- It can spawn different runtimes, including OpenClaw, Claude Code, OpenCode, or custom adapters.
- Approval gates are first-class, with resume tokens instead of awkward manual patchwork.
- `restart:` means a workflow can enforce standards instead of just hoping the first draft is good enough.
- `.test.yaml` support gives you a way to test pipeline behavior without lighting money on fire.
- Event hooks for steps, gates, and spawns make failures visible.

That's the real appeal. Not "wow, another automation framework." More like: finally, a tool that treats agent orchestration like a real system instead of a demo.

## The catch

YAML won't save you from bad workflow design. If the process is stupid, Squid will help you write the stupid process down very clearly.

And if all you need is one cron job and a tiny script, this is overkill. Good. Overkill should stay overkill.

But once your workflow has retries, branches, approvals, multiple runtimes, and quality loops, calling it "just a script" is self-delusion. That's when you need something with actual structure.

Squid is for that moment.

A lot of teams are already there. They just haven't admitted it yet.
