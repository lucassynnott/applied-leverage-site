import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Get Your AI Agent Team",
  description:
    "Deploy a fully-trained AI agent team inside your Slack workspace in minutes. No setup, no hiring, no training — just results.",
};

const ARCHETYPES = [
  {
    slug: "marketing-machine",
    name: "Marketing Machine",
    tagline: "Content, campaigns, and copy — on autopilot",
    description:
      "A specialist team of AI agents that writes content, drafts campaigns, manages your editorial calendar, and keeps your brand voice consistent across every channel.",
    capabilities: [
      "Blog posts, newsletters, and social copy",
      "Campaign planning and brief writing",
      "Brand voice consistency checks",
      "Competitor content monitoring",
      "SEO research and keyword strategy",
    ],
    bestFor: "Agencies, content studios, solo founders with a story to tell",
    emoji: "📣",
  },
  {
    slug: "sales-accelerator",
    name: "Sales Accelerator",
    tagline: "Pipeline intelligence and outreach, automated",
    description:
      "AI agents that research prospects, draft personalised outreach, track pipeline activity in Slack, and surface deal signals before they go cold.",
    capabilities: [
      "Prospect research and enrichment",
      "Personalised cold outreach drafts",
      "Follow-up sequence generation",
      "Deal stage nudges and reminders",
      "Win/loss pattern analysis",
    ],
    bestFor: "SDRs, AEs, and founders closing their own deals",
    emoji: "🚀",
  },
  {
    slug: "ops-commander",
    name: "Ops Commander",
    tagline: "Operations tightened, processes automated",
    description:
      "A team that runs your recurring workflows, tracks project status, flags bottlenecks, and keeps your team aligned without endless status calls.",
    capabilities: [
      "Daily standup summaries and blockers",
      "SOP documentation and updates",
      "Project status tracking",
      "Meeting prep and action-item capture",
      "Vendor and contractor coordination",
    ],
    bestFor: "Operations managers, COOs, and fast-moving startups",
    emoji: "⚙️",
  },
  {
    slug: "support-hub",
    name: "Support Hub",
    tagline: "Customer support that never clocks out",
    description:
      "AI agents trained on your product that handle tier-1 support, draft responses, route complex issues, and surface common problems to your team.",
    capabilities: [
      "First-response drafts for inbound tickets",
      "Knowledge base search and answer synthesis",
      "Issue triage and routing",
      "CSAT trend reporting",
      "Escalation summaries for human handoff",
    ],
    bestFor: "SaaS teams, e-commerce brands, service businesses",
    emoji: "🎧",
  },
  {
    slug: "dev-companion",
    name: "Dev Companion",
    tagline: "Engineering velocity, amplified",
    description:
      "Agents that review PRs, write docs, answer internal dev questions, and help your team ship faster without context-switching out of Slack.",
    capabilities: [
      "PR review summaries and risk flags",
      "Technical documentation drafts",
      "Runbook and incident response guidance",
      "Codebase Q&A from Slack",
      "Sprint retrospective synthesis",
    ],
    bestFor: "Engineering teams, CTOs, and developer-led startups",
    emoji: "💻",
  },
] as const;

const HOW_IT_WORKS = [
  {
    step: "01",
    title: "Choose your team",
    description:
      "Pick the archetype that matches your biggest operational bottleneck. Not sure? Start with Marketing Machine or Ops Commander — they deliver results fastest.",
  },
  {
    step: "02",
    title: "Complete checkout",
    description:
      "Secure payment via Stripe. You'll be redirected to authorise the bot in your Slack workspace — takes 30 seconds.",
  },
  {
    step: "03",
    title: "Your team arrives in ~5 minutes",
    description:
      "Your AI agents spin up, introduce themselves in Slack, and are ready to take tasks. No IT department required.",
  },
] as const;

const FAQS = [
  {
    q: "How long does setup actually take?",
    a: "After payment, you'll authorise the Slack install (one click), and your agents will be live within 5 minutes. That's it.",
  },
  {
    q: "Do I need any technical knowledge?",
    a: "None. If you can install a Slack app, you're done. The agents handle everything else.",
  },
  {
    q: "What does the agent team actually do in Slack?",
    a: "Your agents respond to @mentions, take tasks you assign them, run scheduled workflows, and proactively surface insights in your chosen channels. They work like very fast, very reliable team members.",
  },
  {
    q: "Can I switch archetypes later?",
    a: "Yes. Each archetype is a separate installation. You can add additional teams to the same workspace, or switch by reinstalling.",
  },
  {
    q: "What's the refund policy?",
    a: "If your team isn't live and working within 24 hours of purchase, we'll refund you in full. No questions.",
  },
  {
    q: "Who is this for?",
    a: "Operators who are tired of doing the work that should be automated. Agencies. Solopreneurs. Small teams. Anyone who wants leverage without headcount.",
  },
] as const;

export default function BuyPage() {
  return (
    <div className="mx-auto max-w-4xl">
      {/* Hero */}
      <section className="pt-8 pb-20 text-center">
        <div className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-neutral-500 border border-neutral-800 rounded-full px-3 py-1 mb-6">
          <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
          Now live — teams deploying daily
        </div>
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-[1.1] mb-6">
          An AI team inside{" "}
          <br className="hidden sm:block" />
          your Slack workspace.
          <br />
          <span className="text-neutral-400">Live in 5 minutes.</span>
        </h1>
        <p className="text-lg sm:text-xl text-neutral-400 leading-relaxed max-w-2xl mx-auto mb-10">
          Stop doing the work your business should automate. Pick an agent team,
          complete checkout, and your AI specialists are in Slack before your
          next standup.
        </p>
        <a
          href="#archetypes"
          className="inline-flex items-center gap-2 bg-white text-black font-semibold px-6 py-3 rounded-lg hover:bg-neutral-100 transition-colors"
        >
          Choose your team
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </a>
      </section>

      {/* How it works */}
      <section className="py-16 border-t border-neutral-800">
        <h2 className="text-sm font-medium uppercase tracking-widest text-neutral-500 mb-10">
          How it works
        </h2>
        <div className="grid sm:grid-cols-3 gap-8">
          {HOW_IT_WORKS.map((step) => (
            <div key={step.step}>
              <div className="text-3xl font-bold text-neutral-800 mb-3 font-mono">
                {step.step}
              </div>
              <h3 className="text-white font-semibold mb-2">{step.title}</h3>
              <p className="text-neutral-400 text-sm leading-relaxed">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Archetypes */}
      <section id="archetypes" className="py-16 border-t border-neutral-800">
        <div className="mb-10">
          <h2 className="text-sm font-medium uppercase tracking-widest text-neutral-500 mb-2">
            Choose your team
          </h2>
          <p className="text-neutral-300 text-sm">
            Each team is purpose-built for one domain. Prices are per workspace,
            per month.
          </p>
        </div>
        <div className="space-y-4">
          {ARCHETYPES.map((archetype) => (
            <div
              key={archetype.slug}
              className="group border border-neutral-800 rounded-xl p-6 hover:border-neutral-600 transition-colors"
            >
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{archetype.emoji}</span>
                  <div>
                    <h3 className="text-white font-semibold text-lg">
                      {archetype.name}
                    </h3>
                    <p className="text-neutral-500 text-sm">
                      {archetype.tagline}
                    </p>
                  </div>
                </div>
                <a
                  href={`/api/checkout?archetype=${archetype.slug}`}
                  className="shrink-0 inline-flex items-center gap-1.5 bg-neutral-900 border border-neutral-700 text-white text-sm font-medium px-4 py-2 rounded-lg hover:border-neutral-500 hover:bg-neutral-800 transition-colors"
                >
                  Get started
                  <svg
                    className="w-3.5 h-3.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </a>
              </div>
              <p className="text-neutral-400 text-sm leading-relaxed mb-4">
                {archetype.description}
              </p>
              <div className="grid sm:grid-cols-2 gap-x-6 gap-y-1.5 mb-4">
                {archetype.capabilities.map((cap) => (
                  <div key={cap} className="flex items-start gap-2 text-sm">
                    <svg
                      className="w-3.5 h-3.5 text-green-500 mt-0.5 shrink-0"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="text-neutral-400">{cap}</span>
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-2 text-xs text-neutral-600">
                <span className="font-medium text-neutral-500">Best for:</span>
                {archetype.bestFor}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Guarantee */}
      <section className="py-12 border-t border-neutral-800">
        <div className="flex items-start gap-4 p-6 bg-neutral-900 rounded-xl border border-neutral-800">
          <div className="text-2xl shrink-0">🛡️</div>
          <div>
            <h3 className="text-white font-semibold mb-1">
              24-hour live guarantee
            </h3>
            <p className="text-neutral-400 text-sm leading-relaxed">
              If your agent team isn&apos;t live and operational in your Slack
              workspace within 24 hours of purchase, we&apos;ll refund you in
              full. No disputes. No paperwork.
            </p>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 border-t border-neutral-800">
        <h2 className="text-sm font-medium uppercase tracking-widest text-neutral-500 mb-10">
          Common questions
        </h2>
        <div className="space-y-8">
          {FAQS.map((faq) => (
            <div key={faq.q}>
              <h3 className="text-white font-medium mb-2">{faq.q}</h3>
              <p className="text-neutral-400 text-sm leading-relaxed">{faq.a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer CTA */}
      <section className="py-16 border-t border-neutral-800 text-center">
        <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
          Ready to get leverage?
        </h2>
        <p className="text-neutral-400 mb-8 max-w-md mx-auto">
          Pick a team, complete checkout, and your agents are in Slack before
          you finish your coffee.
        </p>
        <a
          href="#archetypes"
          className="inline-flex items-center gap-2 bg-white text-black font-semibold px-6 py-3 rounded-lg hover:bg-neutral-100 transition-colors"
        >
          Choose your team
        </a>
        <p className="mt-4 text-xs text-neutral-600">
          Questions?{" "}
          <a
            href="https://x.com/lucassynnott"
            target="_blank"
            rel="noopener noreferrer"
            className="text-neutral-500 hover:text-white transition-colors"
          >
            DM on X
          </a>
        </p>
      </section>
    </div>
  );
}
