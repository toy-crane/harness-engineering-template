# kanban-todo 구현 계획

## Architecture Decisions

| 결정 사항 | 선택 | 사유 |
|-----------|------|------|
| DnD 라이브러리 | @atlaskit/pragmatic-drag-and-drop | 경량, headless, React 친화적 |
| 상태 관리 | React useState + Context | 외부 의존성 없이 충분한 규모 |
| 다크모드 | next-themes | 이미 layout.tsx에 ThemeProvider 설정됨 |
| 데이터 영속성 | localStorage | spec 요구사항 (KANBAN-024~026) |
| UI 컴포넌트 | shadcn (기존 설치 컴포넌트 활용) | Dialog, AlertDialog, Badge, Input, Button, Select, Checkbox 등 이미 존재 |

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

## Required Skills

| 스킬 | 적용 Task | 용도 |
|------|-----------|------|
| (Step 3 건너뜀 — 스킬 탐색 생략) | — | — |

## Affected Files

| 파일 경로 | 변경 유형 | 관련 Task |
|-----------|----------|-----------|
| types/kanban.ts | 신규 | Task 1 |
| config/kanban.ts | 신규 | Task 1 |
| __tests__/kanban.spec.test.tsx | 신규 | Task 2 |
| lib/kanban-storage.ts | 신규 | Task 3 |
| lib/kanban-storage.test.ts | 신규 | Task 3 |
| hooks/use-kanban.ts | 신규 | Task 4 |
| hooks/use-kanban.test.ts | 신규 | Task 4 |
| hooks/use-kanban-filter.ts | 신규 | Task 5 |
| hooks/use-kanban-filter.test.ts | 신규 | Task 5 |
| components/kanban-board.tsx | 신규 | Task 6 |
| components/kanban-column.tsx | 신규 | Task 6 |
| components/kanban-card.tsx | 신규 | Task 6 |
| components/kanban-header.tsx | 신규 | Task 6 |
| components/kanban-search-filter.tsx | 신규 | Task 6 |
| components/kanban-card-detail-modal.tsx | 신규 | Task 7 |
| components/kanban-delete-confirm.tsx | 신규 | Task 7 |
| components/kanban-add-card-form.tsx | 신규 | Task 6 |
| hooks/use-kanban-dnd.ts | 신규 | Task 8 |
| hooks/use-kanban-dnd.test.ts | 신규 | Task 8 |
| app/page.tsx | 수정 | Task 6 |

## Tasks

### Task 1: 타입 및 설정 정의

- **시나리오**: 전체 (모든 시나리오의 기반)
- **의존성**: 없음
- **참조**:
  - artifacts/spec.yaml
  - CLAUDE.md Architecture 테이블 (types/ → config/ 순서)
- **구현 대상**:
  - `types/kanban.ts` — Card, Subtask, ColumnId, Column, Priority 타입
  - `config/kanban.ts` — 고정 3칼럼 설정 (COLUMNS 상수), 우선순위 옵션 목록, localStorage 키
- **수용 기준**:
  - [ ] Card 타입에 id, title, description, priority, tags, subtasks, columnId, order 필드가 존재한다
  - [ ] Subtask 타입에 id, title, completed 필드가 존재한다
  - [ ] ColumnId가 "todo" | "in-progress" | "done" union이다
  - [ ] COLUMNS 상수가 3개 칼럼 (To Do, In Progress, Done)을 포함한다
  - [ ] TypeScript 컴파일 에러가 없다 (`bun run build` 또는 `tsc --noEmit`)

---

### Task 2: spec 테스트 생성

- **시나리오**: KANBAN-001 ~ KANBAN-029 전체
- **의존성**: Task 1 (타입 import)
- **참조**:
  - artifacts/spec.yaml — 모든 시나리오의 given/when/then/examples
  - artifacts/kanban-todo/wireframe.html — UI 구조 및 텍스트
- **구현 대상**:
  - `__tests__/kanban.spec.test.tsx` — spec.yaml 전체 시나리오를 검증하는 수용 기준 테스트
- **수용 기준**:
  - [ ] 각 시나리오(KANBAN-001 ~ KANBAN-029)에 대응하는 테스트 케이스가 존재한다
  - [ ] 테스트가 spec.yaml의 given/when/then을 정확히 반영한다
  - [ ] `bun run test`로 실행 시 모든 테스트가 RED 상태(실패)이다

---

### Task 3: localStorage 영속성 모듈

- **시나리오**: KANBAN-024, KANBAN-025, KANBAN-026
- **의존성**: Task 1 (타입)
- **참조**:
  - artifacts/spec.yaml — kanban-persistence 시나리오
- **구현 대상**:
  - `lib/kanban-storage.ts` — Card 배열의 localStorage 읽기/쓰기 유틸리티
  - `lib/kanban-storage.test.ts` — 단위 테스트
- **수용 기준**:
  - [ ] saveCards(cards) 호출 → localStorage에 JSON 저장
  - [ ] loadCards() 호출 → localStorage에서 Card[] 반환, 데이터 없으면 빈 배열 반환
  - [ ] 잘못된 JSON이 저장된 경우 빈 배열을 반환한다
  - [ ] `bun run test lib/kanban-storage.test.ts` 통과

---

### Task 4: 칸반 상태 관리 훅

- **시나리오**: KANBAN-001, KANBAN-002, KANBAN-003~006, KANBAN-007, KANBAN-008, KANBAN-009~011, KANBAN-012~014, KANBAN-015~016, KANBAN-024~027
- **의존성**: Task 1 (타입), Task 3 (storage)
- **참조**:
  - artifacts/spec.yaml — 카드 CRUD, 서브태스크, 칼럼 이동 시나리오
- **구현 대상**:
  - `hooks/use-kanban.ts` — KanbanProvider(Context), useKanban 훅
    - 카드 추가 (빈 제목 검증 포함)
    - 카드 상세 편집 (설명, 우선순위, 태그)
    - 카드 인라인 제목 편집 (빈 문자열 방어)
    - 카드 삭제
    - 서브태스크 추가/토글
    - 칼럼 간 이동, 칼럼 내 순서 변경
    - localStorage 자동 동기화
  - `hooks/use-kanban.test.ts` — 단위 테스트
- **수용 기준**:
  - [ ] addCard("To Do", "장보기") → cards에 title "장보기", columnId "todo" 카드 추가
  - [ ] addCard("To Do", "") → 에러 메시지 "제목을 입력해주세요" 반환
  - [ ] updateCard(id, { description: "마트 가서 장보기" }) → 해당 카드 description 갱신
  - [ ] updateCard(id, { priority: "High" }) → 해당 카드 priority 갱신
  - [ ] addTag(id, "개인") → 해당 카드 tags에 "개인" 추가
  - [ ] updateCardTitle(id, "마트 장보기") → 제목 변경
  - [ ] updateCardTitle(id, "") → 원래 제목 유지
  - [ ] deleteCard(id) → cards에서 제거
  - [ ] addSubtask(cardId, "우유 사기") → subtasks에 항목 추가
  - [ ] toggleSubtask(cardId, subtaskId) → completed 토글
  - [ ] moveCard(cardId, "in-progress") → columnId 변경
  - [ ] reorderCard(cardId, newIndex) → 같은 칼럼 내 order 변경
  - [ ] 상태 변경 시 localStorage에 자동 저장
  - [ ] `bun run test hooks/use-kanban.test.ts` 통과

---

### Task 5: 검색/필터 훅

- **시나리오**: KANBAN-017, KANBAN-018, KANBAN-019, KANBAN-020, KANBAN-021, KANBAN-028, KANBAN-029
- **의존성**: Task 1 (타입), Task 4 (카드 상태)
- **참조**:
  - artifacts/spec.yaml — kanban-search, kanban-filter 시나리오
- **구현 대상**:
  - `hooks/use-kanban-filter.ts` — 검색어, 우선순위 필터, 태그 필터 상태 및 필터링 로직
  - `hooks/use-kanban-filter.test.ts` — 단위 테스트
- **수용 기준**:
  - [ ] searchQuery "장" → title에 "장"이 포함된 카드만 반환
  - [ ] searchQuery "" → 모든 카드 반환
  - [ ] searchQuery "하기" → "장보기", "공부하기", "운동하기" 3개 모두 반환
  - [ ] priorityFilter "High" → priority가 "High"인 카드만 반환
  - [ ] tagFilter "개인" → tags에 "개인"이 포함된 카드만 반환
  - [ ] searchQuery "장" + priorityFilter "High" → AND 조합으로 "장보기"만 반환
  - [ ] priorityFilter null (전체) → 모든 카드 반환
  - [ ] `bun run test hooks/use-kanban-filter.test.ts` 통과

---

### Task 6: 보드 UI 컴포넌트

- **시나리오**: KANBAN-001, KANBAN-002, KANBAN-007, KANBAN-008, KANBAN-017~021, KANBAN-022~023, KANBAN-028, KANBAN-029
- **의존성**: Task 1 (타입), Task 4 (상태 훅), Task 5 (필터 훅)
- **참조**:
  - artifacts/kanban-todo/wireframe.html — Screen 0(기본 보드), Screen 1(카드 보드), Screen 4(검색/필터), Screen 5(다크모드)
- **구현 대상**:
  - `components/kanban-board.tsx` — 3칼럼 보드 레이아웃 (Container component, 모바일: 세로 스택, @md: 가로 배치)
  - `components/kanban-column.tsx` — 칼럼 (제목 + 카드 카운트 Badge + 카드 리스트 + 빈 상태)
  - `components/kanban-card.tsx` — 카드 (제목 인라인 편집, 우선순위 Badge, 태그 Badge, 서브태스크 진행률)
  - `components/kanban-header.tsx` — 헤더 (앱 제목 + 다크모드 토글 Button, moon/sun 아이콘 전환)
  - `components/kanban-search-filter.tsx` — 검색바 (Input) + 우선순위 Select + 태그 Select
  - `components/kanban-add-card-form.tsx` — 카드 추가 폼 (Input + Button, 에러 메시지 표시)
  - `app/page.tsx` — KanbanProvider로 감싼 KanbanBoard 렌더링
- **수용 기준**:
  - [ ] 3칼럼(To Do, In Progress, Done)이 렌더링된다
  - [ ] 각 칼럼에 카드 개수 Badge가 표시된다
  - [ ] 카드 추가 폼에서 제목 입력 후 "추가" 클릭 → 카드 생성
  - [ ] 빈 제목 추가 시 "제목을 입력해주세요" 에러 표시
  - [ ] 카드 제목 클릭 → 인라인 편집 모드 → Enter로 저장
  - [ ] 빈 제목 인라인 편집 시 원래 제목 유지
  - [ ] 카드에 우선순위 Badge, 태그 Badge, 서브태스크 진행률(예: "1/2") 표시
  - [ ] 검색바 입력 시 매칭 카드만 표시
  - [ ] 우선순위/태그 필터 선택 시 매칭 카드만 표시
  - [ ] 다크모드 토글 시 테마 전환 (next-themes useTheme 활용)
  - [ ] 칼럼 빈 상태에서 "카드가 없습니다" 표시

---

### Task 7: 카드 상세 모달 및 삭제 확인

- **시나리오**: KANBAN-003, KANBAN-004, KANBAN-005, KANBAN-006, KANBAN-009, KANBAN-010, KANBAN-011, KANBAN-012, KANBAN-013, KANBAN-014
- **의존성**: Task 4 (상태 훅), Task 6 (보드 UI — 카드 클릭으로 모달 진입)
- **참조**:
  - artifacts/kanban-todo/wireframe.html — Screen 2(카드 상세), Screen 3(삭제 확인)
- **구현 대상**:
  - `components/kanban-card-detail-modal.tsx` — 카드 상세 모달 (Dialog 기반)
    - 제목 표시
    - 설명 편집 (Textarea)
    - 우선순위 선택 (Low/Medium/High 버튼 그룹)
    - 태그 목록 + 태그 추가 (Input + Button)
    - 서브태스크 체크리스트 (Checkbox + 진행률 바)
    - 서브태스크 추가 (Input + Button)
    - 삭제 버튼 (footer)
  - `components/kanban-delete-confirm.tsx` — 삭제 확인 다이얼로그 (AlertDialog 기반)
    - "정말 삭제하시겠습니까?" 메시지
    - 확인/취소 버튼
- **수용 기준**:
  - [ ] 카드 클릭 → 모달에 제목, 설명, 우선순위, 태그, 서브태스크 섹션 표시
  - [ ] 설명 입력 후 저장 → 모달 재진입 시 입력값 유지
  - [ ] 우선순위 "High" 선택 → 카드에 "High" 반영
  - [ ] 태그 "개인" 추가 → 카드에 "개인" 태그 표시
  - [ ] 서브태스크 "우유 사기" 추가 → 체크리스트에 표시
  - [ ] 서브태스크 체크박스 클릭 → 완료 표시, 진행률 갱신
  - [ ] 삭제 버튼 클릭 → "정말 삭제하시겠습니까?" 확인 다이얼로그
  - [ ] 확인 → 카드 삭제, 취소 → 다이얼로그 닫히고 카드 유지

---

### Task 8: 드래그 앤 드롭

- **시나리오**: KANBAN-015, KANBAN-016, KANBAN-027
- **의존성**: Task 4 (상태 훅 — moveCard, reorderCard), Task 6 (보드 UI — 칼럼/카드 렌더링)
- **참조**:
  - artifacts/kanban-todo/wireframe.html — Screen 1(카드 보드, 드롭 영역 표시)
  - @atlaskit/pragmatic-drag-and-drop 문서
- **구현 대상**:
  - `hooks/use-kanban-dnd.ts` — pragmatic-drag-and-drop 기반 드래그 앤 드롭 훅
  - `hooks/use-kanban-dnd.test.ts` — 단위 테스트
  - `components/kanban-column.tsx` 수정 — 드롭 영역 ("여기에 드롭" 표시)
  - `components/kanban-card.tsx` 수정 — 드래그 핸들
- **수용 기준**:
  - [ ] "장보기" 카드를 "To Do" → "In Progress"로 드롭 → "In Progress"에 표시, "To Do"에서 제거
  - [ ] "장보기" 카드를 "In Progress" → "Done"으로 드롭 → "Done"에 표시, "In Progress"에서 제거
  - [ ] 같은 칼럼 내 "공부하기"를 "장보기" 위로 드롭 → 순서 "공부하기, 장보기, 운동하기"
  - [ ] 드래그 중 드롭 영역에 시각적 피드백 표시
  - [ ] `bun run test hooks/use-kanban-dnd.test.ts` 통과

---

### Task 9: 전체 통합 및 spec 테스트 통과

- **시나리오**: KANBAN-001 ~ KANBAN-029 전체
- **의존성**: Task 2 ~ Task 8 전체
- **참조**:
  - __tests__/kanban.spec.test.tsx
- **구현 대상**:
  - 모든 컴포넌트와 훅의 통합 조정
  - 누락된 연결 보완 (이벤트 핸들러 바인딩, Provider 설정 등)
- **수용 기준**:
  - [ ] `bun run test __tests__/kanban.spec.test.tsx` — 전체 시나리오 GREEN
  - [ ] `bun run test` — 모든 테스트 GREEN
  - [ ] `bun run build` — 빌드 에러 없음

---

## 미결정 사항

없음. Step 4에서 DnD, 상태 관리, 다크모드 결정이 이미 확정됨.
