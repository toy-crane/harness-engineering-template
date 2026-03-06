---
name: impl-plan
description: spec, wireframe, prototype 산출물을 기반으로 React/Next.js 구현 계획을 생성합니다. vercel-react-best-practices 규칙을 자동 선별 적용합니다. "/impl-plan", "구현 계획", "implementation plan" 등으로 실행합니다.
argument-hint: "feature 이름"
allowed-tools:
  - "Read"
  - "Write"
  - "Glob"
---

# Implementation Plan: 산출물 기반 구현 계획 생성

spec, wireframe, prototype 산출물을 읽고, vercel-react-best-practices 규칙을 자동 선별하여 React/Next.js 구현 계획을 생성합니다.

## Step 1: 전제 조건 확인

$ARGUMENTS에서 feature명을 추출한 뒤, 다음 파일이 존재하는지 확인합니다.

### 필수 파일

- `artifacts/<feature>/spec.md`
- `artifacts/<feature>/screen-plan.md`
- `artifacts/<feature>/wireframes/*.md` (1개 이상)

### 선택 파일

- `artifacts/<feature>/screens/` 또는 `artifacts/<feature>/*.html` — prototype 산출물. 있으면 시각적 참조로 활용

### 파일이 없는 경우

필수 파일이 하나라도 없으면 아래 안내를 출력하고 스킬을 종료합니다. 다음 단계로 진행하지 않습니다.

- `artifacts/<feature>/spec.md`가 없는 경우:
  - "먼저 `/spec <feature>`를 실행하여 요구사항 문서를 생성하세요."
- `artifacts/<feature>/screen-plan.md` 또는 wireframes가 없는 경우:
  - "먼저 `/wireframe <feature>`를 실행하여 와이어프레임을 생성하세요."

## Step 2: 산출물 읽기

모든 필수 파일이 존재하면, 순서대로 읽어 내용을 파악합니다.

### 2-1: spec.md 읽기

- 시나리오 목록, 성공 기준, 전제 조건, 미결정 사항을 파악합니다.

### 2-2: screen-plan.md 읽기

- 화면 구조(화면 수, 화면별 설명, 커버하는 시나리오)를 파악합니다.

### 2-3: wireframes 읽기

- `artifacts/<feature>/wireframes/*.md` 파일을 모두 읽습니다.
- 각 와이어프레임의 Component Inventory, Interactions, Layout을 분석하여 필요한 UI 컴포넌트와 인터랙션을 도출합니다.

### 2-4: prototype 산출물 읽기 (선택)

- `artifacts/<feature>/screens/` 디렉토리 또는 `artifacts/<feature>/*.html` 파일이 있으면 읽습니다.
- HTML 파일의 구조를 참조하여 구현에 반영합니다.
- PNG 파일이 있으면 시각적 참조로 확인합니다.

## Step 3: vercel-react-best-practices 카테고리 선별 및 읽기

### 3-1: 카테고리 목록 확인

`.claude/skills/vercel-react-best-practices/SKILL.md`를 읽어 8개 카테고리와 각 규칙 목록을 확인합니다.

### 3-2: 관련 카테고리 선별

spec과 wireframe 내용을 바탕으로, 구현에 관련된 카테고리를 자연어로 판단합니다.

#### 항상 포함 (CRITICAL)

다음 2개 카테고리는 **항상** 포함합니다:

- `async-*` (Eliminating Waterfalls) — 데이터 페칭이 있는 모든 화면에 해당
- `bundle-*` (Bundle Size Optimization) — 모든 React 프로젝트에 해당

#### 조건부 포함

spec/wireframe 내용에 따라 포함 여부를 판단합니다:

| 조건 | 포함할 카테고리 |
|---|---|
| 서버 컴포넌트, SSR, 데이터 페칭 언급 | `server-*` |
| 클라이언트 상태, SWR, localStorage 사용 | `client-*` |
| 리스트, 반복 렌더링, 복잡한 상태 관리 | `rerender-*` |
| 애니메이션, SVG, 긴 리스트 | `rendering-*` |
| 복잡한 데이터 처리, 루프, 캐싱 | `js-*` |
| 이벤트 핸들러 최적화, 싱글톤 초기화 | `advanced-*` |

### 3-3: 규칙 파일 읽기

선별된 카테고리의 규칙 파일들을 Glob + Read로 읽습니다.

```
.claude/skills/vercel-react-best-practices/rules/<prefix>-*.md
```

예시:
- `async-` 선별 → `.claude/skills/vercel-react-best-practices/rules/async-*.md` 파일들을 읽기
- `bundle-` 선별 → `.claude/skills/vercel-react-best-practices/rules/bundle-*.md` 파일들을 읽기

## Step 4: 구현 계획 생성

읽은 산출물과 best practices 규칙을 종합하여 구현 계획을 작성합니다.

### 포함할 내용

1. **Overview** — 구현 대상 기능 요약 (spec.md 기반)
2. **기술 스택** — 프로젝트에서 사용할 프레임워크, 라이브러리 (프로젝트 package.json 참조)
3. **화면별 구현 순서** — screen-plan.md 기반, 의존성을 고려한 구현 순서
4. **주요 컴포넌트 목록** — wireframe의 Component Inventory를 기반으로 실제 구현할 React 컴포넌트를 도출
   - 컴포넌트명, 역할, props, 상태
   - 공유 컴포넌트와 화면별 컴포넌트 구분
5. **데이터 모델 및 상태 관리** — 필요한 데이터 구조와 상태 관리 전략
6. **적용할 React Best Practices** — 선별된 규칙과 적용 근거
   - 각 규칙이 어떤 컴포넌트/화면에 적용되는지 명시
   - 규칙의 핵심 내용을 1-2줄로 요약
7. **구현 단계** — 단계별 구현 작업 목록 (TDD 워크플로우 반영)
   - 각 단계의 수용 기준 포함
8. **미결정 사항** — spec의 미결정 사항 + 구현 과정에서 발견된 추가 결정 필요 사항

### 저장

`artifacts/<feature>/impl-plan.md`에 저장합니다.

## Step 5: 완료 보고

### 산출물 파일 경로

```
artifacts/<feature>/
  spec.md           (기존)
  screen-plan.md    (기존)
  wireframes/       (기존)
  impl-plan.md      (생성됨)
```

### 적용된 Best Practices 카테고리 요약

선별된 카테고리와 각 카테고리에서 적용된 규칙 수를 요약합니다.

```
- async-* (CRITICAL): 5개 규칙 적용
- bundle-* (CRITICAL): 5개 규칙 적용
- server-*: 3개 규칙 적용
- rerender-*: 4개 규칙 적용
```

### 다음 단계 안내

- "구현 계획이 생성되었습니다. `artifacts/<feature>/impl-plan.md`를 확인하세요."
- "구현을 시작하려면 impl-plan.md의 구현 단계를 순서대로 진행하세요."
