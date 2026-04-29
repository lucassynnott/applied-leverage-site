---
type: discovery
slug: humanizer-skill-anti-ai-writing
discovered: "2026-04-29"
tags: [humanizer, content, ai-writing, skill, applied-leverage]
relevance: "First quality gate in our content pipeline. Strips the AI tells before anyone reads the draft."
---

# Humanizer: the skill that strips AI fingerprints off agent-written content

Every agent that writes for you has the same problem. The output is technically fine and instantly recognizable as a machine. Em dashes everywhere. "Stands as a testament." Three-item lists where two would do. Bolded inline headers that nobody asked for. Curly quotes you didn't type.

Humanizer is the skill that goes through and rips all of it out before anyone sees the draft.

## The core idea

It's a 24-point checklist built off Wikipedia's "Signs of AI writing" page, the one maintained by WikiProject AI Cleanup. Those editors have seen thousands of instances of LLM slop pasted into articles, and they've cataloged the tells. Humanizer turns that catalog into a skill an agent can actually run on a draft.

The checklist covers the obvious stuff and the subtle stuff. Significance inflation ("pivotal moment", "evolving landscape"). Promotional language ("nestled", "vibrant", "boasts"). Superficial -ing phrases tacked onto sentence ends to fake depth. Vague attributions ("industry observers note"). Negative parallelisms ("not just X, it's Y"). Rule of three forced into every paragraph. Copula avoidance, where "is" gets replaced with "serves as" for no reason.

Then the style stuff. Em dash overuse. Inline boldface headers. Title case in headings. Emojis decorating bullet points. Curly quotes from ChatGPT's auto-format. Sycophantic openers like "Great question!"

After it scrubs the patterns, it does a second pass. The prompt is literally: "What makes the below so obviously AI generated?" The agent answers honestly, then rewrites the remaining tells. Two passes, because one isn't enough.

## Why it matters for Applied Leverage

Our content pipeline is fully autonomous. MiniMax M2.5 writes the drafts, no human pre-review. If the only filter is my eyeballs at publish time, the slop slips through. I've shipped pieces with three em dashes in the same paragraph because I was tired and the draft "read fine." It read fine the way every AI draft reads fine: smooth and instantly forgettable.

Humanizer is Gate 1. Expert Panel is Gate 2. Together they kill the obvious AI fingerprints and the boring takes before either makes it to the site. That's the only reason os.appliedleverage.io doesn't read like every other agent-run blog out there.

The other thing it does, which I didn't expect: it teaches the agent. Run humanizer on enough drafts and the next draft starts cleaner. The agent stops reaching for "underscores" and "intricate tapestry" because it's been corrected enough times. The gate becomes a training signal, not just a filter.

## The catch

Humanizer can over-correct. It will sometimes flatten genuinely good rhythm because the rhythm pattern-matched to "rule of three." It will rewrite a clean punchy em dash as a comma when the dash actually worked. The skill prompts you to preserve voice, but agents don't always have the taste to know when a pattern is a pattern and when it's just good writing.

The other limit: it can't add a take. If the underlying draft has nothing to say, humanizer will give you a clean, voiceless, well-edited piece of nothing. That's what Expert Panel is for. Humanizer kills the AI tells. Expert Panel kills the bad ideas. You need both.

The skill ships in our workspace at `skills/humanizer/`. Drop it into any agent that writes content and the floor goes up immediately. Don't ship without it.
