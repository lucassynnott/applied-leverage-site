---
status: accepted
date: 2026-03-17
decision-makers: Lucas Synnott, Johnny Silverhand
---

# Remove /assess Page and Diagnostic Video Embed

## Context and Problem Statement
The Applied Leverage site had an `/assess` route (Automation Readiness Assessment — a free quiz/scoring tool) and a founder video walkthrough embedded on the `/diagnostic` page. Both were built speculatively during the initial offer ladder construction but never drove meaningful traffic or conversions. The site was accumulating dead weight.

## Decision Drivers
- `/assess` was already returning 404 — the Next.js route had been removed but media assets, OG images, and internal links still existed across the diagnostic page and marketing components
- The diagnostic video embed referenced a 22-second founder clip that was never recorded — placeholder markup shipping to production
- Every dead link and phantom asset erodes trust with visitors who actually click through
- Simpler offer ladder (workbook → diagnostic → sprint) is cleaner than a four-rung ladder with an untested free tier

## Considered Options
1. **Fix /assess and record the video** — invest time building out both assets properly
2. **Remove both and simplify** — cut the dead weight, route everything through workbook as the low-friction entry
3. **Keep /assess, kill the video** — half-measure

## Decision Outcome
Chosen option: "Remove both and simplify", because:
- The free assessment added a step without adding value. People who want low-friction entry get the workbook ($47, self-guided). People who want expert help get the diagnostic or sprint.
- Shipping placeholder video markup is worse than no video at all.
- Three-tier ladder (workbook → diagnostic → sprint) is easier to explain, easier to route, and matches actual buyer behavior so far.

### Consequences
- Good: No more 404s or dead links on the diagnostic page
- Good: Cleaner offer routing — every CTA on the diagnostic page now points to something that exists
- Good: Removed ~3 media files (video placeholder, poster, OG image) reducing deploy size
- Bad: Lost the "free entry point" positioning — workbook at $47 is now the lowest friction offer
- Neutral: If a free assessment proves necessary later, it can be rebuilt as a standalone tool with actual data behind it

### What Changed
- Deleted `public/media/assess-founder-clip-16x9.mp4`, `assess-founder-clip-poster.jpg`, `public/og/automation-readiness-assessment.png`
- Removed video embed section (HTML + CSS) from `public/diagnostic/index.html`
- Removed all `/assess` links and routing cards from diagnostic page
- Cleaned "free assessment" reference from `components/marketing-page.tsx`
- Merged duplicate workbook routing cards created by the cleanup
