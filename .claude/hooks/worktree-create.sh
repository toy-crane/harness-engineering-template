#!/bin/bash
set -e

# Read worktree name from stdin (JSON: {"name": "..."})
INPUT=$(cat)
NAME=$(echo "$INPUT" | jq -r '.name')
PROJECT_ROOT="$(git rev-parse --show-toplevel)"
WORKTREE_PATH="$PROJECT_ROOT/.claude/worktrees/$NAME"

# 이미 worktree가 존재하면 경로만 반환
if [ -d "$WORKTREE_PATH" ]; then
  echo "$WORKTREE_PATH"
  exit 0
fi

# Fetch latest and update local main
if ! git fetch origin main >&2 2>&1; then
  echo "Error: failed to fetch origin/main" >&2
  exit 1
fi
if ! git rebase origin/main main >&2 2>&1; then
  echo "Error: failed to rebase local main onto origin/main" >&2
  git rebase --abort >&2 2>&1 || true
  exit 1
fi

# Create worktree from local main
if ! git worktree add "$WORKTREE_PATH" -b "$NAME" main >&2 2>&1; then
  echo "Error: failed to create worktree at $WORKTREE_PATH (branch: $NAME)" >&2
  exit 1
fi

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
