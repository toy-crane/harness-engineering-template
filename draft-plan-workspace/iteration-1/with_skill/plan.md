# kanban-todo 구현 계획

## Architecture Decisions

| 결정 사항 | 선택 | 사유 |
|-----------|------|------|
| DnD 라이브러리 | @atlaskit/pragmatic-drag-and-drop | 지정됨 |
| 상태 관리 | React useState + Context | 지정됨 |
| 다크모드 | next-themes | 이미 layout.tsx에 ThemeProvider 설정됨 |
| 데이터 영속성 | localStorage | spec KANBAN-024~026 요구사항 |
| 칼럼 구조 | 3칼럼 고정 (To Do, In Progress, Done) | spec 고정 요구사항 |
| UI 컴포넌트 | shadcn/ui (Dialog, AlertDialog, Badge, Button, Input, Select, Checkbox, Textarea) | 프로젝트에 이미 설치됨 |

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

### ColumnId
- "todo" | "in-progress" | "done" (union type)

### Column
- id: ColumnId (required)
- title: "To Do" | "In Progress" | "Done" (required)

### BoardState
- cards: Card[] (required)

## Required Skills

| 스킬 | 적용 Task | 용도 |
|------|-----------|------|
| shadcn | Task 4, 5, 6, 7, 8, 9 | UI 컴포넌트 사용법 참조 |

## Affected Files

| 파일 경로 | 변경 유형 | 관련 Task |
|-----------|----------|-----------|
| types/kanban.ts | 신규 | Task 2 |
| lib/kanban-storage.ts | 신규 | Task 3 |
| hooks/use-kanban-board.ts | 신규 | Task 4 |
| components/kanban-header.tsx | 신규 | Task 5 |
| components/kanban-search-filter-bar.tsx | 신규 | Task 6 |
| components/kanban-card.tsx | 신규 | Task 7 |
| components/kanban-card-detail-modal.tsx | 신규 | Task 8 |
| components/kanban-column.tsx | 신규 | Task 9 |
| components/kanban-board.tsx | 신규 | Task 10 |
| app/page.tsx | 수정 | Task 10 |
| __tests__/kanban.spec.test.tsx | 신규 | Task 1 |
| __tests__/kanban-storage.test.ts | 신규 | Task 3 |
| __tests__/use-kanban-board.test.tsx | 신규 | Task 4 |
| __tests__/kanban-card.test.tsx | 신규 | Task 7 |
| __tests__/kanban-card-detail-modal.test.tsx | 신규 | Task 8 |
| __tests__/kanban-board.test.tsx | 신규 | Task 10 |

변경 유형: 신규 | 수정 | 삭제

## Tasks

### Task 1: spec 테스트 생성

- **시나리오**: KANBAN-001 ~ KANBAN-029 (전체)
- **의존성**: 없음
- **참조**:
  - artifacts/spec.yaml
  - artifacts/kanban-todo/wireframe.html
- **구현 대상**: `__tests__/kanban.spec.test.tsx` — spec.yaml의 모든 시나리오를 검증하는 수용 기준 테스트
- **수용 기준**:
  - [ ] spec.yaml의 29개 시나리오 각각에 대응하는 테스트 케이스가 존재한다
  - [ ] 테스트가 Red 상태(실패)로 실행된다

---

### Task 2: 타입 정의

- **시나리오**: 전체 (데이터 모델 기반)
- **의존성**: 없음
- **참조**:
  - artifacts/spec.yaml — Card, Subtask, Column 속성
- **구현 대상**: `types/kanban.ts` — Card, Subtask, ColumnId, Column, BoardState 타입
- **수용 기준**:
  - [ ] Card 타입에 id, title, description, priority, tags, subtasks, columnId, order 필드가 존재한다
  - [ ] Subtask 타입에 id, title, completed 필드가 존재한다
  - [ ] ColumnId는 "todo" | "in-progress" | "done" 유니온 타입이다
  - [ ] `bun run test` 통과

---

### Task 3: localStorage 영속성 모듈

- **시나리오**: KANBAN-024, KANBAN-025, KANBAN-026
- **의존성**: Task 2 (타입 참조)
- **참조**:
  - artifacts/spec.yaml — kanban-persistence 시나리오
- **구현 대상**: `lib/kanban-storage.ts` — BoardState를 localStorage에 저장/로드하는 함수, `__tests__/kanban-storage.test.ts` — 단위 테스트
- **수용 기준**:
  - [ ] saveBoardState(state) 호출 후 loadBoardState() 하면 동일한 state가 반환된다
  - [ ] localStorage가 비어있으면 loadBoardState()가 빈 카드 배열의 기본 상태를 반환한다
  - [ ] `bun run test` 통과

---

### Task 4: 칸반 보드 상태 관리 훅

- **시나리오**: KANBAN-001, KANBAN-002, KANBAN-003 ~ KANBAN-006, KANBAN-007, KANBAN-008, KANBAN-009 ~ KANBAN-011, KANBAN-012 ~ KANBAN-014, KANBAN-015 ~ KANBAN-016, KANBAN-017 ~ KANBAN-021, KANBAN-027 ~ KANBAN-029
- **의존성**: Task 2 (타입), Task 3 (저장소)
- **참조**:
  - artifacts/spec.yaml — 전체 시나리오의 상태 변경 로직
- **구현 대상**: `hooks/use-kanban-board.ts` — 카드 CRUD, 칼럼 이동, 순서 변경, 검색, 필터링을 제공하는 커스텀 훅. `__tests__/use-kanban-board.test.tsx` — 단위 테스트
- **수용 기준**:
  - [ ] addCard("To Do", "장보기") → "To Do" 칼럼에 "장보기" 카드 추가
  - [ ] addCard("To Do", "") → "제목을 입력해주세요" 에러 반환
  - [ ] updateCard(id, { title: "마트 장보기" }) → 카드 제목 변경
  - [ ] updateCard(id, { title: "" }) → 제목 변경 없이 기존 제목 유지
  - [ ] updateCard(id, { description, priority, tags }) → 해당 필드 업데이트
  - [ ] deleteCard(id) → 카드 삭제
  - [ ] moveCard(cardId, toColumnId, toIndex) → 칼럼 간/칼럼 내 이동
  - [ ] addSubtask(cardId, "우유 사기") → 서브태스크 추가
  - [ ] toggleSubtask(cardId, subtaskId) → 완료 토글
  - [ ] 검색어 "장" 입력 시 "장보기"만 필터링
  - [ ] 우선순위 필터 "High" 선택 시 High 카드만 필터링
  - [ ] 검색 + 필터 AND 조합 동작
  - [ ] 상태 변경 시 localStorage에 자동 저장
  - [ ] `bun run test` 통과

---

### Task 5: 헤더 컴포넌트 (다크모드 토글)

- **시나리오**: KANBAN-022, KANBAN-023
- **의존성**: Task 2 (타입)
- **참조**:
  - artifacts/kanban-todo/wireframe.html — Screen 0, 5 (Header 영역)
  - shadcn — Button 컴포넌트
- **구현 대상**: `components/kanban-header.tsx` — 앱 제목("Kanban Todo") + 다크모드 토글 Button (Moon/Sun 아이콘 전환)
- **수용 기준**:
  - [ ] "Kanban Todo" 제목이 표시된다
  - [ ] 라이트모드에서 토글 클릭 시 다크모드로 전환된다
  - [ ] 다크모드에서 토글 클릭 시 라이트모드로 전환된다
  - [ ] `bun run test` 통과

---

### Task 6: 검색/필터 바 컴포넌트

- **시나리오**: KANBAN-017, KANBAN-018, KANBAN-019, KANBAN-020, KANBAN-021, KANBAN-028, KANBAN-029
- **의존성**: Task 2 (타입), Task 4 (검색/필터 상태)
- **참조**:
  - artifacts/kanban-todo/wireframe.html — Screen 0, 4 (Search & Filter bar 영역)
  - shadcn — Input, Select 컴포넌트
- **구현 대상**: `components/kanban-search-filter-bar.tsx` — 검색 Input (search 아이콘, X-circle 클리어), 우선순위 Select 드롭다운, 태그 Select 드롭다운
- **수용 기준**:
  - [ ] 검색바에 텍스트 입력이 가능하다
  - [ ] 검색어 존재 시 X 아이콘으로 클리어할 수 있다
  - [ ] 우선순위 드롭다운에서 전체/Low/Medium/High를 선택할 수 있다
  - [ ] 태그 드롭다운에서 전체 및 기존 태그 목록을 선택할 수 있다
  - [ ] `bun run test` 통과

---

### Task 7: 칸반 카드 컴포넌트

- **시나리오**: KANBAN-001, KANBAN-005, KANBAN-006, KANBAN-007, KANBAN-008, KANBAN-014
- **의존성**: Task 2 (타입), Task 4 (카드 상태)
- **참조**:
  - artifacts/kanban-todo/wireframe.html — Screen 1 (Card 영역)
  - shadcn — Card, Badge 컴포넌트
- **구현 대상**: `components/kanban-card.tsx` — 인라인 편집 가능한 제목, 우선순위 Badge, 태그 Badge 목록, 서브태스크 진행률 표시. 카드 클릭 시 상세 모달 열기 콜백. `__tests__/kanban-card.test.tsx` — 단위 테스트
- **수용 기준**:
  - [ ] 카드 제목이 표시된다
  - [ ] 제목 클릭 시 인라인 편집 모드로 전환된다
  - [ ] 인라인 편집에서 Enter 입력 시 제목이 변경된다
  - [ ] 빈 문자열로 수정 시 원래 제목이 유지된다
  - [ ] 우선순위가 있으면 Badge로 표시된다 (High: 붉은 계열, Low: 녹색 계열)
  - [ ] 태그가 있으면 Badge 목록으로 표시된다
  - [ ] 서브태스크가 있으면 진행률(예: "1/2")이 표시된다
  - [ ] 카드 클릭 시 onCardClick 콜백이 호출된다
  - [ ] `bun run test` 통과

---

### Task 8: 카드 상세 모달 컴포넌트

- **시나리오**: KANBAN-003, KANBAN-004, KANBAN-005, KANBAN-006, KANBAN-009, KANBAN-010, KANBAN-011, KANBAN-012, KANBAN-013, KANBAN-014
- **의존성**: Task 2 (타입), Task 4 (카드 수정/삭제/서브태스크 로직)
- **참조**:
  - artifacts/kanban-todo/wireframe.html — Screen 2 (카드 상세 모달), Screen 3 (삭제 확인)
  - shadcn — Dialog, AlertDialog, Button, Textarea, Checkbox, Badge, Input 컴포넌트
- **구현 대상**: `components/kanban-card-detail-modal.tsx` — Dialog 기반 모달. 제목 표시, 설명 Textarea, 우선순위 Button 그룹(Low/Medium/High), 태그 Badge 목록 + 추가 Input, 서브태스크 Checkbox 체크리스트 + 진행률 바 + 추가 Input, 삭제 Button + AlertDialog 확인. `__tests__/kanban-card-detail-modal.test.tsx` — 단위 테스트
- **수용 기준**:
  - [ ] 모달에 제목, 설명, 우선순위, 태그, 서브태스크 섹션이 표시된다
  - [ ] 설명 입력 후 저장하면 반영된다
  - [ ] 우선순위 선택 시 카드에 반영된다
  - [ ] 태그 추가 시 카드에 반영된다
  - [ ] 서브태스크 추가 시 체크리스트에 추가된다
  - [ ] 서브태스크 체크 시 완료 표시 + 진행률 업데이트
  - [ ] 삭제 버튼 클릭 시 "정말 삭제하시겠습니까?" 확인 다이얼로그 표시
  - [ ] 확인 클릭 시 카드 삭제, 취소 클릭 시 다이얼로그 닫힘
  - [ ] `bun run test` 통과

---

### Task 9: 칸반 칼럼 컴포넌트

- **시나리오**: KANBAN-001, KANBAN-002, KANBAN-015, KANBAN-016, KANBAN-027
- **의존성**: Task 2 (타입), Task 4 (카드 추가/이동), Task 7 (KanbanCard)
- **참조**:
  - artifacts/kanban-todo/wireframe.html — Screen 0, 1 (Column 영역)
  - shadcn — Button, Input, Badge 컴포넌트
  - @atlaskit/pragmatic-drag-and-drop — 드롭 영역 설정
- **구현 대상**: `components/kanban-column.tsx` — 칼럼 헤더(제목 + 카드 수 Badge), 카드 추가 Input + Button (To Do 칼럼만), 카드 목록, 빈 상태 표시, DnD 드롭 영역(드롭 인디케이터 포함)
- **수용 기준**:
  - [ ] 칼럼 제목과 카드 수가 표시된다
  - [ ] "To Do" 칼럼에 카드 추가 입력란이 있다
  - [ ] 카드 제목 입력 후 추가 버튼 클릭 시 카드가 추가된다
  - [ ] 빈 제목으로 추가 시 "제목을 입력해주세요" 에러 메시지가 표시된다
  - [ ] 카드가 없을 때 빈 상태 메시지가 표시된다
  - [ ] DnD 드롭 영역이 설정되어 카드를 받을 수 있다
  - [ ] `bun run test` 통과

---

### Task 10: 칸반 보드 조립 및 페이지 통합

- **시나리오**: KANBAN-001 ~ KANBAN-029 (전체)
- **의존성**: Task 4 (훅), Task 5 (헤더), Task 6 (검색/필터), Task 8 (상세 모달), Task 9 (칼럼)
- **참조**:
  - artifacts/kanban-todo/wireframe.html — 전체 레이아웃
  - @atlaskit/pragmatic-drag-and-drop — 드래그 소스 + 모니터 설정
- **구현 대상**: `components/kanban-board.tsx` — Header, SearchFilterBar, 3개 KanbanColumn, CardDetailModal을 조립. KanbanBoardProvider로 Context 제공. DnD 모니터 설정. 반응형 레이아웃(모바일: 세로 스택, 데스크톱: 가로 배치). `app/page.tsx` 수정 — KanbanBoard 렌더링. `__tests__/kanban-board.test.tsx` — 통합 테스트
- **수용 기준**:
  - [ ] 3칼럼(To Do, In Progress, Done)이 표시된다
  - [ ] 카드 추가 → 칼럼에 표시
  - [ ] 카드 클릭 → 상세 모달 표시
  - [ ] 카드 DnD → 칼럼 간/칼럼 내 이동
  - [ ] 검색/필터 → 카드 필터링
  - [ ] 다크모드 토글 동작
  - [ ] 새로고침 후 데이터 유지
  - [ ] spec 테스트(`__tests__/kanban.spec.test.tsx`) 전체 통과
  - [ ] `bun run test` 통과

---

## 미결정 사항

없음 (DnD, 상태 관리, 다크모드 모두 사전 결정됨)
