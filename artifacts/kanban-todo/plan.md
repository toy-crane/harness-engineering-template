# Kanban Todo 구현 계획

## Architecture Decisions

| 결정 사항 | 선택 | 사유 |
|-----------|------|------|
| 상태 관리 | Zustand 단일 스토어 (boardStore) | 간단한 앱 규모, localStorage 직렬화 용이 |
| DnD 라이브러리 | @atlaskit/pragmatic-drag-and-drop | 이미 설치됨, 가볍고 접근성 우수 |
| 다크모드 | next-themes (ThemeProvider) | 이미 layout.tsx에 설정 완료 |
| 영속성 | Zustand persist 미들웨어 + localStorage | 별도 서비스 불필요, 미들웨어로 자동 동기화 |
| 칼럼 구조 | 고정 3칼럼 (To Do / In Progress / Done) | spec 요구사항, 칼럼 CRUD 제외 |
| ID 생성 | crypto.randomUUID() | 브라우저 내장 API, 외부 의존성 불필요 |
| 우선순위 선택 UI | ToggleGroup (radix) | shadcn forms 규칙: 2~7개 옵션은 ToggleGroup 사용 |

## Data Model

### Card
- id: string (required, crypto.randomUUID())
- title: string (required)
- description: string
- priority: "High" | "Medium" | "Low" | null
- tags: string[]
- subtasks: Subtask[]
- columnId: ColumnId (required)
- order: number (required)

### Subtask
- id: string (required, crypto.randomUUID())
- title: string (required)
- completed: boolean

### ColumnId
- "todo" | "in-progress" | "done"

### BoardState
- cards: Card[]
- searchQuery: string
- priorityFilter: Priority | null
- tagFilter: string | null

## Required Skills

| 스킬 | 용도 |
|------|------|
| shadcn | UI 컴포넌트 규칙 (composition, styling, forms, icons, base-vs-radix) |
| vercel-react-best-practices | 리렌더링 최적화, 클라이언트 상태 패턴 |
| frontend-design | 칸반 보드 비주얼 디자인 품질 |

## Affected Files

| 파일 경로 | 변경 유형 | 관련 Task |
|-----------|----------|-----------|
| `types/kanban.ts` | 신규 | Task 1 |
| `__tests__/kanban.spec.test.tsx` | 신규 | Task 2 |
| `lib/board-store.ts` | 신규 | Task 3 |
| `__tests__/board-store.test.tsx` | 신규 | Task 3 |
| `components/kanban/kanban-board.tsx` | 신규 | Task 4 |
| `components/kanban/kanban-column.tsx` | 신규 | Task 4 |
| `components/kanban/kanban-card.tsx` | 신규 | Task 4, Task 5, Task 6 |
| `components/kanban/card-add-form.tsx` | 신규 | Task 4 |
| `components/kanban/card-detail-modal.tsx` | 신규 | Task 5 |
| `components/kanban/subtask-list.tsx` | 신규 | Task 5 |
| `components/kanban/inline-title-edit.tsx` | 신규 | Task 5 |
| `components/kanban/search-filter-bar.tsx` | 신규 | Task 7 |
| `components/kanban/theme-toggle.tsx` | 신규 | Task 7 |
| `app/page.tsx` | 수정 | Task 4 |
| `__tests__/persistence.test.tsx` | 신규 | Task 8 |

변경 유형: 신규 | 수정 | 삭제

## Tasks

### Task 1: 타입 정의

- **시나리오**: 모든 시나리오의 기반
- **의존성**: 없음
- **참조 규칙**: `CLAUDE.md` Architecture 의존성 순서 (types → lib → components)
- **구현 대상**:
  - `types/kanban.ts`: Card, Subtask, ColumnId, Priority, BoardState 타입
- **수용 기준**:
  - [ ] Card 타입에 id, title, description, priority, tags, subtasks, columnId, order 필드 존재
  - [ ] ColumnId가 "todo" | "in-progress" | "done" 리터럴 유니온
  - [ ] Priority가 "High" | "Medium" | "Low" 리터럴 유니온
  - [ ] `bun run test` 통과 (기존 테스트 깨지지 않음)

---

### Task 2: Spec 테스트 (수용 기준 테스트)

- **시나리오**: KANBAN-001~029 전체
- **의존성**: Task 1 (타입) — spec 테스트에서 테스트 데이터 생성 시 타입 필요
- **참조 규칙**: `CLAUDE.md` spec 테스트 작성 규칙, `*.spec.test.tsx` 컨벤션
- **구현 대상**:
  - `__tests__/kanban.spec.test.tsx`: spec.yaml의 29개 시나리오를 렌더링 기반으로 검증
- **수용 기준**:
  - [ ] KANBAN-001: "To Do" 칼럼에서 "장보기" 카드 추가 → 화면에 "장보기" 텍스트 표시
  - [ ] KANBAN-002: 빈 제목 확인 → "제목을 입력해주세요" 오류 메시지 표시
  - [ ] KANBAN-003: 카드 클릭 → Dialog에 "설명", "우선순위", "태그", "서브태스크" 섹션 표시
  - [ ] KANBAN-004~006: 설명 Textarea/우선순위 ToggleGroup/태그 Input+Badge 편집 → 변경 반영
  - [ ] KANBAN-007~008: 인라인 제목 Input 편집 → Enter로 저장, 빈 제목은 원래 값 유지
  - [ ] KANBAN-009~011: 삭제 → AlertDialog "정말 삭제하시겠습니까?" → 확인 시 삭제, 취소 시 유지
  - [ ] KANBAN-012~014: 서브태스크 Checkbox 추가/토글/진행률
  - [ ] KANBAN-015~016, 027: 드래그&드롭 칼럼 간/내 이동
  - [ ] KANBAN-017~018, 028: Input 검색바 필터링
  - [ ] KANBAN-019~021, 029: Select 드롭다운으로 우선순위/태그 필터
  - [ ] KANBAN-022~023: Button으로 다크모드 토글
  - [ ] KANBAN-024~026: localStorage 영속성
  - [ ] 테스트 파일 생성 시점에는 Red 상태 (컴포넌트 미구현)

---

### Task 3: Zustand 스토어 + 스토어 단위 테스트

- **시나리오**: KANBAN-001~029 전체 (스토어 로직 검증)
- **의존성**: Task 1 (타입)
- **참조 규칙**: `CLAUDE.md` TDD 규칙, `*.test.tsx` 구현 테스트 컨벤션, `vercel-react-best-practices` (클라이언트 상태 패턴)
- **구현 대상**:
  - `lib/board-store.ts`: Zustand 스토어 (persist 미들웨어 포함)
    - 액션: addCard, updateCard, deleteCard, moveCard, reorderCard
    - 액션: addSubtask, toggleSubtask
    - 액션: setSearchQuery, setPriorityFilter, setTagFilter
    - 파생: filteredCards (검색 + 필터 AND 조합)
  - `__tests__/board-store.test.tsx`: 스토어 액션별 단위 테스트
- **수용 기준**:
  - [ ] addCard: 제목 "장보기" 추가 → cards.length === 1, cards[0].title === "장보기"
  - [ ] addCard: 빈 제목 추가 → cards.length === 0
  - [ ] updateCard: description "마트 가서 장보기" 설정 → 해당 카드 description 일치
  - [ ] updateCard: priority "High" 설정 → 해당 카드 priority === "High"
  - [ ] updateCard: tags에 "개인" 추가 → 해당 카드 tags에 "개인" 포함
  - [ ] deleteCard: 카드 삭제 → cards에서 제거됨
  - [ ] moveCard: "todo" → "in-progress" → columnId 변경 확인
  - [ ] reorderCard: 칼럼 내 순서 변경 → order 값 갱신 확인
  - [ ] addSubtask: "우유 사기" 추가 → subtasks.length === 1
  - [ ] toggleSubtask: 체크 토글 → completed 상태 반전
  - [ ] filteredCards: searchQuery "장" → "장보기"만 반환
  - [ ] filteredCards: priorityFilter "High" → High 카드만 반환
  - [ ] filteredCards: searchQuery "장" + priorityFilter "High" → AND 조합 결과
  - [ ] `bun run test` — `__tests__/board-store.test.tsx` 통과

---

### Task 4: 칸반 보드 기본 UI (칼럼 + 카드 + 추가)

- **시나리오**: KANBAN-001, KANBAN-002
- **의존성**: Task 3 (스토어)
- **참조 규칙**: `shadcn` (composition.md — Badge로 우선순위/태그 표시, Dialog Title 필수), `shadcn` (styling.md — semantic color, gap, cn(), 수동 dark: 오버라이드 금지), `shadcn` (forms.md — Field+Input으로 카드 제목 입력, data-invalid로 유효성 표시), `shadcn` (icons.md — lucide-react, data-icon), `frontend-design` (와이어프레임 기반 비주얼 디자인), `vercel-react-best-practices` (리렌더링 최적화)
- **구현 대상**:
  - `components/kanban/kanban-board.tsx`: 3칼럼 보드 레이아웃 (@container 반응형 — 모바일: 세로 스택, 데스크톱: 가로 배치)
  - `components/kanban/kanban-column.tsx`: 칼럼 컴포넌트 (제목, 카드 수 표시, 카드 목록)
  - `components/kanban/kanban-card.tsx`: 카드 컴포넌트 (제목, 우선순위 Badge, 태그 Badge, 서브태스크 진행률, GripVertical 드래그 핸들)
  - `components/kanban/card-add-form.tsx`: 카드 추가 폼 (Input + 확인/취소 Button, 빈 제목 시 "제목을 입력해주세요" 오류)
  - `app/page.tsx`: KanbanBoard 렌더링으로 교체
- **수용 기준**:
  - [ ] 보드에 "To Do", "In Progress", "Done" 3칼럼 표시
  - [ ] "카드 추가" Button 클릭 → Input 폼 확장
  - [ ] "장보기" 입력 후 확인 Button → "To Do" 칼럼에 "장보기" 카드 표시
  - [ ] 빈 제목으로 확인 → "제목을 입력해주세요" 오류 메시지 표시
  - [ ] 카드에 우선순위 Badge, 태그 Badge, 서브태스크 진행률 (CheckSquare 아이콘 + "n/m") 표시
  - [ ] `bun run test` — KANBAN-001, KANBAN-002 spec 테스트 통과
  - [ ] `bun run test` — 구현 테스트 (`*.test.tsx`) 통과

---

### Task 5: 카드 상세 Dialog + 인라인 편집 + AlertDialog 삭제 + 서브태스크

- **시나리오**: KANBAN-003~014
- **의존성**: Task 4 (카드 컴포넌트)
- **참조 규칙**: `shadcn` (composition.md — Dialog Title 필수, AlertDialog로 삭제 확인, Badge로 태그 표시), `shadcn` (forms.md — ToggleGroup type="single"으로 우선순위 선택, Field+Textarea로 설명, Checkbox로 서브태스크), `shadcn` (base-vs-radix.md — radix ToggleGroup: type="single" defaultValue="string"), `shadcn` (styling.md — semantic color, cn()), `shadcn` (icons.md — lucide-react, data-icon), `frontend-design` (와이어프레임 Screen 2~5 기반)
- **구현 대상**:
  - `components/kanban/card-detail-modal.tsx`: Dialog 기반 상세 모달
    - 설명: Textarea
    - 우선순위: ToggleGroup type="single" (High/Medium/Low ToggleGroupItem)
    - 태그: Input + Badge 목록 (X 아이콘으로 태그 제거)
    - 삭제: AlertDialog 확인 ("정말 삭제하시겠습니까?")
    - 저장 Button
  - `components/kanban/subtask-list.tsx`: Checkbox 체크리스트 + Progress 컴포넌트로 진행률 표시 + "n/m" 텍스트 + Input으로 서브태스크 추가
  - `components/kanban/inline-title-edit.tsx`: 카드 제목 클릭 → Input 전환 (Enter 저장, Esc 취소, 빈 제목 거부)
  - shadcn 추가 필요: `bunx --bun shadcn@latest add toggle-group progress`
- **수용 기준**:
  - [ ] 카드 클릭 → Dialog 열림, DialogTitle에 카드 제목, "설명", "우선순위", "태그", "서브태스크" 섹션 표시
  - [ ] 설명 Textarea에 "마트 가서 장보기" 입력 후 저장 → 재오픈 시 반영
  - [ ] 우선순위 ToggleGroup에서 "High" 선택 → 카드 Badge에 "High" 표시
  - [ ] 태그 Input에 "개인" 입력 후 추가 Button → 카드 Badge에 "개인" 표시
  - [ ] 서브태스크 Input에 "우유 사기" 입력 후 추가 Button → Checkbox 체크리스트에 표시
  - [ ] 서브태스크 Checkbox 클릭 → 완료 표시 (line-through), 진행률 "1/1"
  - [ ] 2개 중 1개 완료 → 진행률 "1/2"
  - [ ] 인라인 제목 편집: "마트 장보기"로 수정 후 Enter → 제목 변경
  - [ ] 인라인 제목 편집: 빈 제목으로 Enter → 원래 제목 유지
  - [ ] 삭제 Button → AlertDialog "정말 삭제하시겠습니까?"
  - [ ] AlertDialog 확인 → 카드 삭제, 취소 → 카드 유지
  - [ ] `bun run test` — KANBAN-003~014 spec 테스트 통과
  - [ ] `bun run test` — 구현 테스트 (`*.test.tsx`) 통과

---

### Task 6: 드래그&드롭

- **시나리오**: KANBAN-015, KANBAN-016, KANBAN-027
- **의존성**: Task 4 (칼럼/카드 컴포넌트)
- **참조 규칙**: `@atlaskit/pragmatic-drag-and-drop` API (draggable, dropTargetForElements, monitorDragHandles), `@atlaskit/pragmatic-drag-and-drop-hitbox` (reorderWithEdge, closestEdge), `vercel-react-best-practices` (리렌더링 최적화 — 드래그 중 불필요한 리렌더 방지)
- **구현 대상**:
  - `components/kanban/kanban-card.tsx`: draggable 설정 (GripVertical 아이콘 핸들)
  - `components/kanban/kanban-column.tsx`: dropTargetForElements 설정
  - `lib/board-store.ts`: moveCard, reorderCard 액션이 DnD 이벤트와 연결
- **수용 기준**:
  - [ ] "To Do"의 "장보기"를 "In Progress"로 드래그 → "In Progress"에 표시, "To Do"에서 제거
  - [ ] "In Progress"의 "장보기"를 "Done"으로 드래그 → "Done"에 표시
  - [ ] "To Do" 내 "공부하기"를 첫 번째로 드래그 → 순서 "공부하기, 장보기, 운동하기"
  - [ ] `bun run test` — KANBAN-015, KANBAN-016, KANBAN-027 spec 테스트 통과
  - [ ] `bun run test` — 구현 테스트 (`*.test.tsx`) 통과

---

### Task 7: Input 검색바 + Select 드롭다운 필터 + Button 다크모드 토글

- **시나리오**: KANBAN-017~023, KANBAN-028, KANBAN-029
- **의존성**: Task 4 (보드 UI), Task 5 (우선순위/태그 데이터)
- **참조 규칙**: `shadcn` (forms.md — Select로 필터 드롭다운, SelectGroup+SelectItem 필수), `shadcn` (composition.md — asChild, SelectGroup 안에 SelectItem), `shadcn` (base-vs-radix.md — radix Select: placeholder로 "전체" 표시), `shadcn` (styling.md — semantic color, dark: 토큰 자동 적용, 수동 dark: 오버라이드 금지), `shadcn` (icons.md — Moon/Sun 아이콘, data-icon), `vercel-react-best-practices` (파생 상태 최적화)
- **구현 대상**:
  - `components/kanban/search-filter-bar.tsx`: InputGroup+InputGroupInput 검색바 (Search 아이콘 + X 클리어) + Select 드롭다운 (우선순위: 전체/High/Medium/Low, 태그: 전체/동적 태그 목록)
  - `components/kanban/theme-toggle.tsx`: Button + Moon/Sun 아이콘 토글 (next-themes useTheme)
  - `components/kanban/kanban-board.tsx`: 검색/필터 바와 테마 토글을 보드 헤더에 배치
- **수용 기준**:
  - [ ] InputGroup 검색바에 "장" 입력 → "장보기"만 표시
  - [ ] 검색바에 "하기" 입력 → 3개 카드 모두 표시
  - [ ] 검색어 삭제 (X Button 또는 비움) → 모든 카드 표시
  - [ ] Select 우선순위 필터 "High" → High 카드만 표시
  - [ ] Select 태그 필터 "개인" → "개인" 태그 카드만 표시
  - [ ] 검색 "장" + 우선순위 "High" → AND 조합 결과
  - [ ] Select 필터 "전체" 선택 → 모든 카드 표시
  - [ ] 검색 결과 카드에서 매칭된 검색어가 하이라이트 (<mark> 또는 배경색)로 표시됨
  - [ ] Button 다크모드 토글 → html에 dark 클래스 적용, Moon→Sun 아이콘 전환
  - [ ] 다크모드 재토글 → 라이트모드 복원
  - [ ] `bun run test` — KANBAN-017~023, KANBAN-028, KANBAN-029 spec 테스트 통과
  - [ ] `bun run test` — 구현 테스트 (`*.test.tsx`) 통과

---

### Task 8: localStorage 영속성 검증 + 최종 통합 테스트

- **시나리오**: KANBAN-024, KANBAN-025, KANBAN-026
- **의존성**: Task 7 (모든 기능 구현 완료)
- **참조 규칙**: `vercel-react-best-practices` (클라이언트 localStorage 스키마)
- **구현 대상**:
  - `lib/board-store.ts`: persist 미들웨어 동작 검증 및 필요 시 조정
  - `__tests__/persistence.test.tsx`: localStorage 저장/복원 테스트
- **수용 기준**:
  - [ ] 카드 3개 추가 후 스토어 재생성 (localStorage 복원) → 3개 카드 유지
  - [ ] 카드 "In Progress" 이동 후 복원 → "In Progress" 칼럼에 카드 유지
  - [ ] 다크모드 설정 후 복원 → 다크모드 유지
  - [ ] `bun run test` — KANBAN-024~026 spec 테스트 통과
  - [ ] `bun run test` — 전체 29개 시나리오 통과
  - [ ] `bun run test` — 모든 테스트 (spec + 구현) 통과

---

## 미결정 사항

없음
