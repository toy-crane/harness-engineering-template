---
name: sketch-wireframe
description: spec.yaml 기반 HTML 와이어프레임을 생성한다. 레이아웃을 시각적으로 확인하고 피드백 루프를 돌린다. UI 기능이 포함된 프로젝트에서만 사용. "/sketch-wireframe", "와이어프레임", "wireframe", "레이아웃 확인" 등으로 실행.
argument-hint: "feature 이름"
---

# Wireframe: Spec → HTML 와이어프레임

## 와이어프레임이란

컴포넌트 배치, 정보 계층, 화면 간 흐름을 검증하는 도구다. 비주얼 디자인(색상, 테마), 비즈니스 로직, 기술 동작의 검증 도구가 아니다.

이 원칙에서 나머지 규칙이 도출된다:
- **화면 포함 기준**: 고유한 레이아웃이 있는 시나리오만 화면으로 생성한다. 비시각적 시나리오는 관련 화면의 `data-scenario`에 매핑만 한다.
- **스타일**: CSS 변수 5개(`--w-bg`, `--w-border`, `--w-text`, `--w-muted`, `--w-fill`)와 텍스트/라벨로 상태를 구분한다. 이 외의 색상을 사용하지 않는다.
- **Notes**: 화면 흐름(진입 조건, 전환, 요소 역할)만 기술한다. 검증 규칙과 비즈니스 로직은 spec.yaml 영역이다.

## 전제 조건

`artifacts/spec.yaml`에서 해당 feature의 시나리오를 확인한다. 없으면 "먼저 `/write-spec`을 실행하세요." 출력 후 종료.

## 스타일 규칙

- 모바일 레이아웃을 먼저 완성한다. 데스크톱은 `@md:`로 확장한다.
- Tailwind v4 유틸리티만 사용. 반응형은 `@container` + `@md:` 접두사
- Lucide 아이콘: `<i data-lucide="icon-name"></i>`
- 시스템 monospace 폰트

## 금지 사항

- artifacts/spec.yaml을 직접 수정하지 않는다. spec 변경이 필요하면 wireframe을 중단하고 `/write-spec`으로 돌아간다.

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

확정된 레이아웃 위에 나머지 시나리오 중 고유한 레이아웃을 가진 것만 탭으로 추가한다.
- `data-scenario` 속성에 시나리오 ID를 명시한다 (본문 텍스트에 ID를 넣지 않는다)
- artifacts/spec.yaml의 examples에서 구체적 데이터를 사용한다
- 각 화면 하단에 Screen Notes를 작성한다: 트리거(진입 조건), 인터랙션(주요 동작), 전환(다른 화면으로 이동 조건)

동일한 피드백 루프로 검증한다.

## Step 4: 커버리지 검증

artifacts/spec.yaml의 모든 시나리오 ID가 wireframe 화면에서 참조되었는지 확인한다. 누락된 시나리오가 있으면 사용자에게 보고하고, 화면에 추가할지 확인한다.

## 완료

완료 후 사용자에게 `/draft-plan <feature>` 진행 여부를 물어본다.
