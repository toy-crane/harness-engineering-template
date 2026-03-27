#!/bin/bash
# PostToolUse hook (Write|Edit): lint auto-fix
# exit 0 = continue, exit 2 = block (Claude retries)

set -eo pipefail

FILE_PATH=$(echo "${TOOL_INPUT:-"{}"}" | jq -r '.file_path // empty')
[ -z "$FILE_PATH" ] && exit 0

# Only lint supported file types
case "$FILE_PATH" in
  *.js|*.jsx|*.ts|*.tsx|*.mjs|*.json|*.css) ;;
  *) exit 0 ;;
esac

[ ! -f "$FILE_PATH" ] && exit 0

# Run lint fix
if ! bun run lint --fix "$FILE_PATH" 2>&1; then
  echo "Lint auto-fix failed for $FILE_PATH"
  exit 2
fi

exit 0
