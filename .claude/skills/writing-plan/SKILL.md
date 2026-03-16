---
name: writing-plan
description: spec.yaml과 wireframe을 기반으로 구현 계획을 작성합니다. 빈칸 채우기로 미결정 사항을 해소하고, TDD 기반 task 목록을 생성합니다. "/writing-plan", "계획 작성", "구현 계획" 등으로 실행합니다.
argument-hint: "feature 이름"
---

# 구현 계획 작성

artifacts(spec.yaml, spec.md, wireframe)로부터 AI가 독립적으로 구현 가능한 task 단위의 계획을 생성한다.

## Step 1: 전제 조건 확인

$ARGUMENTS에서 feature명을 추출한다.

다음 파일이 모두 존재하는지 확인한다:
- `artifacts/spec.yaml` — 없으면 "먼저 `/spec <feature>`를 실행하세요." 출력 후 종료
- `artifacts/<feature>/wireframe.html` — 없으면 "먼저 `/wireframe <feature>`를 실행하세요." 출력 후 종료

## Step 2: 빈칸 채우기

`artifacts/<feature>/spec.md`, `artifacts/spec.yaml`, `artifacts/<feature>/wireframe.html`을 읽고, 구현에 필요하지만 아직 결정되지 않은 사항을 찾는다.

- artifacts에 이미 답이 있거나, 프로젝트에 이미 사용 중인 기술은 질문하지 않는다
- AI가 합리적으로 판단할 수 있는 사소한 결정은 질문하지 않는다
- **변경 비용이 큰 결정만 질문한다** (예: 상태 관리 전략, 외부 라이브러리 선택, 데이터 모델 구조)
- 한 번에 질문 하나. `AskUserQuestion`을 사용하고 2-4개 선택지를 제시한다
- 사용자가 중지 신호를 보내거나 더 이상 새로운 발견이 없으면 다음 단계로 이동한다

## Step 3: 계획 문서 생성

`references/plan-template.md`를 읽고 그 형식에 맞춰 작성한다.

### 계획 요건

- 빈칸 채우기 결과를 Architecture Decisions에 기록한다
- wireframe의 UI 요소를 프로젝트 컴포넌트 시스템에 매핑하고, 부족한 컴포넌트를 식별한다
- 구현에 필요한 스킬을 Required Skills에 기록한다
- 각 task는 대응하는 spec.yaml 시나리오 ID를 명시한다
- 각 task는 구현 대상(What)과 수용 기준을 포함한다. 절차(How)는 쓰지 않는다
- spec 테스트(*.spec.test.tsx) 생성을 첫 번째 task로 배치한다. 선행 작업이 필요하면 사유와 함께 앞에 배치한다
- 각 task 완료 시 커밋한다

### 저장

- 파일명: `artifacts/<feature>/plan.md`
- 저장 전 사용자에게 확인

## Step 4: 완료

산출물: `artifacts/<feature>/plan.md`

다음 단계 안내: "구현을 시작하려면 plan.md의 Task 1부터 진행하세요."
