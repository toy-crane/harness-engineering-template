# Kanban Todo 구현 계획

## Architecture Decisions

| 결정 사항 | 선택 | 사유 |
|-----------|------|------|
| 드래그&드롭 | @atlaskit/pragmatic-drag-and-drop | 사전 결정 사항 |
| 상태 관리 | React useState + Context | 사전 결정 사항 |
| 다크모드 | next-themes | 이미 layout.tsx에 ThemeProvider 설정됨 |
| 데이터 영속성 | localStorage | spec KANBAN-024~026 요구사항 |
| UI 컴포넌트 | shadcn/ui (기설치) | dialog, alert-dialog, badge, card, input, select, checkbox, button 활용 |

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

### BoardState
- cards: Card[]
- columns: { id: ColumnId, title: string }[]

## Required Skills

| 스킬 | 적용 Task | 용도 |
|------|-----------|------|
| (스킬 탐색 건너뜀) | — | — |

## Affected Files

| 파일 경로 | 변경 유형 | 관련 Task |
|-----------|----------|-----------|
| `types/kanban.ts` | 신규 | Task 2 |
| `config/columns.ts` | 신규 | Task 2 |
| `lib/storage.ts` | 신규 | Task 3 |
| `hooks/use-kanban.tsx` | 신규 | Task 4 |
| `components/kanban-board.tsx` | 신규 | Task 5 |
| `components/kanban-column.tsx` | 신규 | Task 5 |
| `components/kanban-card.tsx` | 신규 | Task 5, 6 |
| `components/add-card-form.tsx` | 신규 | Task 5 |
| `components/card-detail-modal.tsx` | 신규 | Task 6 |
| `components/delete-confirm-dialog.tsx` | 신규 | Task 7 |
| `components/search-bar.tsx` | 신규 | Task 8 |
| `components/priority-filter.tsx` | 신규 | Task 8 |
| `components/tag-filter.tsx` | 신규 | Task 8 |
| `components/dark-mode-toggle.tsx` | 신규 | Task 9 |
| `components/kanban-header.tsx` | 신규 | Task 5, 9 |
| `app/page.tsx` | 수정 | Task 5 |
| `__tests__/kanban.spec.test.tsx` | 신규 | Task 1 |
| `__tests__/kanban-card.test.tsx` | 신규 | Task 5 |
| `__tests__/use-kanban.test.tsx` | 신규 | Task 4 |
| `__tests__/storage.test.tsx` | 신규 | Task 3 |

변경 유형: 신규 | 수정 | 삭제

## Tasks

### Task 1: Spec 테스트 생성

- **시나리오**: KANBAN-001 ~ KANBAN-029 (전체)
- **의존성**: 없음
- **참조**:
  - artifacts/spec.yaml
  - __tests__/button.test.tsx (기존 테스트 패턴 참조)
- **구현 대상**: `__tests__/kanban.spec.test.tsx` — spec.yaml의 모든 시나리오를 검증하는 수용 기준 테스트 파일
- **수용 기준**:
  - [ ] `bun run test` 실행 시 모든 spec 테스트가 존재하고, 구현 미완으로 실패(Red) 상태

---

### Task 2: 타입 및 설정 정의

- **시나리오**: 전체 (기반 타입)
- **의존성**: 없음
- **참조**:
  - artifacts/spec.yaml — Card, Subtask, Priority, ColumnId 도출
- **구현 대상**:
  - `types/kanban.ts` — Card, Subtask, ColumnId, Priority, BoardState 타입
  - `config/columns.ts` — 3칼럼 고정 설정 (To Do, In Progress, Done)
- **수용 기준**:
  - [ ] Card 타입에 id, title, description, priority, tags, subtasks, columnId, order 필드 존재
  - [ ] Subtask 타입에 id, title, completed 필드 존재
  - [ ] ColumnId가 "todo" | "in-progress" | "done" 유니온 타입
  - [ ] Priority가 "High" | "Medium" | "Low" | null 타입
  - [ ] columns 설정이 3개 칼럼의 id와 title 매핑 포함

---

### Task 3: localStorage 영속성 모듈

- **시나리오**: KANBAN-024, KANBAN-025, KANBAN-026
- **의존성**: Task 2 (타입 의존)
- **참조**:
  - artifacts/spec.yaml — 영속성 시나리오
- **구현 대상**:
  - `lib/storage.ts` — BoardState를 localStorage에 저장/불러오는 함수
  - `__tests__/storage.test.tsx` — 저장/불러오기 단위 테스트
- **수용 기준**:
  - [ ] saveBoardState(state) 호출 -> localStorage에 JSON 저장
  - [ ] loadBoardState() 호출 -> 저장된 BoardState 반환, 없으면 초기값 반환
  - [ ] 잘못된 JSON이 저장된 경우 초기값 반환

---

### Task 4: 칸반 상태 관리 Hook

- **시나리오**: KANBAN-001, KANBAN-002, KANBAN-003~006, KANBAN-007~008, KANBAN-009~011, KANBAN-012~014, KANBAN-015~016, KANBAN-027
- **의존성**: Task 2 (타입), Task 3 (storage)
- **참조**:
  - artifacts/spec.yaml — 카드 CRUD, 서브태스크, 이동 시나리오
- **구현 대상**:
  - `hooks/use-kanban.tsx` — KanbanProvider Context와 useKanban Hook
  - `__tests__/use-kanban.test.tsx` — 상태 변경 로직 단위 테스트
- **수용 기준**:
  - [ ] addCard("To Do", "장보기") -> "To Do" 칼럼에 카드 추가, 칼럼 카드 수 1
  - [ ] addCard("To Do", "") -> "제목을 입력해주세요" 에러 반환
  - [ ] updateCard(id, { description: "마트 가서 장보기" }) -> 카드 설명 변경
  - [ ] updateCard(id, { priority: "High" }) -> 카드 우선순위 변경
  - [ ] addTag(cardId, "개인") -> 카드에 태그 추가
  - [ ] updateCardTitle(id, "마트 장보기") -> 카드 제목 변경
  - [ ] updateCardTitle(id, "") -> 제목 변경 안 됨, 기존 제목 유지
  - [ ] deleteCard(id) -> 카드 제거
  - [ ] addSubtask(cardId, "우유 사기") -> 서브태스크 추가, 서브태스크 수 1
  - [ ] toggleSubtask(cardId, subtaskId) -> 서브태스크 완료 토글, 진행률 반영
  - [ ] moveCard(cardId, toColumnId, toIndex) -> 카드 칼럼/순서 이동
  - [ ] 상태 변경 시 localStorage에 자동 저장

---

### Task 5: 칸반 보드 레이아웃 컴포넌트

- **시나리오**: KANBAN-001, KANBAN-002, KANBAN-007, KANBAN-008, KANBAN-015, KANBAN-016, KANBAN-027
- **의존성**: Task 2 (타입), Task 4 (상태 Hook)
- **참조**:
  - artifacts/kanban-todo/wireframe.html — Screen 0 (기본 보드), Screen 1 (카드 보드)
- **구현 대상**:
  - `components/kanban-header.tsx` — 앱 타이틀 + 다크모드 토글 자리, wireframe Header 영역
  - `components/kanban-board.tsx` — 3칼럼 보드 레이아웃 (모바일: 세로 스택, 데스크톱: 가로 배치), wireframe Columns 영역
  - `components/kanban-column.tsx` — 칼럼 컨테이너 (칼럼명, 카드 수 badge, 빈 상태 메시지, 드롭 영역), wireframe Column 컴포넌트
  - `components/kanban-card.tsx` — 카드 UI (제목 인라인 편집, 우선순위 badge, 태그 badge, 서브태스크 진행률), wireframe Card 컴포넌트
  - `components/add-card-form.tsx` — 카드 추가 입력 폼 (제목 input + 추가 button + 에러 메시지), wireframe Add card input 영역
  - `app/page.tsx` 수정 — KanbanProvider로 감싸고 보드 렌더링
- **수용 기준**:
  - [ ] To Do, In Progress, Done 3칼럼이 렌더링됨
  - [ ] 각 칼럼에 카드 수 badge 표시
  - [ ] 빈 칼럼에 "카드가 없습니다" 메시지 표시
  - [ ] 카드 추가: 제목 입력 후 추가 버튼 클릭 -> 카드 생성
  - [ ] 빈 제목 제출 시 "제목을 입력해주세요" 에러 표시
  - [ ] 카드 제목 클릭 -> 인라인 편집 활성화, Enter -> 제목 저장
  - [ ] 카드에 우선순위 badge, 태그 badge, 서브태스크 진행률 표시
  - [ ] @atlaskit/pragmatic-drag-and-drop으로 카드 드래그&드롭 (칼럼 간 이동, 칼럼 내 순서 변경)

---

### Task 6: 카드 상세 모달

- **시나리오**: KANBAN-003, KANBAN-004, KANBAN-005, KANBAN-006, KANBAN-012, KANBAN-013, KANBAN-014
- **의존성**: Task 4 (상태 Hook), Task 5 (카드 클릭 트리거)
- **참조**:
  - artifacts/kanban-todo/wireframe.html — Screen 2 (카드 상세 모달)
  - components/ui/dialog.tsx (shadcn Dialog)
- **구현 대상**:
  - `components/card-detail-modal.tsx` — 카드 상세 편집 모달 (설명 textarea, 우선순위 선택 버튼, 태그 추가 input, 서브태스크 체크리스트 + 진행률 바 + 추가 input, 삭제 버튼), wireframe Modal 컴포넌트
- **수용 기준**:
  - [ ] 카드 클릭 -> 모달에 제목, 설명, 우선순위, 태그, 서브태스크 섹션 표시
  - [ ] 설명 입력 후 저장 -> 재오픈 시 설명 유지
  - [ ] 우선순위 Low/Medium/High 버튼 클릭 -> 선택 상태 반영
  - [ ] 태그 입력 후 추가 -> 태그 목록에 표시
  - [ ] 서브태스크 입력 후 추가 -> 체크리스트에 항목 추가
  - [ ] 서브태스크 체크박스 클릭 -> 완료 토글, 진행률(예: "1/2") 갱신
  - [ ] X 버튼 또는 배경 클릭 -> 모달 닫기

---

### Task 7: 카드 삭제 확인 다이얼로그

- **시나리오**: KANBAN-009, KANBAN-010, KANBAN-011
- **의존성**: Task 4 (상태 Hook), Task 6 (삭제 버튼 트리거)
- **참조**:
  - artifacts/kanban-todo/wireframe.html — Screen 3 (삭제 확인)
  - components/ui/alert-dialog.tsx (shadcn AlertDialog)
- **구현 대상**:
  - `components/delete-confirm-dialog.tsx` — "정말 삭제하시겠습니까?" 확인 다이얼로그 (취소/확인 버튼), wireframe Confirm dialog 컴포넌트
- **수용 기준**:
  - [ ] 삭제 버튼 클릭 -> "정말 삭제하시겠습니까?" 확인 다이얼로그 표시
  - [ ] 확인 클릭 -> 카드 삭제, 보드에서 제거
  - [ ] 취소 클릭 -> 다이얼로그 닫힘, 카드 유지

---

### Task 8: 검색 및 필터

- **시나리오**: KANBAN-017, KANBAN-018, KANBAN-019, KANBAN-020, KANBAN-021, KANBAN-028, KANBAN-029
- **의존성**: Task 4 (상태 Hook), Task 5 (보드 렌더링)
- **참조**:
  - artifacts/kanban-todo/wireframe.html — Screen 4 (검색/필터)
  - components/ui/select.tsx (shadcn Select)
- **구현 대상**:
  - `components/search-bar.tsx` — 검색 input (검색 아이콘, X 클리어 버튼), wireframe Search bar 컴포넌트
  - `components/priority-filter.tsx` — 우선순위 드롭다운 (전체/High/Medium/Low), wireframe Priority filter 컴포넌트
  - `components/tag-filter.tsx` — 태그 드롭다운 (전체 + 기존 태그 목록), wireframe Tag filter 컴포넌트
  - 보드에 필터링 로직 연결
- **수용 기준**:
  - [ ] 검색바에 "장" 입력 -> "장보기"만 표시, "공부하기", "운동하기" 숨김
  - [ ] 검색바에 "하기" 입력 -> "장보기", "공부하기", "운동하기" 모두 표시
  - [ ] 검색어 삭제 -> 모든 카드 표시
  - [ ] 우선순위 "High" 선택 -> 우선순위 High 카드만 표시
  - [ ] 태그 "개인" 선택 -> "개인" 태그 카드만 표시
  - [ ] 검색 "장" + 우선순위 "High" -> AND 조합, "장보기"만 표시
  - [ ] 우선순위 필터 "전체" 선택 -> 모든 카드 표시

---

### Task 9: 다크모드 토글

- **시나리오**: KANBAN-022, KANBAN-023, KANBAN-026
- **의존성**: Task 5 (헤더 영역)
- **참조**:
  - artifacts/kanban-todo/wireframe.html — Screen 5 (다크모드)
  - next-themes (이미 layout.tsx에 설정됨)
- **구현 대상**:
  - `components/dark-mode-toggle.tsx` — 다크모드 토글 버튼 (라이트: moon 아이콘, 다크: sun 아이콘), wireframe Toggle button 컴포넌트
- **수용 기준**:
  - [ ] 라이트 모드에서 토글 클릭 -> 다크모드 전환 (html에 dark 클래스)
  - [ ] 다크모드에서 토글 클릭 -> 라이트모드 전환
  - [ ] 다크모드 설정 새로고침 후 유지 (next-themes 기본 동작)

---

## 미결정 사항

없음 (DnD, 상태 관리, 다크모드 모두 사전 결정됨)
