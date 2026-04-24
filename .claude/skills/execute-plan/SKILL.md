---
name: execute-plan
description: plan.md의 Task를 메인 컨텍스트에서 직접 실행한다. CLAUDE.md → Testing의 TDD 규율을 따르고, 각 Task를 한 커밋으로 구현한 뒤 code-reviewer 피드백과 사용자 리뷰를 받는다. "/execute-plan", "execute plan", "플랜 실행", "구현 시작" 등으로 실행한다.
argument-hint: "feature name"
---

# Execute Plan

plan.md의 Task를 메인 컨텍스트에서 한 번에 하나씩 직접 구현한다. 구현은 직접 수행하고, 독립 검증은 Reviewer sub-agent(`code-reviewer`)에 위임한다. 판단(재정렬·범위·복구 경로·피드백 수용 기준)은 전부 직접 내린다.

## Core Principles

- **Spec 준수가 목표, 프로세스는 수단이다** — 유일한 목표는 spec.md의 성공 기준을 충족하는 것이다. 그 목표를 위해 프로세스는 자유롭게 조정할 수 있다
- **구현은 메인에서, 검증은 sub-agent로** — 코드는 직접 쓴다. 독립 코드 리뷰는 `code-reviewer`를 호출해 받는다
- **유연한 판단의 범위** — Task 재정렬/병합, spec 범위 밖 피드백 무시, 접근 전환, 사용자에게 escalate 등은 상황에 따라 결정한다
- **판단을 Harness Signal과 함께 기록한다** — 판단은 `artifacts/<feature>/decisions.md`에 기록한다. **Harness Signal** 필드는 이 판단이 재발할 가능성이 있을 때, 향후 규칙으로 승격할 단서를 남기는 자리다 (자세한 형식은 `references/decisions-template.md`)

## Step 1: 전제 조건 확인

`$ARGUMENTS`에서 feature 이름을 추출한다.

- `artifacts/<feature>/plan.md` — 없으면 "`/draft-plan`을 먼저 실행하세요." 출력 후 중단
- `artifacts/<feature>/spec.md` 읽기
- `artifacts/<feature>/wireframe.html` — 있으면 참조
- plan.md의 Required Skills에 나열된 각 SKILL.md 읽기
- `references/decisions-template.md` 읽기 — decisions.md 기록 형식 확인

RED → GREEN 규율은 `CLAUDE.md` → Testing을 따른다. 실패 시 우회하지 않고 근본 원인을 찾는다.

## Step 2: Task 순서 결정

plan.md의 Task 목록을 분석한다.

1. Task 간 의존성을 식별한다 (공유 파일, import 관계, 데이터 흐름)
2. 실행 순서를 결정한다 — 순차적, 의존성 우선
3. 순서를 간단히 출력한다

순서와 근거를 decisions.md에 기록한다.

## Step 3: Task 실행

Step 2의 순서대로 Task를 한 번에 하나씩 구현한다. 각 Task에 대해:

1. 수용 기준을 읽는다
2. 적합한 곳에 TDD (RED → GREEN)를 적용한다
3. 기준을 충족하는 최소 코드를 구현한다
4. `bun run build`와 영향받은 테스트를 실행한다
5. Task당 conventional commit 하나를 만든다
6. plan.md에서 Task를 완료로 표시한다

실패 시 우회하지 않고 근본 원인을 찾는다. 판단(spec 모호성, 범위 변경, 복구 경로, 사용자 escalation)을 Harness Signal과 함께 decisions.md에 기록한다.

## Step 4: 독립 코드 리뷰 (code-reviewer)

모든 Task 구현이 끝나면 `code-reviewer` 에이전트를 호출한다. 리뷰어는 다섯 차원(정확성/가독성/아키텍처/보안/성능)으로 평가하고 Critical/Important/Suggestion으로 분류한다.

결과 처리:
- **Critical**: 직접 수정하고 영향받은 테스트 재실행
- **Important**: 직접 수정 (spec 범위 밖 제안이면 decisions.md에 근거 기록 후 기각)
- **Suggestion**: Step 5 보고에만 언급, 반영은 선택적

판정을 decisions.md에 Harness Signal과 함께 기록한다.

## Step 5: Human Review

모든 Task가 완료되면 사용자에게 요약을 제시한다:

- Task별 수용 기준 상태 (pass / partial / fail)
- `bun run build`와 테스트 결과
- spec.md Scenario별로 관찰 가능한 결과

사용자에게 spec.md 대비 feature를 검증해 달라고 요청한다. 피드백이 있으면 직접 수정하고 재검증한다. 판단을 decisions.md에 기록한다.

리팩터링이 필요하다고 판단되면 선택적으로 `/simplify`를 실행하고 재검증한다.

## Step 6: Done

사용자에게 결과를 보고한다:

- **실행 요약**: 전체 Task 개수, 생성된 커밋
- **Scenario 커버리지**: spec.md의 어느 Scenario들이 관찰 가능하게 충족되었는가
- **Decision log**: decisions.md 경로 제공 — 보고 전에 남은 모든 `Pending`을 마무리하고, **Harness Signal** 항목들의 짧은 요약을 포함해 미래 하네스 튜닝에 쓸 수 있게 한다
