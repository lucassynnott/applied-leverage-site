---
type: discovery
slug: 2026-04-12-ralph-loops-restartable-coding-agents
discovered: "2026-04-12"
tags: [ralph, coding-agents, codex, tmux, workflow]
relevance: "Ralph loops solve one of the ugliest problems in agentic coding: the model loses the plot, the process dies, and nobody knows what actually happened."
---

# Ralph loops: restartable coding agents for work that takes longer than your attention span

Most coding agents look impressive right up until the job gets annoying.

They can patch a file. Maybe write a test. Then the task gets longer than one clean prompt, the model drifts, the process dies, and you are left reading a fake-success summary from a machine that did not actually finish the work.

That is why Ralph loops are interesting.

The trick is simple: stop treating the agent run like a one-shot magic act. Give it a checklist, run it in a loop, and make it come back with fresh context instead of forcing one bloated session to carry the whole job.

## The core idea

In this stack, Ralph shows up through `ralphy --codex --prd PRD.md`.

The PRD file is not fancy. It is a markdown checklist. Something like:

```markdown
## Tasks
- [ ] Create the API endpoint
- [ ] Add input validation
- [ ] Write tests
```

Ralph works through that list, restarts the coding agent between iterations, and lets the next pass pick up from files and git history instead of a dying context window.

That restart matters more than people think.

A lot of coding-agent failures are not logic failures. They are session failures. The model gets lost. The prompt gets too fat. The agent reads half the repo and starts confidently improvising. A looped run with a checklist is a much better fit for real work than pretending one perfect prompt will carry a multi-step feature from start to finish.

The other smart move is operational, not magical. Ralph runs cleanly inside a tmux session, so the job survives longer than a flaky terminal tab, and you can bolt on completion hooks to fire a system event when the run exits.

## Why it matters for Applied Leverage

This is the difference between demo-agent energy and operator energy.

If you want coding agents inside a real delivery system, you need three things: restartability, visibility, and a way to verify progress against something more concrete than the model saying "done."

Ralph gives you a decent answer on all three.

- Restartability: each pass gets fresh context instead of dragging around old confusion.
- Visibility: the run lives in tmux, so you can inspect the pane, keep the output, and see where it died.
- Verification: the checklist and git state give you something external to inspect.

That last point is the big one. A normal agent session can claim victory while the repo is still a crime scene. Ralph is better because it pushes the work through a visible loop, then forces you to check git history, diffs, and the actual output instead of trusting the model's little victory speech.

It is also a better pattern for delegation. Hand someone a PRD and a Ralph loop, and the job shape is obvious. That is much closer to a usable operating system than "hey, ask the coding model nicely and hope for the best."

## The catch

Ralph does not make a bad agent good. It just gives the bad agent fewer places to hide.

If the checklist is vague, the work will still drift. If the underlying model is weak, it will fail in loops instead of failing once. And if you treat checked boxes as proof, you can still fool yourself.

That part matters because Ralph can mark tasks complete even when the agent got weird. The fix is not complicated, but it is non-negotiable: check the git log, check the diff, and read the session output before you celebrate.

That is the real lesson here.

People keep trying to find the smartest coding agent. Fine. Useful question. But the nastier, more important question is whether your agent can recover when the run gets messy.

Ralph loops are one of the better answers I have seen so far.