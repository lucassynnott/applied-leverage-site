#!/usr/bin/env python3
"""
requirements:
  stdlib only (urllib, socket, subprocess, json, os, signal, time)
"""

from __future__ import annotations

import json
import os
import signal
import socket
import subprocess
import sys
import time
import urllib.error
import urllib.request
from pathlib import Path
from shutil import disk_usage
from typing import Any, Dict, List, Optional, Tuple

CHECK_INTERVAL_SECONDS = 60
CONVEX_URL = os.environ.get("CONVEX_URL", "https://clever-partridge-439.convex.cloud").rstrip("/")
WORKSPACE_ROOT = Path("/home/lucas/applied-leverage-site")
RUNNING = True

NODE_DEFINITIONS: Dict[str, Dict[str, Any]] = {
    "node:johnny-ai": {
        "publicName": "johnny-ai",
        "privateName": "johnny-ai.tail70105c.ts.net",
        "status_default": "offline",
        "specs": [
            "Linux",
            "i9-9900K",
            "RTX 3090 24GB",
            "32GB RAM",
            "458GB NVMe",
            "Tailscale: 100.122.180.57",
        ],
        "role": "Primary AI workstation. Runs OpenClaw gateway, all agents, coding sessions, and GPU workloads.",
        "match_ips": ["100.122.180.57"],
        "services": [],
    },
    "node:lucass-mac-studio": {
        "publicName": "lucass-mac-studio",
        "status_default": "offline",
        "specs": ["macOS", "Tailscale: 100.126.65.119"],
        "role": "Lucas's desktop. Direct LAN access.",
        "match_ips": ["100.126.65.119"],
        "services": [],
    },
    "node:lucass-macbook-pro": {
        "publicName": "lucass-macbook-pro",
        "status_default": "offline",
        "specs": ["macOS", "Tailscale: 100.107.211.59"],
        "role": "Laptop, offers exit node.",
        "match_ips": ["100.107.211.59"],
        "services": [],
    },
    "node:ubuntu-2404-noble-amd64-base-1": {
        "publicName": "ubuntu-2404-noble-amd64-base-1",
        "status_default": "offline",
        "specs": ["Linux VPS", "Tailscale: 100.86.190.74"],
        "role": "VPS node 1.",
        "match_ips": ["100.86.190.74"],
        "services": [],
    },
    "node:ubuntu-2404-noble-amd64-base": {
        "publicName": "ubuntu-2404-noble-amd64-base",
        "status_default": "offline",
        "specs": ["Linux VPS", "Tailscale: 100.125.74.82"],
        "role": "VPS node 2.",
        "match_ips": ["100.125.74.82"],
        "services": [],
    },
}

DAEMON_DEFINITIONS: Dict[str, Dict[str, str]] = {
    "daemon:openclaw-gateway": {
        "name": "openclaw-gateway",
        "description": "Agent gateway  WebSocket server, message routing, heartbeats",
        "status_default": "down",
    },
    "daemon:docker": {
        "name": "docker",
        "description": "Container runtime for agent workloads",
        "status_default": "down",
    },
    "daemon:tailscaled": {
        "name": "tailscaled",
        "description": "Encrypted mesh network connecting all nodes",
        "status_default": "down",
    },
    "daemon:tmux-sessions": {
        "name": "tmux-sessions",
        "description": "Background process manager for dev servers and agents",
        "status_default": "down",
    },
}


def _log(message: str) -> None:
    print(f"[{time.strftime('%Y-%m-%d %H:%M:%S')}] {message}")


def _run_cmd(cmd: List[str], cwd: Optional[Path] = None, timeout: int = 10) -> Tuple[int, str, str]:
    proc = subprocess.run(
        cmd,
        cwd=str(cwd) if cwd else None,
        capture_output=True,
        text=True,
        timeout=timeout,
    )
    return proc.returncode, proc.stdout.strip(), proc.stderr.strip()


def _safe_json_lines(cmd: List[str], cwd: Optional[Path] = None, timeout: int = 15) -> List[Dict[str, Any]]:
    code, out, err = _run_cmd(cmd, cwd=cwd, timeout=timeout)
    if code != 0:
        raise RuntimeError(f"command failed: {' '.join(cmd)}: {err or 'exit ' + str(code)}")

    items: List[Dict[str, Any]] = []
    for line in out.splitlines():
        if not line.strip():
            continue
        try:
            parsed = json.loads(line)
            if isinstance(parsed, dict):
                items.append(parsed)
        except json.JSONDecodeError as exc:
            raise RuntimeError(f"invalid JSON from {' '.join(cmd)}: {exc}")
    return items


def _read_tailscale_status() -> Dict[str, bool]:
    code, out, err = _run_cmd(["tailscale", "status", "--json"], timeout=10)
    if code != 0:
        raise RuntimeError(f"tailscale status failed: {err}")

    payload = json.loads(out)
    peers: list[dict[str, Any]] = []

    if isinstance(payload, dict):
        if isinstance(payload.get("Self"), dict):
            self_entry = payload["Self"]
            peers.append(
                {
                    "TailscaleIPs": self_entry.get("TailscaleIPs", []),
                    "Online": bool(self_entry.get("Online", False)),
                }
            )

        all_peers = payload.get("Peer")
        if isinstance(all_peers, dict):
            for peer in all_peers.values():
                if isinstance(peer, dict):
                    peers.append(
                        {
                            "TailscaleIPs": peer.get("TailscaleIPs", []),
                            "Online": bool(peer.get("Online", False)),
                        }
                    )

    statuses: Dict[str, bool] = {}
    for resource_id, cfg in NODE_DEFINITIONS.items():
        is_online = False
        for ip in cfg["match_ips"]:
            for peer in peers:
                peer_ips = peer.get("TailscaleIPs")
                if isinstance(peer_ips, list) and ip in peer_ips:
                    is_online = bool(peer.get("Online", False))
                    break
            if is_online:
                break
        statuses[resource_id] = is_online

    return statuses


def _read_tailscale_summary() -> int:
    code, out, err = _run_cmd(["tailscale", "status", "--json"], timeout=10)
    if code != 0:
        raise RuntimeError(f"tailscale status failed: {err}")
    payload = json.loads(out)
    peer_map = payload.get("Peer") if isinstance(payload, dict) else {}
    count = 0
    if isinstance(peer_map, dict):
        for peer in peer_map.values():
            if isinstance(peer, dict) and peer.get("Online"):
                count += 1
    return count


def _read_docker_containers() -> List[Dict[str, Any]]:
    return _safe_json_lines(["docker", "ps", "--format", "json"], timeout=10)


def _read_tmux_sessions() -> List[str]:
    code, out, err = _run_cmd(["tmux", "list-sessions"], timeout=10)
    if code != 0:
        raise RuntimeError(f"tmux list-sessions failed: {err}")
    return [line.split(":", 1)[0].strip() for line in out.splitlines() if line.strip()]


def _read_cpu_load_percent() -> float:
    load1, _, _ = os.getloadavg()
    cores = os.cpu_count() or 1
    return min((load1 / cores) * 100.0, 1000.0)


def _read_memory_stats() -> Tuple[float, float, float]:
    meminfo: Dict[str, int] = {}
    with open("/proc/meminfo", "r", encoding="utf-8") as handle:
        for line in handle:
            if ":" not in line:
                continue
            key, rest = line.split(":", 1)
            parts = rest.strip().split()
            if parts and parts[0].isdigit():
                meminfo[key] = int(parts[0]) * 1024

    total = meminfo.get("MemTotal", 0)
    if total <= 0:
        return 0.0, 0.0, 0.0

    available = meminfo.get("MemAvailable")
    if available is None:
        available = meminfo.get("MemFree", 0) + meminfo.get("Buffers", 0) + meminfo.get("Cached", 0)

    used = max(total - available, 0)
    used_pct = (used / total) * 100.0
    return used / (1024 ** 3), total / (1024 ** 3), used_pct


def _read_disk_stats() -> Tuple[float, float, float]:
    usage = disk_usage("/")
    used = usage.used
    total = usage.total
    used_pct = (used / total) * 100.0 if total else 0.0
    return used / (1024 ** 3), total / (1024 ** 3), used_pct


def _read_gpu_utilization() -> Optional[float]:
    code, out, err = _run_cmd(
        ["nvidia-smi", "--query-gpu=utilization.gpu", "--format=csv,noheader,nounits"],
        timeout=10,
    )
    if code != 0:
        raise RuntimeError(f"nvidia-smi failed: {err}")
    for line in out.splitlines():
        line = line.strip()
        if not line:
            continue
        try:
            return float(line)
        except ValueError:
            continue
    return None


def _check_openclaw_gateway() -> bool:
    try:
        with socket.create_connection(("127.0.0.1", 18789), timeout=2) as sock:
            sock.settimeout(2)
            sock.sendall(b"GET / HTTP/1.1\r\nHost: 127.0.0.1\r\nConnection: close\r\n\r\n")
            response = sock.recv(128)
            return bool(response)
    except Exception:
        return False


def _status_from_service(active: str) -> str:
    normalized = (active or "").strip().lower()
    if normalized == "active":
        return "healthy"
    if normalized in {"inactive", "failed", "deactivating", "not-found", "unknown"}:
        return "down"
    return "degraded"


def _to_search_text(fields: Dict[str, Any]) -> str:
    parts: List[str] = []
    for value in fields.values():
        if isinstance(value, str):
            parts.append(value)
        elif isinstance(value, list):
            parts.extend(str(item) for item in value if isinstance(item, str))
    return " ".join(parts)


def _http_post(url: str, payload: Dict[str, Any]) -> Dict[str, Any]:
    req = urllib.request.Request(
        url,
        data=json.dumps(payload).encode("utf-8"),
        headers={"Content-Type": "application/json"},
        method="POST",
    )
    with urllib.request.urlopen(req, timeout=12) as resp:
        body = resp.read().decode("utf-8")
    return json.loads(body)


def _http_mutation(args: Dict[str, Any]) -> bool:
    response = _http_post(
        f"{CONVEX_URL}/api/mutation",
        {
            "path": "contentResources:upsert",
            "args": args,
            "format": "json",
        },
    )
    if response.get("status") != "success":
        raise RuntimeError(f"convex mutation response: {response}")
    return True


def _http_run(args: Dict[str, Any]) -> bool:
    response = _http_post(
        f"{CONVEX_URL}/api/run/contentResources/upsert",
        {"args": args, "format": "json"},
    )
    if response.get("status") != "success":
        raise RuntimeError(f"convex run response: {response}")
    return True


def _cli_mutation(args: Dict[str, Any]) -> bool:
    args_json = json.dumps(args)
    for cmd in (
        ["npx", "convex", "run", "contentResources:upsert", args_json],
        ["npx", "convex", "run", "--prod", "contentResources:upsert", args_json],
    ):
        code, out, err = _run_cmd(cmd, cwd=WORKSPACE_ROOT, timeout=35)
        if code == 0:
            return True
        _log(f"CLI fallback failed ({' '.join(cmd)}): {err or out}")
    raise RuntimeError("convex CLI fallback failed")


def _upsert_resource(payload: Dict[str, Any], allow_http: bool = True) -> None:
    if not allow_http:
        _cli_mutation(payload)
        return

    try:
        _http_mutation(payload)
        return
    except Exception as exc:
        _log(f"HTTP mutation path failed: {exc}")

    try:
        _http_run(payload)
        return
    except Exception as exc:
        _log(f"HTTP run path failed: {exc}")

    _cli_mutation(payload)


def _collect_state() -> Tuple[Dict[str, str], Dict[str, str], Dict[str, str], List[str], int, int, Optional[float], List[Dict[str, Any]], int]:
    # Nodes
    node_states: Dict[str, str] = {}
    try:
        online_map = _read_tailscale_status()
        for resource_id in NODE_DEFINITIONS:
            node_states[resource_id] = "healthy" if online_map.get(resource_id, False) else "offline"
    except Exception as exc:
        _log(f"tailscale status failed: {exc}")
        for resource_id, cfg in NODE_DEFINITIONS.items():
            node_states[resource_id] = cfg["status_default"]

    # Daemons
    daemon_states = {
        "daemon:openclaw-gateway": "healthy" if _check_openclaw_gateway() else "down",
        "daemon:tmux-sessions": "down",
        "daemon:docker": "down",
        "daemon:tailscaled": "down",
    }

    try:
        tmux_sessions = _read_tmux_sessions()
        daemon_states["daemon:tmux-sessions"] = "healthy"
    except Exception as exc:
        _log(f"tmux check failed: {exc}")
        tmux_sessions = []
        daemon_states["daemon:tmux-sessions"] = DAEMON_DEFINITIONS["daemon:tmux-sessions"]["status_default"]

    try:
        code, out, err = _run_cmd(["systemctl", "is-active", "docker", "tailscaled"], timeout=10)
        if code == 0:
            lines = [line.strip() for line in (out or "").splitlines() if line.strip()]
            if len(lines) >= 2:
                daemon_states["daemon:docker"] = _status_from_service(lines[0])
                daemon_states["daemon:tailscaled"] = _status_from_service(lines[1])
        else:
            if err:
                _log(f"systemctl check failed: {err}")
    except Exception as exc:
        _log(f"systemctl check failed: {exc}")

    try:
        docker_containers = _read_docker_containers()
    except Exception as exc:
        _log(f"docker check failed: {exc}")
        docker_containers = []

    # Metrics
    try:
        mem_used, mem_total, mem_pct = _read_memory_stats()
    except Exception as exc:
        _log(f"memory check failed: {exc}")
        mem_used, mem_total, mem_pct = 0.0, 0.0, 0.0

    try:
        disk_used, disk_total, disk_pct = _read_disk_stats()
    except Exception as exc:
        _log(f"disk check failed: {exc}")
        disk_used, disk_total, disk_pct = 0.0, 0.0, 0.0

    try:
        cpu_pct = _read_cpu_load_percent()
    except Exception as exc:
        _log(f"cpu check failed: {exc}")
        cpu_pct = 0.0

    try:
        gpu_pct = _read_gpu_utilization()
    except Exception:
        gpu_pct = None

    cluster_states: Dict[str, str] = {
        "cluster:Orchestration": "OpenClaw 2026.2.26",
        "cluster:Memory": f"{mem_used:.1f} GB used / {mem_total:.1f} GB ({mem_pct:.1f}%)",
        "cluster:CPU": f"{cpu_pct:.1f}% load",
        "cluster:GPU": f"{gpu_pct:.1f}%" if gpu_pct is not None else "N/A",
        "cluster:Storage": f"{disk_used:.1f} GB used / {disk_total:.1f} GB ({disk_pct:.1f}%)",
        "cluster:Functions": f"{len(tmux_sessions)} active agents",
    }

    active_peers = 0
    try:
        active_peers = _read_tailscale_summary()
    except Exception as exc:
        _log(f"tailscale summary failed: {exc}")

    cluster_states["cluster:Interconnect"] = f"{active_peers} active peers, {len(docker_containers)} docker containers"

    if daemon_states.get("daemon:openclaw-gateway") != "healthy":
        cluster_states["cluster:Orchestration"] += " (gateway degraded)"

    return (
        node_states,
        daemon_states,
        cluster_states,
        tmux_sessions,
        len(docker_containers),
        active_peers,
        gpu_pct,
        docker_containers,
        len(docker_containers),
    )


def _node_payload(resource_id: str, status: str) -> Dict[str, Any]:
    cfg = NODE_DEFINITIONS[resource_id]
    fields: Dict[str, Any] = {
        "publicName": cfg["publicName"],
        "status": status,
        "specs": cfg["specs"],
        "role": cfg["role"],
        "services": cfg["services"],
    }
    if "privateName" in cfg:
        fields["privateName"] = cfg["privateName"]

    return {
        "resourceId": resource_id,
        "type": "network_node",
        "fields": fields,
        "searchText": _to_search_text(fields),
    }


def _daemon_payload(resource_id: str, status: str) -> Dict[str, Any]:
    cfg = DAEMON_DEFINITIONS[resource_id]
    fields = {
        "name": cfg["name"],
        "status": status,
        "description": cfg["description"],
    }
    return {
        "resourceId": resource_id,
        "type": "network_daemon",
        "fields": fields,
        "searchText": _to_search_text(fields),
    }


def _cluster_payload(resource_id: str, value: str) -> Dict[str, Any]:
    fields = {
        "key": resource_id.split(":", 1)[1],
        "value": value,
    }
    return {
        "resourceId": resource_id,
        "type": "network_cluster",
        "fields": fields,
        "searchText": _to_search_text(fields),
    }


def _diff(previous: Dict[str, str], current: Dict[str, str]) -> Dict[str, str]:
    return {k: v for k, v in current.items() if previous.get(k) != v}


def _run_loop(once: bool = False) -> None:
    prev_nodes: Dict[str, str] = {}
    prev_daemons: Dict[str, str] = {}
    prev_cluster: Dict[str, str] = {}

    while RUNNING:
        node_states, daemon_states, cluster_states, tmux_sessions, docker_count, tailscale_peers, gpu_pct, _docker_list, _ = _collect_state()

        node_changes = _diff(prev_nodes, node_states)
        daemon_changes = _diff(prev_daemons, daemon_states)
        cluster_changes = _diff(prev_cluster, cluster_states)

        if prev_nodes:
            for key, new_status in node_states.items():
                old = prev_nodes.get(key)
                if old and old != new_status:
                    _log(f"node {key.split(':',1)[1]}: {old} -> {new_status}")
        else:
            for key, status in node_states.items():
                _log(f"node {key.split(':',1)[1]} initial: {status}")

        if prev_daemons:
            for key, new_status in daemon_states.items():
                old = prev_daemons.get(key)
                if old and old != new_status:
                    _log(f"daemon {key.split(':',1)[1]}: {old} -> {new_status}")
        else:
            for key, status in daemon_states.items():
                _log(f"daemon {key.split(':',1)[1]} initial: {status}")

        if prev_cluster:
            for key, new_value in cluster_states.items():
                old = prev_cluster.get(key)
                if old and old != new_value:
                    _log(f"cluster {key.split(':',1)[1]}: {old} -> {new_value}")
        else:
            for key, value in cluster_states.items():
                _log(f"cluster {key.split(':',1)[1]} initial: {value}")

        updates: List[Dict[str, Any]] = []
        updates.extend(_node_payload(k, v) for k, v in sorted(node_changes.items()))
        updates.extend(_daemon_payload(k, v) for k, v in sorted(daemon_changes.items()))
        updates.extend(_cluster_payload(k, v) for k, v in sorted(cluster_changes.items()))

        if updates:
            _log(f"pushing {len(updates)} changed resources")
            for payload in updates:
                _upsert_resource(payload)
        else:
            _log("no state changes")

        prev_nodes = node_states
        prev_daemons = daemon_states
        prev_cluster = cluster_states

        # Keep required monitor output at human-debug level
        _log(f"status snapshot: {len(tmux_sessions)} tmux sessions, {docker_count} docker containers, tailscale peers={tailscale_peers}, gpu={gpu_pct if gpu_pct is not None else 'n/a'}")

        if once:
            break

        for _ in range(CHECK_INTERVAL_SECONDS):
            if not RUNNING:
                break
            time.sleep(1)


def _signal_handler(signum, _frame):
    global RUNNING
    RUNNING = False
    _log(f"received signal {signum}; shutting down")


def main() -> None:
    signal.signal(signal.SIGTERM, _signal_handler)
    signal.signal(signal.SIGINT, _signal_handler)

    once = "--once" in sys.argv
    if once:
        _log("running single cycle")
    else:
        _log(f"starting watcher; convex={CONVEX_URL}")

    _run_loop(once=once)


if __name__ == "__main__":
    main()
