---
name: draft-plan
description: spec.yaml 기반으로 구현 계획을 작성한다. skill-researcher로 관련 스킬을 찾고, TDD 기반 task 목록을 생성한다. "/draft-plan", "계획 작성", "구현 계획" 등으로 실행.
argument-hint: "feature 이름"
---

# 구현 계획 작성

## Step 1: 전제 조건 확인

$ARGUMENTS에서 feature명을 추출한다.

- `artifacts/spec.yaml` -- 없으면 "먼저 `/write-spec`을 실행하세요." 출력 후 종료
- `artifacts/<feature>/spec.md` -- 선택
- `artifacts/<feature>/wireframe.html` -- 선택

## Step 2: 스킬 탐색

`skill-researcher` 에이전트를 호출하여 이 feature의 시나리오에 도움이 될 스킬을 찾는다.

추천 목록을 사용자에게 보여주고, 확인/조정을 받는다.

## Step 3: 빈칸 채우기

위 아티팩트를 읽고, 구현에 필요하지만 아직 결정되지 않은 사항을 찾는다.

- 변경 비용이 큰 결정만 질문한다 (상태 관리 전략, 외부 라이브러리 선택, 데이터 모델 구조 등)
- 한 번에 질문 하나, 2-4개 선택지 제시

## Step 4: 계획 문서 생성

`references/plan-template.md`를 읽고 그 형식에 맞춰 작성한다.

### 계획 요건

- Step 2에서 확정한 스킬을 Required Skills에 나열한다
- Required Skills에 나열된 각 스킬의 SKILL.md를 읽고, 실제 규칙 소스(rules/ 디렉토리 파일, 외부 URL 등)를 파악한 뒤, 각 task의 참조 규칙에 구체적 소스를 나열한다
- 각 task는 대응하는 spec.yaml 시나리오 ID를 명시한다
- 각 task는 구현 대상(What)과 수용 기준을 포함한다. 절차(How)는 쓰지 않는다
- 첫 번째 task는 반드시 spec.yaml 시나리오를 테스트 뼈대로 변환한다 (Red). 이후 task에서 구현하며 Green으로 전환한다. 선행 작업이 필요하면 사유와 함께 앞에 배치한다
- Task 순서는 Architecture 의존성 순서를 따른다. 의존성이 적은 디렉토리부터 순서대로 구현하고, 각 task에서 해당 영역의 테스트를 Green으로 전환한다
- wireframe의 컴포넌트 타입을 task에 반영한다 (예: "필터 UI" 대신 "Select 드롭다운으로 필터 UI")

`artifacts/<feature>/plan.md`로 저장한다.

## Step 5: 독립 검토

`plan-reviewer` 에이전트를 호출하여 위 아티팩트와 plan.md 사이의 불일치를 검증한다.

갭이 있으면 사용자에게 보여주고, 반영할 갭을 선택받아 plan.md에 반영한다.

## 완료

사용자에게 `/execute-plan <feature>` 진행 여부를 안내한다.
