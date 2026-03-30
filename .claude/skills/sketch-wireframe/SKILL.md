---
name: sketch-wireframe
description: spec.yaml 기반 HTML 와이어프레임을 생성한다. 레이아웃을 시각적으로 확인하고 피드백 루프를 돌린다. UI 기능이 포함된 프로젝트에서만 사용. "/sketch-wireframe", "와이어프레임", "wireframe", "레이아웃 확인" 등으로 실행.
argument-hint: "feature 이름"
---

# Wireframe: Spec → HTML 와이어프레임

레이아웃 검증이 목적이다. 디자인이 아니다.

## 전제 조건

`artifacts/spec.yaml`에서 해당 feature의 시나리오를 확인한다. 없으면 "먼저 `/write-spec`을 실행하세요." 출력 후 종료.

## 스타일 규칙

- 모바일 레이아웃을 먼저 완성한다. 데스크톱은 `@md:`로 확장한다.
- `assets/template.html`의 CSS 변수 5개만 사용: `--w-bg`, `--w-border`, `--w-text`, `--w-muted`, `--w-fill`
- Tailwind v4 유틸리티만 사용. 반응형은 `@container` + `@md:` 접두사 (모바일 우선)
- Lucide 아이콘: `<i data-lucide="icon-name"></i>`
- 시스템 monospace 폰트

이 규칙 외의 색상, 폰트, 스타일을 사용하지 않는다.

## 금지 사항

- artifacts/spec.yaml을 직접 수정하지 않는다. spec 변경이 필요하면 wireframe을 중단하고 `/write-spec`으로 돌아간다.

## 레이아웃 구성 원칙

레이아웃의 구조적 품질을 검증한다. 미적 판단이 아니라 구조적 판단이다.

Step 2~3에서 각 화면을 만들 때 아래 4항목을 확인한다.

### 위계 (Hierarchy)

- 요소 간 시각적 중요도 차이가 명확한가 (크기, 위치, 여백, 색상 대비)
- 가장 중요한 요소가 즉시 식별되는가

### 밀도 (Density)

- 화면의 정보 밀도가 맥락에 적절한가
- 같은 수준의 요소는 동일한 간격을 사용하는가

### 흐름 (Flow)

- 사용자의 다음 행동이 현재 시선 위치에서 자연스럽게 발견되는가
- 행동 유도 요소가 관련 컨텐츠와 인접해 있는가

### 상태 (States)

- 각 화면에서 빈 상태, 로딩 상태, 에러 상태를 의식적으로 고려했는가
- 해당 화면에 적용되지 않는 상태는 Screen Notes에 "N/A" 사유를 명시한다

## Step 1: 기존 화면 확인

프로젝트에 실행 가능한 앱이 있으면, 관련 화면의 현재 구현을 확인한다. 기존 화면에 요소를 추가하는 경우, 기존 레이아웃을 기반으로 wireframe을 만든다.

## Step 2: 기본 화면

1. `assets/template.html`을 읽어서 HTML 보일러플레이트를 확보한다
2. 기본 화면을 생성한다. template.html 내 주석의 삽입 패턴을 따른다

출력: `artifacts/<feature>/wireframe.html`

서버 실행: `Bash(run_in_background): bunx vite artifacts/<feature> --port=3456`

피드백 루프:
- 브라우저에서 wireframe.html을 열고 사용자 피드백을 받는다 → wireframe.html 수정

레이아웃이 확정되면 Step 3으로 진행한다.

## Step 3: 시나리오 화면

확정된 레이아웃 위에 나머지 시나리오별 화면을 탭으로 추가한다.
- `data-scenario` 속성에 시나리오 ID를 명시한다 (본문 텍스트에 ID를 넣지 않는다)
- artifacts/spec.yaml의 examples에서 구체적 데이터를 사용한다
- 각 화면 하단에 Screen Notes를 작성한다: 트리거(진입 조건), 인터랙션(주요 동작), 전환(다른 화면으로 이동 조건)

동일한 피드백 루프로 검증한다.

## Step 4: 커버리지 검증

artifacts/spec.yaml의 모든 시나리오 ID가 wireframe 화면에서 참조되었는지 확인한다. 누락된 시나리오가 있으면 사용자에게 보고하고, 화면에 추가할지 확인한다.

## 완료

완료 후 사용자에게 `/draft-plan <feature>` 진행 여부를 물어본다.
