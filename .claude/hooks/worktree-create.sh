#!/bin/bash
set -e

# Read worktree name from stdin (JSON: {"name": "..."})
INPUT=$(cat)
NAME=$(echo "$INPUT" | jq -r '.name')
PROJECT_ROOT="$(git rev-parse --show-toplevel)"
WORKTREE_PATH="$PROJECT_ROOT/.claude/worktrees/$NAME"

# Fetch latest main and create worktree from origin/main
git fetch origin main >/dev/null 2>&1
git worktree add "$WORKTREE_PATH" -b "$NAME" origin/main >/dev/null 2>&1

# Copy only gitignored .env files (tracked ones already exist in worktree)
find "$PROJECT_ROOT" -maxdepth 2 -name '.env*' -type f \
  -not -path '*/node_modules/*' \
  -not -path '*/.claude/*' | while read -r f; do
  rel="${f#$PROJECT_ROOT/}"
  git -C "$PROJECT_ROOT" check-ignore -q "$rel" 2>/dev/null || continue
  target="$WORKTREE_PATH/$rel"
  mkdir -p "$(dirname "$target")"
  cp "$f" "$target"
done

# Install dependencies
echo "Running bun install..." >&2
(cd "$WORKTREE_PATH" && bun install) >&2

# Print the absolute path to stdout (required by Claude Code)
echo "$WORKTREE_PATH"
