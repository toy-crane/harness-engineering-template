#!/bin/bash
FILE_PATH=$(jq -r '.tool_input.file_path')

if [[ ! "$FILE_PATH" =~ \.(js|jsx|ts|tsx|mjs)$ ]]; then
  exit 0
fi

RESULT=$(bunx eslint --fix "$FILE_PATH" 2>&1)
ESLINT_EXIT=$?

if [ $ESLINT_EXIT -eq 0 ]; then
  exit 0
elif [ $ESLINT_EXIT -eq 1 ]; then
  echo "$RESULT" >&2
  exit 2
else
  exit 1
fi
