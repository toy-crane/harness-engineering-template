# Design System: Harness Tutorial

## 1. Visual Theme & Atmosphere

The Harness Tutorial interface embodies a **clean, neutral, and utilitarian** design language rooted in the shadcn/ui design system. The visual identity is built entirely on an achromatic grayscale palette, creating a **professional and distraction-free** environment where content and functionality take absolute precedence over decorative elements. The aesthetic is **modern and systematic**, reflecting the structured precision of developer-oriented tooling.

The overall mood is **crisp yet approachable** — neither cold nor warm, but perfectly balanced. The interface achieves sophistication through restraint: consistent spacing, subtle borders, and carefully calibrated gray tones create hierarchy without visual noise. The atmosphere evokes a well-organized workspace where every element earns its place.

**Key Characteristics:**
- Achromatic grayscale foundation with blue-spectrum data visualization accents
- Systematic spacing and radius scales derived from a single base variable
- Minimal shadow usage — borders and subtle background shifts define depth
- Compact, information-dense interactive elements optimized for productivity
- Dual-mode support (light/dark) with inverted but harmonious palettes
- Typography-driven hierarchy with minimal decorative elements

## 2. Color Palette & Roles

### Primary Foundation
- **Pure White** (#FFFFFF, oklch(1 0 0)) — Primary background color in light mode. The pristine, zero-warmth canvas for the entire interface.
- **Near-White Smoke** (#FAFAFA, oklch(0.985 0 0)) — Sidebar background and primary-foreground text. A whisper of gray that provides imperceptible softness compared to pure white.
- **Whisper Gray** (#F5F5F5, oklch(0.97 0 0)) — Secondary, muted, and accent surface color. Used for hover states, subtle background fills, and quiet content zones.

### Accent & Interactive
- **Ink Black** (#171717, oklch(0.205 0 0)) — Primary action color in light mode. Used for filled buttons, active sidebar elements, and primary interactive surfaces. Conveys authority and directness.
- **Ink Black** also serves as secondary-foreground and accent-foreground, reinforcing a monochromatic interaction model.
- **Light mode accent hover:** Whisper Gray (#F5F5F5) — ghost and outline button hover states use this soft background shift.

**Dark mode inversions:**
- **Soft Silver** (#D4D4D4, oklch(0.87 0 0)) — Primary action color in dark mode. Bright enough to command attention against dark backgrounds.
- **Charcoal** (#262626, oklch(0.269 0 0)) — Secondary/muted surface in dark mode.
- **Dim Gray** (#404040, oklch(0.371 0 0)) — Accent surface in dark mode, used for hover and focus backgrounds.

### Typography & Text Hierarchy
- **Near-Black** (#0A0A0A, oklch(0.145 0 0)) — Primary text color. Deep and saturated for maximum readability without the harshness of pure #000000.
- **Stone Gray** (#737373, oklch(0.556 0 0)) — Muted text color for descriptions, placeholders, and secondary information. Recedes clearly from primary text.
- **Dark mode:** Near-White Smoke (#FAFAFA) for primary text, Medium Gray (#A3A3A3, oklch(0.708 0 0)) for muted text.

### Functional States
- **Vivid Crimson** (#E23636, oklch(0.58 0.22 27)) — Destructive/error state in light mode. Used at 10% opacity for backgrounds, full saturation for text.
- **Soft Coral Red** (#F87171, oklch(0.704 0.191 22.216)) — Destructive state in dark mode. Lighter and warmer for visibility against dark surfaces.
- **Pale Gray** (#E5E5E5, oklch(0.922 0 0)) — Border and input stroke color in light mode. Delicate enough to define boundaries without competing for attention.
- **Medium Gray** (#A3A3A3, oklch(0.708 0 0)) — Focus ring color in light mode. Visible but unobtrusive.
- **Dark mode borders:** White at 10% opacity (oklch(1 0 0 / 10%)) — Translucent borders that adapt naturally to underlying surfaces.
- **Dark mode inputs:** White at 15% opacity (oklch(1 0 0 / 15%)) — Slightly more visible than borders for interactive affordance.

### Chart Colors (Blue Spectrum)
- **Chart 1 — Soft Periwinkle** (#7CB4D4, oklch(0.809 0.105 251.813)) — Lightest data point, ideal for background or lowest-priority series.
- **Chart 2 — Vivid Blue** (#3B82F6, oklch(0.623 0.214 259.815)) — Mid-range blue for secondary data series.
- **Chart 3 — Rich Cobalt** (#2563EB, oklch(0.546 0.245 262.881)) — Strong mid-tone for primary data emphasis.
- **Chart 4 — Deep Royal Blue** (#1D4ED8, oklch(0.488 0.243 264.376)) — Dark accent for important data points. Also used as dark-mode sidebar primary.
- **Chart 5 — Dark Navy** (#1E3A8A, oklch(0.424 0.199 265.638)) — Deepest blue for maximum visual weight in data visualizations.

### Sidebar Colors
- Light mode: Near-White Smoke (#FAFAFA) background, Ink Black (#171717) primary, Whisper Gray (#F5F5F5) accent.
- Dark mode: Ink Black (#171717) background, Deep Royal Blue (#1D4ED8) primary, Charcoal (#262626) accent.

## 3. Typography Rules

**Primary Font Family:** Inter (CSS variable: `--font-sans`)
**Character:** A highly legible, neutral sans-serif designed specifically for screen interfaces. Its tall x-height and open letterforms prioritize clarity at small sizes.

**Secondary Font Family:** Geist Sans (CSS variable: `--font-geist-sans`)
**Applied to:** Body element alongside Geist Mono. Used as a complementary sans-serif.

**Monospace Font Family:** Geist Mono (CSS variable: `--font-geist-mono`)
**Character:** Clean, modern monospace for code snippets and technical content.

### Weight Usage Patterns (from components)
- **Medium (500):** Primary weight for interactive elements — button labels, card titles, badge text, form labels, field legends. The workhorse weight for UI chrome.
- **Regular (400):** Body text, descriptions, muted content, and supporting information.
- **No bold/heavy usage detected** in the component library — the system favors medium weight as its strongest emphasis.

### Size Scale (from components)
- **Base (1rem / text-base):** Default input text, card title. The primary reading size.
- **Small (0.875rem / text-sm):** Most UI elements — buttons, badges, dropdown items, select items, labels, descriptions. The dominant size for compact interfaces.
- **Extra-small (0.75rem / text-xs):** Badges, select labels, dropdown labels, button xs variant. Used for metadata and tertiary information.
- **Responsive sizing:** Inputs use `text-base` on mobile, `text-sm` on `md:` breakpoint for touch-friendly sizing.

### Rendering
- `antialiased` applied globally via the body element for smooth font rendering.

## 4. Component Stylings

### Buttons
- **Shape:** 살짝 둥근 모서리 (rounded-lg, 10px radius). 부드러운 현대적 형태.
- **Variants:**
  - **Default:** Ink Black (#171717) 배경에 Near-White Smoke (#FAFAFA) 텍스트. 호버 시 80% 불투명도로 부드럽게 밝아짐.
  - **Outline:** Pale Gray (#E5E5E5) 테두리에 투명 배경. 호버 시 Whisper Gray (#F5F5F5) 배경으로 전환. 다크 모드에서는 반투명 입력 배경(30%) 사용.
  - **Secondary:** Whisper Gray (#F5F5F5) 배경에 Ink Black 텍스트. 호버 시 80% 불투명도.
  - **Ghost:** 배경 없음. 호버 시 Whisper Gray 배경으로 나타남. 가장 절제된 인터랙티브 스타일.
  - **Destructive:** Vivid Crimson 10% 불투명도 배경에 Crimson 텍스트. 배경색만으로 위험을 암시하는 부드러운 경고.
  - **Link:** 텍스트 색상만 사용, 호버 시 밑줄 표시. 인라인 내비게이션용.
- **Sizes:** xs(24px), sm(28px), default(32px), lg(36px) 높이. 아이콘 전용 크기도 동일 스케일.
- **Focus State:** 포커스 링 색상(#A3A3A3) 3px 링과 테두리 색상 변경. 접근성을 위한 명확한 시각적 피드백.
- **Invalid State:** Destructive 색상 테두리와 20% 불투명도 링으로 에러 상태 표시.

### Cards / Containers
- **Shape:** 부드럽게 둥근 모서리 (rounded-xl, 14px radius). 버튼보다 한 단계 더 부드러운 곡률.
- **Background:** Pure White (#FFFFFF) 배경에 Near-Black 텍스트.
- **Border:** 그림자 대신 1px ring (`ring-1 ring-foreground/10`) — 전경색 10% 불투명도의 극히 미세한 테두리로 경계를 정의.
- **Internal Structure:** 수직 플렉스 레이아웃, 요소 간 16px(gap-4) 간격. sm 사이즈에서는 12px(gap-3).
- **Padding:** 상하 16px(py-4), 좌우 16px(px-4). sm 사이즈에서 12px.
- **Sub-components:** CardHeader(자동 그리드 레이아웃), CardTitle(text-base, font-medium), CardDescription(text-sm, muted), CardContent(px-4), CardFooter(muted/50 배경의 하단 테두리 영역).
- **Footer 패턴:** 상단 테두리 + Whisper Gray 50% 불투명도 배경으로 시각적 분리.

### Inputs / Forms
- **Shape:** 살짝 둥근 모서리 (rounded-lg, 10px radius). 버튼과 동일한 곡률.
- **Height:** 32px(h-8) 기본 높이. 콤팩트하고 정보 밀도 높은 인터페이스에 적합.
- **Stroke:** 1px Pale Gray (#E5E5E5) 테두리. 투명 배경.
- **Focus State:** 테두리가 Ring 색상으로 전환, 3px 포커스 링(ring/50) 추가. 부드러운 확산 효과.
- **Dark Mode:** 배경에 30% 불투명도의 반투명 입력 배경 적용.
- **Disabled:** 50% 불투명도 + 입력 배경색 50% 불투명도 적용. 포인터 이벤트 비활성화.
- **Textarea:** 동일한 스타일 체계. `field-sizing-content`로 내용에 따라 자동 높이 조절. 최소 높이 64px.

### Badges
- **Shape:** 넉넉하게 둥근 알약 형태 (rounded-4xl, 26px radius). 컴포넌트 중 가장 둥근 곡률.
- **Size:** 높이 20px(h-5), 좌우 패딩 8px(px-2). 매우 콤팩트.
- **Typography:** Extra-small(text-xs), Medium weight.
- **Variants:** 버튼과 동일한 6가지 변형(default, secondary, destructive, outline, ghost, link). 색상 체계 공유.
- **Border:** 기본적으로 투명 테두리. outline 변형만 Pale Gray 테두리 사용.

### Alert Dialogs
- **Overlay:** 검정 10% 불투명도 배경 + 블러 효과(`backdrop-blur-xs`). 배경을 부드럽게 흐리면서 주의를 집중.
- **Container:** 부드럽게 둥근 모서리(rounded-xl, 14px). Pure White 배경에 전경색 10% ring.
- **Size:** 기본 `max-w-sm`(384px), sm 변형 `max-w-xs`(320px).
- **Animation:** 페이드인 + 95% 스케일에서 확대되는 줌인 효과. 100ms 지속.
- **Footer:** Card와 동일한 muted/50 배경 + 상단 테두리 패턴.
- **Action/Cancel:** Button 컴포넌트를 직접 활용. Action은 default variant, Cancel은 outline variant.

### Select
- **Trigger Shape:** 살짝 둥근 모서리(rounded-lg). 높이 32px(default) 또는 28px(sm).
- **Trigger Style:** 1px 입력 테두리, 투명 배경. 우측에 ChevronDown 아이콘.
- **Content:** 부드럽게 둥근 팝오버(rounded-lg). Popover 배경색에 그림자(`shadow-md`) + ring.
- **Item:** 미세하게 둥근 모서리(rounded-md). 포커스 시 Accent 배경색. 우측에 체크 아이콘.
- **Animation:** 방향에 따른 슬라이드인 + 페이드인 + 줌인(95%). 100ms 지속.

### Dropdown Menu
- **Content:** Select와 동일한 스타일 체계. rounded-lg, 팝오버 배경, shadow-md + ring.
- **Item:** rounded-md, 포커스 시 Accent 배경. Destructive variant는 별도 색상 처리.
- **Typography:** text-sm 기본. Label은 text-xs에 muted 색상.
- **Separator:** 1px 높이의 Border 색상 라인.
- **Sub-menu:** 동일한 스타일 + ChevronRight 아이콘으로 하위 메뉴 표시.

### Combobox
- **Input:** InputGroup 안에 임베드. 우측에 ChevronDown 트리거 버튼과 선택적 Clear 버튼.
- **Content:** Select/Dropdown과 동일한 팝오버 스타일. 앵커 너비에 맞춤.
- **Item:** rounded-md. 하이라이트 시 Accent 배경. 우측 체크 인디케이터.
- **Chips:** rounded-lg 컨테이너 안에 작은 rounded-sm 칩 요소. Muted 배경에 text-xs.
- **Empty State:** 중앙 정렬된 muted 텍스트 메시지.

### Labels
- **Typography:** text-sm, font-medium, leading-none. 간결하고 명확한 폼 라벨.
- **Disabled State:** 부모 요소 disabled 시 50% 불투명도와 pointer-events-none.

### Separator
- **Horizontal:** 1px 높이, 전체 너비. Border 색상(#E5E5E5).
- **Vertical:** 1px 너비, 부모 높이에 맞춤. 동일한 Border 색상.

### Field (Form Layout)
- **Orientation:** vertical(기본), horizontal, responsive(컨테이너 쿼리 기반 전환).
- **구성:** FieldLabel + Input/Textarea + FieldDescription + FieldError의 수직 스택.
- **Error State:** Destructive 색상 텍스트(text-sm). role="alert"로 접근성 확보.
- **Spacing:** 필드 간 20px(gap-5), 필드 내부 8px(gap-2).

### InputGroup
- **Compound Pattern:** Input/Textarea + Addon(아이콘, 버튼, 텍스트)을 하나의 그룹으로 결합.
- **Shape:** rounded-lg. 내부 요소는 테두리/그림자 제거.
- **Addon 위치:** inline-start, inline-end, block-start, block-end 네 방향 지원.

## 5. Layout Principles

### Spacing Scale
- **Base Unit:** `--radius: 0.625rem` (10px)를 중심으로 파생된 체계적 스케일.
  - radius-sm: 6px, radius-md: 8px, radius-lg: 10px, radius-xl: 14px, radius-2xl: 18px, radius-3xl: 22px, radius-4xl: 26px
- **Component Spacing:** 4px(gap-1) ~ 20px(gap-5) 범위. 8px(gap-2)와 16px(gap-4)가 가장 빈번.
- **Padding:** 8px(p-2) ~ 16px(p-4) 범위. 컴팩트한 인터페이스에 맞춘 절제된 여백.

### Interactive Element Sizing
- **Height Scale:** 24px(xs) → 28px(sm) → 32px(default) → 36px(lg). 4px 단위 증가.
- **Touch Target:** 최소 24px, 기본 32px. 모바일에서는 text-base 유지로 가독성 확보.

### Responsive Strategy
- `md:` 브레이크포인트에서 텍스트 크기 축소 (text-base → text-sm).
- 컨테이너 쿼리(`@container`) 활용 — Field 컴포넌트의 horizontal/vertical 전환.
- 모바일 우선 접근: 기본 스타일이 소형 화면에 최적화.

### Depth & Layering
- **Level 0:** 배경(background) — 평면, 장식 없음.
- **Level 1:** 카드/팝오버 — ring-1(전경색 10%)로 미세한 경계 정의. 그림자 없음.
- **Level 2:** 드롭다운/셀렉트 콘텐츠 — shadow-md로 부유감 표현. z-50.
- **Level 3:** 다이얼로그 오버레이 — 블러 + 10% 검정 오버레이. 최상위 레이어.

### Animation Philosophy
- **Duration:** 100ms — 빠르고 즉각적인 반응. 사용자를 기다리게 하지 않음.
- **Pattern:** fade-in + zoom-in(95% → 100%) 조합. 자연스러운 등장 효과.
- **Direction:** 슬라이드 방향이 출현 위치를 반영 (bottom → slide-from-top, etc.).
