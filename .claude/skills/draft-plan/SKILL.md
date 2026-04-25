---
name: draft-plan
description: spec.md를 기반으로 구현 계획(artifacts/<feature>/plan.md)을 작성한다. **모호하거나, 여러 파일에 걸치거나, 30분 이상 걸리는 product feature에만 사용한다 — meta-tooling(skills/rules/hooks/repo config), 한 줄 수정, 명백한 변경에는 쓰지 않는다.** spec.md가 확정됐는데 어디서부터 시작할지 불명하거나 시나리오들이 서로 의존할 때 트리거한다. 관련 스킬을 찾아내고 vertical slicing과 의존성 순서로 TDD 기반 Task 목록을 생성한다. "/draft-plan", "draft plan", "계획 작성", "구현 계획" 등으로도 호출한다.
argument-hint: "feature name"
---

# Draft Plan

spec.md를 어떤 순서로, 어떤 단위로, 어떻게 검증하며 만들지 Task 단위 TDD 계획으로 쪼갠다.

## Inputs / Outputs

| 입력 | 출력 |
|---|---|
| `artifacts/<feature>/spec.md`, `wireframe.html` (있으면) | `artifacts/<feature>/plan.md` |

이 스킬은 plan.md만 만든다 — 다른 프로젝트 파일은 생성·수정하지 않는다 (구현은 `/execute-plan`에서).

## Workflow

### Step 1. 전제 조건

`$ARGUMENTS`에서 feature 이름을 꺼낸다.

- `artifacts/<feature>/spec.md` — 없으면 "`/write-spec <feature>`를 먼저 실행하세요." 출력 후 중단
- `artifacts/<feature>/wireframe.html` — 있으면 참조

### Step 2. Pre-exploration

plan을 쓰기 전에 이미 존재하는 맥락을 코드와 스킬 두 축에서 모은다.

#### 코드베이스

아키텍처, 관련 패턴, 영향받을 파일, 의존성, 유사 기능을 파악하고 위험을 기록한다.

#### 스킬

`.claude/skills/`를 스캔해 이 feature와 조금이라도 관련 있는 스킬을 모두 고른다 — 애매하면 포함한다. 빠진 스킬 때문에 plan이 프로젝트 규약과 어긋나는 쪽이 넘치는 쪽보다 비용이 크다.

### Step 3. 빈칸 채우기

Step 2의 입력을 읽고 구현에 필요하지만 아직 결정되지 않은 항목을 찾는다.

- **변경 비용이 높은 결정만 묻는다** — 후속 수정이 쉬운 건 묻지 않고 초안에서 판단한다
- **한 번에 하나씩, 2-4개 선택지를 제시한다** (사용자가 한 번에 답할 수 있는 분량)

### Step 4. plan.md 생성

Step 2에서 확정한 각 스킬의 SKILL.md를 읽는다 — plan이 실행 중 로드되는 규칙과 어긋나면 execute 단계에서 충돌이 터진다.

`references/plan-template.md`를 읽고 그 형식을 따른다. 원칙은 아래, 형식은 template가 담당한다.

#### Vertical Slicing

각 Task는 end-to-end로 동작하고 테스트 가능한 slice여야 한다. horizontal layer(DB-only, API-only, UI-only)로 쪼개지 않는다 — horizontal로 쪼개면 각 Task만으로는 end-to-end 테스트가 돌지 않아 회귀가 통합 시점에 한꺼번에 터진다. vertical이면 Task 하나가 끝났을 때 기능이 실제로 살아 있다.

```
OK (vertical):
Task 1: 사용자가 계정을 생성할 수 있다 (스키마 + API + 가입 UI)
Task 2: 사용자가 로그인할 수 있다 (auth 스키마 + API + 로그인 UI)
Task 3: 사용자가 할 일을 만들 수 있다 (todos 스키마 + API + 생성 UI)

NG (horizontal):
Task 1: 모든 DB 스키마
Task 2: 모든 API 엔드포인트
Task 3: 모든 UI 화면
```

#### Task Sizing

목표: S (1-2 파일) 또는 M (3-5 파일). L 이상은 금지 — 리뷰가 사실상 불가능해지고 되돌리기 비용이 급격히 커진다.

판정: 수용 기준이 너무 많거나, 여러 서브시스템에 닿거나, 제목에 "and"가 있으면 쪼갠다.

```
OK: "할 일 생성 API + 생성 폼" — 4 파일, 한 서브시스템(todos)
NG: "할 일 생성·수정·삭제 + 알림" — 10+ 파일, 두 서브시스템, 제목에 and
```

#### 수용 기준

각 Task의 **수용 기준**은 **담당 시나리오**의 성공 기준에서 파생된 자연어 결과 체크리스트다 — spec의 구체적 값을 사용하되 결과는 외부에서 관찰 가능해야 한다. 수용 기준이 내부 상태나 함수 호출을 가리키면 그 테스트는 구현에 결합되어 리팩터링마다 깨진다.

규율:
- 이 Task가 담당하는 spec 성공 기준 **하나당 한 항목**
- 각 항목은 **테스트 케이스에 1:1로 매핑**
- Task의 **담당 시나리오** 줄은 커버 범위를 명시한다 (예: `"Scenario 2 (happy path only)"`)

##### 수용 기준 판정

| 문장 | 판정 | 이유 |
|---|---|---|
| 새 할 일을 추가하면 리스트에 해당 항목이 나타난다 | OK | 외부에서 관찰 가능한 결과 |
| `addTodo()`가 호출된다 | NG | 구현 상세 — 리팩터링하면 깨진다 |
| 빈 제목을 제출하면 "제목을 입력하세요"가 표시된다 | OK | 사용자가 볼 수 있는 문자열 |
| `formState.error`가 `"required"`가 된다 | NG | 내부 상태 |

#### Verification

각 수용 기준 항목은 **어떻게 검증되는지**를 명시해야 한다 — 명령, MCP 단계, 또는 구체적 human review. 다른 사람이 같은 점검을 반복할 수 있어야 그 항목이 완료된 것이다. 가장 낮은 증명 경계를 선택한다.

| 증명 가능한 곳 | 사용 |
|---|---|
| 코드 (DOM, 함수, DB, HTTP) | Vitest / `bun run build` |
| 실제 브라우저, CI에서 반복 가능 | Playwright (`bun run test:e2e`) |
| 실제 브라우저, 일회성 증거 | Browser MCP (`mcp__claude-in-chrome__*`) |
| 자동화 불가능 (디자인 판단, 스크린 리더 AT, cross-browser 느낌, 도구에 없는 성능 임계값) | Human review — 리뷰어·역할·산출물·기준 명시. 증거는 `artifacts/<feature>/evidence/`에 저장 |

#### Ordering

- 테스트 파일 생성을 먼저 둔다
- 의존성이 적은 Task부터 순서를 잡는다
- **고위험 Task를 앞에 둔다** — fail-fast로 실패가 일찍 드러나면 sunk cost가 작고 plan을 조기에 재조정할 수 있다
- 각 Task는 시스템을 동작 가능한 상태로 두어야 한다

#### Checkpoint

Task 2-3개마다 체크포인트를 삽입한다 — 모든 테스트 통과 + 빌드 성공 + vertical slice의 end-to-end 동작을 검증한다. 중간 점검이 없으면 누적 실패가 끝에서 한꺼번에 드러나 원인을 거꾸로 추적해야 한다.

#### Wireframe 통합

- `wireframe.html`이 있으면 Task의 구현 대상에 컴포넌트 유형을 반영한다
- wireframe에서 식별된 컴포넌트 중 프로젝트에 없는 것은 직접 구현 전에 **패키지 레지스트리에서 설치 가능 여부를 먼저 확인**한다

#### 기타

- "영향받는 파일" 섹션에 코드베이스 탐색 결과를 반영한다
- Task 참조에는 실행자가 스스로 찾을 수 없는 외부 소스만 포함한다 (스킬은 이름 + 키워드)

파일명: `artifacts/<feature>/plan.md`

### Step 5. 독립 검토 (plan-reviewer)

`plan-reviewer` 에이전트를 호출해 plan.md를 검증한다. 입력:
- `artifacts/<feature>/spec.md`
- `artifacts/<feature>/plan.md`
- `artifacts/<feature>/wireframe.html` (있으면)

리뷰어는 네 축 — 시나리오/성공 기준 커버리지, wireframe 컴포넌트 일관성, plan 내부 정합성, 불변 규칙 커버리지 — 으로 검증한다. 불일치가 보고되면 사용자에게 제시하고, 어느 것을 수용해 plan.md에 반영할지 결정받는다.

### Step 6. Human Review & Handoff

완성된 plan.md를 사용자에게 제시한다. 승인 또는 수정 요청을 받는다. 요청된 변경을 반영한다. 사용자가 승인할 때까지 다음 단계로 진행하지 않는다.

승인되면 **다음 단계**는 `/execute-plan <feature>`다.
