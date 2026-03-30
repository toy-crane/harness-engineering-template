# kanban-todo 구현 계획

## Architecture Decisions

| 결정 사항 | 선택 | 사유 |
|-----------|------|------|
| 드래그앤드롭 | @atlaskit/pragmatic-drag-and-drop | 지시에 의해 결정됨 |
| 상태 관리 | React useState + Context | 지시에 의해 결정됨 |
| 다크모드 | next-themes | 이미 layout.tsx에 ThemeProvider 설정됨 |
| 데이터 영속성 | localStorage | spec.yaml KANBAN-024~026 요구사항 |
| UI 컴포넌트 | shadcn (기존 설치분 활용) | card, dialog, alert-dialog, input, badge, checkbox, select, button 이미 설치됨 |
| 칼럼 구조 | 3칼럼 고정 (To Do, In Progress, Done) | spec.yaml 명세 |

## Data Model

### Card
- id (required, string)
- title (required, string)
- description (optional, string)
- priority (optional, "Low" | "Medium" | "High")
- tags (string[])
- subtasks → Subtask[]
- columnId (required, "todo" | "in-progress" | "done")
- order (required, number)

### Subtask
- id (required, string)
- title (required, string)
- completed (required, boolean)

### Column
- id (required, "todo" | "in-progress" | "done")
- title (required, "To Do" | "In Progress" | "Done")

### BoardState
- cards → Card[]
- searchQuery (string)
- priorityFilter (optional, "Low" | "Medium" | "High" | null)
- tagFilter (optional, string | null)

## Required Skills

| 스킬 | 적용 Task | 용도 |
|------|-----------|------|
| shadcn | Task 5, 6, 7, 8 | 기존 UI 컴포넌트(card, dialog, alert-dialog, input, badge, checkbox, select, button) 활용법 참조 |

## Affected Files

| 파일 경로 | 변경 유형 | 관련 Task |
|-----------|----------|-----------|
| types/kanban.ts | 신규 | Task 2 |
| lib/kanban-storage.ts | 신규 | Task 3 |
| lib/kanban-filters.ts | 신규 | Task 4 |
| hooks/use-kanban.tsx | 신규 | Task 5 |
| components/kanban-board.tsx | 신규 | Task 6 |
| components/kanban-column.tsx | 신규 | Task 6 |
| components/kanban-card.tsx | 신규 | Task 6 |
| components/kanban-card-detail.tsx | 신규 | Task 7 |
| components/kanban-delete-confirm.tsx | 신규 | Task 7 |
| components/kanban-header.tsx | 신규 | Task 8 |
| components/kanban-search-filter.tsx | 신규 | Task 8 |
| app/page.tsx | 수정 | Task 9 |
| __tests__/kanban.spec.test.tsx | 신규 | Task 1 |
| __tests__/kanban-storage.test.tsx | 신규 | Task 3 |
| __tests__/kanban-filters.test.tsx | 신규 | Task 4 |
| __tests__/use-kanban.test.tsx | 신규 | Task 5 |
| __tests__/kanban-dnd.test.tsx | 신규 | Task 10 |

변경 유형: 신규 | 수정 | 삭제

## Tasks

### Task 1: spec 테스트 생성

- **시나리오**: KANBAN-001 ~ KANBAN-029 전체
- **의존성**: 없음
- **참조**:
  - artifacts/spec.yaml
  - artifacts/kanban-todo/wireframe.html
  - __tests__/button.test.tsx (기존 테스트 패턴 참조)
- **구현 대상**: `__tests__/kanban.spec.test.tsx` -- spec.yaml의 모든 시나리오를 검증하는 수용 기준 테스트
- **수용 기준**:
  - [ ] `bun run test` 실행 시 kanban.spec.test.tsx 파일이 인식됨
  - [ ] 모든 시나리오(KANBAN-001 ~ KANBAN-029)에 대한 테스트 케이스가 존재함
  - [ ] 구현 전이므로 모든 테스트가 실패(Red) 상태

---

### Task 2: 타입 정의

- **시나리오**: 전체 (모든 feature의 데이터 구조 기반)
- **의존성**: 없음
- **참조**:
  - Data Model 섹션
- **구현 대상**: `types/kanban.ts` -- Card, Subtask, Column, BoardState, Priority 타입 정의
- **수용 기준**:
  - [ ] Card 타입에 id, title, description, priority, tags, subtasks, columnId, order 필드가 포함됨
  - [ ] Subtask 타입에 id, title, completed 필드가 포함됨
  - [ ] Priority 타입이 "Low" | "Medium" | "High"로 정의됨
  - [ ] `tsc --noEmit` 통과

---

### Task 3: localStorage 영속성 유틸리티

- **시나리오**: KANBAN-024, KANBAN-025, KANBAN-026
- **의존성**: Task 2 (타입 참조)
- **참조**:
  - types/kanban.ts
- **구현 대상**: `lib/kanban-storage.ts` -- localStorage에 카드 목록을 저장/불러오는 유틸리티 함수, `__tests__/kanban-storage.test.tsx` -- 단위 테스트
- **수용 기준**:
  - [ ] saveCards([card1, card2]) 호출 후 loadCards() 하면 [card1, card2] 반환
  - [ ] localStorage에 데이터가 없을 때 loadCards()는 빈 배열 반환
  - [ ] 유효하지 않은 JSON이 저장된 경우 빈 배열 반환

---

### Task 4: 검색/필터 순수 함수

- **시나리오**: KANBAN-017, KANBAN-018, KANBAN-019, KANBAN-020, KANBAN-021, KANBAN-028, KANBAN-029
- **의존성**: Task 2 (타입 참조)
- **참조**:
  - types/kanban.ts
- **구현 대상**: `lib/kanban-filters.ts` -- 검색어, 우선순위, 태그로 카드 목록을 필터링하는 순수 함수, `__tests__/kanban-filters.test.tsx` -- 단위 테스트
- **수용 기준**:
  - [ ] filterCards(cards, { searchQuery: "장" }) -> 제목에 "장"이 포함된 카드만 반환
  - [ ] filterCards(cards, { priorityFilter: "High" }) -> 우선순위가 "High"인 카드만 반환
  - [ ] filterCards(cards, { tagFilter: "개인" }) -> "개인" 태그가 있는 카드만 반환
  - [ ] filterCards(cards, { searchQuery: "장", priorityFilter: "High" }) -> AND 조합 적용
  - [ ] filterCards(cards, {}) -> 모든 카드 반환 (필터 없음)

---

### Task 5: 칸반 상태 관리 훅

- **시나리오**: KANBAN-001, KANBAN-002, KANBAN-003 ~ KANBAN-006, KANBAN-007, KANBAN-008, KANBAN-009 ~ KANBAN-011, KANBAN-012 ~ KANBAN-014, KANBAN-015, KANBAN-016, KANBAN-027
- **의존성**: Task 2 (타입), Task 3 (영속성), Task 4 (필터)
- **참조**:
  - types/kanban.ts
  - lib/kanban-storage.ts
  - lib/kanban-filters.ts
- **구현 대상**: `hooks/use-kanban.tsx` -- 보드 상태를 관리하는 커스텀 훅(카드 CRUD, 서브태스크, 칼럼 이동, 검색/필터 상태). Context Provider 포함. `__tests__/use-kanban.test.tsx` -- 단위 테스트
- **수용 기준**:
  - [ ] addCard("To Do", "장보기") -> "To Do" 칼럼에 "장보기" 카드 추가
  - [ ] addCard("To Do", "") -> 추가되지 않고 에러 메시지 "제목을 입력해주세요" 반환
  - [ ] updateCard(id, { description: "마트 가서 장보기" }) -> 카드 설명 업데이트
  - [ ] updateCard(id, { priority: "High" }) -> 카드 우선순위 업데이트
  - [ ] updateCard(id, { title: "" }) -> 제목 변경 무시, 기존 제목 유지
  - [ ] deleteCard(id) -> 카드 제거
  - [ ] addTag(cardId, "개인") -> 카드에 태그 추가
  - [ ] addSubtask(cardId, "우유 사기") -> 서브태스크 추가
  - [ ] toggleSubtask(cardId, subtaskId) -> 완료 상태 토글
  - [ ] moveCard(cardId, toColumnId, toIndex) -> 카드 칼럼/순서 이동
  - [ ] 상태 변경 시 localStorage에 자동 저장

---

### Task 6: 보드 레이아웃 컴포넌트 (Board, Column, Card)

- **시나리오**: KANBAN-001, KANBAN-002, KANBAN-007, KANBAN-008
- **의존성**: Task 2 (타입), Task 5 (훅)
- **참조**:
  - shadcn -- card, input, button, badge 컴포넌트 활용
  - artifacts/kanban-todo/wireframe.html -- Screen 0 (기본 보드), Screen 1 (카드 보드)
- **구현 대상**:
  - `components/kanban-board.tsx` -- 3칼럼 레이아웃 (wireframe: desktop은 flex-row, mobile은 flex-col 스택)
  - `components/kanban-column.tsx` -- 칼럼 헤더(제목 + 카드 수 Badge) + 카드 추가 Input + 카드 목록. "To Do" 칼럼에만 카드 추가 입력란 존재
  - `components/kanban-card.tsx` -- 카드 컴포넌트: 제목(인라인 편집 가능), 우선순위 Badge, 태그 Badge, 서브태스크 진행률 텍스트. 카드 클릭 시 상세 모달 오픈
- **수용 기준**:
  - [ ] "To Do", "In Progress", "Done" 3개 칼럼이 렌더링됨
  - [ ] 각 칼럼 헤더에 칼럼명과 카드 수가 표시됨
  - [ ] 카드 추가: 제목 입력 후 추가 버튼 클릭 -> 칼럼에 카드 표시
  - [ ] 빈 제목 입력 시 "제목을 입력해주세요" 오류 메시지 표시
  - [ ] 카드에 우선순위, 태그, 서브태스크 진행률 표시
  - [ ] 카드 제목 클릭 -> 인라인 편집 모드 -> Enter로 저장
  - [ ] 빈 제목으로 인라인 편집 시 원래 제목 유지

---

### Task 7: 카드 상세 모달 및 삭제 확인 (Dialog, AlertDialog)

- **시나리오**: KANBAN-003, KANBAN-004, KANBAN-005, KANBAN-006, KANBAN-009, KANBAN-010, KANBAN-011, KANBAN-012, KANBAN-013, KANBAN-014
- **의존성**: Task 2 (타입), Task 5 (훅), Task 6 (카드 클릭 이벤트)
- **참조**:
  - shadcn -- dialog, alert-dialog, input, checkbox, badge, button, textarea 컴포넌트 활용
  - artifacts/kanban-todo/wireframe.html -- Screen 2 (카드 상세), Screen 3 (삭제 확인)
- **구현 대상**:
  - `components/kanban-card-detail.tsx` -- 카드 상세 Dialog: 제목, 설명(textarea), 우선순위(Low/Medium/High 버튼 그룹), 태그(입력+추가), 서브태스크(체크리스트 + 진행률 바 + 추가), 삭제 버튼
  - `components/kanban-delete-confirm.tsx` -- 삭제 확인 AlertDialog: "정말 삭제하시겠습니까?" 메시지, 확인/취소 버튼
- **수용 기준**:
  - [ ] 카드 클릭 시 상세 모달에 제목, 설명, 우선순위, 태그, 서브태스크 섹션 표시
  - [ ] 설명 입력 후 저장 -> 재오픈 시 입력한 설명 유지
  - [ ] 우선순위 "High" 선택 -> 카드에 "High" 우선순위 반영
  - [ ] 태그 "개인" 추가 -> 카드에 "개인" 태그 반영
  - [ ] 서브태스크 "우유 사기" 추가 -> 체크리스트에 표시
  - [ ] 서브태스크 체크 -> 완료 표시, 진행률 "1/1" 표시
  - [ ] 삭제 버튼 클릭 -> "정말 삭제하시겠습니까?" 확인 다이얼로그 표시
  - [ ] 확인 클릭 -> 카드 삭제, 취소 클릭 -> 다이얼로그 닫기 + 카드 유지

---

### Task 8: 헤더 및 검색/필터 바

- **시나리오**: KANBAN-017, KANBAN-018, KANBAN-019, KANBAN-020, KANBAN-021, KANBAN-022, KANBAN-023, KANBAN-028, KANBAN-029
- **의존성**: Task 2 (타입), Task 5 (훅)
- **참조**:
  - shadcn -- input, select, button 컴포넌트 활용
  - artifacts/kanban-todo/wireframe.html -- Screen 4 (검색/필터), Screen 5 (다크모드)
- **구현 대상**:
  - `components/kanban-header.tsx` -- 앱 헤더: 타이틀 "Kanban Todo" + 다크모드 토글 버튼(moon/sun 아이콘). next-themes useTheme 사용
  - `components/kanban-search-filter.tsx` -- 검색바(Input + search 아이콘) + 우선순위 Select 드롭다운 + 태그 Select 드롭다운. 검색어 삭제(x-circle) 아이콘 포함
- **수용 기준**:
  - [ ] 검색바에 "장" 입력 -> "장보기" 카드만 표시
  - [ ] 검색어 삭제 -> 모든 카드 표시
  - [ ] 우선순위 필터 "High" 선택 -> High 카드만 표시
  - [ ] 태그 필터 "개인" 선택 -> "개인" 태그 카드만 표시
  - [ ] 검색 + 우선순위 AND 조합 -> 교집합만 표시
  - [ ] 필터 "전체" 변경 -> 모든 카드 표시
  - [ ] 다크모드 토글 -> 앱 전체 다크모드 전환
  - [ ] 다크모드 재토글 -> 라이트모드 복귀

---

### Task 9: 페이지 조립 및 Context Provider 연결

- **시나리오**: 전체
- **의존성**: Task 5 (훅/Provider), Task 6 (보드), Task 7 (모달), Task 8 (헤더/필터)
- **참조**:
  - app/layout.tsx (ThemeProvider 이미 설정됨)
  - app/page.tsx (현재 ComponentExample 렌더링 중, 교체 필요)
- **구현 대상**: `app/page.tsx` -- KanbanProvider로 감싼 페이지: Header, SearchFilter, Board 조합
- **수용 기준**:
  - [ ] / 경로 접속 시 칸반 보드 전체 UI 렌더링
  - [ ] 기존 ComponentExample 대신 칸반 보드가 표시됨

---

### Task 10: 드래그앤드롭 통합

- **시나리오**: KANBAN-015, KANBAN-016, KANBAN-027
- **의존성**: Task 5 (moveCard), Task 6 (Board, Column, Card 컴포넌트)
- **참조**:
  - @atlaskit/pragmatic-drag-and-drop 문서
- **구현 대상**: kanban-card, kanban-column에 @atlaskit/pragmatic-drag-and-drop 적용. `__tests__/kanban-dnd.test.tsx` -- 드래그앤드롭 통합 테스트
- **수용 기준**:
  - [ ] "장보기" 카드를 "To Do" -> "In Progress"로 드래그 -> "In Progress"에 표시, "To Do"에서 제거
  - [ ] "공부하기" 카드를 "장보기" 위로 드래그 -> 순서 변경 ("공부하기", "장보기", "운동하기")
  - [ ] "장보기" 카드를 "In Progress" -> "Done"으로 드래그 -> "Done"에 표시

---

### Task 11: spec 테스트 전체 통과 확인

- **시나리오**: KANBAN-001 ~ KANBAN-029 전체
- **의존성**: Task 1 ~ Task 10 전체
- **참조**:
  - __tests__/kanban.spec.test.tsx
- **구현 대상**: spec 테스트 전체 Green 달성. 실패하는 테스트가 있으면 구현 수정
- **수용 기준**:
  - [ ] `bun run test` 실행 시 kanban.spec.test.tsx의 모든 테스트 통과
  - [ ] 기존 button.test.tsx도 통과 유지

---

## 미결정 사항

- 칼럼별 카드 추가 입력란 배치: wireframe에서 "To Do" 칼럼에만 카드 추가 입력란이 보이는데, 다른 칼럼에도 필요한지 spec에 명시되지 않음. wireframe 기준으로 "To Do"만 적용
- 카드 순서 결정 방식: 새 카드 추가 시 칼럼 맨 아래에 추가하는 것으로 가정 (spec에 명시 없음)
- 태그 삭제 기능: spec에 태그 추가만 있고 삭제 시나리오 없음. 추가만 구현
