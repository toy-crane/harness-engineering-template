# kanban-todo 구현 계획

## Architecture Decisions

| 결정 사항 | 선택 | 사유 |
|-----------|------|------|
| 드래그&드롭 | @atlaskit/pragmatic-drag-and-drop | 사전 결정 |
| 상태 관리 | React useState + Context | 사전 결정 |
| 다크모드 | next-themes | 사전 결정, layout.tsx에 ThemeProvider 설정 완료 |
| UI 컴포넌트 | shadcn (기 설치) | dialog, alert-dialog, badge, button, input, select, checkbox 등 활용 |
| 데이터 영속성 | localStorage | spec.yaml KANBAN-024~026 요구사항 |

## Data Model

### Card
- id: string (required)
- title: string (required)
- description: string
- priority: "High" | "Medium" | "Low" | null
- tags: string[]
- subtasks: Subtask[]
- columnId: ColumnId (required)
- order: number (required)

### Subtask
- id: string (required)
- title: string (required)
- completed: boolean (required)

### ColumnId
- "todo" | "in-progress" | "done"

### Column
- id: ColumnId (required)
- title: "To Do" | "In Progress" | "Done" (required)

## Required Skills

| 스킬 | 적용 Task | 용도 |
|------|-----------|------|
| (Step 3 건너뜀) | — | — |

## Affected Files

| 파일 경로 | 변경 유형 | 관련 Task |
|-----------|----------|-----------|
| `types/kanban.ts` | 신규 | Task 1 |
| `config/kanban.ts` | 신규 | Task 1 |
| `lib/kanban-storage.ts` | 신규 | Task 3 |
| `hooks/use-kanban.tsx` | 신규 | Task 4 |
| `components/kanban/board-header.tsx` | 신규 | Task 5 |
| `components/kanban/kanban-column.tsx` | 신규 | Task 5 |
| `components/kanban/kanban-card.tsx` | 신규 | Task 5 |
| `components/kanban/add-card-form.tsx` | 신규 | Task 6 |
| `components/kanban/card-detail-modal.tsx` | 신규 | Task 7 |
| `components/kanban/delete-confirm-dialog.tsx` | 신규 | Task 8 |
| `components/kanban/search-filter-bar.tsx` | 신규 | Task 9 |
| `components/kanban/kanban-board.tsx` | 신규 | Task 10 |
| `app/page.tsx` | 수정 | Task 10 |

## Tasks

### Task 1: spec 테스트 생성

- **시나리오**: KANBAN-001 ~ KANBAN-029 (전체)
- **의존성**: 없음
- **참조**:
  - `artifacts/spec.yaml`
  - `artifacts/kanban-todo/wireframe.html`
- **구현 대상**: spec.yaml의 29개 시나리오를 검증하는 spec 테스트 파일 (`__tests__/kanban-todo.spec.test.tsx`)
- **수용 기준**:
  - [ ] 29개 시나리오 각각에 대응하는 테스트 케이스가 존재한다
  - [ ] `bun run test` 실행 시 모든 spec 테스트가 red 상태(실패)이다

---

### Task 2: 타입 및 설정 정의

- **시나리오**: 전체 (모든 시나리오의 기반)
- **의존성**: 없음
- **참조**:
  - `artifacts/spec.yaml` — Card, Subtask, Column 구조
- **구현 대상**:
  - `types/kanban.ts` — Card, Subtask, ColumnId, Column 타입
  - `config/kanban.ts` — 칼럼 정의 (To Do, In Progress, Done), 우선순위 목록, 스토리지 키
- **수용 기준**:
  - [ ] Card 타입에 id, title, description, priority, tags, subtasks, columnId, order 필드가 정의된다
  - [ ] Subtask 타입에 id, title, completed 필드가 정의된다
  - [ ] ColumnId가 "todo" | "in-progress" | "done" 유니온 타입이다
  - [ ] 칼럼 설정에 3개 칼럼(To Do, In Progress, Done)이 정의된다

---

### Task 3: localStorage 영속성 모듈

- **시나리오**: KANBAN-024, KANBAN-025, KANBAN-026
- **의존성**: Task 2 (타입 참조)
- **참조**:
  - `artifacts/spec.yaml` — kanban-persistence 시나리오
- **구현 대상**:
  - `lib/kanban-storage.ts` — Card[] 저장/로드/초기화 함수
- **수용 기준**:
  - [ ] `saveCards(cards)` 호출 시 localStorage에 Card[] JSON이 저장된다
  - [ ] `loadCards()` 호출 시 localStorage에서 Card[]를 파싱하여 반환한다
  - [ ] localStorage가 비어있으면 빈 배열을 반환한다
  - [ ] 유효하지 않은 JSON이 저장된 경우 빈 배열을 반환한다

---

### Task 4: 칸반 상태 관리 (Context + Hook)

- **시나리오**: KANBAN-001 ~ KANBAN-029 (전체 상태 기반)
- **의존성**: Task 2 (타입), Task 3 (스토리지)
- **참조**:
  - `artifacts/spec.yaml` — 카드 CRUD, 이동, 필터링 시나리오
- **구현 대상**:
  - `hooks/use-kanban.tsx` — KanbanProvider(Context), useKanban hook
    - 카드 추가 (빈 제목 검증 포함)
    - 카드 삭제
    - 카드 제목 인라인 편집 (빈 문자열 시 원래 제목 유지)
    - 카드 상세 편집 (설명, 우선순위, 태그)
    - 서브태스크 추가/토글
    - 카드 이동 (칼럼 간 이동, 같은 칼럼 내 순서 변경)
    - 검색어 필터링, 우선순위 필터링, 태그 필터링 (AND 조합)
    - 상태 변경 시 localStorage 자동 동기화
- **수용 기준**:
  - [ ] 카드 추가: `addCard("To Do", "장보기")` -> "To Do" 칼럼에 "장보기" 카드가 추가된다
  - [ ] 빈 제목 추가: `addCard("To Do", "")` -> 에러 메시지 "제목을 입력해주세요"가 반환된다
  - [ ] 카드 삭제: `deleteCard(cardId)` -> 해당 카드가 목록에서 제거된다
  - [ ] 인라인 편집: `updateCardTitle(cardId, "마트 장보기")` -> 카드 제목이 변경된다
  - [ ] 인라인 편집 빈 문자열: `updateCardTitle(cardId, "")` -> 원래 제목이 유지된다
  - [ ] 칼럼 이동: `moveCard(cardId, "in-progress", 0)` -> 카드가 In Progress 칼럼으로 이동한다
  - [ ] 같은 칼럼 순서 변경: `reorderCard(cardId, 0)` -> 카드가 해당 위치로 이동한다
  - [ ] 검색: searchQuery "장" 설정 시 "장보기" 카드만 필터링된다
  - [ ] 우선순위 필터: priorityFilter "High" 설정 시 High 카드만 필터링된다
  - [ ] AND 조합: searchQuery "장" + priorityFilter "High" -> 두 조건 모두 만족하는 카드만 필터링된다
  - [ ] 필터 초기화: 필터를 null로 설정 시 모든 카드가 표시된다
  - [ ] localStorage 동기화: 상태 변경 후 localStorage에 최신 데이터가 반영된다

---

### Task 5: 보드 레이아웃 컴포넌트 (Header, Column, Card)

- **시나리오**: KANBAN-001, KANBAN-007, KANBAN-008
- **의존성**: Task 2 (타입), Task 4 (상태)
- **참조**:
  - `artifacts/kanban-todo/wireframe.html` — Screen 0 (기본 보드), Screen 1 (카드 보드)
- **구현 대상**:
  - `components/kanban/board-header.tsx` — 앱 제목 + 다크모드 토글 버튼 (Header 영역)
  - `components/kanban/kanban-column.tsx` — 칼럼 컨테이너 (칼럼 제목 + 카드 카운트 배지 + 카드 목록 + 빈 상태)
  - `components/kanban/kanban-card.tsx` — 카드 컴포넌트 (제목 인라인 편집 + 우선순위 Badge + 태그 Badge + 서브태스크 진행률)
- **수용 기준**:
  - [ ] 보드 헤더에 "Kanban Todo" 제목과 다크모드 토글 버튼이 표시된다
  - [ ] 칼럼에 제목("To Do")과 카드 수 배지가 표시된다
  - [ ] 카드가 없는 칼럼에 "카드가 없습니다" 빈 상태가 표시된다
  - [ ] 카드에 제목, 우선순위(High/Medium/Low Badge), 태그(Badge), 서브태스크 진행률(1/2)이 표시된다
  - [ ] 카드 제목 클릭 시 인라인 편집 모드로 전환되고, Enter 시 저장, 빈 문자열 시 원래 제목 유지

---

### Task 6: 카드 추가 폼

- **시나리오**: KANBAN-001, KANBAN-002
- **의존성**: Task 4 (상태), Task 5 (칼럼)
- **참조**:
  - `artifacts/kanban-todo/wireframe.html` — Screen 0 (기본 보드, 카드 추가 입력란)
- **구현 대상**:
  - `components/kanban/add-card-form.tsx` — "To Do" 칼럼 내 카드 추가 폼 (Input + 추가 Button + 에러 메시지)
- **수용 기준**:
  - [ ] "To Do" 칼럼에 카드 제목 입력란과 "추가" 버튼이 표시된다
  - [ ] "장보기" 입력 후 추가 -> "To Do" 칼럼에 "장보기" 카드가 표시되고 카운트가 1이 된다
  - [ ] 빈 입력 후 추가 -> "제목을 입력해주세요" 에러 메시지가 표시된다

---

### Task 7: 카드 상세 모달

- **시나리오**: KANBAN-003, KANBAN-004, KANBAN-005, KANBAN-006, KANBAN-012, KANBAN-013, KANBAN-014
- **의존성**: Task 4 (상태), Task 5 (카드 클릭 트리거)
- **참조**:
  - `artifacts/kanban-todo/wireframe.html` — Screen 2 (카드 상세 모달)
  - `components/ui/dialog.tsx` — shadcn Dialog 컴포넌트
- **구현 대상**:
  - `components/kanban/card-detail-modal.tsx` — Dialog 기반 카드 상세 모달
    - 제목 표시
    - 설명 편집 (Textarea)
    - 우선순위 선택 (Low / Medium / High 버튼 그룹)
    - 태그 추가 (Input + 추가 Button + Badge 목록)
    - 서브태스크 관리 (Checkbox 리스트 + 진행률 바 + 추가 Input)
    - 삭제 버튼 (모달 푸터)
- **수용 기준**:
  - [ ] 카드 클릭 시 상세 모달에 제목, 설명, 우선순위, 태그, 서브태스크 섹션이 표시된다
  - [ ] 설명 입력 후 저장 -> 모달 재오픈 시 저장된 설명이 표시된다
  - [ ] 우선순위 "High" 선택 -> 카드에 "High" 우선순위가 반영된다
  - [ ] 태그 "개인" 추가 -> 카드에 "개인" 태그가 표시된다
  - [ ] 서브태스크 "우유 사기" 추가 -> 체크리스트에 항목이 표시된다
  - [ ] 서브태스크 체크 -> 완료 표시되고 진행률이 갱신된다 (예: "1/1")
  - [ ] 서브태스크 2개 중 1개 완료 시 진행률 "1/2"가 표시된다

---

### Task 8: 카드 삭제 확인 다이얼로그

- **시나리오**: KANBAN-009, KANBAN-010, KANBAN-011
- **의존성**: Task 4 (상태), Task 7 (삭제 버튼 트리거)
- **참조**:
  - `artifacts/kanban-todo/wireframe.html` — Screen 3 (삭제 확인)
  - `components/ui/alert-dialog.tsx` — shadcn AlertDialog 컴포넌트
- **구현 대상**:
  - `components/kanban/delete-confirm-dialog.tsx` — AlertDialog 기반 삭제 확인 (경고 아이콘 + "정말 삭제하시겠습니까?" 메시지 + 취소/확인 버튼)
- **수용 기준**:
  - [ ] 삭제 버튼 클릭 -> "정말 삭제하시겠습니까?" 확인 다이얼로그가 표시된다
  - [ ] "확인" 클릭 -> 카드가 보드에서 제거된다
  - [ ] "취소" 클릭 -> 다이얼로그가 닫히고 카드가 유지된다

---

### Task 9: 검색 및 필터 바

- **시나리오**: KANBAN-017, KANBAN-018, KANBAN-019, KANBAN-020, KANBAN-021, KANBAN-028, KANBAN-029
- **의존성**: Task 4 (상태 - 필터 로직), Task 5 (보드 레이아웃)
- **참조**:
  - `artifacts/kanban-todo/wireframe.html` — Screen 4 (검색/필터 적용)
  - `components/ui/input.tsx` — shadcn Input
  - `components/ui/select.tsx` — shadcn Select
- **구현 대상**:
  - `components/kanban/search-filter-bar.tsx` — 검색 Input (search 아이콘 + 클리어 버튼) + 우선순위 Select (전체/Low/Medium/High) + 태그 Select (전체 + 동적 태그 목록)
- **수용 기준**:
  - [ ] 검색바에 "장" 입력 -> "장보기" 카드만 표시되고 나머지 숨겨진다
  - [ ] 검색바에 "하기" 입력 -> "장보기", "공부하기", "운동하기" 3개 모두 표시된다
  - [ ] 검색어 삭제 -> 모든 카드가 다시 표시된다
  - [ ] 우선순위 필터 "High" 선택 -> High 카드만 표시된다
  - [ ] 태그 필터 "개인" 선택 -> "개인" 태그가 있는 카드만 표시된다
  - [ ] 검색 "장" + 우선순위 "High" -> AND 조합으로 "장보기"만 표시된다
  - [ ] 우선순위 필터 "전체" 선택 -> 모든 카드가 다시 표시된다

---

### Task 10: 드래그&드롭

- **시나리오**: KANBAN-015, KANBAN-016, KANBAN-027
- **의존성**: Task 4 (상태 - 이동 로직), Task 5 (칼럼/카드 컴포넌트)
- **참조**:
  - `artifacts/kanban-todo/wireframe.html` — Screen 1 (드롭 타겟 표시)
  - @atlaskit/pragmatic-drag-and-drop 라이브러리
- **구현 대상**:
  - `components/kanban/kanban-card.tsx` 수정 — draggable 설정
  - `components/kanban/kanban-column.tsx` 수정 — drop target 설정 + "여기에 드롭" 인디케이터
- **수용 기준**:
  - [ ] "장보기" 카드를 "To Do" -> "In Progress"로 드래그&드롭 -> In Progress에 표시, To Do에서 제거
  - [ ] "장보기" 카드를 "In Progress" -> "Done"으로 드래그&드롭 -> Done에 표시, In Progress에서 제거
  - [ ] 같은 칼럼 내 "공부하기"를 "장보기" 위로 드래그&드롭 -> 순서가 "공부하기", "장보기", "운동하기"로 변경

---

### Task 11: 다크모드 토글

- **시나리오**: KANBAN-022, KANBAN-023, KANBAN-026
- **의존성**: Task 5 (보드 헤더 - 토글 버튼)
- **참조**:
  - `artifacts/kanban-todo/wireframe.html` — Screen 5 (다크모드)
  - `app/layout.tsx` — ThemeProvider 설정 (이미 완료)
  - next-themes useTheme hook
- **구현 대상**:
  - `components/kanban/board-header.tsx` 수정 — 다크모드 토글 동작 연결 (moon/sun 아이콘 전환)
- **수용 기준**:
  - [ ] 라이트모드에서 토글 클릭 -> 다크모드로 전환된다 (html에 dark 클래스)
  - [ ] 다크모드에서 토글 클릭 -> 라이트모드로 전환된다
  - [ ] 다크모드 설정이 새로고침 후에도 유지된다

---

### Task 12: 보드 조립 및 페이지 연결

- **시나리오**: KANBAN-024, KANBAN-025, KANBAN-026 (영속성 통합 검증)
- **의존성**: Task 5 ~ Task 11 (모든 컴포넌트)
- **참조**:
  - `artifacts/kanban-todo/wireframe.html` — Screen 6 (영속성)
- **구현 대상**:
  - `components/kanban/kanban-board.tsx` — KanbanProvider로 감싼 보드 전체 조립 (Header + SearchFilterBar + 3 Column)
  - `app/page.tsx` 수정 — KanbanBoard 렌더링
- **수용 기준**:
  - [ ] 앱 진입 시 3칼럼 보드가 표시된다
  - [ ] 카드 3개 추가 후 새로고침 -> 3개 카드가 유지된다
  - [ ] 카드를 In Progress로 이동 후 새로고침 -> In Progress에 카드가 유지된다
  - [ ] `bun run test` 실행 시 모든 spec 테스트가 통과(green)한다

---

## 미결정 사항

없음 (Step 4에서 DnD, 상태 관리, 다크모드 모두 사전 결정됨)
