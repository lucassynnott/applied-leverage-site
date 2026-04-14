---
type: discovery
slug: 2026-04-14-context-doctor-openclaw-context-visibility
discovered: "2026-04-14"
tags: [openclaw, context, tooling, debugging, operators]
relevance: "Context Doctor makes hidden context-window overhead visible, which matters because agent quality falls apart long before most teams realize the bootstrap got too fat."
---

# Context Doctor: see what is eating your agent's brain before the agent gets stupid

Most people blame the model when the agent gets weird.

Sometimes the model deserves it. A lot of the time the real problem is simpler and dumber: the context window is already half full of bootstrap junk, giant workspace files, and tool schemas before the real work even starts.

That is what makes Context Doctor useful.

It gives you one view of the stuff most teams never measure: which bootstrap files are healthy, which ones are getting truncated, how much token budget your setup burns before the conversation even gets interesting, and how much room you actually have left.

## The core idea

Context Doctor is a small OpenClaw skill that audits context overhead.

Run it and it breaks the setup into three pieces:

- workspace bootstrap files, with status, character count, and token estimate
- installed skills inventory, so you can see what is available without pretending it all loads at once
- token budget allocation, including what is eaten by system prompt, workspace files, skills metadata, and tool schemas

It also gives you a blunt health read on bootstrap weight:

- under 10% of the context window, healthy
- 10 to 15%, getting chunky
- over 15%, you are burning thinking space before the real job starts

The nice part is that it does not stop at raw numbers. It flags the failure modes that actually matter:

- `✓ OK` when a file loads cleanly
- `⚠ TRUNCATED` when a file got silently cut
- `✗ MISSING` when a file path or symlink is broken

That last two matter more than most people think. Silent truncation is how an agent starts acting possessed while still sounding confident.

If you want the operator version, the command is straightforward:

```bash
python3 ~/.openclaw/workspace/skills/context-doctor/scripts/context-doctor.py
```

It can also emit JSON or render a PNG if you want to drop the result into chat.

## Why it matters for Applied Leverage

We keep relearning the same lesson: agent quality is not just model quality. It is harness quality.

A heavy bootstrap does not fail with fireworks. It fails by shaving away working memory until the agent starts contradicting itself, forgetting the middle of the job, or getting weirdly obedient to stale instructions.

Context Doctor is useful because it makes that overhead visible before the damage shows up as "the agent got dumber today."

That matters if you are running an agent stack with custom workspace files, lots of installed skills, and long-lived operating context. Which is basically the whole point of an OpenClaw setup.

It is also the kind of tool operators actually need. Not another benchmark chart. Not another prompt trick. Just a clean way to see whether your stack is wasting the scarce thing that decides how well the agent can think.

## The catch

This is a diagnostic, not a cure.

Context Doctor will tell you that your bootstrap is bloated. It will not make you cut the crap.

You still have to prune oversized files, split instructions that turned into novels, and stop stuffing permanent operating doctrine into places that should stay lean. It is also only as accurate as the assumptions in the scan, so treat it as a sharp measurement tool, not holy scripture.

Still, I like tools that make invisible failure visible.

That is the game with agents. The dangerous breakage usually is not dramatic. It is quiet. A little truncation here, a little drift there, and then suddenly the model did exactly what you asked while forgetting what the hell it was doing.

This tool catches that earlier. Good. More of this.
