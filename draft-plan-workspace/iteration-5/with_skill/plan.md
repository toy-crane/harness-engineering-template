# kanban-todo 구현 계획

## Architecture Decisions

| 결정 사항 | 선택 | 사유 |
|-----------|------|------|
| DnD 라이브러리 | @atlaskit/pragmatic-drag-and-drop | 경량, headless, React 친화적 |
| 상태 관리 | React useState + Context | 단일 페이지 앱, 외부 라이브러리 불필요 |
| 다크모드 | next-themes | layout.tsx에 ThemeProvider 이미 설정됨 |
| 데이터 영속성 | localStorage | spec 요구사항 (KANBAN-024~026) |
| 컴포넌트 스타일 | shadcn/ui + Tailwind | 프로젝트 기존 패턴 준수 |

## Data Model

### Card
- id: string (required)
- title: string (required)
- description: string
- priority: "Low" | "Medium" | "High" | null
- tags: string[]
- subtasks: Subtask[]
- columnId: ColumnId (required)
- order: number (required)

### Subtask
- id: string (required)
- title: string (required)
- completed: boolean (required)

### Column
- id: ColumnId (required) — "todo" | "in-progress" | "done"
- title: string (required) — "To Do" | "In Progress" | "Done"
- cards → Card[]

### BoardState
- columns: Column[]
- searchQuery: string
- priorityFilter: Priority | null
- tagFilter: string | null

## Required Skills

| 스킬 | 적용 Task | 용도 |
|------|-----------|------|
| shadcn | Task 2 | progress 컴포넌트 설치 |

## Affected Files

| 파일 경로 | 변경 유형 | 관련 Task |
|-----------|----------|-----------|
| __tests__/kanban-todo.spec.test.tsx | 신규 | Task 1 |
| types/kanban.ts | 신규 | Task 2 |
| lib/kanban-storage.ts | 신규 | Task 3 |
| hooks/use-kanban-board.ts | 신규 | Task 4 |
| components/kanban/kanban-card.tsx | 신규 | Task 5 |
| components/kanban/card-detail-modal.tsx | 신규 | Task 6 |
| components/kanban/delete-confirm-dialog.tsx | 신규 | Task 6 |
| components/kanban/kanban-column.tsx | 신규 | Task 7 |
| components/kanban/kanban-header.tsx | 신규 | Task 8 |
| components/kanban/search-filter-bar.tsx | 신규 | Task 8 |
| components/kanban/kanban-board.tsx | 신규 | Task 9 |
| app/page.tsx | 수정 | Task 9 |
| components/ui/progress.tsx | 신규 | Task 2 |

변경 유형: 신규 | 수정 | 삭제

## Tasks

### Task 1: spec 테스트 생성

- **시나리오**: KANBAN-001 ~ KANBAN-029 전체
- **의존성**: 없음
- **참조**:
  - artifacts/spec.yaml
  - artifacts/kanban-todo/wireframe.html
  - __tests__/button.test.tsx — 기존 테스트 패턴 참조
- **구현 대상**: `__tests__/kanban-todo.spec.test.tsx` — spec.yaml의 모든 시나리오를 검증하는 수용 기준 테스트
- **수용 기준**:
  - [ ] 29개 시나리오 각각에 대응하는 테스트 케이스가 존재한다
  - [ ] `bun run test` 실행 시 모든 spec 테스트가 fail 상태이다 (Red)

---

### Task 2: 타입 정의 및 shadcn progress 컴포넌트 설치

- **시나리오**: 전체 (공통 기반)
- **의존성**: 없음
- **참조**:
  - spec.yaml — Card, Subtask, Column 필드 정의
  - shadcn — progress 컴포넌트 설치
- **구현 대상**:
  - `types/kanban.ts` — Card, Subtask, Column, ColumnId, Priority, BoardState 타입
  - `components/ui/progress.tsx` — shadcn progress 컴포넌트 (설치)
- **수용 기준**:
  - [ ] `types/kanban.ts`가 spec.yaml의 모든 데이터 필드를 포함한다
  - [ ] `bun run build` 시 타입 에러가 없다
  - [ ] `components/ui/progress.tsx`가 존재한다

---

### Task 3: localStorage 영속성 유틸

- **시나리오**: KANBAN-024, KANBAN-025, KANBAN-026
- **의존성**: Task 2 (타입 정의)
- **참조**:
  - types/kanban.ts
- **구현 대상**: `lib/kanban-storage.ts` — 보드 상태를 localStorage에 저장/로드하는 유틸 함수
- **수용 기준**:
  - [ ] `saveBoard(state)` 호출 후 `loadBoard()`가 동일한 상태를 반환한다
  - [ ] localStorage가 비어 있을 때 `loadBoard()`가 기본 3칼럼 빈 보드를 반환한다

---

### Task 4: 보드 상태 관리 훅

- **시나리오**: KANBAN-001, KANBAN-002, KANBAN-004, KANBAN-005, KANBAN-006, KANBAN-007, KANBAN-008, KANBAN-009, KANBAN-010, KANBAN-011, KANBAN-012, KANBAN-013, KANBAN-015, KANBAN-016, KANBAN-017, KANBAN-018, KANBAN-019, KANBAN-020, KANBAN-021, KANBAN-027, KANBAN-028, KANBAN-029
- **의존성**: Task 2 (타입), Task 3 (스토리지)
- **참조**:
  - types/kanban.ts
  - lib/kanban-storage.ts
- **구현 대상**: `hooks/use-kanban-board.ts` — 카드 CRUD, 칼럼 이동, 순서 변경, 검색, 필터, 영속성을 관리하는 커스텀 훅
- **수용 기준**:
  - [ ] `addCard("To Do", "장보기")` → "To Do" 칼럼에 "장보기" 카드 추가
  - [ ] `addCard("To Do", "")` → 에러 메시지 "제목을 입력해주세요" 반환
  - [ ] `updateCard(id, { description: "마트 가서 장보기" })` → 카드 설명 업데이트
  - [ ] `updateCard(id, { priority: "High" })` → 카드 우선순위 변경
  - [ ] `addTag(cardId, "개인")` → 카드에 태그 추가
  - [ ] `updateCardTitle(id, "마트 장보기")` → 카드 제목 변경
  - [ ] `updateCardTitle(id, "")` → 원래 제목 유지
  - [ ] `deleteCard(id)` → 카드 제거
  - [ ] `addSubtask(cardId, "우유 사기")` → 서브태스크 추가
  - [ ] `toggleSubtask(cardId, subtaskId)` → 서브태스크 완료/미완료 토글
  - [ ] `moveCard(cardId, "In Progress")` → 칼럼 간 이동
  - [ ] `reorderCard(cardId, 0)` → 같은 칼럼 내 순서 변경
  - [ ] `setSearchQuery("장")` → "장보기"만 필터링
  - [ ] `setPriorityFilter("High")` → High 우선순위 카드만 필터링
  - [ ] `setTagFilter("개인")` → "개인" 태그 카드만 필터링
  - [ ] 검색 + 필터 AND 조합이 동작한다
  - [ ] 상태 변경 시 localStorage에 자동 저장된다

---

### Task 5: KanbanCard 컴포넌트

- **시나리오**: KANBAN-001, KANBAN-005, KANBAN-006, KANBAN-007, KANBAN-008, KANBAN-014
- **의존성**: Task 2 (타입)
- **참조**:
  - wireframe.html Screen 1 (카드 보드) — 카드 UI 구조
  - components/ui/badge.tsx — 우선순위/태그 표시
  - components/ui/input.tsx — 인라인 제목 편집
- **구현 대상**: `components/kanban/kanban-card.tsx` — 제목, 우선순위 Badge, 태그 Badge, 서브태스크 진행률을 표시하고 인라인 제목 편집을 지원하는 카드 컴포넌트
- **수용 기준**:
  - [ ] 카드에 제목, 우선순위 Badge, 태그 Badge, 서브태스크 진행률(예: "1/2")이 표시된다
  - [ ] 제목 클릭 → 인라인 편집 모드 전환, Enter로 확정
  - [ ] 빈 제목으로 편집 시 원래 제목 유지
  - [ ] 카드 클릭 시 onCardClick 콜백 호출

---

### Task 6: CardDetailModal, DeleteConfirmDialog 컴포넌트

- **시나리오**: KANBAN-003, KANBAN-004, KANBAN-005, KANBAN-006, KANBAN-009, KANBAN-010, KANBAN-011, KANBAN-012, KANBAN-013, KANBAN-014
- **의존성**: Task 2 (타입), Task 5 (카드 컴포넌트 — UI 패턴 참조)
- **참조**:
  - wireframe.html Screen 2 (카드 상세) — 모달 UI 구조
  - wireframe.html Screen 3 (삭제 확인) — 다이얼로그 UI 구조
  - components/ui/dialog.tsx — 모달 기반
  - components/ui/alert-dialog.tsx — 삭제 확인 기반
  - components/ui/checkbox.tsx — 서브태스크 체크
  - components/ui/progress.tsx — 진행률 바
  - components/ui/textarea.tsx — 설명 입력
  - components/ui/input.tsx — 태그/서브태스크 입력
  - components/ui/button.tsx — 액션 버튼
- **구현 대상**:
  - `components/kanban/card-detail-modal.tsx` — 설명, 우선순위, 태그, 서브태스크 섹션이 있는 카드 상세 편집 모달
  - `components/kanban/delete-confirm-dialog.tsx` — "정말 삭제하시겠습니까?" 확인 다이얼로그
- **수용 기준**:
  - [ ] 모달에 제목, 설명, 우선순위, 태그, 서브태스크 섹션이 표시된다
  - [ ] 설명 입력 후 저장 → 다시 열면 설명 유지
  - [ ] 우선순위 Low/Medium/High 선택 가능
  - [ ] 태그 입력 + 추가 버튼 → 태그 추가
  - [ ] 서브태스크 입력 + 추가 → 체크리스트 추가
  - [ ] 서브태스크 체크박스 토글 → 완료/미완료 전환
  - [ ] 진행률 바와 "n/m" 텍스트가 서브태스크 상태를 반영
  - [ ] 삭제 버튼 클릭 → "정말 삭제하시겠습니까?" 다이얼로그 표시
  - [ ] 확인 → 카드 삭제, 취소 → 다이얼로그 닫기 (카드 유지)

---

### Task 7: KanbanColumn 컴포넌트 (DnD 포함)

- **시나리오**: KANBAN-001, KANBAN-002, KANBAN-015, KANBAN-016, KANBAN-027
- **의존성**: Task 2 (타입), Task 5 (KanbanCard)
- **참조**:
  - wireframe.html Screen 0 (기본 보드) — 칼럼 구조, 카드 추가 입력, 빈 상태
  - wireframe.html Screen 1 (카드 보드) — 드롭 타겟 표시
  - @atlaskit/pragmatic-drag-and-drop — DnD 구현
  - components/ui/input.tsx — 카드 추가 입력
  - components/ui/button.tsx — 추가 버튼
- **구현 대상**: `components/kanban/kanban-column.tsx` — 칼럼 헤더(제목 + 카드 수), 카드 추가 입력란, 카드 목록, DnD 드롭 영역을 포함하는 칼럼 컴포넌트
- **수용 기준**:
  - [ ] 칼럼 헤더에 제목("To Do" 등)과 카드 수 배지가 표시된다
  - [ ] "To Do" 칼럼에 카드 추가 입력란과 추가 버튼이 표시된다
  - [ ] 빈 제목 입력 시 "제목을 입력해주세요" 에러 메시지 표시
  - [ ] 카드가 없을 때 "카드가 없습니다" 빈 상태 표시
  - [ ] 카드를 다른 칼럼으로 드래그&드롭 가능
  - [ ] 같은 칼럼 내 카드 순서 변경 가능

---

### Task 8: KanbanHeader, SearchFilterBar 컴포넌트

- **시나리오**: KANBAN-017, KANBAN-018, KANBAN-019, KANBAN-020, KANBAN-021, KANBAN-022, KANBAN-023, KANBAN-028, KANBAN-029
- **의존성**: Task 2 (타입)
- **참조**:
  - wireframe.html Screen 0 (기본 보드) — 헤더, 검색바, 필터 드롭다운 구조
  - wireframe.html Screen 4 (검색 필터) — 활성 검색 + 필터 상태
  - wireframe.html Screen 5 (다크모드) — 다크모드 토글 아이콘 전환 (moon/sun)
  - components/ui/select.tsx — 우선순위/태그 필터 드롭다운
  - components/ui/input.tsx — 검색 입력
  - lucide-react — Moon, Sun, Search 아이콘
  - next-themes — useTheme 훅
- **구현 대상**:
  - `components/kanban/kanban-header.tsx` — 앱 제목("Kanban Todo")과 다크모드 토글 버튼
  - `components/kanban/search-filter-bar.tsx` — 검색 입력, 우선순위 필터 Select, 태그 필터 Select
- **수용 기준**:
  - [ ] 헤더에 "Kanban Todo" 제목과 다크모드 토글 버튼 표시
  - [ ] 라이트모드: Moon 아이콘, 다크모드: Sun 아이콘
  - [ ] 토글 클릭 → 라이트/다크 전환
  - [ ] 검색바에 텍스트 입력 → searchQuery 업데이트
  - [ ] 우선순위 필터 선택 → priorityFilter 업데이트
  - [ ] 태그 필터 선택 → tagFilter 업데이트
  - [ ] 필터를 "전체"로 변경 시 필터 초기화

---

### Task 9: KanbanBoard 조립 및 페이지 통합

- **시나리오**: KANBAN-001 ~ KANBAN-029 전체
- **의존성**: Task 4 (훅), Task 5, Task 6, Task 7, Task 8 (모든 컴포넌트)
- **참조**:
  - wireframe.html Screen 0~6 — 전체 레이아웃 (모바일 수직 스택, 데스크탑 수평 3칼럼)
  - hooks/use-kanban-board.ts
  - app/page.tsx
- **구현 대상**:
  - `components/kanban/kanban-board.tsx` — KanbanHeader, SearchFilterBar, 3개 KanbanColumn을 조립하고 useKanbanBoard 훅을 연결하는 보드 컴포넌트 (모바일: 수직 스택, 데스크탑: 수평 3칼럼)
  - `app/page.tsx` 수정 — KanbanBoard를 렌더링
- **수용 기준**:
  - [ ] `bun run test` 실행 시 Task 1의 spec 테스트 29개가 모두 통과한다
  - [ ] 3칼럼(To Do, In Progress, Done) 보드가 렌더링된다
  - [ ] 모바일 뷰포트에서 칼럼이 수직 스택으로 배치된다
  - [ ] 모든 기능(카드 CRUD, DnD, 검색, 필터, 다크모드, 영속성)이 통합 동작한다

---

## 미결정 사항

- shadcn progress 컴포넌트 미설치 시 대체 구현 여부 (Task 2에서 설치 시도 후 결정)
- @atlaskit/pragmatic-drag-and-drop 테스트 환경(jsdom) 호환성 — DnD 테스트는 통합 테스트로 대체할 수 있음
