# Wireframe HTML Style Guide

## 목차

- [색상 팔레트](#색상-팔레트)
- [레이아웃 규칙](#레이아웃-규칙)
- [반응형 규칙](#반응형-규칙)
- [컴포넌트 패턴](#컴포넌트-패턴)
  - Layout: [Container](#container) · [Card](#card) · [Separator](#separator)
  - Navigation: [Tabs](#tabs) · [Breadcrumb](#breadcrumb) · [Pagination](#pagination) · [Stepper](#stepper)
  - Form: [Button](#button) · [Input](#input) · [Textarea](#textarea) · [Search Input](#search-input) · [Select](#select--dropdown-trigger) · [Dropdown Menu](#dropdown-menu-expanded) · [Checkbox](#checkbox) · [Radio Group](#radio-group) · [Toggle / Switch](#toggle--switch) · [Slider](#slider) · [File Upload](#file-upload) · [Label](#label)
  - Data Display: [Table](#table) · [List Item](#list-item) · [Avatar](#avatar) · [Badge / Tag](#badge--tag) · [Accordion](#accordion) · [Skeleton](#skeleton) · [Tooltip](#tooltip)
  - Feedback: [Alert](#alert) · [Toast](#toast) · [Spinner](#spinner) · [Empty State](#empty-state) · [Progress Bar](#progress-bar)
  - Overlay: [Modal / Dialog](#modal--dialog) · [Drawer (Side)](#drawer-side) · [Bottom Sheet (Mobile)](#bottom-sheet-mobile)
  - Wireframe: [Screen Header](#screen-header) · [Screen Notes](#screen-notes)
- [아이콘](#아이콘)

---

## 색상 팔레트

5개 CSS 변수만 사용한다. 인라인 `style=`에서 참조.

| 변수 | 값 | 용도 |
|------|------|------|
| `--w-bg` | `#f5f5f5` | 페이지 배경 |
| `--w-border` | `#ccc` | 테두리, 구분선 |
| `--w-text` | `#555` | 기본 텍스트 |
| `--w-muted` | `#aaa` | 보조 텍스트, 레이블, placeholder |
| `--w-fill` | `#eee` | 입력 필드 배경, 비활성 영역 |

> 이 변수 외의 색상을 사용하지 않는다. `rgba(0,0,0,0.1)`은 오버레이 배경에만 허용.

---

## 레이아웃 규칙

- Tailwind 유틸리티만 사용: `flex`, `grid`, `gap-*`, `p-*`, `m-*`, `rounded`, `text-*` 등
- `style=` 속성은 CSS 변수 참조에만 사용: `style="border-color:var(--w-border)"`
- 모든 `<input>`, `<select>`, `<button>` 요소에 `disabled` 추가 (와이어프레임은 비대화형)
- 화면 컨텐츠에 `max-w-6xl mx-auto p-6` 적용 (template의 `.screen-content`에 포함됨)

---

## 반응형 규칙

와이어프레임에서 데스크톱/모바일 레이아웃을 동시에 지원한다. template의 뷰포트 토글로 전환.

- `.screen-content`에 `@container` 클래스가 적용되어 있다. 자식 요소의 `@md:` 접두사는 **컨테이너 너비** 448px(28rem) 기준으로 전환된다.
- 모바일 우선으로 작성하고 `@md:` 접두사로 데스크톱 레이아웃 적용
- 모바일에서 다단 레이아웃 → 단일 칼럼으로 스택
- 모바일에서 Sidebar → Bottom Sheet 또는 Drawer로 전환
- 모바일에서 테이블 → 카드 리스트로 전환 고려

---

## 컴포넌트 패턴

### Container

영역을 감싸는 기본 컨테이너.

```html
<div class="border rounded p-4" style="border-color:var(--w-border); background:white;">
  <!-- content -->
</div>
```

점선 컨테이너 (드롭 영역, 빈 상태 래퍼):

```html
<div class="border-2 border-dashed rounded-lg p-3" style="border-color:var(--w-border); background:white; min-height:200px;">
  <!-- content -->
</div>
```

### Card

제목, 본문, 선택적 푸터를 가진 콘텐츠 카드.

```html
<div class="border rounded-lg overflow-hidden" style="border-color:var(--w-border); background:white;">
  <div class="p-4">
    <h3 class="text-sm font-bold">Card Title</h3>
    <p class="text-xs mt-1" style="color:var(--w-muted)">Card description or content</p>
  </div>
</div>
```

푸터가 있는 카드:

```html
<div class="border rounded-lg overflow-hidden" style="border-color:var(--w-border); background:white;">
  <div class="p-4">
    <h3 class="text-sm font-bold">Card Title</h3>
    <p class="text-xs mt-1" style="color:var(--w-muted)">Card description</p>
  </div>
  <div class="px-4 py-3 flex justify-end gap-2" style="border-top:1px solid var(--w-border);">
    <button class="border rounded px-3 py-1 text-sm" style="border-color:var(--w-border); background:var(--w-fill)" disabled>Action</button>
  </div>
</div>
```

### Separator

수평 구분선:

```html
<div style="border-top:1px solid var(--w-border); margin:16px 0;"></div>
```

수직 구분선 (flex 컨테이너 내):

```html
<div style="border-left:1px solid var(--w-border); height:24px;"></div>
```

### Tabs

탭 네비게이션. 활성 탭에 하단 보더.

```html
<div>
  <div class="flex gap-0" style="border-bottom:1px solid var(--w-border);">
    <button class="px-4 py-2 text-sm font-bold" style="border-bottom:2px solid var(--w-text);" disabled>Active Tab</button>
    <button class="px-4 py-2 text-sm" style="color:var(--w-muted);" disabled>Tab 2</button>
    <button class="px-4 py-2 text-sm" style="color:var(--w-muted);" disabled>Tab 3</button>
  </div>
  <div class="p-4">
    <!-- tab content -->
  </div>
</div>
```

### Breadcrumb

계층 네비게이션 경로. 현재 페이지는 기본 색상.

```html
<nav class="flex items-center gap-1 text-sm">
  <span style="color:var(--w-muted)">Home</span>
  <span style="color:var(--w-muted)">/</span>
  <span style="color:var(--w-muted)">Section</span>
  <span style="color:var(--w-muted)">/</span>
  <span>Current Page</span>
</nav>
```

### Pagination

페이지 네비게이션. 현재 페이지는 굵은 보더.

```html
<div class="flex items-center gap-1">
  <button class="border rounded px-2 py-1 text-xs" style="border-color:var(--w-border); background:var(--w-fill)" disabled>←</button>
  <button class="border rounded px-2 py-1 text-xs font-bold" style="border-color:var(--w-text); background:var(--w-fill)" disabled>1</button>
  <button class="border rounded px-2 py-1 text-xs" style="border-color:var(--w-border); background:var(--w-fill)" disabled>2</button>
  <button class="border rounded px-2 py-1 text-xs" style="border-color:var(--w-border); background:var(--w-fill)" disabled>3</button>
  <span class="text-xs px-1" style="color:var(--w-muted)">…</span>
  <button class="border rounded px-2 py-1 text-xs" style="border-color:var(--w-border); background:var(--w-fill)" disabled>10</button>
  <button class="border rounded px-2 py-1 text-xs" style="border-color:var(--w-border); background:var(--w-fill)" disabled>→</button>
</div>
```

### Stepper

다단계 진행 표시. 완료/현재/대기 상태 구분.

```html
<div class="flex items-center gap-2">
  <div class="flex items-center gap-2">
    <div class="rounded-full flex items-center justify-center text-xs font-bold" style="width:24px; height:24px; background:var(--w-border); color:white;">✓</div>
    <span class="text-sm">Step 1</span>
  </div>
  <div style="flex:1; height:1px; background:var(--w-border);"></div>
  <div class="flex items-center gap-2">
    <div class="rounded-full flex items-center justify-center text-xs font-bold" style="width:24px; height:24px; border:2px solid var(--w-text);">2</div>
    <span class="text-sm font-bold">Step 2</span>
  </div>
  <div style="flex:1; height:1px; background:var(--w-fill);"></div>
  <div class="flex items-center gap-2">
    <div class="rounded-full flex items-center justify-center text-xs" style="width:24px; height:24px; background:var(--w-fill); color:var(--w-muted);">3</div>
    <span class="text-sm" style="color:var(--w-muted)">Step 3</span>
  </div>
</div>
```

### Button

```html
<button class="border rounded px-3 py-1 text-sm" style="border-color:var(--w-border); background:var(--w-fill)" disabled>Label</button>
```

주요 액션 버튼 (강조):

```html
<button class="border rounded px-3 py-1 text-sm font-bold" style="border-color:var(--w-text); background:var(--w-fill)" disabled>Primary</button>
```

아이콘 버튼:

```html
<button class="border rounded p-1.5 text-sm" style="border-color:var(--w-border); background:var(--w-fill)" disabled>🗑</button>
```

### Input

```html
<input class="w-full border rounded px-3 py-1.5 text-sm" style="border-color:var(--w-border); background:var(--w-fill); color:var(--w-muted)" placeholder="Placeholder..." disabled>
```

값이 있는 Input:

```html
<input class="w-full border rounded px-3 py-1.5 text-sm" style="border-color:var(--w-border); background:var(--w-fill)" value="Example value" disabled>
```

### Textarea

여러 줄 텍스트 입력.

```html
<textarea class="w-full border rounded px-3 py-2 text-sm" rows="3" style="border-color:var(--w-border); background:var(--w-fill); color:var(--w-muted); resize:none;" placeholder="Placeholder..." disabled></textarea>
```

### Search Input

검색 아이콘이 포함된 입력 필드.

```html
<div class="flex items-center border rounded px-3 py-1.5 gap-2" style="border-color:var(--w-border); background:var(--w-fill);">
  <span class="text-sm">🔍</span>
  <input class="w-full text-sm border-0 outline-none" style="background:transparent; color:var(--w-muted)" placeholder="Search..." disabled>
</div>
```

### Select (Dropdown trigger)

닫힌 상태의 드롭다운.

```html
<div class="border rounded px-3 py-1.5 text-sm flex items-center justify-between" style="border-color:var(--w-border); background:var(--w-fill)">
  <span>Option</span>
  <span style="color:var(--w-muted)">▾</span>
</div>
```

### Dropdown Menu (expanded)

열린 상태의 드롭다운 메뉴. `position:relative` 래퍼 필요.

```html
<div style="position:relative; display:inline-block;">
  <button class="border rounded px-3 py-1 text-sm" style="border-color:var(--w-border); background:var(--w-fill)" disabled>Menu ▾</button>
  <div class="border rounded-lg py-1" style="position:absolute; top:100%; left:0; min-width:160px; background:white; border-color:var(--w-border); box-shadow:0 2px 8px rgba(0,0,0,0.08); z-index:10;">
    <div class="px-3 py-1.5 text-sm" style="background:var(--w-fill)">Selected Item</div>
    <div class="px-3 py-1.5 text-sm">Item 2</div>
    <div class="px-3 py-1.5 text-sm">Item 3</div>
    <div style="border-top:1px solid var(--w-border); margin:4px 0;"></div>
    <div class="px-3 py-1.5 text-sm" style="color:var(--w-muted)">Danger Item</div>
  </div>
</div>
```

### Checkbox

```html
<div class="flex items-center gap-2">
  <input type="checkbox" disabled>
  <span class="text-sm">Unchecked item</span>
</div>
<div class="flex items-center gap-2">
  <input type="checkbox" checked disabled>
  <span class="text-sm line-through" style="color:var(--w-muted)">Checked item</span>
</div>
```

### Radio Group

단일 선택 그룹. `name` 속성으로 그룹핑.

```html
<div class="flex flex-col gap-2">
  <label class="flex items-center gap-2 text-sm">
    <input type="radio" name="group" checked disabled>
    <span>Selected option</span>
  </label>
  <label class="flex items-center gap-2 text-sm">
    <input type="radio" name="group" disabled>
    <span>Another option</span>
  </label>
</div>
```

### Toggle / Switch

Off 상태:

```html
<div class="border rounded-full" style="width:32px;height:16px;background:var(--w-fill);border-color:var(--w-border);position:relative;">
  <div style="width:12px;height:12px;border-radius:50%;background:white;border:1px solid var(--w-border);position:absolute;top:1px;left:2px;"></div>
</div>
```

On 상태:

```html
<div class="border rounded-full" style="width:32px;height:16px;background:var(--w-border);border-color:var(--w-border);position:relative;">
  <div style="width:12px;height:12px;border-radius:50%;background:white;border:1px solid var(--w-border);position:absolute;top:1px;right:2px;"></div>
</div>
```

### Slider

범위 입력. knob 위치로 현재 값 표현.

```html
<div class="flex items-center gap-3">
  <span class="text-xs" style="color:var(--w-muted)">0</span>
  <div class="flex-1 relative" style="height:4px; background:var(--w-fill); border-radius:2px;">
    <div style="position:absolute; left:0; top:0; width:40%; height:100%; background:var(--w-border); border-radius:2px;"></div>
    <div style="position:absolute; left:40%; top:-4px; width:12px; height:12px; background:white; border:2px solid var(--w-border); border-radius:50%; transform:translateX(-50%);"></div>
  </div>
  <span class="text-xs" style="color:var(--w-muted)">100</span>
</div>
```

### File Upload

드래그&드롭 파일 업로드 영역.

```html
<div class="border-2 border-dashed rounded-lg p-6 flex flex-col items-center gap-2" style="border-color:var(--w-border);">
  <span class="text-2xl" style="color:var(--w-muted)">↑</span>
  <p class="text-sm" style="color:var(--w-muted)">Drop files here or click to upload</p>
  <p class="text-xs" style="color:var(--w-muted)">PNG, JPG up to 10MB</p>
</div>
```

### Label

폼 필드 위에 사용하는 레이블.

```html
<label class="text-xs" style="color:var(--w-muted)">Field Name</label>
```

### Table

데이터 테이블. 헤더 행은 굵은 하단 보더.

```html
<table class="w-full text-sm" style="border-collapse:collapse;">
  <thead>
    <tr style="border-bottom:2px solid var(--w-border);">
      <th class="text-left py-2 px-3 font-bold">Header</th>
      <th class="text-left py-2 px-3 font-bold">Header</th>
      <th class="text-left py-2 px-3 font-bold">Header</th>
    </tr>
  </thead>
  <tbody>
    <tr style="border-bottom:1px solid var(--w-border);">
      <td class="py-2 px-3">Cell</td>
      <td class="py-2 px-3">Cell</td>
      <td class="py-2 px-3">Cell</td>
    </tr>
    <tr style="border-bottom:1px solid var(--w-border);">
      <td class="py-2 px-3">Cell</td>
      <td class="py-2 px-3">Cell</td>
      <td class="py-2 px-3">Cell</td>
    </tr>
  </tbody>
</table>
```

### List Item

아바타, 제목, 부제, 메타 정보가 있는 리스트 항목.

```html
<div class="flex items-center gap-3 px-4 py-3" style="border-bottom:1px solid var(--w-border);">
  <div class="rounded-full flex items-center justify-center text-xs font-bold" style="width:32px; height:32px; background:var(--w-fill); border:1px solid var(--w-border); flex-shrink:0;">AB</div>
  <div class="flex-1 min-w-0">
    <p class="text-sm font-bold truncate">List item title</p>
    <p class="text-xs truncate" style="color:var(--w-muted)">Secondary text</p>
  </div>
  <span class="text-xs" style="color:var(--w-muted)">Meta</span>
</div>
```

### Avatar

사용자 표현. 이니셜 또는 아이콘.

```html
<div class="rounded-full flex items-center justify-center text-xs font-bold" style="width:32px; height:32px; background:var(--w-fill); border:1px solid var(--w-border);">AB</div>
```

이름과 함께:

```html
<div class="flex items-center gap-2">
  <div class="rounded-full flex items-center justify-center text-xs font-bold" style="width:32px; height:32px; background:var(--w-fill); border:1px solid var(--w-border);">AB</div>
  <span class="text-sm">User Name</span>
</div>
```

### Badge / Tag

```html
<span class="border rounded-full px-2 text-xs" style="border-color:var(--w-border); background:var(--w-fill)">Label</span>
```

제거 가능한 태그:

```html
<span class="border rounded-full px-2 text-xs" style="border-color:var(--w-border); background:var(--w-fill)">Label ✕</span>
```

### Accordion

접었다 펼 수 있는 섹션. 열린/닫힌 상태 모두 표시 가능.

```html
<div class="border rounded" style="border-color:var(--w-border);">
  <div class="flex items-center justify-between px-4 py-3 text-sm font-bold" style="border-bottom:1px solid var(--w-border);">
    <span>Expanded Section</span>
    <span>▾</span>
  </div>
  <div class="px-4 py-3 text-sm">
    Expanded content here
  </div>
  <div class="flex items-center justify-between px-4 py-3 text-sm" style="border-top:1px solid var(--w-border); color:var(--w-muted);">
    <span>Collapsed Section</span>
    <span>▸</span>
  </div>
</div>
```

### Skeleton

로딩 중 콘텐츠 플레이스홀더. 너비를 다르게 하여 텍스트 형태를 암시.

```html
<div class="space-y-3">
  <div class="rounded" style="height:16px; width:60%; background:var(--w-fill);"></div>
  <div class="rounded" style="height:16px; width:80%; background:var(--w-fill);"></div>
  <div class="rounded" style="height:16px; width:40%; background:var(--w-fill);"></div>
</div>
```

카드형 스켈레톤:

```html
<div class="border rounded-lg p-4 space-y-3" style="border-color:var(--w-border); background:white;">
  <div class="rounded" style="height:12px; width:40%; background:var(--w-fill);"></div>
  <div class="rounded" style="height:12px; width:70%; background:var(--w-fill);"></div>
  <div class="flex gap-2 mt-2">
    <div class="rounded" style="height:24px; width:60px; background:var(--w-fill);"></div>
    <div class="rounded" style="height:24px; width:60px; background:var(--w-fill);"></div>
  </div>
</div>
```

### Tooltip

요소 위에 표시되는 짧은 안내 텍스트.

```html
<div style="position:relative; display:inline-block;">
  <button class="border rounded px-3 py-1 text-sm" style="border-color:var(--w-border); background:var(--w-fill)" disabled>Hover me</button>
  <div class="rounded px-2 py-1 text-xs" style="position:absolute; bottom:calc(100% + 4px); left:50%; transform:translateX(-50%); background:var(--w-text); color:white; white-space:nowrap;">
    Tooltip text
  </div>
</div>
```

### Alert

페이지 내 알림 메시지. 아이콘으로 유형 구분 (⚠ 경고, ✓ 성공 등).

```html
<div class="border rounded-lg px-4 py-3 flex items-start gap-2 text-sm" style="border-color:var(--w-border); background:var(--w-fill);">
  <span>⚠</span>
  <div>
    <p class="font-bold">Alert Title</p>
    <p class="text-xs mt-0.5" style="color:var(--w-muted)">Alert description message.</p>
  </div>
</div>
```

### Toast

일시적인 알림. 와이어프레임에서는 인라인으로 배치하고 위치를 주석으로 표시.

```html
<!-- 실제 위치: 화면 하단 우측 고정 -->
<div class="border rounded-lg px-4 py-3 text-sm" style="border-color:var(--w-border); background:white; box-shadow:0 2px 8px rgba(0,0,0,0.08); max-width:360px;">
  <div class="flex items-center justify-between">
    <span>Toast message here</span>
    <span style="color:var(--w-muted)">✕</span>
  </div>
</div>
```

### Spinner

로딩 상태 표시.

```html
<div class="flex items-center justify-center gap-2">
  <span style="color:var(--w-muted)">⟳</span>
  <span class="text-sm" style="color:var(--w-muted)">Loading...</span>
</div>
```

### Empty State

```html
<div class="border-2 border-dashed rounded flex flex-col items-center justify-center p-8 gap-2" style="border-color:var(--w-border); color:var(--w-muted)">
  <span class="text-2xl">📋</span>
  <p class="text-sm">No items yet</p>
  <button class="border rounded px-3 py-1 text-xs mt-1" style="border-color:var(--w-border); background:var(--w-fill)" disabled>Add first item</button>
</div>
```

### Progress Bar

```html
<div class="rounded-full overflow-hidden" style="height:4px; background:var(--w-fill)">
  <div class="rounded-full" style="height:100%; width:60%; background:var(--w-border)"></div>
</div>
```

퍼센트 레이블과 함께:

```html
<div class="flex items-center gap-3">
  <div class="flex-1 rounded-full overflow-hidden" style="height:4px; background:var(--w-fill)">
    <div class="rounded-full" style="height:100%; width:60%; background:var(--w-border)"></div>
  </div>
  <span class="text-xs" style="color:var(--w-muted)">60%</span>
</div>
```

### Modal / Dialog

```html
<div class="rounded-lg" style="position:relative; min-height:400px; background:rgba(0,0,0,0.1); display:flex; align-items:center; justify-content:center;">
  <div class="border rounded-lg w-full" style="border-color:var(--w-border); background:white; max-width:440px;">
    <!-- Header -->
    <div class="flex items-center justify-between px-5 py-3" style="border-bottom:1px solid var(--w-border);">
      <span class="text-sm font-bold">Modal Title</span>
      <span style="cursor:pointer; color:var(--w-muted)">✕</span>
    </div>
    <!-- Body -->
    <div class="p-5">
      <!-- content -->
    </div>
    <!-- Footer -->
    <div class="flex justify-end gap-2 px-5 py-3" style="border-top:1px solid var(--w-border);">
      <button class="border rounded px-3 py-1 text-sm" style="border-color:var(--w-border); background:var(--w-fill)" disabled>Cancel</button>
      <button class="border rounded px-3 py-1 text-sm font-bold" style="border-color:var(--w-text); background:var(--w-fill)" disabled>Confirm</button>
    </div>
  </div>
</div>
```

### Drawer (Side)

화면 측면에서 슬라이드하는 패널. 데스크톱용.

```html
<div style="position:relative; min-height:400px; background:rgba(0,0,0,0.1); display:flex; justify-content:flex-end;">
  <div class="border-l" style="border-color:var(--w-border); background:white; width:320px;">
    <div class="flex items-center justify-between px-5 py-3" style="border-bottom:1px solid var(--w-border);">
      <span class="text-sm font-bold">Drawer Title</span>
      <span style="color:var(--w-muted)">✕</span>
    </div>
    <div class="p-5">
      <!-- content -->
    </div>
  </div>
</div>
```

### Bottom Sheet (Mobile)

화면 하단에서 올라오는 시트. 모바일 전용.

```html
<div style="position:relative; min-height:400px; background:rgba(0,0,0,0.1); display:flex; align-items:flex-end;">
  <div class="w-full rounded-t-xl" style="background:white; border-top:1px solid var(--w-border);">
    <div class="flex justify-center py-2">
      <div style="width:40px; height:4px; background:var(--w-border); border-radius:2px;"></div>
    </div>
    <div class="px-5 pb-5">
      <h3 class="text-sm font-bold mb-3">Sheet Title</h3>
      <!-- content -->
    </div>
  </div>
</div>
```

### Screen Header

각 화면의 제목.

```html
<h2 class="text-lg font-bold mb-5" style="color:var(--w-muted); border-bottom:1px solid var(--w-border); padding-bottom:8px;">
  Screen Name
</h2>
```

### Screen Notes

AI가 작성하는 화면 설명. 화면의 목적, 주요 인터랙션, 상태 전환을 자연어로 기술한다. template.html에 스타일이 정의되어 있으므로 아래 구조만 따른다.

```html
<div class="screen-notes">
  <details open>
    <summary>Notes</summary>
    <p>이 화면이 무엇을 보여주는지, 사용자가 어떤 행동을 하는지 설명</p>
    <ul>
      <li>주요 인터랙션: 어떤 요소를 조작하면 어떤 일이 일어나는지</li>
      <li>상태 전환: 특정 조건에서 화면이 어떻게 바뀌는지</li>
      <li>제약 사항: 비활성 조건, 유효성 검사 등</li>
    </ul>
  </details>
</div>
```

---

## 아이콘

유니코드 문자와 이모지를 직접 사용한다. 외부 아이콘 라이브러리는 사용하지 않는다.
