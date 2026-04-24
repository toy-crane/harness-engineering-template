---
name: draft-plan
description: spec.md를 기반으로 구현 계획(artifacts/<feature>/plan.md)을 작성한다. **모호하거나, 여러 파일에 걸치거나, 30분 이상 걸리는 product feature에만 사용한다 — meta-tooling(skills/rules/hooks/repo config), 한 줄 수정, 명백한 변경에는 쓰지 않는다.** 관련 스킬을 찾아내고 vertical slicing과 의존성 순서로 TDD 기반 Task 목록을 생성한다. "/draft-plan", "draft plan", "계획 작성", "구현 계획" 등으로 실행한다.
argument-hint: "feature name"
---

# 구현 계획 작성

## Step 1: 전제 조건 확인

`$ARGUMENTS`에서 feature 이름을 추출한다.

Feature별 필수:
- `artifacts/<feature>/spec.md` — 없으면 "`/write-spec <feature>`를 먼저 실행하세요." 출력 후 중단

Feature별 선택:
- `artifacts/<feature>/wireframe.html`

## Step 2: Plan Mode 진입

읽기 전용 모드로 동작한다. 프로젝트 파일을 생성/수정/삭제하지 않는다.

이 스킬의 유일한 출력 파일은 `artifacts/<feature>/plan.md` 다.

## Step 3: 코드베이스 탐색

기존 코드를 탐색하여 아키텍처와 관련 패턴을 이해한다.

- 프로젝트 구조, 기존 컴포넌트, 상태 관리 방식을 확인한다
- 이 feature가 영향을 줄 파일과 그 의존성 관계를 식별한다
- 컴포넌트 간 의존성을 맵핑한다 — 무엇이 무엇에 의존하는가
- 유사한 기존 기능이 있다면 그 구현을 참조한다
- 위험과 미지수를 기록한다

## Step 4: 스킬 탐색

`.claude/skills/`를 스캔하여 이 feature와 조금이라도 연관이 있는 모든 스킬을 선택한다.
망설여지면 포함한다 — 구현자는 필요 없는 것을 무시할 수 있다.

**항상 따른다** (feature와 무관하게):
- `CLAUDE.md` → Testing 참조 — 행동을 추가하거나 수정하는 모든 Task는 RED → GREEN 규율을 따르고 각 acceptance 항목을 테스트 케이스에 매핑한다. CLAUDE.md가 프로젝트의 success-criteria 원칙, 스택, 배치 규칙을 정의한다.

## Step 5: 빈칸 채우기

위 입력을 읽고 구현에 필요하지만 아직 결정되지 않은 항목을 찾는다.

- 변경 비용이 높은 결정만 묻는다
- 한 번에 하나씩, 2-4개 선택지를 제시한다

## Step 6: 계획 문서 생성

확정된 각 스킬의 SKILL.md를 읽는다. plan은 실행 중 로드될 규칙과 모순되지 않아야 한다.

`references/plan-template.md`를 읽고 그 형식을 따른다.

### Task 작성 원칙

#### Vertical Slicing

각 Task는 하나의 완전한 경로를 통해 동작하고 테스트 가능한 기능을 전달하는 vertical slice여야 한다. horizontal layer가 아니다.

나쁜 예 (horizontal slicing):
```
Task 1: 전체 데이터베이스 스키마 구축
Task 2: 모든 API 엔드포인트 구축
Task 3: 모든 UI 컴포넌트 구축
Task 4: 전부 연결
```

좋은 예 (vertical slicing):
```
Task 1: 사용자가 계정을 생성할 수 있다 (스키마 + API + 가입 UI)
Task 2: 사용자가 로그인할 수 있다 (auth 스키마 + API + 로그인 UI)
Task 3: 사용자가 할 일을 만들 수 있다 (할 일 스키마 + API + 생성 UI)
```

#### Task Sizing

목표: S (1-2 파일) 또는 M (3-5 파일). L 이상은 금지.

다음의 경우 Task를 더 쪼갠다:
- Acceptance criteria가 3개를 초과한다
- 독립적인 서브시스템 2개 이상에 닿는다
- 제목에 "and"가 있다 (두 개의 Task라는 신호)

#### Acceptance

각 Task의 **Acceptance** 섹션은 **Covers**에 나열된 시나리오의 성공 기준에서 파생된 자연어 결과의 체크리스트다. 이 Task가 커버하는 성공 기준 하나당 한 항목. spec의 구체적 값을 사용한다 — 의역은 허용되지만 결과는 외부에서 관찰 가능해야 한다.

**각 acceptance 항목은 이를 증명하는 테스트 케이스에 1:1로 매핑되어야 한다.** 수용 기준이 실제로 증명되는 가장 낮은 경계를 선택한다. mock이 기준을 가린다면 거기서 mock하지 않는다 (`CLAUDE.md` → Testing 참조).

Task의 **Covers** 줄은 어떤 시나리오가 다뤄지는지와 커버가 완전한지 부분적인지를 명시한다. 부분적이라면 어떤 부분인지 적는다 (예: "happy path only", "validation only").

#### Verification

각 Acceptance 항목은 **어떻게 검증되는지**를 명시해야 한다 — 명령, MCP 단계, 또는 구체적 human review. 미래의 독자가 그 점검을 독립적으로 재실행할 수 있어야 완료다. 가장 낮은 증명 가능 경계를 선택한다.

| 증명 가능한 곳 | 사용 |
|---|---|
| 코드 (DOM, 함수, DB, HTTP) | Vitest / `bun run build` |
| 실제 브라우저, CI에서 반복 가능 | Playwright (`bun run test:e2e`) |
| 실제 브라우저, 일회성 증거 | Browser MCP (`mcp__claude-in-chrome__*`) |
| 자동화 불가능 (디자인 판단, 스크린 리더 AT, cross-browser 느낌, 도구에 없는 성능 임계값) | Human review — 리뷰어/역할, 산출물, 기준을 명시한다. 증거(스크린샷/영상/노트)를 `artifacts/<feature>/evidence/`에 저장한다. |

`manual: visit X`를 *자동화 가능한* 점검의 자리표로 쓰는 것은 허용되지 않는다. 명명된 human review는 허용된다 — 판정 기준은 "다른 사람이 이 항목만 보고 같은 점검을 다시 할 수 있는가?" 다.

Verification 블록의 구체적 형태는 `references/plan-template.md`를 본다.

#### Ordering

- 테스트 파일 생성을 먼저 둔다 (colocated `<file>.test.tsx`, App Router 페이지는 `app/**/__tests__/` — `CLAUDE.md` → Testing 참조). 선행 작업이 필요하면 이유와 함께 앞에 둔다
- 의존성이 적은 Task부터 순서를 잡는다
- 고위험 Task를 앞에 둔다 (fail fast)
- 각 Task는 시스템을 동작 가능한 상태로 두어야 한다

#### Checkpoint Discipline

Task 2-3개마다 체크포인트를 삽입한다. 체크포인트는 다음을 검증한다: 모든 테스트 통과, 빌드 성공, vertical slice가 end-to-end로 동작.

#### Wireframe Integration

- wireframe.html이 있으면 Task의 implementation targets에 컴포넌트 유형을 반영한다
- wireframe에서 식별된 컴포넌트 중 프로젝트에 없는 것은 직접 구현하기 전에 패키지 레지스트리에서 설치 가능 여부를 확인한다

#### 기타

- Affected Files 섹션에 코드베이스 탐색 결과를 반영한다
- Task references에는 실행자가 스스로 찾을 수 없는 외부 소스만 포함한다 (스킬은 이름 + 키워드만)

`artifacts/<feature>/plan.md`로 저장한다.

## Step 7: Human Review 제시

제시하기 전에 자체 점검:
- spec.md의 모든 시나리오가 어느 Task의 **Covers**에 포함되어 있는가
- 모든 Acceptance 항목에 대응하는 Verification 명령/단계가 있는가
- 2-3 Task마다 Checkpoint가 있는가

완성된 plan.md를 사용자에게 제시한다. 승인 또는 수정 요청을 받는다. 요청된 변경을 반영한다. 사용자가 승인할 때까지 진행하지 않는다.

## Done

사용자에게 `/execute-plan <feature>`로 진행할지 안내한다.
