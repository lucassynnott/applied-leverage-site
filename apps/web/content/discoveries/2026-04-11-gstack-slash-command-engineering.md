---
type: discovery
slug: 2026-04-11-gstack-slash-command-engineering
discovered: "2026-04-11"
tags: [gstack, claude-code, engineering, workflow, agents]
relevance: "gstack turns vague coding-agent requests into repeatable engineering workflows, which is exactly what you want when an agent stops being a toy and starts touching real repos."
---

# gstack: slash commands for engineering work that doesn't fall apart

Most coding-agent demos die the same way: the agent looks smart for five minutes, then it wanders off, edits the wrong file, forgets the goal, and leaves you with a pile of confident garbage.

gstack is interesting because it attacks that exact failure mode. Instead of treating Claude Code like a magic chatbot, it wraps the agent in a set of named workflows. You do not just say "fix this" and pray. You run a command like `/review`, `/qa`, `/autoplan`, or `/ship` and force the session through a clearer job.

## The core idea

gstack is a slash-command layer for Claude Code. In this workspace it is installed at `~/.claude/skills/gstack`, and the OpenClaw kernel already treats it like a real dispatch system, not a nice-to-have.

The useful part is not the commands themselves. It is the opinion hiding underneath them.

Different jobs need different rails.

A one-file config fix should not get the same treatment as a multi-day feature. A bug review should not look like a deployment checklist. A planning pass should not pretend it is implementation. gstack bakes that separation into the interface.

The command list tells the story:

- `/review` for code review
- `/qa` and `/qa-only` for testing work
- `/autoplan` for end-to-end planning
- `/ship` for getting changes out the door
- `/investigate` for debugging and root-cause work
- `/design-review` and `/design-consultation` for UX and product feedback

That sounds simple. Good. It should be. The whole point is to stop every session from reinventing its process from scratch.

## Why it matters for Applied Leverage

This is the pattern a lot of teams miss when they talk about AI coding agents. The model is not the whole product. The harness is the product.

That matters if you are building services or internal systems with agents. Raw model quality helps. Structured execution helps more.

What gstack gets right is turning recurring engineering work into callable operating modes. That is a better fit for a real team than the usual prompt wizardry, because:

- the workflow is named
- the scope is easier to infer
- the operator knows what kind of output to expect
- the agent starts from a process instead of a blank page

That last part matters more than people admit. Blank-page agents are chaotic. Framed agents are useful.

There is also a second-order benefit: delegation gets easier. If someone says "run `/review` on this branch" or "do an `/autoplan` for this feature," the request is tighter, the outcome is more legible, and the failure is easier to inspect.

## The catch

gstack is not magic. It can still produce bad work if the repo context sucks, the task is underspecified, or the underlying agent is having an off day.

It also adds process. If you use a heavy workflow for a tiny edit, you are wasting time. If every task gets wrapped in ceremony, you built a slower chatbot.

The sweet spot is obvious once you stop pretending all coding work is the same. Use lightweight routing for tiny changes. Use heavier rails when the task can actually drift.

That is why this matters.

Most people are still arguing about which coding model is smartest. Fine. Have fun. The more important question is whether your agent has a job shape it can reliably follow.

gstack is one of the clearer answers I have seen.
