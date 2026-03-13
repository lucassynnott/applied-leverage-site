import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "OpenClaw Memory Stack — Give Your AI Agent a Permanent Memory",
  description:
    "Your AI agent forgets everything between sessions. The OpenClaw Memory Stack installer kit gives it five specialized memory layers. Five minutes to set up. Months of context retained. $19.99.",
};

const GUMROAD_URL = "https://gumroad.com/l/openclaw-memory-stack";

const LAYERS = [
  {
    number: "01",
    id: "gigabrain",
    name: "Gigabrain",
    tagline: "Automatic recall — zero effort",
    description:
      "Runs before every prompt. Injects relevant memories automatically. Captures what matters from conversations. Your agent stops starting from zero.",
    specs: [
      "Semantic + recency-weighted retrieval",
      "Quality gates and deduplication",
      "Nightly maintenance and pruning",
      "Obsidian vault mirror for inspection",
    ],
  },
  {
    number: "02",
    id: "lcm",
    name: "LCM",
    tagline: "Current session, never lost",
    description:
      "Manages the active conversation. When context fills, it compacts intelligently — preserving key facts and decisions. Drill back to any detail with lcm_grep and lcm_expand.",
    specs: [
      "Automatic compaction when context fills",
      "Full transcript preserved on disk",
      "Targeted recovery tools (lcm_grep, lcm_expand)",
      "Feeds OpenStinger for cross-session indexing",
    ],
  },
  {
    number: "03",
    id: "openstinger",
    name: "OpenStinger",
    tagline: "What changed, and when",
    description:
      "The temporal knowledge graph. Answers the questions other memory systems can't: what was believed on a specific date, how understanding has evolved, which entities are connected.",
    specs: [
      "Bi-temporal model (valid-time + transaction-time)",
      "Semantic + BM25 hybrid search",
      "Graceful degradation when server is unavailable",
      "Auto-ingest from LCM sessions every 10 seconds",
    ],
  },
  {
    number: "04",
    id: "para",
    name: "PARA",
    tagline: "Durable facts, never lost",
    description:
      "Structured file-based storage for everything that must survive. Business model, decisions, people, pricing — in plain Markdown files you can read, inspect, and correct.",
    specs: [
      "Atomic facts with full correction history",
      "PARA structure: Projects, Areas, Resources, Archives",
      "Weekly synthesis rewrites summaries from live facts",
      "Zero infrastructure — just files",
    ],
  },
  {
    number: "05",
    id: "workspace-patching",
    name: "Workspace Patching",
    tagline: "Tiny bootstrap, big recall",
    description:
      "Manages the files injected into every session. Keeps MEMORY.md as a lean routing index. Writes daily operational logs. Patches bootstrap files without overwriting your work.",
    specs: [
      "Non-destructive managed-block patching",
      "Daily notes (memory/YYYY-MM-DD.md)",
      "Bootstrap size guardrails",
      "Idempotent reinstalls",
    ],
  },
];

const BEFORE_AFTER = [
  {
    before: "Starts every session with no context",
    after: "Gigabrain auto-injects relevant memories before the first message",
  },
  {
    before: "Forgets what you discussed an hour ago",
    after: "LCM compacts but preserves — drill back with lcm_grep",
  },
  {
    before: "Can't answer 'what did we decide last week?'",
    after: "OpenStinger temporal graph answers point-in-time queries",
  },
  {
    before: "Loses pricing, decisions, and business facts between resets",
    after: "PARA stores atomic facts in plain files — survives anything",
  },
  {
    before: "AGENTS.md grows to 50K characters and eats your context budget",
    after: "MEMORY.md stays under 500 chars — just routing hints",
  },
];

const WHAT_YOU_GET = [
  "Installer scripts for all 5 memory layers",
  "Non-destructive apply — backs up your files before touching them",
  "Config snippets for Gigabrain, LCM, and OpenStinger",
  "PARA scaffolding templates and starter files",
  "Preflight check script — confirms your workspace is ready",
  "Full QA suite to verify the install worked",
  "Architecture docs + quick-start guide",
  "Decision tree for choosing which layers to enable",
  "Works with OpenClaw ≥0.3.0 — any workspace, any agent",
];

export default function MemoryStackPage() {
  return (
    <div className="mx-auto max-w-4xl">
      {/* Hero */}
      <section className="pt-8 pb-20 text-center">
        <div className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-neutral-500 border border-neutral-800 rounded-full px-3 py-1 mb-6">
          <span className="w-1.5 h-1.5 rounded-full bg-violet-500 animate-pulse" />
          v0.2.0 · Instant digital download
        </div>
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-[1.1] mb-6">
          Your AI agent forgets
          <br className="hidden sm:block" />
          everything.
          <br />
          <span className="text-neutral-400">Fix that in 5 minutes.</span>
        </h1>
        <p className="text-lg sm:text-xl text-neutral-400 leading-relaxed max-w-2xl mx-auto mb-3">
          The OpenClaw Memory Stack is an installer kit that gives your agent
          five specialized memory layers — automatic recall, durable facts,
          cross-session knowledge, and more.
        </p>
        <p className="text-sm text-neutral-500 mb-10">
          Five minutes to set up. Months of context retained.
        </p>

        {/* Primary CTA block */}
        <div className="inline-flex flex-col items-center gap-3">
          <a
            href={GUMROAD_URL}
            className="inline-flex items-center gap-3 bg-white text-black font-bold px-8 py-4 rounded-xl hover:bg-neutral-100 transition-colors text-lg shadow-lg shadow-white/10"
          >
            Get the Memory Stack Kit
            <span className="bg-black/10 text-black font-semibold text-sm px-2.5 py-1 rounded-lg">
              $19.99
            </span>
          </a>
          <p className="text-xs text-neutral-600">
            Instant download · Works with any OpenClaw workspace · v0.2.0
          </p>
        </div>

        <div className="mt-8">
          <a
            href="#how-it-works"
            className="inline-flex items-center gap-2 text-neutral-500 hover:text-neutral-300 transition-colors text-sm font-medium"
          >
            See how it works
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </a>
        </div>
      </section>

      {/* Problem */}
      <section className="py-16 border-t border-neutral-800">
        <h2 className="text-sm font-medium uppercase tracking-widest text-neutral-500 mb-10">
          The problem
        </h2>
        <div className="grid sm:grid-cols-3 gap-8">
          {[
            {
              title: "Context windows aren't memory",
              body: "A 200K token window means the model can see 200K tokens at once — this session only. Start a new conversation and it's gone.",
            },
            {
              title: "Summaries lose detail",
              body: "The model decided what mattered. It was wrong half the time. Summarize a summary enough times and you're playing telephone with your own history.",
            },
            {
              title: "One big blob degrades",
              body: "Dump everything into one place — a single vector DB, a single MEMORY.md — and retrieval quality drops as the pile grows.",
            },
          ].map((item) => (
            <div key={item.title}>
              <h3 className="text-white font-semibold mb-2">{item.title}</h3>
              <p className="text-neutral-400 text-sm leading-relaxed">{item.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Before / After */}
      <section className="py-16 border-t border-neutral-800">
        <h2 className="text-sm font-medium uppercase tracking-widest text-neutral-500 mb-10">
          Before / after
        </h2>
        <div className="space-y-4">
          {BEFORE_AFTER.map((item, i) => (
            <div key={i} className="grid sm:grid-cols-2 gap-4">
              <div className="border border-neutral-800 rounded-xl p-5 bg-neutral-950">
                <div className="text-xs font-medium uppercase tracking-wider text-red-500/70 mb-2">Before</div>
                <p className="text-neutral-400 text-sm leading-relaxed">{item.before}</p>
              </div>
              <div className="border border-neutral-700 rounded-xl p-5 bg-neutral-900">
                <div className="text-xs font-medium uppercase tracking-wider text-green-400/70 mb-2">After</div>
                <p className="text-neutral-300 text-sm leading-relaxed">{item.after}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-16 border-t border-neutral-800">
        <h2 className="text-sm font-medium uppercase tracking-widest text-neutral-500 mb-10">
          How it works
        </h2>
        <div className="grid sm:grid-cols-3 gap-8 mb-10">
          {[
            {
              step: "1",
              title: "Download and unzip",
              description: "Get the kit from Gumroad. Unzip it. Point your OpenClaw at the folder.",
            },
            {
              step: "2",
              title: "Run preflight + apply",
              description:
                "The script checks what you already have, proposes a plan, patches your workspace without overwriting anything.",
            },
            {
              step: "3",
              title: "Wire up plugins",
              description:
                "Review the config snippets. Apply them to your openclaw.json. Restart the gateway.",
            },
          ].map((step) => (
            <div key={step.step}>
              <div className="text-3xl font-bold text-neutral-800 mb-3 font-mono">
                {step.step}
              </div>
              <h3 className="text-white font-semibold mb-2">{step.title}</h3>
              <p className="text-neutral-400 text-sm leading-relaxed">{step.description}</p>
            </div>
          ))}
        </div>
        <div className="border border-neutral-800 rounded-xl p-6 bg-neutral-950 font-mono text-sm">
          <div className="text-neutral-500 mb-1"># Step 1 — check your workspace</div>
          <div className="text-neutral-300 mb-4">bash scripts/preflight.sh /your/workspace</div>
          <div className="text-neutral-500 mb-1"># Step 2 — install</div>
          <div className="text-neutral-300 mb-4">bash scripts/apply.sh /your/workspace --mode core-plus-guidance</div>
          <div className="text-neutral-500 mb-1"># Step 3 — restart</div>
          <div className="text-neutral-300">openclaw gateway restart</div>
        </div>
      </section>

      {/* Five Layers */}
      <section id="layers" className="py-16 border-t border-neutral-800">
        <div className="mb-10">
          <h2 className="text-sm font-medium uppercase tracking-widest text-neutral-500 mb-2">
            Five layers
          </h2>
          <p className="text-neutral-300 text-sm">
            Each layer has one job. None of them bloat your bootstrap files.
          </p>
        </div>
        <div className="space-y-4">
          {LAYERS.map((layer) => (
            <div
              key={layer.id}
              className="group border border-neutral-800 rounded-xl p-6 hover:border-neutral-600 transition-colors"
            >
              <div className="flex items-start gap-4 mb-4">
                <div className="text-3xl font-bold text-neutral-800 font-mono shrink-0 mt-0.5">
                  {layer.number}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="text-white font-semibold text-lg">{layer.name}</h3>
                    <span className="text-xs text-neutral-500 font-mono">{layer.tagline}</span>
                  </div>
                  <p className="text-neutral-400 text-sm leading-relaxed">{layer.description}</p>
                </div>
              </div>
              <ul className="ml-16 space-y-1">
                {layer.specs.map((spec) => (
                  <li key={spec} className="flex items-center gap-2 text-sm text-neutral-500">
                    <span className="w-1 h-1 rounded-full bg-neutral-700 shrink-0" />
                    {spec}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* Retrieval flow */}
      <section className="py-16 border-t border-neutral-800">
        <h2 className="text-sm font-medium uppercase tracking-widest text-neutral-500 mb-6">
          Retrieval flow
        </h2>
        <div className="border border-neutral-800 rounded-xl p-6 bg-neutral-950 font-mono text-xs leading-relaxed overflow-x-auto">
          <pre className="text-neutral-400">{`Agent receives a question
    │
    ▼  (before the agent sees the message)
Gigabrain injects top-K relevant memories automatically
    │
    ├─ From this session? → lcm_grep / lcm_expand
    │
    ├─ From a past session? → memory_search (OpenStinger)
    │
    ├─ Durable fact? → read ~/life/<entity>/summary.md
    │
    └─ What happened today? → read memory/YYYY-MM-DD.md

The agent almost never starts from zero.`}</pre>
        </div>
      </section>

      {/* What You Get — Pricing */}
      <section id="pricing" className="py-16 border-t border-neutral-800">
        <div className="mb-10">
          <h2 className="text-sm font-medium uppercase tracking-widest text-neutral-500 mb-2">
            What you get
          </h2>
          <p className="text-neutral-300 text-sm">
            One kit. Everything you need to give your agent a real memory system.
          </p>
        </div>

        <div className="border border-violet-500/40 rounded-2xl p-8 bg-gradient-to-b from-violet-950/20 to-transparent">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-6 mb-8">
            <div>
              <div className="text-xs font-medium uppercase tracking-wider text-violet-400 mb-2">
                OpenClaw Memory Stack Kit
              </div>
              <h3 className="text-white font-bold text-2xl mb-1">Full installer kit</h3>
              <p className="text-neutral-400 text-sm max-w-md leading-relaxed">
                The complete memory stack in one download. Run two scripts and your agent
                has five specialized memory layers wired up and verified.
              </p>
            </div>
            <div className="shrink-0 text-right">
              <div className="text-4xl font-bold text-white mb-1">$19.99</div>
              <div className="text-neutral-500 text-sm">one-time · instant download</div>
            </div>
          </div>

          <ul className="grid sm:grid-cols-2 gap-3 mb-8">
            {WHAT_YOU_GET.map((item) => (
              <li key={item} className="flex items-start gap-2.5 text-sm text-neutral-300">
                <svg
                  className="w-4 h-4 text-violet-400 shrink-0 mt-0.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                {item}
              </li>
            ))}
          </ul>

          <a
            href={GUMROAD_URL}
            className="block w-full text-center bg-white text-black font-bold px-6 py-4 rounded-xl hover:bg-neutral-100 transition-colors text-lg"
          >
            Get the Memory Stack Kit — $19.99
          </a>
          <p className="text-center text-xs text-neutral-600 mt-3">
            Instant download · Works with OpenClaw ≥0.3.0 · MIT License
          </p>
        </div>

        {/* DFY upsell */}
        <div className="mt-6 border border-neutral-800 rounded-2xl p-6 bg-neutral-950">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h3 className="text-white font-semibold mb-1">Want it done for you?</h3>
              <p className="text-neutral-400 text-sm leading-relaxed max-w-md">
                We install and wire the full memory stack in your OpenClaw workspace. You verify. Done.
                Includes Gigabrain tuning, OpenStinger infrastructure, and 30-day support.
              </p>
            </div>
            <Link
              href="/diagnostic"
              className="shrink-0 inline-flex items-center gap-2 border border-neutral-700 text-white font-medium px-5 py-3 rounded-lg hover:border-neutral-500 transition-colors text-sm whitespace-nowrap"
            >
              Book setup call
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 border-t border-neutral-800">
        <h2 className="text-sm font-medium uppercase tracking-widest text-neutral-500 mb-10">
          Common questions
        </h2>
        <div className="space-y-8">
          {[
            {
              q: "Does this work with any OpenClaw instance?",
              a: "Yes. The installer kit adapts to your machine's paths and existing config. It won't overwrite your AGENTS.md or MEMORY.md — it patches them with managed blocks.",
            },
            {
              q: "Do I need Docker for this?",
              a: "Only if you want OpenStinger (cross-session graph recall). The core file layer — Gigabrain, LCM, PARA, Workspace Patching — runs on SQLite and plain files. No infrastructure required.",
            },
            {
              q: "What if I already have a MEMORY.md or AGENTS.md?",
              a: "The installer backs up your existing files before touching them, then appends managed blocks instead of overwriting. Your custom content stays intact.",
            },
            {
              q: "Can I use this with multiple agents?",
              a: "Yes. Each agent gets its own workspace and namespace. Multiple agents can share an OpenStinger server and a PARA knowledge graph while keeping their session memory separate.",
            },
            {
              q: "What's the minimum viable install?",
              a: "Create a memory/ folder, write a minimal MEMORY.md, and start keeping daily notes. Add Gigabrain for automatic recall. That's a working memory system with zero infrastructure.",
            },
            {
              q: "What do I get after purchase?",
              a: "An instant download link to the zip archive (v0.2.0). The archive includes all installer scripts, templates, config snippets, QA suite, and full documentation.",
            },
          ].map((item) => (
            <div key={item.q} className="border-b border-neutral-800 pb-8 last:border-0">
              <h3 className="text-white font-semibold mb-2">{item.q}</h3>
              <p className="text-neutral-400 text-sm leading-relaxed">{item.a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 border-t border-neutral-800 text-center">
        <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white mb-4">
          Stop starting from zero.
        </h2>
        <p className="text-neutral-400 text-lg mb-3 max-w-xl mx-auto leading-relaxed">
          Five layers. Five minutes. Your agent remembers what matters — across
          sessions, across days, across months.
        </p>
        <p className="text-neutral-600 text-sm mb-10">One-time $19.99. Instant download.</p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <a
            href={GUMROAD_URL}
            className="inline-flex items-center gap-3 bg-white text-black font-bold px-8 py-4 rounded-xl hover:bg-neutral-100 transition-colors text-lg shadow-lg shadow-white/10"
          >
            Get the Memory Stack Kit
            <span className="bg-black/10 text-black font-semibold text-sm px-2.5 py-1 rounded-lg">
              $19.99
            </span>
          </a>
          <Link
            href="/diagnostic"
            className="inline-flex items-center gap-2 text-neutral-400 hover:text-white transition-colors font-medium px-6 py-4 text-sm"
          >
            Want it done for you? →
          </Link>
        </div>
        <p className="mt-6 text-xs text-neutral-700">
          v0.2.0 · MIT License · Works with OpenClaw ≥0.3.0
        </p>
      </section>
    </div>
  );
}
