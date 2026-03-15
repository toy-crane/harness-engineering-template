---
name: wireframe
description: spec을 기반으로 HTML 와이어프레임을 생성합니다. Tailwind + 시스템 monospace로 시각적 레이아웃을 빠르게 검증합니다. "/wireframe", "와이어프레임", "wireframe", "layout", "레이아웃 검증", "UI 구성", "화면 설계", "목업" 등으로 실행합니다. spec.md가 있는 기능의 UI를 시각적으로 확인하고 싶을 때 사용하세요.
argument-hint: "feature 이름"
allowed-tools:
  - "Read"
  - "Write"
  - "Edit"
  - "Glob"
  - "Bash"
  - "AskUserQuestion"
---

# Wireframe: Spec → HTML 와이어프레임

spec 문서로부터 HTML 와이어프레임을 생성한다. Tailwind CDN + CSS 변수로 최소 회색 톤 스타일 적용. 데스크톱/모바일 뷰포트 전환을 지원한다.

### 와이어프레임의 목적

이 와이어프레임은 plan mode에서 UI 컴포넌트를 추출하고, 사용자 흐름을 시각적으로 검증하기 위한 산출물이다.

- 검증 대상: 정보 계층, 사용자 행동 흐름, 화면 간 전환 경로
- 검증 대상이 아닌 것: 픽셀 정밀도, 색상 디자인, 애니메이션

## Step 1: 전제 조건

$ARGUMENTS에서 feature명 추출 후:
1. `artifacts/<feature>/spec.md` 존재 확인. 없으면 "먼저 `/spec <feature>`를 실행하세요." 출력 후 종료.
2. `artifacts/spec.yaml`에서 해당 feature의 시나리오를 확인한다.

## Step 2: 시나리오 → 화면 그룹핑

spec.md의 `### N.` 시나리오를 파싱하고, **시각적으로 구분되는 화면 상태**로 그룹핑한다.

- 하나의 화면 = 하나의 시각적으로 구분되는 UI 상태
- 모달/다이얼로그/시트가 열린 상태 → 별도 화면으로 분리 (기저 화면 + 오버레이)
- 모바일에서 레이아웃이 크게 달라지는 경우 → 별도 모바일 화면 추가 검토

각 화면에 대해 모바일에서 레이아웃이 달라지는 영역(반응형 전환 지점)을 식별한다.

화면 목록, 시나리오 매핑, 반응형 전환 지점을 사용자에게 출력한 뒤, 바로 Step 3으로 진행한다.

**출력 형식:**
```
N개 화면으로 구성합니다:
1. 화면 이름 — FEATURE-001, 002, 003
   ↳ 반응형: 3칼럼 그리드 → 단일 칼럼 스택
2. 화면 이름 — FEATURE-004, 005
   ↳ 반응형: sidebar → bottom sheet
3. 화면 이름 — FEATURE-006
   ↳ 반응형: 변환 없음
```

## Step 3: 전체 와이어프레임 생성

1. `assets/template.html`을 읽어서 HTML 보일러플레이트를 확보한다
2. `references/style-guide.md`를 읽어서 컴포넌트 패턴과 색상 규칙을 확인한다
3. **모든 화면을 한 번에 생성**하여 `artifacts/<feature>/wireframe.html`에 작성한다. template.html의 삽입 패턴 주석을 따라 `<!-- NAV_BUTTONS -->`와 `<!-- SCREEN_CONTENT -->` 위치에 각 화면을 삽입한다.

   ### 작성 규칙

   - Screen Notes에 자연어로 기술한다: 화면 목적, 주요 인터랙션, 상태 전환, 제약 사항
     - 관련 시나리오 ID(예: KANBAN-001)를 명시적으로 참조한다
     - 용도: plan mode 구현 계획의 입력
   - spec.md에서 구체적인 예시 데이터를 사용

   ### 반응형 레이아웃 규칙

   `references/style-guide.md`의 **반응형 규칙** 섹션을 적용한다. Step 2에서 식별한 반응형 전환 지점 각각에 대응하는 반응형 패턴을 적용한다.

4. 브라우저에서 파일을 연다

5. `AskUserQuestion`으로 피드백을 수집한다
6. 피드백이 있으면 수정 후 재생성하고 다시 브라우저에서 연다

## Step 4: 완료

산출물: `artifacts/<feature>/wireframe.html`

다음 단계 안내: "구현을 시작하려면 plan mode로 전환하세요."
