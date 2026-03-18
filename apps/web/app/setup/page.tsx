"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

type ProvisioningStatus =
  | "pending"
  | "queued"
  | "provisioning"
  | "ready"
  | "failed";

const STATUS_STEPS = [
  {
    id: "payment",
    label: "Payment confirmed",
    description: "Your purchase is verified",
  },
  {
    id: "install",
    label: "Slack app authorised",
    description: "Bot connected to your workspace",
  },
  {
    id: "provisioning",
    label: "Spinning up your team",
    description: "Agents initialising (~3 minutes)",
  },
  {
    id: "ready",
    label: "Team is live",
    description: "Check Slack for your welcome message",
  },
] as const;

const ARCHETYPE_NAMES: Record<string, string> = {
  "marketing-machine": "Marketing Machine",
  "sales-accelerator": "Sales Accelerator",
  "ops-commander": "Ops Commander",
  "support-hub": "Support Hub",
  "dev-companion": "Dev Companion",
};

function getActiveStep(status: ProvisioningStatus): number {
  switch (status) {
    case "pending":
      return 0;
    case "queued":
      return 1;
    case "provisioning":
      return 2;
    case "ready":
      return 3;
    case "failed":
      return -1;
    default:
      return 1;
  }
}

export default function SetupPage() {
  const searchParams = useSearchParams();
  const archetype = searchParams.get("archetype") ?? "";
  const sessionId = searchParams.get("session_id") ?? "";
  const installCode = searchParams.get("install_code") ?? "";

  const [status, setStatus] = useState<ProvisioningStatus>("pending");
  const [installUrl, setInstallUrl] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const archetypeName =
    ARCHETYPE_NAMES[archetype] ?? archetype ?? "your agent team";
  const activeStep = getActiveStep(status);
  const isComplete = status === "ready";
  const isFailed = status === "failed";

  useEffect(() => {
    if (!sessionId) return;
    if (isComplete || isFailed) return;

    const poll = async () => {
      try {
        const res = await fetch(
          `/api/provision-status?session_id=${encodeURIComponent(sessionId)}&install_code=${encodeURIComponent(installCode)}&archetype=${encodeURIComponent(archetype)}`,
        );
        if (!res.ok) return;
        const data = (await res.json()) as {
          status: ProvisioningStatus;
          installUrl?: string | null;
          error?: string;
        };
        setStatus(data.status);
        setInstallUrl(data.installUrl ?? null);
        if (data.error) setErrorMessage(data.error);
      } catch {
        // Silently retry
      }
    };

    const interval = setInterval(() => void poll(), 5000);
    void poll();
    return () => clearInterval(interval);
  }, [archetype, installCode, isComplete, isFailed, sessionId]);

  return (
    <div className="mx-auto max-w-lg py-16">
      <div className="text-center mb-12">
        {isComplete ? (
          <>
            <div className="text-5xl mb-4">🎉</div>
            <h1 className="text-2xl font-bold text-white mb-2">
              Your team is live!
            </h1>
            <p className="text-neutral-400">
              Check your Slack workspace — your {archetypeName} agents just
              introduced themselves.
            </p>
          </>
        ) : isFailed ? (
          <>
            <div className="text-5xl mb-4">⚠️</div>
            <h1 className="text-2xl font-bold text-white mb-2">
              Something went wrong
            </h1>
            <p className="text-neutral-400 mb-4">
              {errorMessage ??
                "We hit an issue setting up your team. We're on it."}
            </p>
            <p className="text-sm text-neutral-500">
              DM{" "}
              <a
                href="https://x.com/lucassynnott"
                target="_blank"
                rel="noopener noreferrer"
                className="text-neutral-300 hover:text-white"
              >
                @lucassynnott
              </a>{" "}
              and we&apos;ll sort it out or refund you.
            </p>
          </>
        ) : (
          <>
            <div className="text-5xl mb-4">⚡</div>
            <h1 className="text-2xl font-bold text-white mb-2">
              Setting up your {archetypeName}
            </h1>
            <p className="text-neutral-400">
              Your agents are initialising. This takes about 3–5 minutes.
              <br />
              We&apos;ll update this page automatically.
            </p>
          </>
        )}
      </div>

      {installUrl && !isComplete && !isFailed && (
        <div className="mb-10 rounded-xl border border-neutral-800 bg-neutral-900/80 p-5">
          <p className="text-sm font-medium text-white mb-2">
            Connect your Slack workspace to continue
          </p>
          <p className="text-sm text-neutral-400 leading-relaxed mb-4">
            Payment is confirmed. Complete Slack OAuth in a new tab, then leave
            this page open while your agents finish provisioning.
          </p>
          <a
            href={installUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-white text-black font-semibold px-5 py-2.5 rounded-lg hover:bg-neutral-100 transition-colors"
          >
            Connect Slack workspace
          </a>
        </div>
      )}

      {/* Progress steps */}
      <div className="space-y-0 mb-12">
        {STATUS_STEPS.map((step, idx) => {
          const isActive = idx === activeStep;
          const isDone = idx < activeStep || isComplete;
          const isPending = idx > activeStep && !isComplete;

          return (
            <div key={step.id} className="flex items-start gap-4">
              {/* Step connector + icon */}
              <div className="flex flex-col items-center">
                <div
                  className={`w-8 h-8 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                    isDone
                      ? "border-green-500 bg-green-500"
                      : isActive
                        ? "border-white bg-white"
                        : "border-neutral-700 bg-transparent"
                  }`}
                >
                  {isDone ? (
                    <svg
                      className="w-4 h-4 text-black"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  ) : isActive ? (
                    <div className="w-2 h-2 rounded-full bg-black animate-pulse" />
                  ) : (
                    <div className="w-2 h-2 rounded-full bg-neutral-700" />
                  )}
                </div>
                {idx < STATUS_STEPS.length - 1 && (
                  <div
                    className={`w-px flex-1 my-1 h-8 transition-colors ${
                      isDone ? "bg-green-500/30" : "bg-neutral-800"
                    }`}
                  />
                )}
              </div>

              {/* Step content */}
              <div className="pb-6">
                <p
                  className={`font-medium transition-colors ${
                    isDone
                      ? "text-green-400"
                      : isActive
                        ? "text-white"
                        : "text-neutral-600"
                  }`}
                >
                  {step.label}
                </p>
                <p
                  className={`text-sm mt-0.5 transition-colors ${
                    isPending ? "text-neutral-700" : "text-neutral-500"
                  }`}
                >
                  {step.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {isComplete && (
        <div className="text-center">
          <a
            href="https://slack.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-white text-black font-semibold px-6 py-3 rounded-lg hover:bg-neutral-100 transition-colors"
          >
            Open Slack
          </a>
        </div>
      )}

      {!isComplete && !isFailed && (
        <p className="text-center text-xs text-neutral-700">
          This page refreshes automatically every 5 seconds
        </p>
      )}
    </div>
  );
}
