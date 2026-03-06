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
시나리오가 2개 이상이면 **multi-screen 모드**로 여러 화면을 순차 생성합니다.

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

## Step 3: 모드 판별 및 화면 계획

spec.md의 시나리오 수에 따라 단일 화면 / multi-screen 모드를 결정합니다.

### 모드 판별

- spec.md의 `### N.` 형식 시나리오 헤딩을 파싱하여 시나리오 수를 센다.
- **시나리오 1개** → 단일 화면 모드 (Step 3A로 이동)
- **시나리오 2개 이상** → multi-screen 모드 (Step 3B로 이동)

### Step 3A: 단일 화면 모드 — 프롬프트 생성

기존 방식 그대로 수행합니다.

1. `.agents/skills/enhance-prompt/SKILL.md`를 읽습니다.
2. 해당 스킬의 Enhancement Pipeline 절차대로 수행합니다.
   - spec.md의 시나리오에서 UI 구조를 도출합니다.
   - DESIGN.md Section 6의 디자인 시스템 블록을 주입합니다.
   - UI/UX 키워드를 추가하고 페이지 구조를 정리합니다.
   - Scope Constraint를 프롬프트에 포함합니다.
3. 산출물을 `artifacts/<feature>/prompt.md`에 저장합니다.
4. 사용자 확인 후 **Step 4A**로 진행합니다.

### Step 3B: Multi-screen 모드 — 화면 계획 수립

spec.md의 시나리오들을 분석하여 **시각적으로 구분되는 화면 상태**로 그룹핑합니다.

#### 그룹핑 원칙

- 하나의 화면 = 하나의 시각적으로 구분되는 UI 상태
- 같은 베이스 화면에서 작은 상태 차이만 있는 시나리오는 하나로 묶는다
  - 예: "카드 편집"과 "카드 삭제 확인 다이얼로그"는 같은 화면에 표현 가능
- 시각적으로 완전히 다른 상태는 별도 화면으로 분리한다
  - 예: "다크 모드"는 별도 화면

#### 산출물: screen-plan.md

`artifacts/<feature>/screen-plan.md`를 생성합니다.

```markdown
---
feature: <feature>
total_screens: <N>
generated: 0
---
# Screen Plan: <feature>

### 01-<screen-id>
- **Title:** <화면 제목>
- **Scenarios:** <커버하는 시나리오 번호와 이름>
- **Description:** <이 화면에서 보여줄 UI 상태 설명>
- **Mode:** light | dark | light+dark
- **Status:** [ ] pending

### 02-<screen-id>
...
```

#### 사용자 확인

생성된 화면 계획을 보여주고 승인을 받습니다. 사용자는:
- 화면을 추가/제거/병합할 수 있음
- 각 화면의 모드(light/dark)를 변경할 수 있음
- 화면 순서를 변경할 수 있음

승인 후 **Step 4B**로 진행합니다.

## Step 4: Stitch 화면 생성

### 공통: 프로젝트 확인

- `stitch.json`이 있으면 `projectId`를 사용합니다.
- 없으면 `create_project`로 새 프로젝트를 생성하고 `stitch.json`에 저장합니다.

### 공통: deviceType 결정

DESIGN.md 또는 프롬프트의 `Platform` 필드에서 deviceType을 결정합니다.

| Platform 필드 | deviceType |
|--------------|------------|
| Desktop-first | `DESKTOP` |
| Mobile-first | `MOBILE` |
| 명시 없음 | `DESKTOP` (기본값) |

### Step 4A: 단일 화면 생성

기존 방식 그대로 수행합니다.

#### 모드 결정

prompt.md에 정의된 블록 기준으로 생성할 모드를 결정합니다.
- Light 블록만 있으면 Light만 생성
- Light, Dark 블록 모두 있으면 둘 다 생성

#### 화면 생성 (모드별 반복)

각 모드(Light, Dark)에 대해 다음을 수행합니다:

1. `generate_screen_from_text` 호출:
   - `projectId`: 위에서 확인한 ID
   - `prompt`: prompt.md의 해당 모드 프롬프트 전체
   - `deviceType`: 위에서 결정한 값
   - `modelId`: `GEMINI_3_PRO`
2. `get_screen`으로 `htmlCode.downloadUrl`, `screenshot.downloadUrl`을 획득합니다.
3. `curl -L -o`로 HTML과 PNG를 다운로드합니다.

#### 산출물

- `artifacts/<feature>/light.html`, `artifacts/<feature>/light.png`
- `artifacts/<feature>/dark.html`, `artifacts/<feature>/dark.png` (Dark 블록이 있을 때)

#### 사용자 확인

생성된 화면의 스크린샷을 보여주고 만족하는지 확인합니다. 재생성이 필요하면 프롬프트를 수정하고 다시 생성합니다.

**Step 5**로 진행합니다.

### Step 4B: Multi-screen 화면 생성 루프

screen-plan.md의 각 화면에 대해 **순차적으로** 아래 루프를 반복합니다.

#### 4B-1: 바톤 작성

`artifacts/<feature>/next-screen.md`에 현재 생성할 화면 정보를 기록합니다.

```markdown
---
screen: <screen-id>
title: "<화면 제목>"
scenario_refs: [<시나리오 번호들>]
mode: <light | dark | light+dark>
---
<screen-plan.md에서 가져온 Description>
```

#### 4B-2: 프롬프트 강화

`.agents/skills/enhance-prompt/SKILL.md`를 읽고 Enhancement Pipeline을 수행합니다.

1. `next-screen.md`의 화면 설명을 입력으로 사용
2. DESIGN.md Section 6의 디자인 시스템 블록 주입
3. spec.md에서 해당 시나리오의 성공 기준을 참고하여 UI 요소 구체화
4. Scope Constraint 포함
5. **2번째 화면부터**: 이전 화면에서 확립된 스타일을 **VISUAL CONSISTENCY** 블록으로 추가

**VISUAL CONSISTENCY 블록 예시:**

```markdown
**VISUAL CONSISTENCY (이전 화면 기준):**
- Header: 64px 높이, 로고 좌측, 테마 토글 우측
- 칼럼 너비: ~320px, 칼럼 간격 16px
- 카드: 12px rounded corners, 16px padding
- 우선순위 색상: High=빨강, Medium=노랑, Low=초록
```

이 블록은 이전에 생성된 화면의 HTML/스크린샷을 분석하여 추출합니다.

6. 산출물을 `artifacts/<feature>/screens/<screen-id>/prompt.md`에 저장합니다.

#### 4B-3: 사용자 확인 (프롬프트)

생성된 프롬프트를 보여주고 승인을 받습니다.

#### 4B-4: Stitch 생성

`next-screen.md`의 `mode` 필드에 따라 화면을 생성합니다.

각 모드(Light, Dark)에 대해:

1. `generate_screen_from_text` 호출:
   - `projectId`: stitch.json의 ID
   - `prompt`: `screens/<screen-id>/prompt.md`의 해당 모드 프롬프트
   - `deviceType`: 위에서 결정한 값
   - `modelId`: `GEMINI_3_PRO`
2. `get_screen`으로 다운로드 URL 획득
3. `curl -L -o`로 다운로드

산출물:
- `artifacts/<feature>/screens/<screen-id>/light.html`, `light.png`
- `artifacts/<feature>/screens/<screen-id>/dark.html`, `dark.png` (dark 모드 포함 시)

#### 4B-5: 사용자 확인 (화면)

생성된 스크린샷을 보여주고 확인합니다. 사용자는:
- **승인** → 다음 화면으로 진행
- **재생성** → 프롬프트 수정 후 4B-4 반복
- **나머지 스킵** → 루프 종료, Step 5로 이동

#### 4B-6: 계획 갱신 및 다음 바톤

1. `screen-plan.md`에서 현재 화면의 Status를 `[x] completed`로 업데이트
2. `screen-plan.md`의 `generated` 카운트를 +1
3. 다음 화면이 있으면 `next-screen.md`를 갱신하고 **4B-1로 돌아감**
4. 모든 화면이 완료되면 **Step 5**로 진행

## Step 5: 완료 보고

### 단일 화면 모드 — 파일 목록

```
artifacts/<feature>/
  spec.md       (기존)
  prompt.md     (생성됨)
  light.html    (생성됨)
  light.png     (생성됨)
  dark.html     (생성됨 - Dark 블록이 있을 때)
  dark.png      (생성됨 - Dark 블록이 있을 때)
```

### Multi-screen 모드 — 파일 목록

```
artifacts/<feature>/
  spec.md              (기존)
  screen-plan.md       (생성됨 - 화면 계획)
  next-screen.md       (생성됨 - 마지막 바톤 상태)
  screens/
    01-<screen-id>/
      prompt.md        (생성됨)
      light.html       (생성됨)
      light.png        (생성됨)
      dark.html        (생성됨 - 해당 시)
      dark.png         (생성됨 - 해당 시)
    02-<screen-id>/
      ...
```

### 요약 출력

- 계획된 화면 수 / 생성된 화면 수
- 각 화면이 커버하는 시나리오 매핑
- Stitch 프로젝트 ID

### 다음 단계 안내

- "화면 생성이 완료되었습니다. 구현을 시작하려면 plan mode로 전환하세요. (Shift+Tab 두 번 또는 `/plan`)"
