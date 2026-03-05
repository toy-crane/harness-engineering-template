---
name: prototype
description: spec과 DESIGN.md를 기반으로 Stitch 화면을 자동 생성합니다. 두 파일이 없으면 안내하고 종료합니다. "/prototype", "프로토타입", "화면 생성" 등으로 실행합니다.
argument-hint: "feature 이름"
allowed-tools:
  - "stitch*:*"
  - "Read"
  - "Write"
  - "Bash"
---

# Prototype: Spec → Stitch 화면 생성

spec 문서와 DESIGN.md를 기반으로 Stitch 화면을 자동 생성하는 파이프라인입니다.

## Step 1: 전제 조건 확인

$ARGUMENTS에서 feature명을 추출한 뒤, 다음 파일이 모두 존재하는지 확인합니다.

### 필수 파일

- `artifacts/<feature>/spec.md`
- `DESIGN.md`

### 파일이 없는 경우

하나라도 없으면 아래 안내를 출력하고 스킬을 종료합니다. 다음 단계로 진행하지 않습니다.

- `artifacts/<feature>/spec.md`가 없는 경우:
  - "먼저 `/spec <feature>`를 실행하여 요구사항 문서를 생성하세요."
- `DESIGN.md`가 없는 경우:
  - "먼저 `/extract-design` 스킬을 실행하여 DESIGN.md를 생성하세요."

### 파일이 모두 있는 경우

- `stitch.json`이 있으면 projectId를 확인합니다.
- 다음 단계로 진행합니다.

## Step 2: DESIGN.md 동기화 검증

DESIGN.md가 현재 프로젝트 상태와 맞는지 가볍게 확인합니다.

### 검증 항목

- `app/globals.css`의 CSS 변수(--background, --primary 등)가 DESIGN.md Section 2 색상과 일치하는지
- `components.json`의 style 값이 DESIGN.md 헤더의 스타일과 일치하는지
- `package.json`의 프레임워크 버전이 DESIGN.md 헤더와 일치하는지
- DESIGN.md Section 4에 문서화된 컴포넌트가 실제 `components/ui/` 디렉토리에 설치되어 있는지 (누락/추가 컴포넌트 확인)

### 결과 처리

- 불일치 없음: 다음 스텝으로 진행
- 불일치 발견: 구체적인 차이점을 목록으로 출력하고 사용자에게 확인
  - 계속 진행할지
  - `/extract-design` 스킬을 다시 실행하여 DESIGN.md를 업데이트할지

## Step 3: Stitch 프롬프트 생성

spec의 시나리오를 UI 구조로 변환하고, DESIGN.md의 디자인 시스템을 주입하여 Stitch에 최적화된 프롬프트를 만듭니다.

### 워크플로우

이 작업은 `enhance-prompt` 스킬의 워크플로우를 따릅니다.

1. `.agents/skills/enhance-prompt/SKILL.md`를 읽습니다.
2. 해당 스킬의 Enhancement Pipeline 절차대로 수행합니다.
   - spec.md의 시나리오에서 UI 구조를 도출합니다.
   - DESIGN.md Section 6의 디자인 시스템 블록을 주입합니다.
   - UI/UX 키워드를 추가하고 페이지 구조를 정리합니다.
   - spec.md의 시나리오와 전제 조건에서 명시된 UI 요소만 스코프로 설정하고, 스코프 밖의 요소를 생성하지 않도록 Scope Constraint를 프롬프트에 포함합니다.
3. 산출물을 `artifacts/<feature>/prompt.md`에 저장합니다.

### 사용자 확인

생성된 프롬프트를 보여주고 수정할 부분이 있는지 확인합니다. 승인을 받은 뒤 다음 단계로 진행합니다.

## Step 4: Stitch 화면 생성

승인받은 프롬프트로 Stitch MCP를 호출하여 화면을 생성합니다.

### 워크플로우

이 작업은 `stitch-loop` 스킬의 워크플로우를 따릅니다.

1. `.agents/skills/stitch-loop/SKILL.md`를 읽습니다.
2. 해당 스킬의 Execution Protocol 중 Step 3(Generate with Stitch) 절차대로 수행합니다.
   - `stitch.json`에서 projectId를 확인하거나 새로 생성합니다.
   - `generate_screen_from_text`로 화면을 생성합니다.
   - `get_screen`으로 HTML/PNG를 다운로드합니다.
3. DESIGN.md Section 6에 정의된 블록 기준으로 생성할 모드를 결정합니다.
   - Light 블록만 있으면 Light만 생성
   - Light, Dark 블록 모두 있으면 둘 다 생성

### 산출물

- `artifacts/<feature>/light.html`, `artifacts/<feature>/light.png`
- `artifacts/<feature>/dark.html`, `artifacts/<feature>/dark.png` (Dark 블록이 있을 때)

### 사용자 확인

생성된 화면의 스크린샷을 보여주고 만족하는지 확인합니다. 재생성이 필요하면 프롬프트를 수정하고 다시 생성합니다.

## Step 5: 완료 보고

### 생성된 파일 목록 출력

```
artifacts/<feature>/
  spec.md       (기존)
  prompt.md     (생성됨)
  light.html    (생성됨)
  light.png     (생성됨)
  dark.html     (생성됨 - Dark 블록이 있을 때)
  dark.png      (생성됨 - Dark 블록이 있을 때)
```

### 다음 단계 안내

- "화면 생성이 완료되었습니다. 구현을 시작하려면 plan mode로 전환하세요. (Shift+Tab 두 번 또는 `/plan`)"
