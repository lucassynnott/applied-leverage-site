#!/bin/bash
# Sync ADRs + Discoveries from workspace to web content directory.
# Run via cron or manually: ./scripts/sync-adrs.sh
#
# Copies ~/.openclaw/workspace/adr/*.md → apps/web/content/adrs/
# Copies ~/.openclaw/workspace/discoveries/*.md → apps/web/content/discoveries/
# Commits and pushes if there are changes.

set -euo pipefail

WORKSPACE_ADRS="$HOME/.openclaw/workspace/adr"
WORKSPACE_DISCOVERIES="$HOME/.openclaw/workspace/discoveries"
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
REPO_ROOT="$SCRIPT_DIR/.."
WEB_ADRS="$REPO_ROOT/apps/web/content/adrs"
WEB_DISCOVERIES="$REPO_ROOT/apps/web/content/discoveries"

# Ensure target dirs exist
mkdir -p "$WEB_ADRS" "$WEB_DISCOVERIES"

# Sync ADRs
if [ -d "$WORKSPACE_ADRS" ]; then
  rsync -av --delete --include='*.md' --exclude='*' "$WORKSPACE_ADRS/" "$WEB_ADRS/"
else
  echo "WARNING: ADR source not found at $WORKSPACE_ADRS"
fi

# Sync Discoveries
if [ -d "$WORKSPACE_DISCOVERIES" ]; then
  rsync -av --delete --include='*.md' --exclude='*' "$WORKSPACE_DISCOVERIES/" "$WEB_DISCOVERIES/"
else
  echo "WARNING: Discoveries source not found at $WORKSPACE_DISCOVERIES"
fi

# Check if anything changed
cd "$REPO_ROOT"
if git diff --quiet apps/web/content/adrs/ apps/web/content/discoveries/ \
   && [ -z "$(git ls-files --others --exclude-standard apps/web/content/adrs/ apps/web/content/discoveries/)" ]; then
  echo "No changes to sync."
  exit 0
fi

# Commit and push
git add apps/web/content/adrs/ apps/web/content/discoveries/
git commit -m "sync: ADRs + discoveries from workspace $(date +%Y-%m-%d)"
git push

echo "Synced and pushed."
