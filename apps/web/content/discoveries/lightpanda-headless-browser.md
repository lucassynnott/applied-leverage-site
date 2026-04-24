---
type: discovery
slug: lightpanda-headless-browser
discovered: "2026-04-24"
tags: [browser, automation, agents, scraping, tools]
relevance: "Lightpanda is the default browser tool in our stack because Chrome is a liability when every agent run spins one up."
---

# Lightpanda: the headless browser built for agents instead of humans

Chrome wasn't built for your agents. It was built for your mom.

Every time an agent fires up a headless Chrome, it's dragging decades of code written for a person who wants pretty fonts, smooth scroll, and a passwords panel. Your agent wants none of that. It wants the DOM, the JS result, and out. Chrome makes it pay rent for a whole apartment when it only needed to use the bathroom.

Lightpanda is the rewrite.

## The core idea

Lightpanda is a headless browser written from scratch in Zig. No Chromium fork. No Webkit base. No rendering pipeline. No graphics stack. Just a JavaScript runtime attached to a DOM that talks the Chrome DevTools Protocol well enough that Puppeteer and Playwright treat it like Chrome.

Their published benchmark on AWS m5.large — 933 real web pages over the network:

- **Execution time: 5 seconds vs Chrome's 46 seconds** — 9x faster
- **Memory peak: 123MB vs 2GB** — 16x lighter

You can swap it into an existing Puppeteer script by changing one line — `puppeteer.launch` becomes `puppeteer.connect` pointed at a Lightpanda CDP endpoint. Same scripts. Same API. Different engine underneath.

## Why it matters for Applied Leverage

Our stack runs browser work constantly. Research pipelines, scraping, SEO checks, content atomizers, discovery loops. Every one of those used to mean "spawn a Chromium, wait, hope, kill it." That scales badly when you have a fleet of agents all trying to do it at once.

Lightpanda is now the default browser tool in our workspace. The CLI wrapper `lpanda` sits at `~/.local/bin/`, the binary is `~/lightpanda`, and it's registered as an MCP server so agents can call it as a tool without thinking about it. One command for JS-rendered markdown. One for the accessibility tree. One for interactive elements and their roles. One for structured data — JSON-LD, OpenGraph, Twitter cards, meta tags.

The accessibility tree is the quiet killer feature. Feeding an agent a semantic tree of a page — headings, landmarks, buttons, forms — uses a fraction of the tokens of raw HTML and gives the agent *more* useful structure. It's the kind of thing you only appreciate after you've burned 80k tokens on a rendered page that could have been 4k.

It also runs a CDP server on port 9222, which means any existing Puppeteer or Playwright automation you've already written drops in without a rewrite.

## The catch

Lightpanda isn't Chrome, and that's the whole point, but it's also the whole trade-off.

Some JS-heavy sites will timeout or render incompletely. Their JavaScript engine covers the mainstream cases — React, Vue, Svelte, basic SPAs — but edge cases exist. We've seen `interactiveElements` and `structuredData` extraction occasionally choke on heavy sites and need a manual `--http_timeout 30000` bump.

If your workload demands full Chromium fidelity — video playback, WebRTC, exotic CSS, canvas-heavy pages, sites with aggressive bot detection tied to Chrome fingerprinting — keep Chrome around. Lightpanda's own cloud product lets you fall back to Chrome per-request for exactly that reason.

The mental model: Lightpanda for the 95% of agent browser work where you just need the DOM and the JavaScript result. Chrome for the 5% where a site actively fights you.

Swap first, measure the gap, and only reach for Chrome when something actually breaks. Most of the time, nothing will, and your RAM bill will quietly collapse.
