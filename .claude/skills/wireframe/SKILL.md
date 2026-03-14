---
name: wireframe
description: spec을 기반으로 HTML 와이어프레임을 생성합니다. Tailwind + 시스템 monospace로 시각적 레이아웃을 빠르게 검증합니다. "/wireframe", "와이어프레임", "wireframe", "layout", "레이아웃 검증" 등으로 실행합니다.
argument-hint: "feature 이름"
allowed-tools:
  - "Read"
  - "Write"
  - "Glob"
  - "Bash"
  - "AskUserQuestion"
---

# Wireframe: Spec → HTML 와이어프레임

spec 문서로부터 HTML 와이어프레임을 생성한다. Tailwind CDN + CSS 변수로 최소 회색 톤 스타일 적용.

## Step 1: 전제 조건

$ARGUMENTS에서 feature명 추출 후 `artifacts/<feature>/spec.md` 존재 확인.
없으면 "먼저 `/spec <feature>`를 실행하세요." 출력 후 종료.

## Step 2: 시나리오 → 화면 그룹핑 + Layout Structure

spec.md의 `### N.` 시나리오를 파싱하고, **시각적으로 구분되는 화면 상태**로 그룹핑한다.

- 하나의 화면 = 하나의 시각적으로 구분되는 UI 상태
- 같은 베이스에서 작은 상태 차이만 있는 시나리오는 하나로 묶는다
- 시각적으로 완전히 다른 상태는 별도 화면으로 분리

각 화면의 **Layout Structure**를 들여쓰기 트리로 작성한다.

```
Screen: 기본 보드 [col]
├── Header [row] — 로고, 다크모드 토글
├── Toolbar [row] — 검색 input, Priority 필터, Tag 필터
└── Board [row, 1:1:1]
    ├── Column: Todo [col] — 카드 목록 + 추가 입력
    ├── Column: In Progress [col] — 카드 목록
    └── Column: Done [col] — 카드 목록
```

Layout Structure 규칙:
- `[row]` / `[col]`: 배치 방향
- `1:1:1` 등 비율 힌트: 자식 요소 간 크기 비율
- `—` 뒤에 해당 영역의 핵심 내용 요약

그룹핑 결과 + Layout Structure를 사용자에게 보여주고 `AskUserQuestion`으로 승인받는다.

## Step 3: 전체 와이어프레임 생성

1. `assets/template.html`을 읽어서 HTML 보일러플레이트를 확보한다
2. `references/style-guide.md`를 읽어서 컴포넌트 패턴과 색상 규칙을 확인한다
3. **모든 화면을 한 번에 생성**하여 `artifacts/<feature>/wireframe.html`에 작성한다:
   - template.html의 `<!-- NAV_BUTTONS -->` 위치에 화면별 nav 버튼을 삽입
   - template.html의 `<!-- SCREEN_CONTENT -->` 위치에 화면별 컨텐츠를 삽입
   - `{{FEATURE_NAME}}`을 실제 feature명으로 치환
   - 각 화면 상단에 매핑된 시나리오 번호를 표시
   - style-guide.md의 컴포넌트 패턴을 사용하여 HTML 작성
   - style-guide.md의 컴포넌트 패턴을 사용할 때, 해당 요소 직전에 `<!-- [패턴명] 용도 -->` 주석을 추가한다
   - spec.md에서 구체적인 예시 데이터를 사용

4. 브라우저에서 파일을 연다:
   - macOS: `open artifacts/<feature>/wireframe.html`
   - Linux: `xdg-open artifacts/<feature>/wireframe.html`
   - 동작하지 않으면 파일 경로를 안내

5. `AskUserQuestion`으로 피드백을 수집한다
6. 피드백이 있으면 수정 후 재생성하고 다시 브라우저에서 연다

## Step 4: 시나리오 커버리지 검증

spec.md의 모든 시나리오 번호가 와이어프레임의 화면에 매핑되었는지 확인한다.

- 각 화면의 `(scenarios: ...)` 표기를 검사
- 누락된 시나리오가 있으면 사용자에게 알리고, 추가할지 확인

## Step 5: 완료

산출물: `artifacts/<feature>/wireframe.html`

다음 단계 안내: "구현을 시작하려면 plan mode로 전환하세요."
