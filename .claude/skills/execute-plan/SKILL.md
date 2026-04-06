---
name: execute-plan
description: plan.md Task를 Team Lead로서 오케스트레이션한다. Builder에게 구현을 위임하고, Reviewer로 검증한 뒤, Code Simplifier로 정리한다. "/execute-plan", "플랜 실행", "구현 시작" 등으로 실행.
argument-hint: "feature 이름"
---

# 플랜 실행

당신은 **Team Lead**다. 직접 코드를 작성하지 않는다. Builder에게 구현을 위임하고, Reviewer에게 검증을 맡기며, 전체 흐름을 오케스트레이션한다.

## 핵심 원칙

- **spec 정합성이 목적, 프로세스는 수단** — spec.yaml의 input→output이 일치하는 것이 유일한 목표다. 그 목표를 달성하기 위해서라면 프로세스는 자유롭게 조정할 수 있다
- **모든 의사결정은 Team Lead를 통한다** — Builder와 Reviewer는 Team Lead에게 보고하고, Team Lead가 다음 행동을 결정한다
- **유연한 판단의 범위** — Task 순서 변경/합치기, spec 범위 밖 피드백 무시, 접근 방식 전환, 사용자 에스컬레이션 등 상황에 따라 Team Lead가 결정한다
- **판단을 기록한다** — 자의적으로 내린 판단은 `artifacts/<feature>/decisions.md`에 기록한다 (시점, 내용, 근거)

## Step 1: 전제 조건 확인

$ARGUMENTS에서 feature명을 추출한다.

- `artifacts/<feature>/plan.md` — 없으면 "먼저 `/draft-plan`을 실행하세요." 출력 후 종료
- `artifacts/spec.yaml` 읽기
- `artifacts/<feature>/wireframe.html` — 있으면 참조
- plan.md의 Required Skills에 나열된 각 SKILL.md를 읽는다

## Step 2: 팀 편성

feature 특성을 분석하여 이번 실행에 필요한 팀원을 결정한다.

- **Builder**: Task 수와 병렬 가능성을 고려하여 필요한 수를 결정
- **Reviewer 선별**:
  - `wireframe-reviewer` — wireframe.html이 존재하고 UI 변경 Task가 있을 때
  - `design-reviewer` — UI 컴포넌트가 있을 때만
  - `react-reviewer` — React/Next.js 코드가 있을 때만

팀 편성 결정과 근거를 decisions.md에 기록한다.

## Step 3: Task 실행 계획 수립

plan.md의 Task 목록을 분석한다.

1. Task 간 의존성을 파악한다 (공유 파일, import 관계, 데이터 흐름)
2. 독립적인 Task는 **병렬 실행** 가능으로 표시한다
3. 의존성이 있는 Task는 **순차 실행** 순서를 정한다
4. 실행 계획을 간단히 출력한다

## Step 4: Builder에게 Task 위임

실행 계획에 따라 `builder` agent를 spawn한다. 각 Builder에게 Task 내용, spec.yaml 경로, wireframe 경로, 구현 앱 URL을 전달한다.

- 순차 Task: 하나씩 위임하고 결과 확인 후 다음으로 진행
- 병렬 Task: 독립적인 Task는 동시에 여러 Builder를 spawn하고 완료 후 결과 종합

## Step 5: 평가 루프

전체 Task 완료 후 Step 2에서 선별한 Reviewer를 **병렬로** spawn한다. wireframe-reviewer에게는 feature명, 구현 앱 URL, wireframe screen ↔ 구현 URL 경로 매핑을 함께 전달한다.

### 피드백 처리

모든 Reviewer 결과를 수집한 뒤 Team Lead가 판단한다:

- **All pass** → Step 6으로 진행
- **Fail 있음** → 피드백을 분석하고 수정 전략을 결정한다:
  - 경미한 수정: Team Lead가 직접 수정
  - 구현 수준 수정: Builder를 다시 spawn하여 Reviewer 피드백과 함께 위임
- 수정 후 Reviewer를 재실행하여 pass를 확인한다

수정 전략 판단을 decisions.md에 기록한다.

## Step 6: Code Simplifier

모든 Reviewer pass 후 `code-simplifier` 에이전트를 호출한다.

## Step 7: 완료

사용자에게 결과를 보고한다:

- **실행 요약**: 총 Task 수, 병렬/순차 실행 현황, 팀 구성
- **Reviewer 결과**: 실행한 Reviewer별 pass/fail
- **Code Simplifier**: 주요 변경사항
- **판단 기록**: decisions.md 경로 안내
