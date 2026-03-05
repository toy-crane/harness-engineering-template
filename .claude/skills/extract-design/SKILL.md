---
name: extract-design
description: 소스코드(CSS 변수, Tailwind 설정, UI 컴포넌트)를 분석하여 시맨틱 디자인 시스템 문서(DESIGN.md)를 생성합니다. "/extract-design", "코드에서 디자인 추출" 등으로 실행합니다.
allowed-tools:
  - "Read"
  - "Glob"
  - "Grep"
  - "Write"
---

# Extract Design: 소스코드 → DESIGN.md 생성

로컬 소스코드(CSS 변수, Tailwind 설정, UI 컴포넌트)에서 디자인 토큰을 추출하여 시맨틱 디자인 시스템 문서를 생성합니다.

## 개요

이 스킬은 Stitch MCP 서버 없이, 프로젝트의 소스코드만으로 `DESIGN.md`를 생성합니다. CSS 변수, Tailwind 클래스, 컴포넌트 패턴을 분석하여 서술적인 디자인 언어로 변환합니다.

## 1단계: 소스 탐색

`Glob`과 `Grep`을 사용하여 디자인 관련 파일을 자동으로 찾습니다.

### 탐색 대상

1. **CSS/테마 파일** — 색상, 반경, 간격 토큰
   - `Glob("**/globals.css")` — 메인 CSS 변수
   - `Glob("**/*.css")` — 추가 스타일시트
   - `Grep("--", glob: "*.css")` — CSS 커스텀 속성

2. **레이아웃/폰트 설정**
   - `Glob("app/layout.tsx")` 또는 `Glob("app/layout.jsx")` — 폰트 임포트, 메타데이터

3. **Tailwind 설정**
   - `Glob("tailwind.config.*")` — 커스텀 테마 확장
   - `Glob("postcss.config.*")` — PostCSS 플러그인

4. **UI 컴포넌트**
   - `Glob("components/ui/*.tsx")` — shadcn/ui 또는 커스텀 컴포넌트
   - `Glob("components/ui/*.jsx")` — JSX 컴포넌트

5. **유틸리티**
   - `Glob("lib/utils.*")` — cn(), cva() 등 스타일 유틸리티
   - `Read("package.json")` — 프레임워크, UI 라이브러리 확인

### 탐색 결과가 부족한 경우

- CSS 변수가 없으면: "CSS 변수를 찾을 수 없습니다. Tailwind 클래스에서 직접 추출합니다."
- 컴포넌트가 없으면: "UI 컴포넌트를 찾을 수 없습니다. Section 4는 생략합니다."

## 2단계: 토큰 추출

각 파일에서 다음 항목을 추출합니다.

### 색상

CSS 변수에서 추출:
- `:root` 블록 — 라이트 모드 색상
- `.dark` 블록 — 다크 모드 색상
- 시맨틱 변수: `--background`, `--foreground`, `--primary`, `--secondary`, `--accent`, `--muted`, `--destructive`, `--border`, `--input`, `--ring`, `--card`, `--popover`
- 차트 색상: `--chart-1` ~ `--chart-5`
- 사이드바 색상: `--sidebar-*`

### 타이포그래피

- `layout.tsx`에서 `import` 구문으로 폰트 패밀리 추출
- CSS 변수: `--font-sans`, `--font-mono`
- 컴포넌트에서 `text-sm`, `text-base`, `font-medium` 등 패턴 수집

### 반경/간격

- `--radius` 기본값과 파생 변수 (`--radius-sm`, `--radius-md`, `--radius-lg` 등)
- 컴포넌트에서 `rounded-*`, `gap-*`, `p-*`, `m-*` 패턴 수집

### 컴포넌트 패턴

각 `components/ui/*.tsx`에서:
- CVA `variants` 객체 — variant 이름과 스타일 매핑
- `size` variants — 크기별 스타일
- 상태 스타일 — hover, focus, disabled, active
- 서브 컴포넌트 구조 — Card > CardHeader, CardTitle 등

## 3단계: 시맨틱 변환

추출한 기술적 값을 서술적 디자인 언어로 변환합니다.

### 색상 변환 규칙

- OKLCH 값은 HEX로 변환한 뒤 서술적 이름을 부여
- 이름은 색상의 성격과 기능을 반영: "Deep Muted Teal-Navy (#294056)" 형식
- 각 색상에 기능적 역할을 명시: "주요 액션 버튼과 활성 네비게이션에 사용"

### Tailwind 클래스 변환 규칙

| 기술적 값 | 서술적 표현 |
|-----------|------------|
| `rounded-full` | 완전한 알약 형태(Pill-shaped) |
| `rounded-4xl` | 매우 넉넉하게 둥근 모서리 |
| `rounded-xl` | 부드럽게 둥근 모서리 |
| `rounded-lg` | 살짝 둥근 모서리 |
| `rounded-md` | 미세하게 둥근 모서리 |
| `rounded-none` | 날카로운 직각 모서리 |
| `shadow-sm` | 속삭이듯 부드러운 그림자 |
| `shadow-md` | 가벼운 깊이감의 그림자 |
| `shadow-lg` | 뚜렷한 입체감의 그림자 |
| flat (no shadow) | 평면적, 그림자 없음 |

### 변환 원칙

- 기술 전문 용어를 피하고 시각적 묘사를 사용
- "rounded-xl"이 아니라 "부드럽게 둥근 모서리"
- 반드시 정확한 값(hex, px, rem)을 괄호 안에 병기
- 기능적 역할("무엇에 사용되는지")을 항상 설명

## 4단계: DESIGN.md 생성

`templates/DESIGN.md`의 구조를 따라 문서를 작성합니다. 서술 수준과 상세도는 `examples/DESIGN.md`를 참조합니다.

### 섹션별 작성 지침

1. **Visual Theme & Atmosphere** — 전체 색상 팔레트와 컴포넌트 스타일에서 추론한 분위기를 3-5개 형용사로 표현
2. **Color Palette & Roles** — 추출한 모든 CSS 변수를 의미 단위로 분류하여 서술
3. **Typography Rules** — 폰트 패밀리, 웨이트 사용 패턴, 크기 계층 구조
4. **Component Stylings** — 프로젝트에 존재하는 컴포넌트만 문서화. 각 컴포넌트의 형태, 색상, 상태별 스타일을 서술
5. **Layout Principles** — 컴포넌트의 패딩, 갭, 그리드 패턴에서 추론한 레이아웃 전략

### 작성 규칙

- 프로젝트에 없는 컴포넌트는 문서화하지 않음
- 추측으로 값을 채우지 않음. 코드에서 확인된 것만 기재
- 라이트/다크 모드가 모두 있으면 둘 다 문서화

## 5단계: 저장

- 프로젝트 루트에 `DESIGN.md`로 저장
- 기존 `DESIGN.md`가 있으면 덮어쓰기 전 사용자에게 확인
