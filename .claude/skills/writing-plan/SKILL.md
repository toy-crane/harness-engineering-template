---
name: writing-plan
description: spec.yaml과 wireframe을 기반으로 구현 계획을 작성합니다. 빈칸 채우기로 미결정 사항을 해소하고, TDD 기반 task 목록을 생성합니다. "/writing-plan", "계획 작성", "구현 계획" 등으로 실행합니다.
argument-hint: "feature 이름"
---

# 구현 계획 작성

## Step 1: 전제 조건 확인

$ARGUMENTS에서 feature명을 추출한다.

다음 파일이 모두 존재하는지 확인한다:
- `artifacts/spec.yaml` — 없으면 "먼저 `/writing-spec <feature>`를 실행하세요." 출력 후 종료
- `artifacts/<feature>/wireframe.html` — 없으면 "먼저 `/sketching-wireframe <feature>`를 실행하세요." 출력 후 종료

## Step 2: 빈칸 채우기

`artifacts/<feature>/spec.md`, `artifacts/spec.yaml`, `artifacts/<feature>/wireframe.html`을 읽고, 구현에 필요하지만 아직 결정되지 않은 사항을 찾는다.

- **변경 비용이 큰 결정만 질문한다** (예: 상태 관리 전략, 외부 라이브러리 선택, 데이터 모델 구조)
- 한 번에 질문 하나, 2-4개 선택지 제시

## Step 3: UI 컴포넌트 탐색 (선택)

프로젝트에 `components.json`이 있으면 이 단계를 실행한다.

### 3-1: wireframe 컴포넌트 분석

wireframe의 각 화면에서 사용된 컴포넌트 패턴을 식별한다:
- 각 화면의 HTML 요소를 분석하여 사용된 컴포넌트 타입을 목록화한다 (예: Select, Switch, Progress Bar, Dropdown Menu 등)
- 식별된 컴포넌트를 각 task의 구현 대상에 구체적 타입으로 명시한다 (예: "필터 UI" → "Select 드롭다운으로 필터 UI 구현")

### 3-2: shadcn 레지스트리 탐색

wireframe의 UI 요소에 대해 shadcn 레지스트리(공식+커뮤니티)에서 후보를 탐색한다.

커뮤니티 레지스트리:
- 애니메이션/모션: `@magicui`, `@aceternity`, `@animate-ui`, `@motion-primitives`
- 마케팅/랜딩: `@tailark`
- 리치 텍스트 에디터: `@plate`
- AI 앱: `@ai-elements`

후보를 사용자에게 제시하고 선택을 받는다.
커스텀 컴포넌트는 레지스트리에 대안이 없을 때만 만든다.

## Step 4: 계획 문서 생성

`references/plan-template.md`를 읽고 그 형식에 맞춰 작성한다.

### 필수 스킬

다음 스킬은 항상 Required Skills에 포함한다:
- `vercel-react-best-practices` — React/Next.js 성능 최적화 규칙
- `web-design-guidelines` — Web Interface Guidelines 준수

### 계획 요건

- 위 필수 스킬과 추가로 필요한 스킬을 Required Skills에 나열한다
- Required Skills에 나열된 각 스킬의 SKILL.md를 읽고, 해당 스킬이 제공하는 실제 규칙 소스(rules/ 디렉토리 파일, 외부 URL 등)를 파악한 뒤, 각 task에 적용되는 구체적 소스를 참조 규칙에 나열한다
- 각 task는 대응하는 spec.yaml 시나리오 ID를 명시한다
- 각 task는 구현 대상(What)과 수용 기준을 포함한다. 절차(How)는 쓰지 않는다
- spec 테스트(*.spec.test.tsx) 생성을 첫 번째 task로 배치한다. 선행 작업이 필요하면 사유와 함께 앞에 배치한다

`artifacts/<feature>/plan.md`로 저장한다.
