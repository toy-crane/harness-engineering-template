# kanban-todo 구현 계획

## Architecture Decisions

| 결정 사항 | 선택 | 사유 |
|-----------|------|------|
| DnD 라이브러리 | @atlaskit/pragmatic-drag-and-drop | 지정됨 |
| 상태 관리 | React useState + Context | 지정됨. 외부 상태 라이브러리 없이 간결하게 유지 |
| 다크모드 | next-themes | 이미 layout.tsx에 ThemeProvider 설정됨 |
| 데이터 영속성 | localStorage | spec에 명시된 요구사항 (KANBAN-024~026) |
| 카드 상세 모달 | shadcn Dialog | 기존 components/ui/dialog.tsx 활용 |
| 삭제 확인 | shadcn AlertDialog | 기존 components/ui/alert-dialog.tsx 활용 |
| 우선순위 배지 | shadcn Badge | 기존 components/ui/badge.tsx의 variant 활용 |
| 검색 입력 | shadcn Input + InputGroup | 기존 components/ui/input.tsx, input-group.tsx 활용 |
| 필터 드롭다운 | shadcn Select | 기존 components/ui/select.tsx 활용 |
| 서브태스크 체크 | shadcn Checkbox | 기존 components/ui/checkbox.tsx 활용 |

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

### ColumnId (union type)
- "todo" | "in-progress" | "done"

### Column
- id: ColumnId (required)
- title: "To Do" | "In Progress" | "Done" (required)

## Required Skills

| 스킬 | 적용 Task | 용도 |
|------|-----------|------|
| shadcn | Task 4, 5, 6, 7, 8 | 컴포넌트 사용법과 variant 참조 |

## Affected Files

| 파일 경로 | 변경 유형 | 관련 Task |
|-----------|----------|-----------|
| types/kanban.ts | 신규 | Task 2 |
| config/kanban.ts | 신규 | Task 2 |
| lib/kanban-storage.ts | 신규 | Task 3 |
| hooks/use-kanban.tsx | 신규 | Task 4 |
| components/kanban-board.tsx | 신규 | Task 5 |
| components/kanban-column.tsx | 신규 | Task 5 |
| components/kanban-card.tsx | 신규 | Task 6 |
| components/kanban-card-detail.tsx | 신규 | Task 7 |
| components/kanban-header.tsx | 신규 | Task 8 |
| components/kanban-search-filter.tsx | 신규 | Task 8 |
| app/page.tsx | 수정 | Task 9 |
| __tests__/kanban.spec.test.tsx | 신규 | Task 1 |
| __tests__/kanban-storage.test.tsx | 신규 | Task 3 |
| __tests__/use-kanban.test.tsx | 신규 | Task 4 |
| __tests__/kanban-card.test.tsx | 신규 | Task 6 |
| __tests__/kanban-card-detail.test.tsx | 신규 | Task 7 |
| __tests__/kanban-dnd.test.tsx | 신규 | Task 9 |

변경 유형: 신규 | 수정 | 삭제

## Tasks

### Task 1: spec 테스트 생성

- **시나리오**: KANBAN-001 ~ KANBAN-029 (전체)
- **의존성**: 없음
- **참조**:
  - artifacts/spec.yaml
  - __tests__/button.test.tsx (기존 테스트 패턴)
- **구현 대상**: `__tests__/kanban.spec.test.tsx` — spec.yaml의 모든 시나리오를 검증하는 수용 기준 테스트
- **수용 기준**:
  - [ ] spec.yaml의 29개 시나리오 각각에 대응하는 테스트 케이스 존재
  - [ ] `bun run test __tests__/kanban.spec.test.tsx` 실행 시 모든 테스트가 fail (Red 상태)

---

### Task 2: 타입 및 설정 정의

- **시나리오**: 전체 (데이터 구조 기반)
- **의존성**: 없음
- **참조**:
  - artifacts/spec.yaml (카드 속성: title, description, priority, tags, subtasks)
  - artifacts/kanban-todo/wireframe.html (칼럼명: To Do, In Progress, Done)
- **구현 대상**:
  - `types/kanban.ts` — Card, Subtask, ColumnId, Column 타입
  - `config/kanban.ts` — 칼럼 정의 상수 (3칼럼 고정), 우선순위 목록 상수
- **수용 기준**:
  - [ ] Card 타입에 id, title, description, priority, tags, subtasks, columnId, order 필드 존재
  - [ ] Subtask 타입에 id, title, completed 필드 존재
  - [ ] ColumnId가 "todo" | "in-progress" | "done" 유니온 타입
  - [ ] 칼럼 설정에 3개 칼럼의 id와 표시 제목 매핑 존재
  - [ ] `bun run test` 타입 오류 없이 통과

---

### Task 3: localStorage 영속성 모듈

- **시나리오**: KANBAN-024, KANBAN-025, KANBAN-026
- **의존성**: Task 2 (타입 참조)
- **참조**:
  - types/kanban.ts
- **구현 대상**:
  - `lib/kanban-storage.ts` — 카드 목록 저장/로드 함수
  - `__tests__/kanban-storage.test.tsx` — 저장/로드 단위 테스트
- **수용 기준**:
  - [ ] 카드 목록을 localStorage에 저장하고 로드 시 동일 데이터 반환
  - [ ] localStorage가 비어있을 때 빈 배열 반환
  - [ ] 잘못된 JSON이 저장된 경우 빈 배열 반환 (에러 방어)
  - [ ] `bun run test __tests__/kanban-storage.test.tsx` 통과

---

### Task 4: 칸반 상태 관리 Hook

- **시나리오**: KANBAN-001, KANBAN-002, KANBAN-003~006, KANBAN-007~008, KANBAN-009~011, KANBAN-012~014, KANBAN-015~016, KANBAN-017~021, KANBAN-027~029
- **의존성**: Task 2 (타입), Task 3 (저장 모듈)
- **참조**:
  - types/kanban.ts
  - lib/kanban-storage.ts
- **구현 대상**:
  - `hooks/use-kanban.tsx` — KanbanProvider Context + useKanban Hook. 카드 CRUD, 칼럼 이동, 순서 변경, 서브태스크 관리, 검색/필터 상태 관리
  - `__tests__/use-kanban.test.tsx` — Hook 단위 테스트
- **수용 기준**:
  - [ ] 카드 추가: title "장보기" 입력 시 "To Do" 칼럼에 카드 생성, 빈 title 시 에러
  - [ ] 카드 편집: description, priority, tag 업데이트 반영
  - [ ] 카드 인라인 제목 편집: 빈 문자열 시 원래 제목 유지
  - [ ] 카드 삭제: 삭제 후 카드 목록에서 제거
  - [ ] 서브태스크 추가/토글: 추가 시 목록에 포함, 토글 시 completed 상태 변경
  - [ ] 칼럼 이동: moveCard(cardId, toColumnId) 호출 시 카드의 columnId 변경
  - [ ] 칼럼 내 순서 변경: reorderCard(cardId, toIndex) 호출 시 order 갱신
  - [ ] 검색: searchQuery 설정 시 title에 해당 문자열을 포함하는 카드만 filteredCards에 포함
  - [ ] 우선순위 필터: priorityFilter 설정 시 해당 우선순위 카드만 filteredCards에 포함
  - [ ] 태그 필터: tagFilter 설정 시 해당 태그를 가진 카드만 filteredCards에 포함
  - [ ] 검색 + 필터 AND 조합 동작
  - [ ] 상태 변경 시 localStorage에 자동 저장
  - [ ] `bun run test __tests__/use-kanban.test.tsx` 통과

---

### Task 5: 보드 레이아웃 (KanbanBoard + KanbanColumn)

- **시나리오**: KANBAN-001, KANBAN-002
- **의존성**: Task 2 (타입), Task 4 (Hook)
- **참조**:
  - artifacts/kanban-todo/wireframe.html — Screen 0 (기본 보드), Screen 1 (카드 보드)
  - shadcn -- Card, Input, Button 컴포넌트
- **구현 대상**:
  - `components/kanban-board.tsx` — 3칼럼 보드 컨테이너 (모바일: 세로 스택, 데스크톱: 가로 배치). wireframe의 `@container` + `@md:flex-row` 반응형 패턴
  - `components/kanban-column.tsx` — 칼럼 컴포넌트. 칼럼 제목 + 카드 카운트 배지 + 카드 추가 입력(To Do 칼럼만) + 카드 목록 + 빈 상태
- **수용 기준**:
  - [ ] 3개 칼럼(To Do, In Progress, Done)이 화면에 렌더링
  - [ ] 각 칼럼에 카드 개수 배지 표시
  - [ ] To Do 칼럼에 카드 추가 입력란과 추가 버튼 존재
  - [ ] 카드 제목 입력 후 추가 버튼 클릭 시 To Do 칼럼에 카드 표시
  - [ ] 빈 제목 입력 시 "제목을 입력해주세요" 오류 메시지 표시
  - [ ] 카드가 없는 칼럼에 빈 상태 메시지 표시

---

### Task 6: 카드 컴포넌트 (KanbanCard)

- **시나리오**: KANBAN-007, KANBAN-008
- **의존성**: Task 2 (타입), Task 4 (Hook), Task 5 (칼럼에서 사용)
- **참조**:
  - artifacts/kanban-todo/wireframe.html — Screen 1 카드 영역 (우선순위 배지, 태그 배지, 서브태스크 진행률)
  - shadcn -- Badge 컴포넌트
- **구현 대상**:
  - `components/kanban-card.tsx` — 카드 컴포넌트. 제목(인라인 편집 가능) + 우선순위 Badge + 태그 Badge + 서브태스크 진행률. 카드 클릭 시 상세 모달 오픈
  - `__tests__/kanban-card.test.tsx` — 인라인 편집 단위 테스트
- **수용 기준**:
  - [ ] 카드에 제목, 우선순위 배지, 태그 배지, 서브태스크 진행률(예: "1/2") 표시
  - [ ] 제목 클릭 시 편집 모드 진입, 수정 후 Enter 시 제목 변경
  - [ ] 빈 문자열로 수정 시 원래 제목 유지
  - [ ] 카드 클릭 시 상세 모달 열림
  - [ ] `bun run test __tests__/kanban-card.test.tsx` 통과

---

### Task 7: 카드 상세 모달 (KanbanCardDetail)

- **시나리오**: KANBAN-003, KANBAN-004, KANBAN-005, KANBAN-006, KANBAN-009, KANBAN-010, KANBAN-011, KANBAN-012, KANBAN-013, KANBAN-014
- **의존성**: Task 2 (타입), Task 4 (Hook), Task 6 (카드 클릭으로 열림)
- **참조**:
  - artifacts/kanban-todo/wireframe.html — Screen 2 (카드 상세 모달), Screen 3 (삭제 확인)
  - shadcn -- Dialog, AlertDialog, Checkbox, Input, Button, Badge 컴포넌트
- **구현 대상**:
  - `components/kanban-card-detail.tsx` — 카드 상세 Dialog. 설명 편집(Textarea) + 우선순위 선택(Low/Medium/High 버튼) + 태그 관리(추가 입력 + Badge 목록) + 서브태스크 관리(Checkbox 리스트 + 진행률 바 + 추가 입력) + 삭제 버튼 → AlertDialog 확인
  - `__tests__/kanban-card-detail.test.tsx` — 모달 상호작용 단위 테스트
- **수용 기준**:
  - [ ] 모달에 제목, 설명, 우선순위, 태그, 서브태스크 섹션 표시
  - [ ] 설명 입력 후 저장 시 반영
  - [ ] 우선순위 "High" 선택 시 카드에 반영
  - [ ] 태그 "개인" 추가 시 카드에 반영
  - [ ] 서브태스크 "우유 사기" 추가 시 체크리스트에 표시
  - [ ] 서브태스크 체크 토글 시 완료 표시 및 진행률 갱신 (예: "1/1", "1/2")
  - [ ] 삭제 버튼 클릭 시 "정말 삭제하시겠습니까?" AlertDialog 표시
  - [ ] AlertDialog 확인 시 카드 삭제, 취소 시 다이얼로그 닫힘
  - [ ] `bun run test __tests__/kanban-card-detail.test.tsx` 통과

---

### Task 8: 헤더 + 검색/필터 바

- **시나리오**: KANBAN-017, KANBAN-018, KANBAN-019, KANBAN-020, KANBAN-021, KANBAN-022, KANBAN-023, KANBAN-028, KANBAN-029
- **의존성**: Task 2 (타입), Task 4 (Hook)
- **참조**:
  - artifacts/kanban-todo/wireframe.html — Screen 0/1 헤더 영역, Screen 4 (검색/필터), Screen 5 (다크모드)
  - shadcn -- Input, InputGroup, Select, Button 컴포넌트
  - next-themes (useTheme hook)
- **구현 대상**:
  - `components/kanban-header.tsx` — 앱 제목 + 다크모드 토글 버튼(Moon/Sun 아이콘 전환)
  - `components/kanban-search-filter.tsx` — 검색 Input(search 아이콘 포함) + 우선순위 Select 드롭다운 + 태그 Select 드롭다운. wireframe의 `@container` 반응형 패턴(모바일: 세로 스택, 데스크톱: 가로 배치)
- **수용 기준**:
  - [ ] 검색바에 "장" 입력 시 "장보기" 카드만 표시, "공부하기"/"운동하기" 숨김
  - [ ] 검색바에 "하기" 입력 시 3개 카드 모두 표시
  - [ ] 검색어 삭제 시 모든 카드 다시 표시
  - [ ] 우선순위 필터 "High" 선택 시 해당 카드만 표시
  - [ ] 태그 필터 "개인" 선택 시 해당 카드만 표시
  - [ ] 검색어 "장" + 우선순위 "High" AND 조합 시 "장보기"만 표시
  - [ ] 필터 "전체" 선택 시 모든 카드 다시 표시
  - [ ] 다크모드 토글 클릭 시 앱 전체 다크모드 전환
  - [ ] 다크모드에서 토글 클릭 시 라이트모드 복귀

---

### Task 9: 드래그 앤 드롭 통합 + 페이지 조립

- **시나리오**: KANBAN-015, KANBAN-016, KANBAN-024, KANBAN-025, KANBAN-026, KANBAN-027
- **의존성**: Task 4 (Hook), Task 5 (보드), Task 6 (카드), Task 7 (모달), Task 8 (헤더/필터)
- **참조**:
  - @atlaskit/pragmatic-drag-and-drop 문서
  - artifacts/kanban-todo/wireframe.html — Screen 1 (드래그 타겟 인디케이터 "여기에 드롭"), Screen 6 (영속성)
- **구현 대상**:
  - `components/kanban-board.tsx` 수정 — @atlaskit/pragmatic-drag-and-drop draggable/droppable 적용. 칼럼 간 카드 이동 + 칼럼 내 순서 변경. 드롭 타겟 인디케이터(점선 영역)
  - `components/kanban-card.tsx` 수정 — draggable 속성 연결
  - `app/page.tsx` 수정 — KanbanProvider로 감싸고 KanbanHeader + KanbanSearchFilter + KanbanBoard 조립
  - `__tests__/kanban-dnd.test.tsx` — DnD 통합 테스트
- **수용 기준**:
  - [ ] "장보기" 카드를 "To Do"에서 "In Progress"로 드래그 시 칼럼 이동
  - [ ] "장보기" 카드를 "In Progress"에서 "Done"으로 드래그 시 칼럼 이동
  - [ ] "공부하기" 카드를 "장보기" 위로 드래그 시 순서 변경 ("공부하기", "장보기", "운동하기")
  - [ ] 카드 3개 추가 후 새로고침 시 3개 카드 유지
  - [ ] "장보기"를 "In Progress"로 이동 후 새로고침 시 위치 유지
  - [ ] 다크모드 설정 후 새로고침 시 다크모드 유지
  - [ ] `bun run test __tests__/kanban.spec.test.tsx` 전체 통과 (Green 상태)

---

## 미결정 사항

- 태그 삭제 UI: spec에 태그 추가만 명시되어 있고 삭제 시나리오는 없음. 추가만 구현 후 필요 시 확장
- 카드 추가 위치: "To Do" 칼럼에만 추가 버튼이 wireframe에 존재. In Progress/Done 칼럼에는 DnD로만 카드 이동
- 서브태스크 삭제: spec에 서브태스크 추가/토글만 명시. 삭제 시나리오 없음
