---
type: discovery
slug: script-pty-wrapper-for-agent-cli
discovered: "2026-05-07"
tags: [agents, cli, infrastructure, devops, patterns]
relevance: "Half the CLI tools your agents try to run hang forever in non-interactive shells. One line of script(1) fixes it."
---

# script(1): The Unix Tool That Unblocks Half Your Agent's CLI Stack

Your agent tries to run `vercel --prod`. It hangs. Forever.

Not because the deploy failed. Because the CLI is checking `isatty()`, sees it's not connected to a real terminal, and decides to do nothing about it. No prompt. No error. Just silence.

This is one of the most common ways agents look broken when they're not. And the fix is a 40-year-old Unix utility that ships on every Linux box.

## The Core Idea

`script(1)` was originally built to record terminal sessions for typesetters in the 1980s. It does one thing that's now extremely useful: it allocates a pseudo-terminal (PTY) and runs your command inside it.

```bash
script -qfec "vercel --prod --yes 2>&1" /tmp/deploy.log
```

That's it. The CLI thinks it's talking to a human. Your agent gets the output. Nobody hangs.

The flags that matter:
- `-q` quiet, no startup banner
- `-f` flush after each write so you can tail the log live
- `-e` return the wrapped command's exit code, not script's
- `-c` the command to run

## Why It Matters for Applied Leverage

Agents don't have terminals. They have stdin, stdout, stderr, and patience that runs out.

The CLI tools they want to drive were almost all built for humans staring at a prompt. Vercel, Heroku, gcloud, some npm scripts, half the interactive installers, Docker login, a pile of auth flows. They detect non-TTY and either hang waiting for input that will never come, suppress progress output you actually need, or just refuse to run at all.

Three patterns worth stealing:

**Pattern 1: Wrap a hanging deploy.** Our `scripts/vercel-deploy.sh` is the clean version. PTY wrap, capture log, regex out the deployment URL, return it on stdout. Exit 1 on any real failure. The agent calls one script, gets back a URL or a clear error. No timeout dance, no half-deployed sites.

**Pattern 2: Capture interactive output.** When you need the spinner-and-progress output (large uploads, long builds), `-f` lets you tail the log file in another process while the wrapped command runs. Agents can stream status without breaking the PTY illusion.

**Pattern 3: Fail loud.** Most "non-interactive" wrappers fail silently when the CLI changes its output format. Use `strings` on the log (binary control chars from the PTY pollute it) and grep for both your success token and known error patterns. If neither shows up, that's its own failure.

The whole pattern is twenty lines of bash. It replaces every "I'll just give the agent more time" hack you've ever written.

## The Catch

The output gets messy. PTY recording captures color codes, cursor moves, progress-bar rewrites, every `\r\n` the CLI emits. Naive parsing falls over. You will pipe through `strings` or `sed 's/\x1b\[[0-9;]*m//g'` more than you want to.

Exit codes are also stranger than they look. Without `-e`, `script` returns its own exit code, which is almost always 0 even when your command died. Forget `-e` once and you'll ship a deploy script that says "success" while your site is on fire.

And `script(1)` itself is GNU-vs-BSD inconsistent. The flags above are GNU. macOS ships the BSD version with different syntax (`script -q /tmp/log command...`). If your agent runs on both, you write two paths or you standardize on Linux.

But none of that is worse than an agent that hangs forever and lies about why.
