"use client";

import { useState } from "react";

const WHAT_YOU_GET = [
  "SKILL.md — full self-bootstrapping skill instructions",
  "README.md — plain-English setup guide",
  "config.example.json — all configurable fields documented",
  "Zero permanent agents needed — seats spawn on the fly",
  "Works with any OpenClaw workspace, any models",
  "First run asks 2-3 questions, writes your config, runs immediately",
  "Rotating proposer seat — different agent leads each session",
  "Memo saved locally + Obsidian vault + Slack (all optional)",
];

const HOW_IT_WORKS = [
  {
    step: "1",
    title: "Drop it in your skills/ folder",
    description: "Copy the skill folder into your OpenClaw workspace. That's the install.",
  },
  {
    step: "2",
    title: "Say 'run the roundtable'",
    description:
      "First run detects no config, pulls from your memory, asks 2-3 questions about your business goals.",
  },
  {
    step: "3",
    title: "Council runs automatically",
    description:
      "4 seat agents spawn, debate, and dissolve. You get a strategic memo with top 3 actions — ready in under 2 minutes.",
  },
];

const SEATS = [
  {
    emoji: "🔴",
    name: "Provocateur",
    desc: "Generates bold, non-obvious ideas. The one who says what others won't.",
  },
  {
    emoji: "🔵",
    name: "Operator",
    desc: "Hard execution focus. Evaluates shippability, first steps, hidden complexity.",
  },
  {
    emoji: "🟡",
    name: "Skeptic",
    desc: "Analytical critic. Finds real weaknesses and failure modes before you ship.",
  },
  {
    emoji: "🟢",
    name: "Customer",
    desc: "Voice of your ICP. Reacts like a buyer, not a builder.",
  },
];

function SubscribeForm() {
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setError("");

    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, firstName, audience: "roundtable" }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Something went wrong");
      }

      setStatus("success");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setStatus("error");
    }
  };

  if (status === "success") {
    return (
      <div className="text-center py-6">
        <div className="text-3xl mb-3">🎸</div>
        <h3 className="text-white font-bold text-xl mb-2">You're in.</h3>
        <p className="text-neutral-400 text-sm">
          Check your inbox — the skill zip is on its way.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="flex gap-3">
        <input
          type="text"
          placeholder="First name"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          className="flex-1 bg-neutral-900 border border-neutral-700 rounded-lg px-4 py-3 text-white placeholder-neutral-500 focus:outline-none focus:border-violet-500 text-sm"
        />
        <input
          type="email"
          placeholder="Email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="flex-[2] bg-neutral-900 border border-neutral-700 rounded-lg px-4 py-3 text-white placeholder-neutral-500 focus:outline-none focus:border-violet-500 text-sm"
        />
      </div>
      {error && <p className="text-red-400 text-xs">{error}</p>}
      <button
        type="submit"
        disabled={status === "loading"}
        className="w-full bg-white text-black font-bold px-6 py-4 rounded-xl hover:bg-neutral-100 transition-colors text-base disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {status === "loading" ? "Sending..." : "Get the Free Skill →"}
      </button>
      <p className="text-center text-xs text-neutral-600">
        Free forever · No credit card · Works with any OpenClaw setup
      </p>
    </form>
  );
}

export default function RoundtablePage() {
  return (
    <div className="mx-auto max-w-4xl">
      {/* Hero */}
      <section className="pt-8 pb-20 text-center">
        <div className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-neutral-500 border border-neutral-800 rounded-full px-3 py-1 mb-6">
          <span className="w-1.5 h-1.5 rounded-full bg-violet-500 animate-pulse" />
          Free skill · Instant download
        </div>
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-[1.1] mb-6">
          Your AI agents just got
          <br className="hidden sm:block" />
          a boardroom.
        </h1>
        <p className="text-lg sm:text-xl text-neutral-400 leading-relaxed max-w-2xl mx-auto mb-3">
          The Moltron Roundtable is a free OpenClaw skill that runs a live R&D council —
          4 agent seats debate one bold idea, your coordinator synthesizes a strategic memo.
          Drop it in, say "run the roundtable." Done.
        </p>
        <p className="text-sm text-neutral-500 mb-10">
          Zero pre-configuration. No permanent agents required. Works in under 2 minutes.
        </p>

        {/* Form */}
        <div className="max-w-xl mx-auto">
          <SubscribeForm />
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 border-t border-neutral-800">
        <h2 className="text-sm font-medium uppercase tracking-widest text-neutral-500 mb-10">
          How it works
        </h2>
        <div className="grid sm:grid-cols-3 gap-8">
          {HOW_IT_WORKS.map((item) => (
            <div key={item.step}>
              <div className="text-3xl font-bold text-neutral-800 mb-3 font-mono">{item.step}</div>
              <h3 className="text-white font-semibold mb-2">{item.title}</h3>
              <p className="text-neutral-400 text-sm leading-relaxed">{item.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* The 4 seats */}
      <section className="py-16 border-t border-neutral-800">
        <h2 className="text-sm font-medium uppercase tracking-widest text-neutral-500 mb-10">
          The 4 seats
        </h2>
        <div className="grid sm:grid-cols-2 gap-4">
          {SEATS.map((seat) => (
            <div
              key={seat.name}
              className="border border-neutral-800 rounded-xl p-6 hover:border-neutral-600 transition-colors"
            >
              <div className="text-2xl mb-3">{seat.emoji}</div>
              <h3 className="text-white font-semibold mb-1">{seat.name}</h3>
              <p className="text-neutral-400 text-sm leading-relaxed">{seat.desc}</p>
            </div>
          ))}
        </div>
        <p className="mt-6 text-neutral-500 text-sm">
          Seats spawn as one-shot agents per session. No permanent setup. Each session is fresh.
          The coordinator (your main agent) synthesizes the debate into a memo.
        </p>
      </section>

      {/* What you get */}
      <section className="py-16 border-t border-neutral-800">
        <div className="border border-violet-500/40 rounded-2xl p-8 bg-gradient-to-b from-violet-950/20 to-transparent">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-6 mb-8">
            <div>
              <div className="text-xs font-medium uppercase tracking-wider text-violet-400 mb-2">
                Moltron Roundtable Skill
              </div>
              <h3 className="text-white font-bold text-2xl mb-1">Free forever</h3>
              <p className="text-neutral-400 text-sm max-w-md leading-relaxed">
                Drop into your OpenClaw workspace and run. Self-bootstrapping, zero agents pre-required,
                works with any model setup.
              </p>
            </div>
            <div className="shrink-0 text-right">
              <div className="text-4xl font-bold text-white mb-1">$0</div>
              <div className="text-neutral-500 text-sm">free · always</div>
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

          <div className="max-w-xl">
            <SubscribeForm />
          </div>
        </div>
      </section>

      {/* Sample memo */}
      <section className="py-16 border-t border-neutral-800">
        <h2 className="text-sm font-medium uppercase tracking-widest text-neutral-500 mb-6">
          Sample output
        </h2>
        <div className="border border-neutral-800 rounded-xl p-6 bg-neutral-950 font-mono text-xs leading-relaxed overflow-x-auto">
          <pre className="text-neutral-400 whitespace-pre-wrap">{`# 🧠 R&D Council — Session #3
2026-03-24 09:00 | morning | Proposer: 🔴 Provocateur

## 💡 The Idea
Launch a "one-hour agency audit" as a $97 async offer — founder records
a 10-min walkthrough, agent fleet diagnoses bottlenecks, delivers a
written report with 3 immediate actions.

🔵 Operator: Shippable in 48h — Loom intake, Goro writes the report,
no sales call needed. First constraint is intake form UX.

🟡 Skeptic: Who decides the 3 actions are right? Trust breaks if the
report feels generic. Needs at least one sync touchpoint.

🟢 Customer: I'd pay $97 for a diagnosis that doesn't require an hour
of my time. Price it at $147 and it signals seriousness.

## 📋 Strategic Memo
The async audit idea is sound. The risk isn't execution — it's trust.
A written report from an AI fleet will feel cheap unless the intake is
thorough and the recommendations are specific...

Top 3 Actions:
1. Build intake form this week (30 min, Tally + Notion)
2. Run 2 beta audits free, collect testimonials
3. Launch at $147 with a 48h turnaround guarantee`}</pre>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 border-t border-neutral-800 text-center">
        <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white mb-4">
          Give your agents a war room.
        </h2>
        <p className="text-neutral-400 text-lg mb-10 max-w-xl mx-auto leading-relaxed">
          One skill file. Zero setup. Your agent fleet debates your biggest business problem
          and hands you a decision in under 2 minutes.
        </p>
        <div className="max-w-xl mx-auto">
          <SubscribeForm />
        </div>
      </section>
    </div>
  );
}
