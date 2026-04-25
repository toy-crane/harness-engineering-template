---
name: execute-plan
description: plan.md의 Task를 메인 컨텍스트에서 직접 구현한다. `artifacts/<feature>/plan.md`가 확정돼 각 Task를 실제로 실행할 준비가 된 상태에서 트리거한다 — 사용자가 "이제 구현 시작", "플랜 실행" 같은 신호를 보낼 때. CLAUDE.md → Testing의 TDD 규율을 따르고, 각 Task를 한 커밋으로 구현한 뒤 `code-reviewer` 피드백과 사용자 리뷰를 받는다. plan.md 없이 바로 구현하려는 경우에는 쓰지 않는다. "/execute-plan", "플랜 실행", "구현 시작"으로도 호출한다.
argument-hint: "feature name"
---

# Execute Plan

plan.md의 Task를 메인 컨텍스트에서 한 번에 하나씩 직접 구현한다. 구현은 직접, 독립 검증은 `code-reviewer` sub-agent로 위임한다. 판단은 전부 직접 내리고 `artifacts/<feature>/learnings.md`에 기록해 다음 feature를 더 쉽게 만든다 — Compound Engineering 정신.

## Inputs / Outputs

| 입력 | 출력 |
|---|---|
| `artifacts/<feature>/plan.md`, `spec.md`, `wireframe.html`(있으면) | 코드 + 커밋, `artifacts/<feature>/learnings.md` |

## Workflow

### Step 1. 전제 조건 확인

`$ARGUMENTS`에서 feature 이름을 추출한다.

- `artifacts/<feature>/plan.md` — 없으면 "`/draft-plan`을 먼저 실행하세요." 출력 후 중단
- `artifacts/<feature>/spec.md` 읽기
- `artifacts/<feature>/wireframe.html` — 있으면 참조
- plan.md의 Required Skills에 나열된 각 SKILL.md 읽기
- `references/learnings-template.md` 읽기 — learnings.md 기록 형식 확인

### Step 2. Task 순서 결정

plan.md의 Task 목록을 분석한다.

1. Task 간 의존성을 식별한다 (공유 파일, import 관계, 데이터 흐름)
2. 실행 순서를 결정한다 — 순차, 의존성 우선
3. 순서를 간단히 출력한다

순서와 근거를 learnings.md에 기록한다.

### Step 3. Task 실행

Step 2의 순서대로 Task를 한 번에 하나씩 구현한다. 각 Task에 대해:

1. 수용 기준을 읽는다
2. **수용 기준이 코드로 표현 가능한 부분에 TDD (RED → GREEN)를 적용한다** — UI 시각 검증·디자인 판단 같은 부분은 제외. `CLAUDE.md` → Testing 규율을 따른다.
3. 기준을 충족하는 최소 코드를 구현한다
4. `bun run build`와 영향받은 테스트를 실행한다
5. Task당 conventional commit 하나를 만든다
6. plan.md에서 Task를 완료로 표시한다

실패 시 우회하지 않고 근본 원인을 찾는다 — 빌드 skip, 테스트 disable, 에러 swallow는 기술 부채를 가리는 단기 우회일 뿐이다.

#### 유연한 판단

상황에 따라 Task 재정렬·병합, spec 범위 밖 피드백 기각, 접근 전환, 사용자 escalation을 직접 결정한다. 다음 같은 판단은 기록할 가치가 있다:

- **재정렬이 정당한 경우**: Task 3이 Task 1의 출력에 의존하는데 plan이 역순으로 배치돼 있음 — 순서를 바꿔 throwaway stub을 없앤다
- **피드백 기각이 정당한 경우**: 사용자가 "비밀번호 재설정도 같이 해달라"고 요청 — spec 범위 밖, learnings.md에 근거 기록 후 "새 feature로 다루자"고 제안한다

판단은 learnings.md에 기록한다. 형식은 `references/learnings-template.md`에 있다.

### Step 4. 독립 코드 리뷰 (code-reviewer)

모든 Task 구현이 끝나면 `code-reviewer` 에이전트를 호출한다. 리뷰어는 다섯 차원(정확성·가독성·아키텍처·보안·성능)으로 평가하고 Critical / Important / Suggestion으로 분류한다.

#### 분류 원리

기준: **지금 안 고치면 다음에 얼마의 비용이 드는가**

- **Critical** — 머지하면 사용자·시스템에 즉각 손해. 직접 수정하고 영향받은 테스트 재실행. (예: PII 노출, 보안 취약점, 데이터 손실)
- **Important** — 동작은 하지만 다음 작업 비용을 누적시킴. 직접 수정 (spec 범위 밖이면 learnings.md에 근거 기록 후 기각). (예: 유지보수 부담, 중복)
- **Suggestion** — 동작·유지보수 영향 없음, 가독성·취향. Step 7 보고에만 언급, 반영은 선택적. (예: 변수명, 미세 리팩터링)

판정을 learnings.md에 기록한다.

### Step 5. Human Review

모든 Task가 완료되면 사용자에게 요약을 제시한다:

- Task별 수용 기준 상태 (pass / partial / fail)
- `bun run build`와 테스트 결과
- spec.md Scenario별로 관찰 가능한 결과

사용자에게 spec.md 대비 feature를 검증해 달라고 요청한다. 피드백이 있으면 직접 수정하고 재검증한다. 판단을 learnings.md에 기록한다.

#### `/simplify` 트리거

새로 추가한 코드에 **중복(추상화 부채 신호)**이 보이면 `/simplify`를 실행한다.

- code-reviewer가 같은 패턴(예: 중복 fetch, 반복 분기)을 여러 곳에 걸쳐 지적했다 — 패턴 인식이 임계점을 넘었다는 신호
- 새로 추가한 코드가 기존 유틸·훅과 크게 겹친다 — 이미 존재하는 추상화를 우회하고 있다는 신호
- Task 간 복사-붙여넣기로 보이는 블록이 누적된다 — 공통화 시점이 지났다는 신호

실행 후 재검증한다.

### Step 6. Compound — 학습 즉시 반영

Compound Engineering 정신: 이번 feature가 다음 feature를 더 쉽게 만들도록 학습을 누적한다. 항상 실행한다 — 발견 없으면 "발견 없음"도 기록.

다음 3질문에 답해 사용자에게 제시한다:

1. **무엇이 잘 됐는가**
2. **무엇이 안 됐는가**
3. **다음에도 쓸 인사이트는 무엇인가**

#### 즉시 승격 vs 메모

- **명확한 인사이트** (재발 가능성 높음, 일반화 가능) → 사용자 승인 후 즉시 `.claude/rules/<name>.md` 또는 `CLAUDE.md`에 반영. learnings.md에는 `applied: rule`로 기록.
- **약한 신호** (재발 가능성 모호) → learnings.md에 `applied: not-yet`로 메모만. 여러 feature 누적 후 `/self-improve`가 회고로 분석.

판단 가이드:
- 같은 실수가 이미 다른 feature에서 발생한 적 있는가 → 즉시 승격
- 일반화 가능한 규칙으로 표현되는가 → 즉시 승격
- 이번 feature 특유의 우연인가 → 메모만

### Step 7. Done

사용자에게 결과를 보고한다:

- **실행 요약**: 전체 Task 개수, 생성된 커밋
- **Scenario 커버리지**: spec.md의 어느 Scenario들이 관찰 가능하게 충족되었는가
- **Compound 결과**: 즉시 승격된 원칙 + learnings.md에 남긴 메모 요약

이번 feature는 완료. 여러 feature 누적되면 **다음 단계**는 `/self-improve`로 약한 신호의 패턴을 회고하는 것이다.
