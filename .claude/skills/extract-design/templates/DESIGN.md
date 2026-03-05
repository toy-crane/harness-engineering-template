# Design System: [프로젝트명]

## 1. Visual Theme & Atmosphere

<!--
전체적인 분위기와 미적 철학을 서술합니다.
- 무드를 표현하는 형용사 3-5개 (예: "Airy", "Minimalist", "Utilitarian")
- 디자인이 지향하는 사용자 경험
- 여백과 밀도의 특성
- Key Characteristics 목록 (5-6개 항목)
-->

## 2. Color Palette & Roles

<!--
CSS 변수에서 추출한 모든 색상을 의미 단위로 분류합니다.
각 색상은 반드시 "서술적 이름 (hex/oklch) — 기능적 역할" 형식으로 작성합니다.
라이트 모드를 기본으로 하되, 다크 모드 값도 함께 기재합니다.
-->

### Primary Foundation
- **서술적 이름** (#hex) — 기능적 역할 설명
<!-- --background, --card, --popover 등 배경/표면 색상 -->

### Accent & Interactive
<!-- --primary, --secondary, --accent 등 인터랙티브 요소 색상 -->

### Typography & Text Hierarchy
<!-- --foreground, --muted-foreground 등 텍스트 색상 -->

### Functional States
<!-- --destructive, --ring, --border 등 상태/피드백 색상 -->

### Chart Colors (해당 시)
<!-- --chart-1 ~ --chart-5 데이터 시각화 색상 -->

## 3. Typography Rules

<!--
layout.tsx에서 추출한 폰트 정보를 기반으로 작성합니다.
- Primary Font Family와 성격 설명
- Mono Font Family (있는 경우)
- 웨이트별 사용 규칙 (Display, Section Headers, Body, Small Text 등)
- 자간(letter-spacing)과 행간(line-height) 특성
-->

## 4. Component Stylings

<!--
components/ui/*.tsx에서 추출한 컴포넌트 패턴을 서술합니다.
기술적 값을 자연어로 변환합니다:
- rounded-full → "완전한 알약 형태(Pill-shaped)"
- rounded-xl → "부드럽게 둥근 모서리"
- rounded-lg → "살짝 둥근 모서리"
- rounded-none → "날카로운 직각 모서리"
- shadow-sm → "속삭이듯 부드러운 그림자"
- shadow-md → "가벼운 깊이감의 그림자"

프로젝트에 존재하는 컴포넌트만 문서화합니다.
-->

### Buttons
<!-- 형태, variants(default/outline/secondary/ghost/destructive/link), 크기, 호버/포커스 상태 -->

### Cards/Containers
<!-- 모서리 둥글기, 배경색, 그림자, 내부 여백 -->

### Inputs/Forms
<!-- 스트로크 스타일, 배경, 포커스 상태, 크기 -->

### Badges
<!-- 형태, variants, 크기 -->

### Dropdown Menus
<!-- 스타일, 애니메이션, 구성 요소 -->

### Alert Dialogs
<!-- 오버레이, 크기, 애니메이션 -->

### Select
<!-- 스타일, 애니메이션, 위치 모드 -->

<!-- 프로젝트에 존재하는 추가 컴포넌트가 있으면 섹션을 추가합니다 -->

## 5. Layout Principles

<!--
전체 레이아웃 전략을 서술합니다.
- 그리드 시스템과 최대 너비
- 여백(whitespace) 전략과 기본 단위
- 반응형 브레이크포인트
- 정렬과 시각적 균형
- 터치 타겟 크기
-->
