---
name: execute-plan
description: plan.md Task를 순차 실행하고, Evaluator로 검증한 뒤, Code Simplifier로 정리한다. "/execute-plan", "플랜 실행", "구현 시작" 등으로 실행.
argument-hint: "feature 이름"
---

# 플랜 실행

## Step 1: 전제 조건 확인

$ARGUMENTS에서 feature명을 추출한다.

- `artifacts/<feature>/plan.md` -- 없으면 "먼저 `/draft-plan`을 실행하세요." 출력 후 종료
- `artifacts/spec.yaml` 읽기
- `artifacts/<feature>/wireframe.html` -- 있으면 참조
- plan.md의 Required Skills에 나열된 각 SKILL.md를 읽는다

## Step 2: Task 순차 실행

plan.md의 Task를 순서대로 실행한다.

각 Task에서 TDD를 따른다:
1. 구현 테스트(*.test.tsx)를 먼저 작성한다 (Red)
2. 테스트를 통과하는 최소 코드를 구현한다 (Green)
3. spec 테스트와 구현 테스트 양쪽 통과를 유지하며 리팩터링

## Step 3: 평가 루프

전체 Task 완료 후 dev server를 시작하고 평가를 실행한다.

- E2E Review: spec.yaml 시나리오별 pass/fail 검증
- Design Review: 컴포넌트 파일의 디자인 시스템 규칙 준수 검증
- React Review: React/Next.js 성능 패턴 검증 (CRITICAL/HIGH 위반만 fail)
- 피드백 → 수정 → 재평가

## Step 4: Code Simplifier

모든 evaluator pass 후 `code-simplifier` 에이전트를 호출한다.

## Step 5: 완료

사용자에게 결과를 보고한다:
- E2E Review: 시나리오별 pass/fail
- React Review: CRITICAL/HIGH 위반 + advisory 요약
- Code Simplifier: 주요 변경사항
