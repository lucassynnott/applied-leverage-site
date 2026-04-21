---
type: discovery
slug: 2026-04-21-expert-panel-gate-kill-bad-content
discovered: "2026-04-21"
tags: [content, quality-gate, ai-writing, publishing, skills]
relevance: "Every piece of content we ship now passes a simulated 5-expert panel before it goes live. Most drafts die there. That's the point."
---

# Expert Panel Gate: the skill that kills six out of seven drafts before anyone reads them

Eric Siu's content team has a rule. They kill roughly six of every seven clips before publishing.

Not because the clips are bad. Because the clips aren't good enough.

That ratio — 6:7 dead on the cutting room floor — is the difference between a team that publishes volume and a team that publishes signal. We built a skill that does the same thing to our drafts.

## The Core Idea

`expert-panel-gate` is a skill that runs every draft past five simulated critics before it's allowed to ship. Not one LLM doing a vibe check. Five separate roles, five separate scoring passes, one average.

The roles:

1. **Marketing Strategist** — does this actually move the needle? Hook in the first two lines, clear takeaway, differentiated positioning.
2. **Copy Chief** — is the writing any good? AI patterns, rhythm, voice consistency.
3. **SEO/Data Analyst** — is this grounded in reality? Specific numbers, real examples, sources that hold up.
4. **Target Audience** — would the intended reader care, or is this inside baseball nobody asked for?
5. **Brand Voice Guardian** — does this sound like us, or could any LinkedIn ghostwriter have produced it?

Each expert scores the draft 0–100. Average has to be ≥75 to pass. Below that and the piece gets blocked, revised, or killed.

Two revision cycles max. If a draft can't clear 75 after two passes, it's dead. Move on. The cost of rewriting forever is higher than the cost of never having written it.

## Why It Matters for Applied Leverage

We run a content pipeline. A new discovery post every day. A weekly essay. ADRs, memos, carousels, X threads, newsletter drops. At that cadence, the real risk isn't "we won't write enough." The real risk is we'll publish stuff that makes people trust us less.

One slop post doesn't fail quietly. It actively hurts the brand. A prospect reads it, shrugs, closes the tab, and the next time your name crosses their feed they scroll past. You didn't "reach more people." You made yourself skippable.

The panel catches the things a single pass misses:

- A hook that sounds fine but doesn't actually hook anyone.
- A claim that reads smooth but has no number behind it.
- A voice that drifts halfway through because the writer got tired.
- A topic that's technically correct but nobody in the audience actually cares.

Five lenses catch what one lens forgets.

Paired with the `humanizer` skill — which runs first and strips the AI patterns out — you get a two-stage gate: humanizer for the language layer, panel for the substance layer. Draft → humanize → panel → publish. If the panel fails, you loop. If the loop fails, you kill.

Last week I killed a post at the expert-panel stage. The humanizer cleaned the prose up fine. The panel flagged it as derivative — the angle was already well-covered elsewhere, and the "insight" was just a restating of a thing three other writers had already shipped better. Dead. No harm done. That's the skill doing its job.

## The Catch

The panel is a simulation. It's a prompt asking an LLM to role-play five critics. That means it inherits the model's weaknesses. If the model has a blind spot for a genre, the panel will too. It's not a replacement for human editorial judgment on pieces that matter — launches, sales pages, anything load-bearing.

The scoring also drifts. Run the same draft through the panel twice and you'll see ±5 points of variance, sometimes more. That's fine for a 75 threshold — nothing borderline deserves to sneak through anyway — but don't treat the number as precise. It's a filter, not a measurement.

And six-out-of-seven isn't a target to hit for its own sake. It's what happens when you stop publishing reflexively. If your panel is killing less than half your drafts, either your drafts are already excellent or your panel is too soft. Usually the second one.

The point isn't the ratio. The point is that somewhere between "wrote it" and "shipped it" there has to be a step where most of what you wrote dies. Because most of what anyone writes should die. The skill just makes that step routine instead of optional.
