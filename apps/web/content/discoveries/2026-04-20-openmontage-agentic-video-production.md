---
type: discovery
slug: 2026-04-20-openmontage-agentic-video-production
discovered: "2026-04-20"
tags: [openmontage, video, agents, open-source, remotion, ffmpeg, piper, pipelines, ocplatform]
relevance: "OpenMontage is what happens when someone decides a video production studio should be a folder of instructions, not a SaaS. Your coding agent drives the pipeline. Our content stack already leans on an agent to write and publish — OpenMontage extends that same pattern to video, which is the one channel we haven't productized yet."
---

# OpenMontage: a video production studio that lives in your coding agent

Most "AI video" tools in 2026 fall into two camps. Either they're a SaaS with a chat box that outputs whatever the model hallucinated that day, or they're a Python wrapper around three APIs that breaks the first time a provider changes a response shape.

OpenMontage is a third thing. It's an instruction-driven video production system where the agent — Claude Code, Cursor, Codex, whichever one you run — reads pipeline manifests, stage director skills, and a tool registry, then actually makes the video. Python holds the tools. The agent holds the judgment.

That framing alone is more interesting than the output. But the output is also real.

## What it actually does

OpenMontage ships with 12 named pipelines. Documentary montage, cinematic, animation, animated explainer, talking head, avatar spokesperson, clip factory, hybrid, localization dub, podcast repurpose, screen demo, framework smoke. Each one is a YAML manifest describing stages, tools, and quality gates. Each stage has a director skill the agent is required to read before doing work in that stage. The skills folder has 137 markdown files. That's where the intelligence lives.

The tools themselves cover the full stack. Piper TTS for free offline narration. Archive.org, NASA, and Wikimedia Commons for open archival footage. Pexels, Unsplash, Pixabay for free stock if you grab their free keys. FFmpeg for the lower-level cutting and mixing. Remotion for the actual composition layer. faster-whisper for transcripts. yt-dlp for reference video ingestion. scenedetect for cut detection.

Add paid keys — FAL, OpenAI, ElevenLabs, Google, Suno — and you unlock Veo, Kling, FLUX, Chirp3, Suno music generation. But the project's loudest pitch is that you can make a real video with zero API keys and a GPU, or near-zero cost with just one key.

The cost line in the README isn't marketing. A 60-second animated short with 6 Kling v3 motion clips, Chirp3 narration, royalty-free music, word-level captions, and Remotion composition: $1.33. A product ad with gpt-image-1 visuals, TTS narration, auto-sourced music, WhisperX subtitles, Remotion data viz: $0.69. A Ghibli-style anime piece with 12 FLUX images, parallax crossfade, particle overlays, ambient soundtrack: $0.15.

Those are the numbers a human editor spends on one cup of coffee during a day they're still cutting their first draft.

## The pattern that actually matters

Forget the output for a second. Look at the shape.

OpenMontage follows the same pattern I keep writing about: the agent is the operator, the file system is the runtime. A pipeline manifest is not configuration, it's a contract. A stage director skill is not documentation, it's a procedure the agent executes. A tool registry isn't a dependency list, it's a capability menu the agent walks before it plans.

This is how our content pipeline works. It's how Engram works. It's how the Hermes Agent release I covered last week works. It's how gstack works. The pattern is converging fast, and every serious agentic project from the last four months is landing on some version of it. OpenMontage is the first time I've seen it applied cleanly to media production.

The part that seals it: reference video as a first-class input. You paste a YouTube Short you love, the agent runs `video-reference-analyst`, extracts transcript, pacing, scene structure, keyframes, and style, and then produces 2-3 differentiated concepts with cost estimates before it generates a single asset. That's not "give me a vibe," that's a grounded production plan.

## Why it matters for Applied Leverage

We don't have a video pipeline yet. We have a content pipeline that writes this post. We have Transcript Atomizer that turns one video into a month of written content. We have a Substack bridge, a vault, a git-to-Vercel publish path, and an agent that drives all of it.

What we don't have is the thing that produces the video in the first place. Right now that's still human hours — record the YouTube clip, edit it, cut it, caption it, post it. Every hour there is an hour not spent packaging the Founder Dependency Audit Kit or shipping the next install offer.

OpenMontage is a plausible fix. Not because it makes "good enough" video — I'm not convinced it does yet for long-form — but because the short-form paths are genuinely cheap, genuinely fast, and shaped exactly like the rest of our stack. An agent selects the pipeline, runs preflight, presents a tool plan, executes stage by stage with checkpoints, self-reviews with ffprobe and frame sampling, and hands me a finished clip for approval.

That's our content pipeline with a video output. The skill slot is open.

## The catch

Three real ones.

First, the good output lives at the paid-key end. The $0.15 Ghibli animations are beautiful. The zero-key documentary path is useful but it's not where the best demo videos in the README come from. If you want OpenMontage to sing, you're paying FAL, Google, or OpenAI for generation credits. Cheaper than a video editor. Not free.

Second, this is AGPLv3. If you're building a closed SaaS on top of it, read the license before you commit. For our use — internal production for Applied Leverage content — AGPL is fine. For a product you'd sell, it's a constraint.

Third, you need an agent that actually reads instructions. The project is explicit that the intelligence is in the skills, not in improvised code, and an agent that skips the director skills and just calls tools directly will produce worse output. This is a system that rewards Claude Code, Cursor, Codex discipline and punishes "just run this Python script" shortcuts. That's the same rule we already live by, so it's less a catch than a compatibility check.

## What I'd do with it

One pass at the clip factory pipeline against an existing Applied Leverage talk. See what the agent picks out, what captions it writes, how the auto-sourced music lands. One pass at the animated explainer pipeline for the Founder Dependency Audit Kit — 60 seconds, narration, simple visuals, word-level captions, whatever the total key cost comes to.

If either one lands within striking distance of manual work, we have a video pipeline. If neither does, we've spent an hour and learned exactly where the ceiling is. Both outcomes are useful.

That's the whole move.

---

**Links:**
- [OpenMontage on GitHub](https://github.com/calesthio/OpenMontage)
- [OpenMontage YouTube](https://www.youtube.com/@OpenMontage)
- [Remotion (composition layer)](https://www.remotion.dev/)
- [Piper TTS (free narration)](https://github.com/rhasspy/piper)
