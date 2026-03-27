#!/bin/bash
# Stop hook: run tests after Claude finishes, retry on failure
# exit 0 = continue, exit 2 = block (Claude resumes to fix)

set -euo pipefail

REPO_ROOT=$(git rev-parse --show-toplevel 2>/dev/null || pwd)
RETRY_FILE="/tmp/harness-test-retry-$(echo "$REPO_ROOT" | md5sum | cut -d' ' -f1)"
MAX_RETRIES=3

# Skip if no files changed
if git diff --quiet HEAD 2>/dev/null && git diff --cached --quiet 2>/dev/null; then
  exit 0
fi

# Read retry counter
RETRY_COUNT=0
[ -f "$RETRY_FILE" ] && RETRY_COUNT=$(cat "$RETRY_FILE")

# Max retries exceeded -> give up, let human handle
if [ "$RETRY_COUNT" -ge "$MAX_RETRIES" ]; then
  echo "Test failed $MAX_RETRIES times. Stopping for human review."
  rm -f "$RETRY_FILE"
  exit 0
fi

# Run tests
if bun run test 2>&1; then
  rm -f "$RETRY_FILE"
  exit 0
else
  RETRY_COUNT=$((RETRY_COUNT + 1))
  echo "$RETRY_COUNT" > "$RETRY_FILE"
  echo "Tests failed (attempt $RETRY_COUNT/$MAX_RETRIES). Fix and retry."
  exit 2
fi
