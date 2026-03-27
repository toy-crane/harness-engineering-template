---
name: write-spec
description: 유저와 대화하며 기능의 스펙을 작성한다. 사용자 흐름을 시뮬레이션하고, 빈칸을 질문으로 채운 뒤, spec.md(논의 기록)와 spec.yaml(검증 가능한 요구사항)을 생성한다. "/write-spec", "스펙 작성", "기능 정의" 등으로 실행.
argument-hint: "기능 설명"
---

# 스펙 작성

## Step 1: 사전 탐색

기존 기능을 확장하는 경우, 질문 전에 먼저 탐색한다:

- `spec.yaml`에서 관련 시나리오 읽기
- `artifacts/<feature>/spec.md` 확인
- 관련 컴포넌트의 현재 구현 확인

완전히 새로운 기능이면 이 단계를 건너뛴다.

## Step 2: 반복 질문

`$ARGUMENTS`에 대해 사용자 흐름을 시뮬레이션하며 빈칸을 찾는다.
각 단계에서 정상 경로, 에러 경로, 경계 조건, 기존 기능과의 교차점을 확인한다.

변경 비용으로 분류한다:
- **변경 비용이 큰 것**: 반드시 질문한다
- **변경 비용이 작은 것**: 기본값을 제안하고 넘어간다

### 질문 규칙

- 한 번에 질문 하나. 2-4개 선택지를 제시한다
- 질문 전에 코드베이스에서 답을 찾을 수 있는지 먼저 확인한다
- 기존 시나리오와의 교차점이 있으면 구체적으로 언급하며 질문한다
- 3회 이상 새로운 발견이 없으면 다음 단계로 이동한다. 단, 변경 비용이 큰 미탐색 분기가 있으면 먼저 질문한다

## Step 3: spec.md 생성

`references/spec-template.md`를 읽고 그 형식에 맞춰 작성한다.

### 작성 규칙

- 모든 성공 기준이 구체적 입력 -> 기대 출력을 명시하는가
- 범위 제외 항목에 이유가 있는가
- 미결정 사항은 사용자가 모른다고 답한 항목만 기록한다

파일명: `artifacts/<feature-name>/spec.md`

## Step 4: spec.yaml 추출

spec.md의 시나리오를 spec.yaml에 추출한다. `references/scenario-guide.md`의 기준과 `references/spec-example.yaml`의 구조를 따른다.

### 추출 규칙

- ID 형식: `{FEATURE}-{NNN}` (기존 번호와 충돌하지 않게 이어서 부여)
- 기존 spec.yaml이 있으면 features에 append한다. 없으면 새로 생성한다
- `examples`의 input/expect는 화면에서 확인 가능한 구체적 값으로 작성한다

### 검증 체크리스트 (저장 전)

- [ ] input이 구체적 값인가 (플레이스홀더가 아닌 실제 값)
- [ ] expect가 화면에서 단언 가능한 값인가 (내부 상태가 아님)
- [ ] given/when/then이 `references/scenario-guide.md` 기준을 충족하는가
- [ ] 동일한 의미의 중복 시나리오가 없는가
- [ ] examples가 1개 이상인가

## Step 5: 독립 검토

spec.yaml 저장 후, `spec-reviewer` 에이전트를 호출하여 spec.md와 spec.yaml 사이의 누락 시나리오를 검증한다.

갭이 있으면 사용자에게 보여주고, 반영할 갭을 선택받아 Step 4의 규칙을 적용하여 추가한다.

## 완료

spec에 UI 변경이 포함되어 있으면 `/sketch-wireframe`을, 없으면 `/draft-plan`을 안내한다.
