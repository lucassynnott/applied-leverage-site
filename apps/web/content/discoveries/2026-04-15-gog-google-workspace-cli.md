---
type: discovery
slug: 2026-04-15-gog-google-workspace-cli
discovered: "2026-04-15"
tags: [google-workspace, cli, automation, email, operators]
relevance: "gog makes Gmail, Calendar, Drive, Docs, and Sheets scriptable, which is exactly what you need if you want agents doing real work instead of browser tab theater."
---

# gog: the Google Workspace CLI that lets agents do real office work

Most AI workflow demos die the moment they touch Google Workspace.

The inbox is in one tab. The calendar is in another. The numbers are buried in some sheet with a name like Final Final Pipeline V3. Then somebody says "the agent can handle it" and five minutes later you are back to clicking around like it is 2017.

gog fixes a lot of that.

It is a CLI for Gmail, Calendar, Drive, Contacts, Docs, and Sheets. Which sounds dull. Perfect. Dull is what you want when the job is real.

## The core idea

gog gives Google Workspace a shell interface.

So instead of faking browser actions, you can do the work directly:

- search Gmail with real filters
- send or draft emails from a text file
- list calendar events and create new ones
- search Drive for the file nobody named properly
- read from Sheets and append rows as JSON
- export Docs into plain text for the next tool in the chain

That last one is the hinge. A lot of agent automation falls apart because the model can reason but cannot touch the systems where the business actually lives.

Here is the shape of it:

```bash
gog gmail search 'newer_than:7d' --max 10
gog calendar events primary --from 2026-04-15T00:00:00Z --to 2026-04-16T00:00:00Z
gog drive search "Alejandro" --max 10
gog sheets append <sheetId> "Pipeline!A:C" --values-json '[["lead","warm","2026-04-15"]]'
```

No browser choreography. No brittle button clicking. Just commands.

## Why it matters for Applied Leverage

We are not trying to build agents that look clever in a demo. We are trying to build agents that can do operator work.

That means they need access to the places work piles up. Inbox. Calendar. Drive. Docs. Sheets. For a huge chunk of small businesses and agencies, Google Workspace is the operating system whether they admit it or not.

If your agent stack cannot work there, it is mostly cosplay.

gog matters because it gives that access in a form agents and operators can actually use. Query Drive instead of hunting through folders. Pull a sheet range instead of guessing what is in it. Draft the email from the terminal instead of forwarding threads by hand.

That is the jump from "AI helps me think" to "AI helps me move work."

I also like that gog does not try to be magical. Email stays email. Sheets stay sheets. The tool just makes them scriptable.

## The catch

You still need OAuth setup, so this is not a one-click toy.

It is also a CLI. That alone filters out a lot of people. Fine. The audience here is operators and builders, not tourists.

The real catch is governance. Access is not judgment. Giving an agent permission to send mail or write to a sheet does not mean it should do that unattended. gog solves interface friction. It does not solve decision quality.

Still, I would take a clean scriptable interface over another fake agent layer that clicks around a web app and breaks the second Google moves one button.

If your business runs on Google Workspace, gog is one of those boring tools that quietly makes the rest of the stack possible.
