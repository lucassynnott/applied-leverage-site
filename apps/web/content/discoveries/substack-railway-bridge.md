---
type: discovery
slug: substack-railway-bridge
discovered: "2026-04-27"
tags: [substack, publishing, agents, automation, railway]
relevance: "Substack has no public draft API. This bridge gives agents a way to push drafts into Substack the way they push to a git repo."
---

# Substack Railway Bridge: the API Substack refuses to ship

If you've ever tried to wire an agent into Substack, you already know the punchline. Substack has no public API for drafts. Their official surface is a web app and an editor that wants you, in person, clicking buttons. That's fine for human writers. It's a brick wall for any pipeline that ends in "publish."

A small Railway-hosted bridge fixes that. One POST and your draft shows up in Substack as if you'd typed it yourself.

## The Core Idea

The bridge is a tiny service running on Railway that exposes a single endpoint:

```
POST https://substack-railway-bridge-production.up.railway.app/substack/create-draft
{ "title": "...", "subtitle": "...", "body": "<html>" }
```

It logs into Substack with your stored session and creates a draft post. That's it. No queue, no scheduler, no opinions. The agent does the writing. The bridge does the boring last mile that Substack won't expose.

The catch in the contract: `body` must be HTML. Substack's editor doesn't speak markdown on input. So the agent converts markdown to HTML before posting. A six-line regex pass covers headers, bold, italic, paragraphs, and horizontal rules. That's enough for 95% of essays.

The other catch: do not interpolate HTML through shell. Quoting will betray you the moment a quote shows up in the body. Write the payload to a temp file with `json.dump`, then `curl -d @file.json`. Boring, deterministic, works every time.

## Why It Matters for Applied Leverage

The content pipeline already writes essays into the vault and pushes a Vercel-backed site. Substack was the missing leg. People still subscribe by email, and email lives where readers live, not where my git history lives.

With the bridge in place, every essay can fan out: vault copy, repo copy, Substack draft. The draft is the gate. A human still presses "Publish" inside Substack, but the typing, formatting, and uploading is gone. The agent doesn't bother me to copy-paste a thousand-word essay into a browser anymore.

That's the whole game with agent infrastructure. You don't need the agent to do everything. You need the agent to remove every step that wasn't strategic in the first place.

## The Catch

Three real ones.

First, this is a session bridge, not an OAuth integration. Substack's auth state lives on the Railway box. If Substack rotates session tokens or invalidates the cookie, the bridge stops working until someone re-authenticates. There is no graceful key rotation story. Plan for outages.

Second, no markdown rendering. You bring HTML or you bring nothing. That's a one-time problem (write the converter once, reuse forever) but it's a problem.

Third, drafts only. Publishing, scheduling, paywall settings, none of that is exposed. By design. You don't want an agent yeeting unreviewed essays to a paid newsletter list. The draft handoff is the safety rail, not a limitation to fix.

If you run a content pipeline that ends in Substack and you've been hand-pasting your way through it, build the bridge or use this one. The day you stop opening the Substack composer is the day your pipeline stopped pretending to be automated and actually became automated.
