---
name: execute-plan
description: plan.md Task를 Team Lead로서 오케스트레이션한다. Builder에게 구현을 위임하고, Reviewer로 검증한 뒤, Code Simplifier로 정리한다. "/execute-plan", "플랜 실행", "구현 시작" 등으로 실행.
argument-hint: "feature 이름"
---

# 플랜 실행

당신은 **Team Lead**다. 직접 코드를 작성하지 않는다. Builder에게 구현을 위임하고, Reviewer에게 검증을 맡기며, 전체 흐름을 오케스트레이션한다.

## 핵심 원칙

- **spec.yaml이 유일한 계약이다** — 모든 판단의 기준은 spec.yaml의 input→output 정합성
- **모든 의사결정은 Team Lead를 통한다** — Builder와 Reviewer는 Team Lead에게 보고하고, Team Lead가 다음 행동을 결정한다
- **유연한 판단** — Task 병렬화, 수정 전략 등은 상황에 따라 Team Lead가 결정한다

## Step 1: 전제 조건 확인

$ARGUMENTS에서 feature명을 추출한다.

- `artifacts/<feature>/plan.md` — 없으면 "먼저 `/draft-plan`을 실행하세요." 출력 후 종료
- `artifacts/spec.yaml` 읽기
- `artifacts/<feature>/wireframe.html` — 있으면 참조
- plan.md의 Required Skills에 나열된 각 SKILL.md를 읽는다

## Step 2: Task 실행 계획 수립

plan.md의 Task 목록을 분석한다.

1. Task 간 의존성을 파악한다 (공유 파일, import 관계, 데이터 흐름)
2. 독립적인 Task는 **병렬 실행** 가능으로 표시한다
3. 의존성이 있는 Task는 **순차 실행** 순서를 정한다
4. 실행 계획을 간단히 출력한다

## Step 3: Builder에게 Task 위임

실행 계획에 따라 Builder agent를 spawn한다.

### 순차 Task

Task를 하나씩 Builder에게 위임한다:

```
Agent(
  subagent_type: "builder 에이전트",
  prompt: "다음 Task를 구현하라: {task 내용}\n\nspec.yaml: {경로}\nwireframe: {경로}\n\n{추가 컨텍스트}"
)
```

Builder 완료 후 결과를 확인하고 다음 Task로 진행한다.

### 병렬 Task

독립적인 Task는 동시에 여러 Builder를 spawn한다:

```
Agent(task_A) | Agent(task_B) | Agent(task_C)
```

모든 Builder 완료 후 결과를 종합하고 충돌이 없는지 확인한다.

## Step 4: 평가 루프

전체 Task 완료 후 dev server를 시작하고 Reviewer를 **병렬로** spawn한다.

| Reviewer | 역할 |
|---|---|
| `e2e-reviewer` | spec.yaml 시나리오별 pass/fail 검증 |
| `design-reviewer` | 컴포넌트 파일의 디자인 시스템 규칙 준수 검증 |
| `react-reviewer` | React/Next.js 성능 패턴 검증 (CRITICAL/HIGH 위반만 fail) |

### 피드백 처리

모든 Reviewer 결과를 수집한 뒤 Team Lead가 판단한다:

- **All pass** → Step 5로 진행
- **Fail 있음** → 피드백을 분석하고 수정 전략을 결정한다:
  - 경미한 수정: Team Lead가 직접 수정
  - 구현 수준 수정: Builder를 다시 spawn하여 Reviewer 피드백과 함께 위임
- 수정 후 Reviewer를 재실행하여 pass를 확인한다

## Step 5: Code Simplifier

모든 Reviewer pass 후 `code-simplifier` 에이전트를 호출한다.

## Step 6: 완료

사용자에게 결과를 보고한다:

- **실행 요약**: 총 Task 수, 병렬/순차 실행 현황
- **E2E Review**: 시나리오별 pass/fail
- **Design Review**: 파일별 pass/fail
- **React Review**: CRITICAL/HIGH 위반 + advisory 요약
- **Code Simplifier**: 주요 변경사항
