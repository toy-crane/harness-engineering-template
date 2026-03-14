# Wireframe HTML Style Guide

## 색상 팔레트

5개 CSS 변수만 사용한다. 인라인 `style=`에서 참조.

| 변수 | 값 | 용도 |
|------|------|------|
| `--w-bg` | `#f5f5f5` | 페이지 배경 |
| `--w-border` | `#ccc` | 테두리, 구분선 |
| `--w-text` | `#555` | 기본 텍스트 |
| `--w-muted` | `#aaa` | 보조 텍스트, 레이블, placeholder |
| `--w-fill` | `#eee` | 입력 필드 배경, 비활성 영역 |

> 이 변수 외의 색상을 사용하지 않는다. `rgba(0,0,0,0.1)`은 Modal 오버레이 배경에만 허용.

## 레이아웃 규칙

- Tailwind 유틸리티만 사용: `flex`, `grid`, `gap-*`, `p-*`, `m-*`, `rounded`, `text-*` 등
- `style=` 속성은 CSS 변수 참조에만 사용: `style="border-color:var(--w-border)"`
- 모든 `<input>`, `<select>`, `<button>` 요소에 `disabled` 추가 (와이어프레임은 비대화형)
- 최대 너비: 화면 컨텐츠에 `max-w-6xl mx-auto` 적용

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

### Button

```html
<button class="border rounded px-3 py-1 text-sm" style="border-color:var(--w-border); background:var(--w-fill)" disabled>Label</button>
```

### Input

```html
<input class="w-full border rounded px-3 py-1.5 text-sm" style="border-color:var(--w-border); background:var(--w-fill); color:var(--w-muted)" placeholder="Placeholder..." disabled>
```

값이 있는 Input:

```html
<input class="w-full border rounded px-3 py-1.5 text-sm" style="border-color:var(--w-border); background:var(--w-fill)" value="Example value" disabled>
```

### Select (Dropdown trigger)

```html
<div class="border rounded px-3 py-1.5 text-sm" style="border-color:var(--w-border); background:var(--w-fill)">Option ▾</div>
```

### Badge / Tag

```html
<span class="border rounded-full px-2 text-xs" style="border-color:var(--w-border); background:var(--w-fill)">Label</span>
```

제거 가능한 태그:

```html
<span class="border rounded-full px-2 text-xs" style="border-color:var(--w-border); background:var(--w-fill)">Label ✕</span>
```

### Toggle

```html
<div class="border rounded-full" style="width:32px;height:16px;background:var(--w-fill);border-color:var(--w-border);position:relative;">
  <div style="width:12px;height:12px;border-radius:50%;background:white;border:1px solid var(--w-border);position:absolute;top:1px;left:2px;"></div>
</div>
```

On 상태 (knob을 오른쪽으로):

```html
<div class="border rounded-full" style="width:32px;height:16px;background:var(--w-border);border-color:var(--w-border);position:relative;">
  <div style="width:12px;height:12px;border-radius:50%;background:white;border:1px solid var(--w-border);position:absolute;top:1px;right:2px;"></div>
</div>
```

### Empty State

```html
<div class="border-2 border-dashed rounded flex items-center justify-center p-8" style="border-color:var(--w-border); color:var(--w-muted)">
  No items yet
</div>
```

### Modal / Dialog

```html
<div class="rounded-lg" style="position:relative; min-height:400px; background:rgba(0,0,0,0.1); display:flex; align-items:center; justify-content:center;">
  <div class="border rounded-lg" style="border-color:var(--w-border); background:white; width:440px;">
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
      <button class="border rounded px-3 py-1 text-sm" style="border-color:var(--w-border); background:var(--w-fill)" disabled>Confirm</button>
    </div>
  </div>
</div>
```

### Progress Bar

```html
<div class="rounded-full overflow-hidden" style="height:4px; background:var(--w-fill)">
  <div class="rounded-full" style="height:100%; width:60%; background:var(--w-border)"></div>
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

### Label

폼 필드 위에 사용하는 레이블.

```html
<label class="text-xs" style="color:var(--w-muted)">Field Name</label>
```

### Screen Header

각 화면 상단에 표시하는 제목. 매핑된 시나리오 번호 포함.

```html
<h2 class="text-lg font-bold mb-5" style="color:var(--w-muted); border-bottom:1px solid var(--w-border); padding-bottom:8px;">
  Screen: Screen Name (scenarios: 1, 2, 3)
</h2>
```

## 아이콘

유니코드 문자와 이모지를 직접 사용한다:

| 용도 | 문자 |
|------|------|
| 메뉴 | `☰` |
| 라이트모드 | `☀` |
| 다크모드 | `🌙` |
| 닫기 | `✕` |
| 삭제 | `🗑` |
| 검색 | `🔍` |
| 캘린더/날짜 | `📅` |
| 경고 | `⚠` |
| 추가 | `+` |
| 내보내기 | `↑` |
| 가져오기 | `↓` |
