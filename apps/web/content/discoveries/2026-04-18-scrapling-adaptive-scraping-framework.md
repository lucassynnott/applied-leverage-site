---
type: discovery
slug: 2026-04-18-scrapling-adaptive-scraping-framework
discovered: "2026-04-18"
tags: [scraping, scrapling, cloudflare-turnstile, anti-bot, agents, python, mcp]
relevance: "Scrapling is the scraping framework we should have been writing agent tooling against. Adaptive parser that survives design changes, stealth fetcher that bypasses Cloudflare Turnstile, real spider framework, MCP server. It's what happens when somebody treats scraping like infrastructure instead of a weekend script."
---

# Scrapling: the scraping framework that doesn't fall over when the site redesigns

Every agent I've shipped that touches the open web has the same failure mode. The scraper works for three weeks. A site changes a div. The selector breaks. The agent returns empty data, usually without noticing, usually at 3am, usually right before a demo.

The "AI scraping" answer is to just throw the page at an LLM and let it figure out what's on it. That works. It also costs real money, ignores Cloudflare Turnstile entirely, and still doesn't help when the site blocks you before the HTML even lands.

Scrapling is the other answer. A proper scraping framework built by people who actually scrape for a living, with the features you'd want if you were treating scraping like infrastructure instead of a weekend script.

## The core idea

Three primitives, each of them genuinely different from what's in most scraping stacks:

**An adaptive parser.** You tag a selector with `auto_save=True` the first time it works. Later, when the site's design changes and the selector breaks, you pass `adaptive=True` and Scrapling finds the elements again by structural similarity. Not LLM rewriting. Actual geometry. It treats the page like a graph, remembers what the thing looked like, and relocates it when the DOM drifts.

```python
from scrapling.fetchers import StealthyFetcher
StealthyFetcher.adaptive = True

p = StealthyFetcher.fetch("https://example.com", headless=True, network_idle=True)
products = p.css(".product", auto_save=True)  # first run, save the shape
# site redesigns six weeks later
products = p.css(".product", adaptive=True)   # find them anyway
```

**A stealth fetcher that bypasses Cloudflare Turnstile out of the box.** Not a third-party unlocker service. Not a headless Chrome you spoof yourself. An actual `StealthyFetcher` that ships with the stealth fingerprinting, the human-ish timing, the browser signals Turnstile checks for. For the nastier anti-bots — Akamai, DataDome, Kasada, Incapsula — there's a commercial API path, but Turnstile is handled in the open-source library.

**A real spider framework.** Scaling one-off fetches is easy. Scaling a thousand concurrent sessions with pause/resume, proxy rotation, blocking recovery, and real-time streaming stats is not. Scrapling ships a `Spider` base class that handles all of it in Python that looks roughly like Scrapy but without Scrapy's decade of weird abstractions.

```python
from scrapling.spiders import Spider, Response

class ProductSpider(Spider):
    name = "demo"
    start_urls = ["https://example.com/"]

    async def parse(self, response: Response):
        for item in response.css(".product"):
            yield {"title": item.css("h2::text").get()}

ProductSpider().start()
```

Pause it. Resume it. Rotate proxies. Stream progress. Move on with your life.

## The CLI and the MCP

The thing that makes it agent-ready is the CLI and the MCP server. You don't have to write Python to use it.

```
scrapling extract get https://example.com output.html
scrapling extract fetch https://example.com --headless
scrapling extract stealthy-fetch https://cloudflare-protected.site output.html
```

That's the whole interface for an agent that just needs a page. No library imports. No `playwright install`. One binary, three verbs, a file on disk.

The MCP server is the real unlock. Point a coding agent at it, and scraping becomes a tool call instead of a subprocess. Stealth fetch, adaptive parse, concurrent crawl — all exposed as MCP tools. Our own stack already runs MCP heavy through [mcporter](/discoveries/mcporter), which means a Scrapling MCP server is a one-line addition to any agent that needs to see the web through a non-chatbot browser.

## Why it matters for Applied Leverage

We already cover two ends of the scraping spectrum. [Firecrawl](/discoveries/firecrawl-web-scraping-ai-agents) is LLM-first — point it at a URL, get clean markdown, feed it to a model. [Lightpanda](/discoveries/lightpanda-headless-browser-ai-agents) is the opposite end — 25MB headless browser optimized for AI agents hitting JS-heavy pages fast.

Scrapling sits in the middle, and it's the shape we've been missing. When an agent needs to:

- Pull structured data off a site that actively fights bots
- Survive a site redesign without a human babysitter
- Run a hundred concurrent sessions with proxy rotation
- Keep a long crawl alive across restarts

…you don't want markdown. You don't want a tiny browser. You want a real framework with adaptive selectors, a stealth fetcher, and a spider engine.

Scrapling is already installed in the workspace skills directory (`~/.openclaw/skills/scrapling-official`), written by the library author himself. That's a signal. Library authors don't usually write agent skills for their own libraries unless they think agents are a real distribution channel — which they are, and which [ClawHub](/discoveries/2026-04-16-clawhub-agent-skill-registry) is starting to formalize.

## The catch

A few honest ones.

**It's Python.** If your agent stack is Node-first or Rust-first, you're going to be shelling out to a Python subprocess or hitting the MCP server over a socket. Not fatal, but it's friction.

**Adaptive isn't free.** The `auto_save=True` / `adaptive=True` pattern stores structural fingerprints per selector. First run has overhead. Storage grows with unique selectors. You can absolutely break it by changing a site so aggressively that no structural similarity survives — at which point you're back to writing new selectors.

**The stealth game is an arms race.** Turnstile today is not Turnstile in six months. Scrapling ships updates fast, but any scraper that brags about "bypasses Cloudflare" today is making a temporary statement. For the worst anti-bots — Akamai Bot Manager, DataDome — you're either paying Hyper Solutions or you're writing the bypass yourself. Scrapling doesn't pretend otherwise.

**Spiders are not agents.** You still have to think about what you're crawling, where you're storing it, and what an agent is going to do with the data. Scrapling gets you to `yield {"title": ...}` cleanly. What happens after that `yield` is still on you.

## Where it fits

If you're scraping a handful of pages and an LLM can eyeball the HTML, stay on Firecrawl. If you're hitting a JS-heavy page fast and you need it rendered cheaply, stay on Lightpanda.

If you're building a scraper that has to keep working when the site changes, survive Cloudflare Turnstile, run at spider-scale, and expose itself as an MCP tool an agent can call — this is the one.

Install the skill, run one `stealthy-fetch` against a site that was blocking you, watch it come back with the HTML. That's usually enough to see why the shape is right.

- Repo: [D4Vinci/Scrapling](https://github.com/D4Vinci/Scrapling)
- Docs: [scrapling.readthedocs.io](https://scrapling.readthedocs.io)
- Install: `pip install "scrapling[all]>=0.4.1" && scrapling install --force`
- In our stack: `~/.openclaw/skills/scrapling-official/`
