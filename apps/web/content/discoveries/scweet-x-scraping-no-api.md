---
type: discovery
slug: scweet-x-scraping-no-api
discovered: "2026-04-26"
tags: [x, twitter, scraping, cli, research, agents, intelligence]
relevance: "Scweet scrapes X without the API gate, so agents can pull followers, timelines, and search results without paying X's enterprise tier."
---

# Scweet: X Scraping for Agents That Don't Want to Pay X

X's API is a tax. The free tier is a joke, the basic tier won't get you serious follower lists, and the enterprise tier costs more than most indie projects make in a year. Meanwhile, the data is sitting right there in the browser, fully renderable, fully scrapeable. Scweet does the obvious thing.

## The Core Idea

Scweet is a Python scraper that drives a logged-in X session via your `auth_token` cookie. No API keys. No OAuth dance. No quota meter ticking down while you decide what query to run.

What you get out of the box:

- `scweet-search "query"` — full-text search across X with filters for date range, language, min likes, min retweets, from-user
- `scweet-timeline USER` — pull a user's full tweet history up to whatever limit you set
- `scweet-followers USER` and `scweet-following USER` — graph data without the API
- `scweet-profile USER1 USER2` — bulk profile metadata as JSON

Output is CSV or JSON. State persists in a SQLite database so reruns are incremental, not destructive.

## Why It Matters for Applied Leverage

We run on X intelligence. xint handles real-time signal and analysis through the API path. Scweet handles the bulk historical work the API won't let you touch cheaply: pulling 1,000 followers of a competitor, scraping a creator's full timeline for content patterns, building lists of warm leads who already follow people in our orbit.

Two practical jobs Scweet unlocks for our stack:

1. **Audience graph mining.** Pick a creator who shares our ICP. Pull their followers. Filter by bio keywords. That is a warm prospect list, generated overnight, by an agent.
2. **Voice training data.** Scrape a creator's full timeline. Hand it to a persona skill. Now you have a writer that sounds like them on day one instead of week six.

The agent integration is the real prize. Drop the CLI behind a skill, and any agent in the fleet can run audience research without us writing custom API glue.

## The Catch

This is scraping. That comes with rules.

- You need a dedicated X account for the `auth_token`. Never your personal one. X has banned accounts for less.
- Rate limits exist even without the API. Move too fast and the session gets soft-throttled.
- X redesigns its DOM constantly. A scraper that worked last month can break tomorrow. Scweet's maintainers patch quickly, but you should expect occasional friction.
- Terms of service are a gray area. We treat this as research tooling, not a public product feature. Don't ship a SaaS on top of it.

The tradeoff is fine for our use case. We need data, we have judgment about how to use it, and we're not building a public X clone. For agent research workflows, Scweet is the cheapest unlock available right now.

If you're paying X for follower exports, stop.
