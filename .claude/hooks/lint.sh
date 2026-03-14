#!/bin/bash

# stdin JSON에서 파일 경로 추출
FILE_PATH=$(jq -r '.tool_input.file_path')

# JS/TS 파일이 존재할 때만 ESLint 자동 수정 실행
if [[ -f "$FILE_PATH" && "$FILE_PATH" =~ \.(js|jsx|ts|tsx|mjs)$ ]]; then
    # 에러 출력 숨김 — Claude 응답에 노이즈 방지
    bunx eslint --fix "$FILE_PATH" 2>/dev/null
fi

# 조건 미충족 시 exit 0으로 훅 성공 처리 (exit 2면 작업 차단됨)
