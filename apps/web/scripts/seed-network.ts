import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api";
import type { FunctionReference } from "convex/server";

type ContentResource = {
  resourceId: string;
  type: string;
  fields: Record<string, unknown>;
};

const CONVEX_URL = process.env.CONVEX_URL || process.env.NEXT_PUBLIC_CONVEX_URL;
if (!CONVEX_URL) {
  throw new Error("Missing NEXT_PUBLIC_CONVEX_URL or CONVEX_URL environment variable");
}

const client = new ConvexHttpClient(CONVEX_URL);

const upsertRef = api.contentResources.upsert as FunctionReference<"mutation">;

async function pushContentResource(item: ContentResource) {
  await client.mutation(upsertRef, {
    resourceId: item.resourceId,
    type: item.type,
    fields: item.fields,
    searchText: Object.values(item.fields).filter((value) => typeof value === "string").join(" "),
  });
}

const nodes: ContentResource[] = [
  {
    resourceId: "node:johnny-ai",
    type: "network_node",
    fields: {
      publicName: "johnny-ai",
      status: "healthy",
      specs: [
        "Linux",
        "i9-9900K",
        "RTX 3090 24GB",
        "32GB RAM",
        "458GB NVMe",
        "Tailscale: 100.122.180.57",
      ],
      role: "Primary AI workstation. Runs OpenClaw gateway, all agents, coding sessions, and GPU workloads.",
      services: [],
    },
  },
  {
    resourceId: "node:lucass-mac-studio",
    type: "network_node",
    fields: {
      publicName: "lucass-mac-studio",
      status: "healthy",
      specs: ["macOS", "Tailscale: 100.126.65.119"],
      role: "Lucas's desktop. Direct LAN access.",
      services: [],
    },
  },
  {
    resourceId: "node:lucass-macbook-pro",
    type: "network_node",
    fields: {
      publicName: "lucass-macbook-pro",
      status: "healthy",
      specs: ["macOS", "Tailscale: 100.107.211.59"],
      role: "Laptop, offers exit node.",
      services: [],
    },
  },
  {
    resourceId: "node:ubuntu-2404-noble-amd64-base-1",
    type: "network_node",
    fields: {
      publicName: "ubuntu-2404-noble-amd64-base-1",
      status: "healthy",
      specs: ["Linux VPS", "Tailscale: 100.86.190.74"],
      role: "VPS node 1.",
      services: [],
    },
  },
  {
    resourceId: "node:ubuntu-2404-noble-amd64-base",
    type: "network_node",
    fields: {
      publicName: "ubuntu-2404-noble-amd64-base",
      status: "healthy",
      specs: ["Linux VPS", "Tailscale: 100.125.74.82"],
      role: "VPS node 2.",
      services: [],
    },
  },
];

const cluster: ContentResource[] = [
  {
    resourceId: "cluster:Orchestration",
    type: "network_cluster",
    fields: { key: "Orchestration", value: "OpenClaw 2026.2.26" },
  },
  {
    resourceId: "cluster:Memory",
    type: "network_cluster",
    fields: { key: "Memory", value: "32 GB DDR4" },
  },
  {
    resourceId: "cluster:CPU",
    type: "network_cluster",
    fields: { key: "CPU", value: "i9-9900K (8C/16T)" },
  },
  {
    resourceId: "cluster:GPU",
    type: "network_cluster",
    fields: { key: "GPU", value: "RTX 3090 (24GB VRAM)" },
  },
  {
    resourceId: "cluster:Storage",
    type: "network_cluster",
    fields: { key: "Storage", value: "458GB NVMe + NAS" },
  },
  {
    resourceId: "cluster:Functions",
    type: "network_cluster",
    fields: { key: "Functions", value: "6 agents, 67 skills" },
  },
  {
    resourceId: "cluster:Interconnect",
    type: "network_cluster",
    fields: { key: "Interconnect", value: "Tailscale WireGuard mesh" },
  },
];

const daemons: ContentResource[] = [
  {
    resourceId: "daemon:openclaw-gateway",
    type: "network_daemon",
    fields: {
      name: "openclaw-gateway",
      status: "healthy",
      description: "Agent gateway — WebSocket server, message routing, heartbeats",
    },
  },
  {
    resourceId: "daemon:docker",
    type: "network_daemon",
    fields: {
      name: "docker",
      status: "healthy",
      description: "Container runtime for agent workloads",
    },
  },
  {
    resourceId: "daemon:tailscaled",
    type: "network_daemon",
    fields: {
      name: "tailscaled",
      status: "healthy",
      description: "Encrypted mesh network connecting all nodes",
    },
  },
  {
    resourceId: "daemon:tmux-sessions",
    type: "network_daemon",
    fields: {
      name: "tmux-sessions",
      status: "healthy",
      description: "Background process manager for dev servers and agents",
    },
  },
];

const stack: ContentResource[] = [
  {
    resourceId: "stack:5",
    type: "network_stack",
    fields: {
      layer: 5,
      label: "Agents",
      description: "Johnny, Alt, T-Bug, Goro, River — orchestration and execution",
    },
  },
  {
    resourceId: "stack:4",
    type: "network_stack",
    fields: {
      layer: 4,
      label: "Skills",
      description: "67 installed skills — coding, research, content, ops",
    },
  },
  {
    resourceId: "stack:3",
    type: "network_stack",
    fields: {
      layer: 3,
      label: "Gateway",
      description: "OpenClaw gateway — routing, memory, heartbeats, cron",
    },
  },
  {
    resourceId: "stack:2",
    type: "network_stack",
    fields: {
      layer: 2,
      label: "Runtime",
      description: "Node.js, Docker, tmux, systemd services",
    },
  },
  {
    resourceId: "stack:1",
    type: "network_stack",
    fields: {
      layer: 1,
      label: "Infrastructure",
      description: "i9-9900K, RTX 3090, Tailscale mesh, NAS storage",
    },
  },
];

const resources = [...nodes, ...cluster, ...daemons, ...stack];

await Promise.all(resources.map((resource) => pushContentResource(resource)));

console.log("Seeded network content resources for Applied Leverage.");
