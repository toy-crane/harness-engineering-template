# kanban-todo 구현 계획

## Architecture Decisions

| 결정 사항 | 선택 | 사유 |
|-----------|------|------|
| DnD 라이브러리 | @atlaskit/pragmatic-drag-and-drop | 결정됨 (외부 지정) |
| 상태 관리 | React useState + Context | 결정됨 (외부 지정) |
| 다크모드 | next-themes | 결정됨 (이미 layout.tsx에 설정됨) |
| 데이터 영속성 | localStorage | spec KANBAN-024~026 요구사항 |
| 모달 | shadcn Dialog 컴포넌트 | 프로젝트에 이미 설치됨 |
| 삭제 확인 | shadcn AlertDialog 컴포넌트 | 프로젝트에 이미 설치됨 |
| 우선순위 필터 | shadcn Select 컴포넌트 | 프로젝트에 이미 설치됨 |
| 태그 필터 | shadcn Select 컴포넌트 | 프로젝트에 이미 설치됨 |

## Data Model

### Card
- id: string (required)
- title: string (required)
- description: string
- priority: "Low" | "Medium" | "High" | null
- tags: string[]
- subtasks -> Subtask[]
- columnId: ColumnId (required)
- order: number (required)

### Subtask
- id: string (required)
- title: string (required)
- completed: boolean (required)

### ColumnId
- "todo" | "in-progress" | "done" (고정 3칼럼)

### Column
- id: ColumnId (required)
- title: "To Do" | "In Progress" | "Done" (required)

## Required Skills

| 스킬 | 적용 Task | 용도 |
|------|-----------|------|
| shadcn | Task 4, 5, 6, 7, 8 | UI 컴포넌트 가드 규칙 준수 확인 |

## Affected Files

| 파일 경로 | 변경 유형 | 관련 Task |
|-----------|----------|-----------|
| types/kanban.ts | 신규 | Task 2 |
| lib/kanban-storage.ts | 신규 | Task 3 |
| hooks/use-kanban.tsx | 신규 | Task 4 |
| components/kanban-board.tsx | 신규 | Task 5 |
| components/kanban-column.tsx | 신규 | Task 5 |
| components/kanban-card.tsx | 신규 | Task 5, 6 |
| components/kanban-card-form.tsx | 신규 | Task 5 |
| components/kanban-header.tsx | 신규 | Task 5, 8 |
| components/kanban-search-filter.tsx | 신규 | Task 7 |
| components/card-detail-modal.tsx | 신규 | Task 6 |
| app/page.tsx | 수정 | Task 5 |
| __tests__/kanban-todo.spec.test.tsx | 신규 | Task 1 |
| __tests__/kanban-storage.test.ts | 신규 | Task 3 |
| __tests__/use-kanban.test.tsx | 신규 | Task 4 |

변경 유형: 신규 | 수정 | 삭제

## Tasks

### Task 1: spec 테스트 생성

- **시나리오**: KANBAN-001 ~ KANBAN-029 (전체)
- **의존성**: 없음
- **참조**:
  - artifacts/spec.yaml
  - artifacts/kanban-todo/wireframe.html
- **구현 대상**: `__tests__/kanban-todo.spec.test.tsx` -- spec.yaml의 모든 시나리오를 검증하는 수용 기준 테스트
- **수용 기준**:
  - [ ] 모든 시나리오(KANBAN-001 ~ KANBAN-029)에 대한 테스트 케이스가 존재한다
  - [ ] `bun run test` 실행 시 spec 테스트가 인식된다 (Red 상태 허용)

---

### Task 2: 타입 정의

- **시나리오**: 전체 (공통 기반)
- **의존성**: 없음
- **참조**:
  - artifacts/spec.yaml -- Card, Subtask, Column 구조
- **구현 대상**: `types/kanban.ts` -- Card, Subtask, ColumnId, Column 타입 및 KanbanState 인터페이스
- **수용 기준**:
  - [ ] Card 타입에 id, title, description, priority, tags, subtasks, columnId, order 필드가 존재한다
  - [ ] Subtask 타입에 id, title, completed 필드가 존재한다
  - [ ] ColumnId는 "todo" | "in-progress" | "done" 유니온 타입이다
  - [ ] TypeScript 컴파일 에러가 없다

---

### Task 3: localStorage 영속성 모듈

- **시나리오**: KANBAN-024, KANBAN-025, KANBAN-026
- **의존성**: Task 2 (타입 참조)
- **참조**:
  - artifacts/spec.yaml -- 영속성 시나리오
- **구현 대상**: `lib/kanban-storage.ts` -- localStorage 읽기/쓰기 함수, `__tests__/kanban-storage.test.ts` -- 단위 테스트
- **수용 기준**:
  - [ ] saveCards(cards) 호출 후 loadCards()가 동일한 카드 배열을 반환한다
  - [ ] localStorage가 비어있으면 loadCards()가 빈 배열을 반환한다
  - [ ] 잘못된 JSON이 저장되어 있으면 빈 배열을 반환한다

---

### Task 4: 칸반 상태 관리 훅 + Context

- **시나리오**: KANBAN-001, KANBAN-002, KANBAN-003 ~ KANBAN-006, KANBAN-007, KANBAN-008, KANBAN-009 ~ KANBAN-011, KANBAN-012 ~ KANBAN-014, KANBAN-015, KANBAN-016, KANBAN-027
- **의존성**: Task 2 (타입 참조), Task 3 (영속성 모듈 참조)
- **참조**:
  - artifacts/spec.yaml -- 전체 상태 변경 시나리오
- **구현 대상**: `hooks/use-kanban.tsx` -- KanbanProvider, useKanban 훅 (카드 CRUD, 칼럼 이동, 서브태스크 관리, 순서 변경 로직), `__tests__/use-kanban.test.tsx` -- 단위 테스트
- **수용 기준**:
  - [ ] addCard("To Do", "장보기") -> "To Do" 칼럼에 "장보기" 카드가 추가된다
  - [ ] addCard("To Do", "") -> 에러("제목을 입력해주세요")가 반환된다
  - [ ] updateCard로 description, priority, tag 변경 후 해당 카드에 반영된다
  - [ ] updateCardTitle("장보기", "마트 장보기") -> 제목이 변경된다
  - [ ] updateCardTitle("장보기", "") -> 제목이 "장보기"로 유지된다
  - [ ] deleteCard 호출 시 카드가 목록에서 제거된다
  - [ ] addSubtask("우유 사기") -> 서브태스크 목록에 추가된다
  - [ ] toggleSubtask -> completed 상태가 토글된다
  - [ ] moveCard(cardId, fromColumn, toColumn) -> 카드가 대상 칼럼으로 이동한다
  - [ ] reorderCard(cardId, newIndex) -> 같은 칼럼 내에서 순서가 변경된다
  - [ ] 상태 변경 시 localStorage에 자동 저장된다

---

### Task 5: 칸반 보드 레이아웃 컴포넌트 (Board형)

- **시나리오**: KANBAN-001, KANBAN-002
- **의존성**: Task 2 (타입), Task 4 (상태 훅)
- **참조**:
  - artifacts/kanban-todo/wireframe.html -- Screen 0 (기본 보드), Screen 1 (카드 보드)
  - shadcn -- Card, Button, Input 컴포넌트
- **구현 대상**:
  - `components/kanban-header.tsx` -- 앱 헤더 (제목, 다크모드 토글 버튼)
  - `components/kanban-board.tsx` -- 3칼럼 보드 레이아웃 (Board형 컨테이너)
  - `components/kanban-column.tsx` -- 칼럼 (Column형: 제목, 카드 수 배지, 카드 리스트, 빈 상태)
  - `components/kanban-card.tsx` -- 카드 (Card형: 제목, 우선순위 Badge, 태그 Badge, 서브태스크 진행률)
  - `components/kanban-card-form.tsx` -- 카드 추가 폼 (Form형: Input + Button, 에러 메시지)
  - `app/page.tsx` -- KanbanProvider로 감싼 보드 페이지 (수정)
- **수용 기준**:
  - [ ] "To Do", "In Progress", "Done" 3개 칼럼이 렌더링된다
  - [ ] 각 칼럼에 카드 수 배지가 표시된다
  - [ ] 카드 추가 폼에서 제목 입력 후 추가 버튼 클릭 시 "To Do" 칼럼에 카드가 나타난다
  - [ ] 빈 제목 입력 시 "제목을 입력해주세요" 에러 메시지가 표시된다
  - [ ] 카드에 우선순위, 태그, 서브태스크 진행률이 표시된다
  - [ ] 빈 칼럼에 "카드가 없습니다" 메시지가 표시된다

---

### Task 6: 카드 상세 모달 + 인라인 편집 + 삭제

- **시나리오**: KANBAN-003, KANBAN-004, KANBAN-005, KANBAN-006, KANBAN-007, KANBAN-008, KANBAN-009, KANBAN-010, KANBAN-011, KANBAN-012, KANBAN-013, KANBAN-014
- **의존성**: Task 5 (보드 레이아웃에서 카드 클릭으로 진입)
- **참조**:
  - artifacts/kanban-todo/wireframe.html -- Screen 2 (카드 상세 모달), Screen 3 (삭제 확인)
  - shadcn -- Dialog, AlertDialog, Input, Textarea, Checkbox, Badge, Button 컴포넌트
- **구현 대상**:
  - `components/card-detail-modal.tsx` -- 카드 상세 모달 (Dialog형: 설명 Textarea, 우선순위 선택, 태그 추가/표시, 서브태스크 체크리스트 + 진행률 Bar, 삭제 버튼)
  - `components/kanban-card.tsx` 수정 -- 인라인 제목 편집 (클릭 시 Input 전환, Enter로 확정, 빈 값 시 원래 제목 유지), 카드 클릭 시 모달 열기
- **수용 기준**:
  - [ ] 카드 클릭 시 상세 모달에 제목, 설명, 우선순위, 태그, 서브태스크 섹션이 표시된다
  - [ ] 모달에서 설명 입력 후 저장하면 재오픈 시 유지된다
  - [ ] 모달에서 우선순위 "High" 선택 시 카드에 반영된다
  - [ ] 모달에서 태그 "개인" 추가 시 카드에 반영된다
  - [ ] 모달에서 서브태스크 "우유 사기" 추가 시 체크리스트에 나타난다
  - [ ] 서브태스크 체크박스 클릭 시 완료 표시 및 진행률(1/1) 반영된다
  - [ ] 진행률이 완료/전체 형식(1/2)으로 표시된다
  - [ ] 카드 제목 클릭 -> "마트 장보기" 입력 -> Enter -> 제목 변경된다
  - [ ] 카드 제목 클릭 -> 빈 문자열 입력 -> Enter -> 원래 제목 유지된다
  - [ ] 삭제 버튼 클릭 시 "정말 삭제하시겠습니까?" 확인 다이얼로그가 표시된다
  - [ ] 확인 클릭 시 카드가 보드에서 제거된다
  - [ ] 취소 클릭 시 다이얼로그가 닫히고 카드가 유지된다

---

### Task 7: 검색 및 필터

- **시나리오**: KANBAN-017, KANBAN-018, KANBAN-019, KANBAN-020, KANBAN-021, KANBAN-028, KANBAN-029
- **의존성**: Task 5 (보드에 카드가 렌더링되어야 필터 동작 확인 가능)
- **참조**:
  - artifacts/kanban-todo/wireframe.html -- Screen 4 (검색 필터)
  - shadcn -- Input, Select 컴포넌트
- **구현 대상**:
  - `components/kanban-search-filter.tsx` -- 검색바 (Input형: 검색 아이콘, X 아이콘으로 초기화), 우선순위 필터 (Select형: 전체/Low/Medium/High), 태그 필터 (Select형: 전체 + 기존 태그 목록)
  - `hooks/use-kanban.tsx` 수정 -- 검색어/필터 상태, 필터링된 카드 목록 반환 로직 (AND 조합)
- **수용 기준**:
  - [ ] 검색바에 "장" 입력 시 "장보기" 카드만 표시된다
  - [ ] 검색바에 "하기" 입력 시 "장보기", "공부하기", "운동하기" 모두 표시된다
  - [ ] 검색어 삭제 시 모든 카드가 표시된다
  - [ ] 우선순위 "High" 필터 선택 시 High 카드만 표시된다
  - [ ] 태그 "개인" 필터 선택 시 "개인" 태그 카드만 표시된다
  - [ ] 검색어 "장" + 우선순위 "High" 동시 적용 시 "장보기"만 표시된다 (AND 조합)
  - [ ] 우선순위 필터를 "전체"로 변경 시 모든 카드가 표시된다

---

### Task 8: 드래그 앤 드롭

- **시나리오**: KANBAN-015, KANBAN-016, KANBAN-027
- **의존성**: Task 5 (보드 + 칼럼 + 카드 컴포넌트)
- **참조**:
  - artifacts/kanban-todo/wireframe.html -- Screen 1 (드롭 타겟 인디케이터)
  - @atlaskit/pragmatic-drag-and-drop 문서
- **구현 대상**:
  - `components/kanban-card.tsx` 수정 -- draggable 설정
  - `components/kanban-column.tsx` 수정 -- dropTargetForElements 설정, 드롭 타겟 인디케이터 (dashed border, "여기에 드롭" 텍스트)
  - @atlaskit/pragmatic-drag-and-drop 패키지 설치
- **수용 기준**:
  - [ ] "장보기" 카드를 "To Do" -> "In Progress"로 드래그&드롭 시 "In Progress"에 표시되고 "To Do"에서 제거된다
  - [ ] "장보기" 카드를 "In Progress" -> "Done"으로 드래그&드롭 시 "Done"에 표시되고 "In Progress"에서 제거된다
  - [ ] 같은 칼럼 내에서 "공부하기"를 "장보기" 위로 드래그&드롭 시 순서가 "공부하기", "장보기", "운동하기"로 변경된다

---

### Task 9: 다크모드 토글

- **시나리오**: KANBAN-022, KANBAN-023, KANBAN-026
- **의존성**: Task 5 (헤더 컴포넌트)
- **참조**:
  - artifacts/kanban-todo/wireframe.html -- Screen 5 (다크모드)
  - next-themes (이미 layout.tsx에 ThemeProvider 설정됨)
  - shadcn -- Button 컴포넌트
- **구현 대상**:
  - `components/kanban-header.tsx` 수정 -- 다크모드 토글 버튼 (라이트: Moon 아이콘, 다크: Sun 아이콘, useTheme 훅 사용)
- **수용 기준**:
  - [ ] 라이트모드에서 토글 클릭 시 html에 "dark" 클래스가 추가된다
  - [ ] 다크모드에서 토글 클릭 시 html에서 "dark" 클래스가 제거된다
  - [ ] 다크모드 설정이 새로고침 후 유지된다 (next-themes 자체 localStorage)

---

## 미결정 사항

없음 (모든 기술 선택이 사전 결정됨)
