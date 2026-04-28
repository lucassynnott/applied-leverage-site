---
type: discovery
slug: gamma-api-presentation-generation
discovered: "2026-04-28"
tags: [gamma, presentations, composio, agents, api]
relevance: "Agents can generate full investor decks and pitch slides through one API call, but only if you know which mode to use."
---

# Gamma API: AI Slide Decks Your Agents Can Actually Ship

Your agent just wrote a 40-slide pitch deck in Markdown. Now what? Copy paste into Google Slides for two hours, or hand it to a designer who'll get back to you Tuesday?

Gamma has an API. It's wired into Composio. And if you stop fighting it, your agents can ship presentation-ready decks straight to a URL.

## The Core Idea

Gamma is the deck tool that ate Pitch and most of Beautiful.ai's mindshare. It takes text, runs it through a layout engine that actually understands hierarchy, and produces decks that don't look like 2009 PowerPoint.

The API exposes one verb: generate a deck from text. Two knobs matter:

- `textMode: "preserve"` — Gamma formats your content. No AI rewriting. Your words land on the slide.
- `textMode: "generate"` — Gamma writes the content from your outline. AI does the heavy lifting.
- `cardSplit: "inputTextBreaks"` — split slides on `---` markers in your input.

Pair `preserve` with `inputTextBreaks` and you get a deterministic pipeline: write the slides yourself, hit the API, get back a Gamma URL. No surprises. No hallucinations. No two minute spinner that times out.

## Why It Matters for Applied Leverage

Decks are a content surface I've been ignoring. Substack, X, YouTube, the site — fine. But proposals, pitches, and internal explainers all want slides, and the cost of producing a real one has been the reason half my drafts never become sharable artifacts.

With Gamma in the loop, the pipeline looks like:

1. Agent drafts the deck content in Markdown with `---` between slides.
2. Humanizer runs across the text.
3. One Composio call ships it to Gamma.
4. URL gets posted to Slack or attached to a proposal.

Same flow we use for blogs, just a different output format. Now every Moltron memo, every offer pitch, every onboarding doc can have a deck variant for the people who think in slides.

## The Catch

`textMode: "generate"` times out past nine slides. Every time.

Composio has a roughly 120 second connection ceiling. Gamma's generation mode runs async and exceeds that for anything longer than a tight intro deck. You'll watch your agent burn a tool call, get a timeout, and have nothing to show.

The fix is the same fix for half the AI tooling problems I've hit: do the writing yourself. Use `textMode: "preserve"`, paste in real content split by `---`, and let Gamma handle the layout. That call returns fast regardless of length, up to the 60 card max.

There's a second tax. Gamma's free tier has card limits and watermarks. If you want clean output, somebody pays. For the volume I'd actually use this at, it's cheap. For an agency burning through 30 decks a week, run the math.

Last note: the API doesn't expose theme controls as cleanly as the web UI. You pick a theme by name, and if it doesn't exist on your account, you get default. Set up your themes in the dashboard first, then reference them by exact name from the API.

Use it for what it's good at. Stop trying to make it write the deck for you. It writes layouts. You write content. That division of labor is the whole game.
