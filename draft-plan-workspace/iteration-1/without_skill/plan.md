# kanban-todo 구현 계획

## Architecture Decisions

| 결정 사항 | 선택 | 사유 |
|-----------|------|------|
| DnD 라이브러리 | @atlaskit/pragmatic-drag-and-drop | 지정됨 |
| 상태 관리 | React useState + Context | 지정됨 |
| 다크모드 | next-themes | 이미 layout.tsx에 ThemeProvider 설정됨 |
| 영속성 | localStorage | spec KANBAN-024~026 요구사항 |
| UI 컴포넌트 | shadcn/ui (기존 설치분 활용) | AlertDialog, Badge, Button, Card, Checkbox, Dialog, Input, Select 등 이미 존재 |
| ID 생성 | nanoid | 이미 node_modules에 존재 |

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

### BoardState
- cards: Card[]

## Required Skills

| 스킬 | 적용 Task | 용도 |
|------|-----------|------|
| shadcn | Task 3, 4, 5, 6, 7, 8, 9 | UI 컴포넌트 활용 가이드 |

## Affected Files

| 파일 경로 | 변경 유형 | 관련 Task |
|-----------|----------|-----------|
| types/kanban.ts | 신규 | Task 2 |
| lib/kanban-storage.ts | 신규 | Task 3 |
| hooks/use-kanban-board.ts | 신규 | Task 4 |
| hooks/use-kanban-filter.ts | 신규 | Task 8 |
| components/kanban/board-header.tsx | 신규 | Task 5 |
| components/kanban/kanban-column.tsx | 신규 | Task 5 |
| components/kanban/kanban-card.tsx | 신규 | Task 5 |
| components/kanban/card-add-form.tsx | 신규 | Task 5 |
| components/kanban/kanban-board.tsx | 신규 | Task 5 |
| components/kanban/card-detail-modal.tsx | 신규 | Task 6 |
| components/kanban/delete-confirm-dialog.tsx | 신규 | Task 7 |
| components/kanban/search-filter-bar.tsx | 신규 | Task 8 |
| app/page.tsx | 수정 | Task 10 |
| __tests__/kanban-todo.spec.test.tsx | 신규 | Task 1 |
| __tests__/kanban-storage.test.tsx | 신규 | Task 3 |
| __tests__/use-kanban-board.test.tsx | 신규 | Task 4 |
| __tests__/kanban-card.test.tsx | 신규 | Task 5 |
| __tests__/card-detail-modal.test.tsx | 신규 | Task 6 |
| __tests__/delete-confirm-dialog.test.tsx | 신규 | Task 7 |
| __tests__/search-filter.test.tsx | 신규 | Task 8 |
| __tests__/kanban-dnd.test.tsx | 신규 | Task 9 |

## Tasks

### Task 1: spec 테스트 생성

- **시나리오**: KANBAN-001 ~ KANBAN-029 (전체)
- **의존성**: 없음
- **참조**:
  - artifacts/spec.yaml
  - __tests__/button.test.tsx — 기존 테스트 패턴
- **구현 대상**: spec.yaml의 모든 시나리오를 검증하는 수용 기준 테스트 파일 `__tests__/kanban-todo.spec.test.tsx`
- **수용 기준**:
  - [ ] KANBAN-001 ~ KANBAN-029 각 시나리오에 대응하는 테스트 케이스가 존재한다
  - [ ] `bun run test __tests__/kanban-todo.spec.test.tsx` 실행 시 모든 테스트가 FAIL (Red 상태)

---

### Task 2: 타입 정의

- **시나리오**: 전체 (데이터 모델 기반)
- **의존성**: 없음
- **참조**:
  - artifacts/spec.yaml — Card 속성 (title, description, priority, tags, subtasks)
  - artifacts/kanban-todo/wireframe.html — 칼럼 3개 고정 (To Do, In Progress, Done)
- **구현 대상**: `types/kanban.ts` — Card, Subtask, ColumnId, BoardState 타입
- **수용 기준**:
  - [ ] Card 타입에 id, title, description, priority, tags, subtasks, columnId, order 필드가 존재한다
  - [ ] Subtask 타입에 id, title, completed 필드가 존재한다
  - [ ] ColumnId 타입이 "todo" | "in-progress" | "done" 유니온이다
  - [ ] `bun run build` 시 타입 오류 없음

---

### Task 3: localStorage 영속성 모듈

- **시나리오**: KANBAN-024, KANBAN-025, KANBAN-026
- **의존성**: Task 2 (Card, BoardState 타입 참조)
- **참조**:
  - artifacts/spec.yaml — 영속성 시나리오
  - wireframe Screen 6 — 새로고침 후 카드, 칼럼 위치, 다크모드 유지
- **구현 대상**: `lib/kanban-storage.ts` — BoardState를 localStorage에 저장/로드하는 순수 함수, 구현 테스트 `__tests__/kanban-storage.test.tsx`
- **수용 기준**:
  - [ ] save(boardState) 후 load()하면 동일한 boardState가 반환된다
  - [ ] localStorage가 비어 있으면 load()가 빈 카드 배열의 초기 상태를 반환한다
  - [ ] 잘못된 JSON이 저장되어 있으면 load()가 초기 상태를 반환한다

---

### Task 4: 보드 상태 관리 Hook

- **시나리오**: KANBAN-001, KANBAN-002, KANBAN-004, KANBAN-005, KANBAN-006, KANBAN-007, KANBAN-008, KANBAN-009, KANBAN-010, KANBAN-011, KANBAN-012, KANBAN-013
- **의존성**: Task 2 (타입), Task 3 (영속성)
- **참조**:
  - artifacts/spec.yaml — 카드 CRUD, 서브태스크 관리 시나리오
- **구현 대상**: `hooks/use-kanban-board.ts` — 카드 추가/수정/삭제, 서브태스크 추가/토글, 칼럼 이동 로직을 관리하는 Hook. 구현 테스트 `__tests__/use-kanban-board.test.tsx`
- **수용 기준**:
  - [ ] addCard("To Do", "장보기") -> "To Do" 칼럼에 "장보기" 카드가 추가된다
  - [ ] addCard("To Do", "") -> "제목을 입력해주세요" 에러가 반환된다
  - [ ] updateCard(id, { description: "마트 가서 장보기" }) -> 해당 카드의 설명이 변경된다
  - [ ] updateCard(id, { priority: "High" }) -> 해당 카드의 우선순위가 변경된다
  - [ ] addTag(cardId, "개인") -> 해당 카드에 "개인" 태그가 추가된다
  - [ ] updateCardTitle(id, "마트 장보기") -> 카드 제목이 변경된다
  - [ ] updateCardTitle(id, "") -> 카드 제목이 변경되지 않는다
  - [ ] deleteCard(id) -> 해당 카드가 제거된다
  - [ ] addSubtask(cardId, "우유 사기") -> 서브태스크가 추가된다
  - [ ] toggleSubtask(cardId, subtaskId) -> 서브태스크 완료 상태가 토글된다
  - [ ] moveCard(cardId, "in-progress") -> 카드가 "In Progress" 칼럼으로 이동한다
  - [ ] 상태 변경 시 localStorage에 자동 저장된다

---

### Task 5: 보드 레이아웃 컴포넌트 (헤더, 칼럼, 카드, 카드 추가 폼)

- **시나리오**: KANBAN-001, KANBAN-002, KANBAN-007, KANBAN-008, KANBAN-022, KANBAN-023
- **의존성**: Task 2 (타입), Task 4 (보드 상태 Hook)
- **참조**:
  - wireframe Screen 0 — 기본 보드: 3칼럼 고정 레이아웃, 헤더(타이틀 + 다크모드 토글), 카드 추가 입력폼, 빈 상태
  - wireframe Screen 1 — 카드 보드: 카드 컴포넌트(제목, 우선순위 Badge, 태그 Badge, 서브태스크 진행률), 인라인 제목 편집
  - wireframe Screen 5 — 다크모드: 토글 아이콘 moon/sun 전환
- **구현 대상**:
  - `components/kanban/board-header.tsx` — 앱 타이틀 + 다크모드 토글 Button (moon/sun 아이콘)
  - `components/kanban/kanban-column.tsx` — 칼럼 컨테이너 (칼럼 제목 + 카드 카운트 Badge + 빈 상태 + 카드 목록)
  - `components/kanban/kanban-card.tsx` — 카드 컴포넌트 (인라인 편집 가능한 제목, 우선순위 Badge, 태그 Badge, 서브태스크 진행률 텍스트)
  - `components/kanban/card-add-form.tsx` — 카드 추가 입력폼 (Input + 추가 Button, 에러 메시지)
  - `components/kanban/kanban-board.tsx` — 3칼럼 레이아웃을 조합하는 보드 컨테이너
  - 구현 테스트 `__tests__/kanban-card.test.tsx`
- **수용 기준**:
  - [ ] 3칼럼(To Do, In Progress, Done)이 표시된다
  - [ ] 각 칼럼에 카드 개수 Badge가 표시된다
  - [ ] "To Do" 칼럼에 카드 추가 입력폼이 존재한다
  - [ ] 카드에 제목, 우선순위 Badge, 태그 Badge, 서브태스크 진행률이 표시된다
  - [ ] 카드 제목 클릭 시 인라인 편집 모드로 전환되고 Enter로 확정된다
  - [ ] 빈 제목 입력 시 "제목을 입력해주세요" 에러 메시지가 표시된다
  - [ ] 다크모드 토글 클릭 시 테마가 전환된다 (moon/sun 아이콘 변경)
  - [ ] 칼럼에 카드가 없으면 빈 상태("카드가 없습니다")가 표시된다

---

### Task 6: 카드 상세 모달 (설명, 우선순위, 태그, 서브태스크)

- **시나리오**: KANBAN-003, KANBAN-004, KANBAN-005, KANBAN-006, KANBAN-012, KANBAN-013, KANBAN-014
- **의존성**: Task 4 (보드 상태 Hook), Task 5 (카드 클릭 트리거)
- **참조**:
  - wireframe Screen 2 — 카드 상세 모달: 헤더(제목 + X 닫기), 설명 텍스트영역, 우선순위 선택(Low/Medium/High), 태그 목록 + 태그 추가 입력, 서브태스크 체크리스트 + 진행률 바 + 서브태스크 추가 입력, 푸터(삭제 Button)
- **구현 대상**:
  - `components/kanban/card-detail-modal.tsx` — Dialog 기반 카드 상세 모달 (설명 Textarea, 우선순위 버튼 그룹, 태그 Badge + 추가 Input, 서브태스크 Checkbox 리스트 + 진행률 바 + 추가 Input, 삭제 Button)
  - 구현 테스트 `__tests__/card-detail-modal.test.tsx`
- **수용 기준**:
  - [ ] 카드 클릭 시 모달에 제목, 설명, 우선순위, 태그, 서브태스크 섹션이 표시된다
  - [ ] 설명 입력 후 저장하면 재오픈 시 유지된다
  - [ ] 우선순위 "High" 선택 시 카드에 반영된다
  - [ ] 태그 "개인" 추가 시 카드에 반영된다
  - [ ] 서브태스크 "우유 사기" 추가 시 체크리스트에 표시된다
  - [ ] 서브태스크 체크 시 완료 표시 + 진행률 "1/1" 표시된다
  - [ ] 서브태스크 2개 중 1개 완료 시 진행률 "1/2" 표시된다

---

### Task 7: 카드 삭제 확인 다이얼로그

- **시나리오**: KANBAN-009, KANBAN-010, KANBAN-011
- **의존성**: Task 4 (삭제 로직), Task 6 (모달에서 삭제 버튼 트리거)
- **참조**:
  - wireframe Screen 3 — 삭제 확인: AlertDialog (경고 아이콘 + "정말 삭제하시겠습니까?" + 취소/확인 Button)
- **구현 대상**:
  - `components/kanban/delete-confirm-dialog.tsx` — AlertDialog 기반 삭제 확인 다이얼로그 (AlertTriangle 아이콘, "정말 삭제하시겠습니까?" 메시지, 취소 Button + 확인 Button)
  - 구현 테스트 `__tests__/delete-confirm-dialog.test.tsx`
- **수용 기준**:
  - [ ] 삭제 버튼 클릭 시 "정말 삭제하시겠습니까?" 다이얼로그가 표시된다
  - [ ] "확인" 클릭 시 카드가 보드에서 제거된다
  - [ ] "취소" 클릭 시 다이얼로그가 닫히고 카드가 유지된다

---

### Task 8: 검색 및 필터 기능

- **시나리오**: KANBAN-017, KANBAN-018, KANBAN-019, KANBAN-020, KANBAN-021, KANBAN-028, KANBAN-029
- **의존성**: Task 2 (타입), Task 4 (보드 상태), Task 5 (보드 렌더링)
- **참조**:
  - wireframe Screen 4 — 검색/필터: 검색바(Search 아이콘 + 입력 + X 클리어), 우선순위 드롭다운, 태그 드롭다운, 비매칭 카드 숨김
- **구현 대상**:
  - `hooks/use-kanban-filter.ts` — 검색어 + 우선순위 + 태그 필터 상태 관리 및 카드 필터링 로직 Hook
  - `components/kanban/search-filter-bar.tsx` — 검색 Input (Search 아이콘 + X 클리어) + 우선순위 Select + 태그 Select
  - 구현 테스트 `__tests__/search-filter.test.tsx`
- **수용 기준**:
  - [ ] 검색바에 "장" 입력 시 "장보기"만 표시되고 나머지 숨겨진다
  - [ ] 검색어 삭제 시 모든 카드가 표시된다
  - [ ] 검색바에 "하기" 입력 시 "장보기", "공부하기", "운동하기" 3개 모두 표시된다
  - [ ] 우선순위 필터 "High" 선택 시 High 카드만 표시된다
  - [ ] 태그 필터 "개인" 선택 시 해당 태그 카드만 표시된다
  - [ ] 검색어 "장" + 우선순위 "High" 동시 적용 시 AND 조합으로 "장보기"만 표시된다
  - [ ] 우선순위 필터 "전체"로 변경 시 모든 카드가 표시된다

---

### Task 9: 드래그&드롭

- **시나리오**: KANBAN-015, KANBAN-016, KANBAN-027
- **의존성**: Task 4 (moveCard, reorderCard 로직), Task 5 (칼럼/카드 렌더링)
- **참조**:
  - wireframe Screen 1 — 드래그 타겟 인디케이터 ("여기에 드롭" dashed border 영역)
  - @atlaskit/pragmatic-drag-and-drop 문서
- **구현 대상**: kanban-card, kanban-column 컴포넌트에 @atlaskit/pragmatic-drag-and-drop 연결. 카드 간 순서 변경 및 칼럼 간 이동. 드롭 타겟 인디케이터. 구현 테스트 `__tests__/kanban-dnd.test.tsx`
- **수용 기준**:
  - [ ] "장보기" 카드를 "To Do"에서 "In Progress"로 드롭하면 "In Progress"에 표시되고 "To Do"에서 제거된다
  - [ ] "장보기" 카드를 "In Progress"에서 "Done"으로 드롭하면 "Done"에 표시되고 "In Progress"에서 제거된다
  - [ ] "To Do" 칼럼 내에서 "공부하기"를 "장보기" 위로 드롭하면 순서가 변경된다
  - [ ] 드래그 중 드롭 타겟 인디케이터가 표시된다

---

### Task 10: 페이지 통합 및 전체 검증

- **시나리오**: KANBAN-024, KANBAN-025, KANBAN-026 (영속성 검증 포함)
- **의존성**: Task 5, 6, 7, 8, 9 (모든 컴포넌트)
- **참조**:
  - wireframe Screen 6 — 새로고침 후 데이터 유지 검증
  - app/page.tsx — 현재 ComponentExample를 KanbanBoard로 교체
- **구현 대상**: `app/page.tsx` 수정 — KanbanBoard를 메인 페이지에 배치. 전체 spec 테스트 통과 확인
- **수용 기준**:
  - [ ] `bun run test __tests__/kanban-todo.spec.test.tsx` 실행 시 모든 테스트 통과 (Green 상태)
  - [ ] `bun run build` 성공
  - [ ] 카드 3개 추가 후 새로고침 시 3개 유지된다
  - [ ] 칼럼 이동 후 새로고침 시 이동 위치 유지된다
  - [ ] 다크모드 설정 후 새로고침 시 다크모드 유지된다

---

## 미결정 사항

- 태그 삭제 기능: spec.yaml에 태그 삭제 시나리오가 없으므로 구현 범위에서 제외. 추후 필요 시 추가.
- 서브태스크 삭제 기능: spec.yaml에 서브태스크 삭제 시나리오가 없으므로 구현 범위에서 제외.
- 카드 추가 폼 배치: wireframe에서 "To Do" 칼럼에만 카드 추가 폼이 있음. 다른 칼럼에도 필요한지 여부는 spec에 명시되지 않아 "To Do" 칼럼만 적용.
