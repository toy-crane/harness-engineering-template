#!/bin/bash
# PreToolUse hook (Bash): detect secrets before git commit
# Requires: brew install gitleaks
# exit 0 = continue, exit 2 = block

set -euo pipefail

# Only intercept git commit commands
COMMAND=$(echo "$TOOL_INPUT" | jq -r '.command // empty')
case "$COMMAND" in
  *"git commit"*|*"git add"*) ;;
  *) exit 0 ;;
esac

# Check if gitleaks is installed
if ! command -v gitleaks &>/dev/null; then
  echo "Warning: gitleaks not installed. Run: brew install gitleaks"
  exit 0
fi

# Scan staged files
if ! gitleaks protect --staged --no-banner 2>&1; then
  echo "Secrets detected in staged files. Remove them before committing."
  exit 2
fi

exit 0
