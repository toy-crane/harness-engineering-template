# Kanban Todo 구현 계획

## Architecture Decisions

| 결정 사항 | 선택 | 사유 |
|-----------|------|------|
| DnD 라이브러리 | @atlaskit/pragmatic-drag-and-drop | Atlassian(Jira) 팀이 활발히 유지보수, react-beautiful-dnd 후속작 |
| 상태 관리 | React Context + useReducer | 외부 라이브러리 불필요한 규모, 보드 전역 상태 공유 필요 |
| 영속성 | Custom useLocalStorage hook | spec 요구사항이 localStorage 전용 |
| 테마 | next-themes (기설치) | layout.tsx에 ThemeProvider 이미 구성됨. next-themes가 자체적으로 localStorage에 테마 설정을 영속화하므로 별도 관리 불필요 |
| 필터 표시 방식 | dimming (opacity) | wireframe Screen 4에서 비매칭 카드를 opacity 25%로 dimming 처리. 완전히 숨기지 않고 존재를 보여줌 |
| UI 컴포넌트 | shadcn/ui (기설치 16종) | Card, Dialog, AlertDialog, Badge, Select 등 모두 사용 가능 |

## Data Model

### Card
- id: string (required, nanoid)
- title: string (required)
- description: string
- priority: "Low" | "Medium" | "High" | null
- tags: string[]
- subtasks → Subtask[]
- columnId: ColumnId (required)
- order: number (required)

### Subtask
- id: string (required)
- title: string (required)
- completed: boolean (default: false)

### ColumnId
- "todo" | "in-progress" | "done"

### BoardState
- cards: Card[]
- searchQuery: string
- priorityFilter: Priority | null
- tagFilter: string | null

## Required Skills

| 스킬 | 적용 Task | 용도 |
|------|-----------|------|
| shadcn | Task 6-11 | 컴포넌트 추가·variant 활용 |
| vercel-react-best-practices | Task 5, 12 | 상태 관리·메모이제이션 최적화 |

## Affected Files

| 파일 경로 | 변경 유형 | 관련 Task |
|-----------|----------|-----------|
| types/kanban.ts | 신규 | Task 2 |
| lib/kanban-store.ts | 신규 | Task 3 |
| hooks/use-local-storage.ts | 신규 | Task 4 |
| hooks/use-kanban-board.tsx | 신규 | Task 5 |
| components/kanban-card.tsx | 신규 | Task 6 |
| components/card-detail-modal.tsx | 신규 | Task 7 |
| components/delete-confirm-dialog.tsx | 신규 | Task 8 |
| components/kanban-column.tsx | 신규 | Task 9 |
| components/search-filter-bar.tsx | 신규 | Task 10 |
| components/dark-mode-toggle.tsx | 신규 | Task 11 |
| components/kanban-board.tsx | 신규 | Task 12 |
| app/page.tsx | 수정 | Task 13 |
| __tests__/kanban.spec.test.tsx | 신규 | Task 1 |
| __tests__/kanban-store.test.ts | 신규 | Task 3 |
| __tests__/use-local-storage.test.ts | 신규 | Task 4 |
| __tests__/use-kanban-board.test.tsx | 신규 | Task 5 |
| __tests__/kanban-card.test.tsx | 신규 | Task 6 |
| __tests__/card-detail-modal.test.tsx | 신규 | Task 7 |
| __tests__/delete-confirm-dialog.test.tsx | 신규 | Task 8 |
| __tests__/kanban-column.test.tsx | 신규 | Task 9 |
| __tests__/search-filter-bar.test.tsx | 신규 | Task 10 |
| __tests__/dark-mode-toggle.test.tsx | 신규 | Task 11 |
| __tests__/kanban-board.test.tsx | 신규 | Task 12 |

## Tasks

### Task 1: Spec 테스트 생성

- **시나리오**: KANBAN-001 ~ KANBAN-029 (전체)
- **의존성**: 없음
- **참조**: 없음
- **구현 대상**: `__tests__/kanban.spec.test.tsx` — spec.yaml의 29개 시나리오를 수용 기준 테스트로 작성. 보드를 렌더링하고 사용자 인터랙션을 시뮬레이션하여 기대 결과를 검증한다
- **수용 기준**:
  - [ ] 29개 시나리오 각각에 대응하는 테스트 케이스가 존재한다
  - [ ] `bun run test __tests__/kanban.spec.test.tsx` 실행 시 테스트가 실패한다 (RED 상태)

---

### Task 2: 타입 정의

- **시나리오**: 전체 (공통 기반)
- **의존성**: 없음
- **참조**: 없음
- **구현 대상**: `types/kanban.ts` — Card, Subtask, ColumnId, Priority, BoardState 타입
- **수용 기준**:
  - [ ] `types/kanban.ts`에서 Card, Subtask, ColumnId, Priority, BoardState를 export한다
  - [ ] `tsc --noEmit` 통과

---

### Task 3: 보드 상태 로직

- **시나리오**: KANBAN-001, KANBAN-002, KANBAN-004 ~ KANBAN-016, KANBAN-027
- **의존성**: Task 2 (타입 참조)
- **참조**: 없음
- **구현 대상**: `lib/kanban-store.ts` — 순수 함수: addCard, updateCard, deleteCard, moveCard, reorderCards, addSubtask, toggleSubtask, filterCards (검색 + 우선순위 + 태그 AND 조합)
- **수용 기준**:
  - [ ] `__tests__/kanban-store.test.ts` 구현 테스트 통과
  - [ ] addCard: 빈 제목 → 에러, 유효 제목 → 카드 추가됨
  - [ ] updateCard: description/priority/tags 변경 반영
  - [ ] deleteCard: 카드 ID로 삭제
  - [ ] moveCard: fromColumn → toColumn 이동
  - [ ] reorderCards: 같은 칼럼 내 순서 변경
  - [ ] addSubtask/toggleSubtask: 서브태스크 추가 및 완료 토글
  - [ ] filterCards: searchQuery="장" → "장보기"만, priorityFilter="High" → High만, AND 조합 동작

---

### Task 4: localStorage 영속성 훅

- **시나리오**: KANBAN-024, KANBAN-025, KANBAN-026
- **의존성**: 없음
- **참조**: 없음
- **구현 대상**: `hooks/use-local-storage.ts` — 제네릭 useLocalStorage<T>(key, initialValue) 훅. 값 변경 시 localStorage에 자동 동기화
- **수용 기준**:
  - [ ] `__tests__/use-local-storage.test.ts` 구현 테스트 통과
  - [ ] 초기값이 localStorage에 없으면 initialValue 반환
  - [ ] setValue 호출 시 localStorage에 JSON 직렬화 저장
  - [ ] 컴포넌트 재마운트 시 localStorage에서 복원

---

### Task 5: 칸반 보드 훅

- **시나리오**: 전체 (상태 중앙 관리)
- **의존성**: Task 2 (타입), Task 3 (상태 로직), Task 4 (localStorage)
- **참조**:
  - vercel-react-best-practices — 상태 관리 최적화
- **구현 대상**: `hooks/use-kanban-board.tsx` — Context + useReducer 기반 KanbanProvider와 useKanbanBoard 훅. 보드 상태를 localStorage에 영속화하고, 카드 CRUD / 이동 / 검색 / 필터 액션을 제공
- **수용 기준**:
  - [ ] `__tests__/use-kanban-board.test.tsx` 구현 테스트 통과
  - [ ] KanbanProvider로 감싼 컴포넌트에서 useKanbanBoard로 상태와 액션에 접근 가능
  - [ ] 액션 디스패치 후 상태가 올바르게 업데이트된다
  - [ ] 새로고침(재마운트) 후 이전 상태가 복원된다

---

### Task 6: 칸반 카드 컴포넌트

- **시나리오**: KANBAN-005, KANBAN-006, KANBAN-007, KANBAN-008, KANBAN-014
- **의존성**: Task 2 (타입)
- **참조**:
  - shadcn — Card, Badge 컴포넌트
- **구현 대상**: `components/kanban-card.tsx` — 카드 표시 컴포넌트 (wireframe Screen 1의 카드). 제목 (클릭 시 인라인 편집), 우선순위 Badge, 태그 Badge 목록, 서브태스크 진행률(1/2). 카드 클릭 시 onSelect 콜백. 필터 비매칭 시 dimmed prop으로 opacity 25% 적용
- **수용 기준**:
  - [ ] `__tests__/kanban-card.test.tsx` 구현 테스트 통과
  - [ ] 카드에 제목, 우선순위 배지, 태그 배지, 서브태스크 진행률이 표시된다
  - [ ] 제목 클릭 → 입력란 전환 → 수정 후 Enter → onTitleChange 콜백 호출
  - [ ] 빈 제목으로 수정 시도 → 원래 제목 유지
  - [ ] 카드 영역 클릭 → onSelect 콜백 호출
  - [ ] dimmed=true → 카드가 opacity 25%로 표시된다

---

### Task 7: 카드 상세 모달

- **시나리오**: KANBAN-003, KANBAN-004, KANBAN-005, KANBAN-006, KANBAN-009, KANBAN-012, KANBAN-013, KANBAN-014
- **의존성**: Task 2 (타입)
- **참조**:
  - shadcn — Dialog, Badge, Checkbox, Input, Textarea, Button 컴포넌트 (우선순위는 Button 그룹으로 구현, wireframe Screen 2 참고)
- **구현 대상**: `components/card-detail-modal.tsx` — 카드 상세 편집 모달 (wireframe Screen 2). 설명 Textarea, 우선순위 토글 버튼 그룹 (Low/Medium/High 3개 버튼, 선택된 버튼 강조), 태그 입력+추가, 서브태스크 체크리스트 + 진행률 바 + 서브태스크 추가, 삭제 버튼
- **수용 기준**:
  - [ ] `__tests__/card-detail-modal.test.tsx` 구현 테스트 통과
  - [ ] 모달에 제목, 설명, 우선순위, 태그, 서브태스크 섹션이 표시된다
  - [ ] 설명 입력 후 저장 → onUpdate 콜백에 변경된 description 전달
  - [ ] 우선순위 버튼 클릭 → onUpdate 콜백에 변경된 priority 전달
  - [ ] 태그 입력 후 추가 → onUpdate 콜백에 변경된 tags 전달
  - [ ] 서브태스크 추가 → 체크리스트에 항목 추가
  - [ ] 서브태스크 체크 → 완료 표시, 진행률 업데이트
  - [ ] 삭제 버튼 클릭 → onDelete 콜백 호출

---

### Task 8: 삭제 확인 다이얼로그

- **시나리오**: KANBAN-009, KANBAN-010, KANBAN-011
- **의존성**: 없음
- **참조**:
  - shadcn — AlertDialog 컴포넌트
- **구현 대상**: `components/delete-confirm-dialog.tsx` — 삭제 확인 다이얼로그 (wireframe Screen 3). "정말 삭제하시겠습니까?" 메시지, 취소/확인 버튼
- **수용 기준**:
  - [ ] `__tests__/delete-confirm-dialog.test.tsx` 구현 테스트 통과
  - [ ] 열림 상태에서 "정말 삭제하시겠습니까?" 텍스트 표시
  - [ ] 확인 클릭 → onConfirm 콜백 호출
  - [ ] 취소 클릭 → onCancel 콜백 호출, 다이얼로그 닫힘

---

### Task 9: 칸반 칼럼 컴포넌트

- **시나리오**: KANBAN-001, KANBAN-002
- **의존성**: Task 2 (타입), Task 6 (카드 컴포넌트)
- **참조**:
  - shadcn — Input, Button 컴포넌트
- **구현 대상**: `components/kanban-column.tsx` — 칼럼 컴포넌트 (wireframe Screen 0, 1). 칼럼 헤더 (이름 + 카드 수), 카드 목록, 하단 카드 추가 입력(제목 input + 추가 버튼), 빈 상태 표시("카드가 없습니다"), 빈 제목 에러("제목을 입력해주세요")
- **수용 기준**:
  - [ ] `__tests__/kanban-column.test.tsx` 구현 테스트 통과
  - [ ] 칼럼 헤더에 이름과 카드 수가 표시된다
  - [ ] 카드 제목 입력 후 추가 → onAddCard 콜백 호출
  - [ ] 빈 제목으로 추가 시도 → "제목을 입력해주세요" 에러 메시지 표시
  - [ ] 카드가 없을 때 "카드가 없습니다" 표시

---

### Task 10: 검색·필터 바

- **시나리오**: KANBAN-017 ~ KANBAN-021, KANBAN-028, KANBAN-029
- **의존성**: Task 2 (타입)
- **참조**:
  - shadcn — Input, Select 컴포넌트
- **구현 대상**: `components/search-filter-bar.tsx` — 검색·필터 바 (wireframe Screen 4). 검색 input (돋보기 아이콘 + 클리어 버튼), 우선순위 Select 드롭다운, 태그 Select 드롭다운
- **수용 기준**:
  - [ ] `__tests__/search-filter-bar.test.tsx` 구현 테스트 통과
  - [ ] 검색어 입력 → onSearchChange 콜백 호출
  - [ ] 검색어 클리어 → onSearchChange("") 콜백 호출
  - [ ] 우선순위 선택 → onPriorityChange 콜백 호출
  - [ ] 태그 선택 → onTagChange 콜백 호출
  - [ ] 필터를 "전체"로 변경 → onPriorityChange(null) 콜백 호출

---

### Task 11: 다크모드 토글

- **시나리오**: KANBAN-022, KANBAN-023, KANBAN-026
- **의존성**: 없음
- **참조**: 없음
- **구현 대상**: `components/dark-mode-toggle.tsx` — 다크모드 토글 버튼 (wireframe Screen 5). next-themes의 useTheme 사용, 라이트 시 Moon 아이콘 / 다크 시 Sun 아이콘. 영속성은 next-themes가 자체 localStorage 키(theme)로 자동 처리
- **수용 기준**:
  - [ ] `__tests__/dark-mode-toggle.test.tsx` 구현 테스트 통과
  - [ ] 라이트모드에서 클릭 → theme이 "dark"로 변경
  - [ ] 다크모드에서 클릭 → theme이 "light"로 변경
  - [ ] 새로고침 후 다크모드 설정이 유지된다 (next-themes 자동 영속화)

---

### Task 12: 드래그&드롭 통합

- **시나리오**: KANBAN-015, KANBAN-016, KANBAN-027
- **의존성**: Task 5 (보드 훅 — moveCard/reorderCards 액션 디스패치), Task 9 (칼럼), Task 6 (카드)
- **참조**:
  - @atlaskit/pragmatic-drag-and-drop 공식 문서: https://atlassian.design/components/pragmatic-drag-and-drop
- **구현 대상**: `components/kanban-board.tsx` — 3칼럼 보드 컨테이너에 pragmatic-drag-and-drop 통합. 카드를 draggable로, 칼럼을 drop target으로 설정. 칼럼 간 이동과 칼럼 내 순서 변경 지원. 드래그 중 대상 칼럼에 dashed border + "여기에 드롭" 시각적 피드백 표시 (wireframe Screen 1)
- **수용 기준**:
  - [ ] `__tests__/kanban-board.test.tsx` 구현 테스트 통과
  - [ ] @atlaskit/pragmatic-drag-and-drop 패키지 설치됨
  - [ ] 카드를 다른 칼럼으로 드래그&드롭 → moveCard 액션 디스패치
  - [ ] 같은 칼럼 내 카드 순서 변경 → reorderCards 액션 디스패치
  - [ ] 드래그 중 대상 칼럼에 drop indicator(dashed border) 표시

---

### Task 13: 보드 페이지 조합

- **시나리오**: 전체 (통합)
- **의존성**: Task 5 ~ Task 12
- **참조**: 없음
- **구현 대상**: `app/page.tsx` 수정 — KanbanProvider로 감싸고, 헤더 (타이틀 + DarkModeToggle), SearchFilterBar, KanbanBoard (3칼럼) 조합. 카드 클릭 시 CardDetailModal 표시, 삭제 시 DeleteConfirmDialog 표시 (wireframe Screen 0, 6)
- **수용 기준**:
  - [ ] `bun run test __tests__/kanban.spec.test.tsx` — 29개 시나리오 전체 통과 (GREEN)
  - [ ] `bun run test` — 전체 테스트 통과
  - [ ] `bun run build` — 빌드 성공

---

## 미결정 사항

- 없음
