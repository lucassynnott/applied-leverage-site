---
status: accepted
date: 2026-03-17
decision-makers: Lucas Synnott, Johnny Silverhand
---

# Local GPU Inference with Ollama

## Context and Problem Statement
Hermes agent was routing through OpenRouter (external API), incurring costs and latency. Needed local inference capability to reduce dependency on external providers and enable faster agent loops.

## Decision Drivers
- RTX 3090 (24GB VRAM) sitting idle on the machine
- 1.7TB NAS storage available at `/nas/storage/ollama`
- OpenRouter costs accumulating per agent request
- Need for faster tool-call response times

## Considered Options
1. **Run Ollama directly on GPU** — single machine, no cloud costs
2. **Use cloud GPU rental (RunPod, Paperspace)** — scalable but adds cost/latency
3. **Stay on OpenRouter** — simplest but highest ongoing cost

## Decision Outcome
Chosen option: "Ollama on local RTX 3090", because:
- Zero per-request cost after hardware investment
- Sub-second response times for warm models (Qwen3-30B-A3B: 0.77s vs 13.5s for Nemotron)
- Full control over model versions and configuration
- NAS storage ensures models persist across reboots

### Consequences
- Good: ~28x faster inference for simple prompts, 2x for complex agent payloads
- Good: No API latency or rate limits
- Bad: Single point of failure if GPU dies (mitigation: can fall back to OpenRouter)
- Bad: Requires maintenance of Ollama service and model updates

### Technical Details
- Ollama v0.18.0 installed as systemd service
- Models stored on NAS: `/nas/storage/ollama`
- Active model: `qwen3:30b-a3b` (30B MoE, 3B active params, ~18GB VRAM)
- Endpoint: `http://127.0.0.1:11434/v1` (OpenAI-compatible for tool calling)
- Tool set trimmed to `file, memory, terminal, web` (~9 tools) to prevent model choking
