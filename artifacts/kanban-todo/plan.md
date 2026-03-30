# Kanban Todo 구현 계획

## Architecture Decisions

| 결정 사항 | 선택 | 사유 |
|-----------|------|------|
| 드래그&드롭 | @atlaskit/pragmatic-drag-and-drop | Atlassian(Trello)이 직접 유지보수하는 공식 DnD 라이브러리 |
| 상태 관리 | React useState + Context | 단일 페이지 앱, 외부 라이브러리 불필요 |
| 데이터 영속성 | localStorage | spec 요구사항. 서버 불필요 |
| 다크모드 | next-themes | 이미 layout.tsx에 ThemeProvider 설정됨 |
| UI 컴포넌트 | shadcn (기존) | Card, Dialog, AlertDialog, Badge, Input, Select, Checkbox 활용 |

## Data Model

### Card
- id: string (nanoid)
- title: string (required)
- description: string
- priority: "High" | "Medium" | "Low" | null
- tags: string[]
- subtasks: Subtask[]
- columnId: ColumnId

### Subtask
- id: string (nanoid)
- title: string (required)
- completed: boolean

### ColumnId (union type)
- "todo" | "in-progress" | "done"

### Column
- id: ColumnId
- title: string ("To Do" | "In Progress" | "Done")

### BoardState
- cards: Card[]
- darkMode: boolean

## Required Skills

| 스킬 | 적용 Task | 용도 |
|------|-----------|------|
| shadcn | Task 4, 5, 6, 7, 8 | Card, Dialog, AlertDialog, Badge, Input, Select, Checkbox 컴포넌트 활용 |
| vercel-react-best-practices | Task 4~9 | React 상태 관리, 리렌더링 최적화 |

## Affected Files

| 파일 경로 | 변경 유형 | 관련 Task |
|-----------|----------|-----------|
| types/kanban.ts | 신규 | Task 1 |
| lib/kanban-storage.ts | 신규 | Task 2 |
| hooks/use-kanban-board.ts | 신규 | Task 3 |
| components/kanban-board.tsx | 신규 | Task 4 |
| components/kanban-column.tsx | 신규 | Task 4 |
| components/kanban-card.tsx | 신규 | Task 5 |
| components/kanban-card-detail.tsx | 신규 | Task 6 |
| components/kanban-search-filter.tsx | 신규 | Task 7 |
| components/kanban-header.tsx | 신규 | Task 8 |
| app/page.tsx | 수정 | Task 9 |
| __tests__/kanban.spec.test.tsx | 신규 | Task 0 |
| __tests__/kanban-storage.test.tsx | 신규 | Task 2 |
| __tests__/use-kanban-board.test.tsx | 신규 | Task 3 |
| __tests__/kanban-card.test.tsx | 신규 | Task 5 |
| __tests__/kanban-card-detail.test.tsx | 신규 | Task 6 |
| __tests__/kanban-search-filter.test.tsx | 신규 | Task 7 |
| __tests__/kanban-dnd.test.tsx | 신규 | Task 9 |

## Tasks

### Task 0: Spec 테스트 생성

- **시나리오**: KANBAN-001 ~ KANBAN-029 (전체)
- **의존성**: 없음
- **참조**: 없음
- **구현 대상**: `__tests__/kanban.spec.test.tsx` — spec.yaml의 29개 시나리오를 수용 기준 테스트로 변환
- **수용 기준**:
  - [ ] 29개 시나리오 각각에 대한 테스트 케이스 존재
  - [ ] `bun run test` 실행 시 모든 spec 테스트가 fail (Red 상태)

---

### Task 1: 타입 정의

- **시나리오**: 전체 (데이터 모델 기반)
- **의존성**: 없음
- **참조**: 없음
- **구현 대상**: `types/kanban.ts` — Card, Subtask, ColumnId, Column, BoardState 타입
- **수용 기준**:
  - [ ] 타입 정의 파일이 존재하고 TypeScript 컴파일 에러 없음
  - [ ] Card 타입에 id, title, description, priority, tags, subtasks, columnId 필드 포함

---

### Task 2: localStorage 영속성 서비스

- **시나리오**: KANBAN-024, KANBAN-025, KANBAN-026
- **의존성**: Task 1 (타입 필요)
- **참조**: 없음
- **구현 대상**: `lib/kanban-storage.ts` — 보드 상태 저장/로드 함수
- **수용 기준**:
  - [ ] `__tests__/kanban-storage.test.tsx` 통과
  - [ ] saveBoard(state) → localStorage에 JSON 저장
  - [ ] loadBoard() → localStorage에서 BoardState 반환, 없으면 기본값 반환
  - [ ] 카드 목록, 칼럼 위치, 다크모드 설정이 저장/복원됨

---

### Task 3: 보드 상태 관리 Hook

- **시나리오**: KANBAN-001, KANBAN-002, KANBAN-007, KANBAN-008, KANBAN-009~011
- **의존성**: Task 1 (타입), Task 2 (스토리지)
- **참조**: 없음
- **구현 대상**: `hooks/use-kanban-board.ts` — 카드 CRUD, 칼럼 이동, 검색/필터 로직을 제공하는 커스텀 Hook
- **수용 기준**:
  - [ ] `__tests__/use-kanban-board.test.tsx` 통과
  - [ ] addCard("장보기", "todo") → "To Do" 칼럼에 카드 추가
  - [ ] addCard("", "todo") → 에러 반환, 카드 추가 안 됨
  - [ ] updateCard(id, { title: "마트 장보기" }) → 제목 변경
  - [ ] updateCard(id, { title: "" }) → 거부, 기존 제목 유지
  - [ ] deleteCard(id) → 카드 제거
  - [ ] moveCard(id, "in-progress", index) → 칼럼 이동
  - [ ] 상태 변경 시 localStorage에 자동 저장

---

### Task 4: 보드 레이아웃 (Board + Column)

- **시나리오**: KANBAN-001, KANBAN-002
- **의존성**: Task 3 (상태 Hook)
- **참조**:
  - shadcn — Card 컴포넌트
  - wireframe.html — 기본 보드, 카드 보드 화면
- **구현 대상**: `components/kanban-board.tsx`, `components/kanban-column.tsx` — 3칼럼 보드 레이아웃, 칼럼 헤더 카드 카운터 배지, 카드 추가 입력, 빈 상태 표시
- **수용 기준**:
  - [ ] 3칼럼 (To Do, In Progress, Done) 렌더링
  - [ ] 각 칼럼 헤더에 카드 수 카운터 배지 표시 (예: "To Do 3")
  - [ ] To Do 칼럼에 카드 제목 입력 → 추가 버튼 → 카드 생성
  - [ ] 빈 제목 입력 시 "제목을 입력해주세요" 에러 표시
  - [ ] 빈 칼럼에 "카드가 없습니다" 표시
  - [ ] 모바일: 세로 스택, 데스크톱: 가로 배치

---

### Task 5: 카드 컴포넌트 (인라인 편집 포함)

- **시나리오**: KANBAN-007, KANBAN-008
- **의존성**: Task 4 (보드 레이아웃)
- **참조**:
  - shadcn — Badge 컴포넌트
  - wireframe.html — 카드 보드 화면
- **구현 대상**: `components/kanban-card.tsx` — 카드 표시 (제목, 우선순위 뱃지, 태그, 서브태스크 진행률), 인라인 제목 편집
- **수용 기준**:
  - [ ] `__tests__/kanban-card.test.tsx` 통과
  - [ ] 카드에 제목, 우선순위 뱃지, 태그, 서브태스크 진행률(1/2) 표시
  - [ ] 제목 클릭 → 입력 모드 → "마트 장보기" 입력 → Enter → 제목 변경
  - [ ] 빈 문자열 입력 → Enter → 원래 제목 "장보기" 유지

---

### Task 6: 카드 상세 모달 (편집 + 서브태스크 + 삭제)

- **시나리오**: KANBAN-003~006, KANBAN-009~014
- **의존성**: Task 5 (카드 컴포넌트)
- **참조**:
  - shadcn — Dialog, AlertDialog, Checkbox, Input, Textarea 컴포넌트
  - wireframe.html — 카드 상세, 삭제 확인 화면
- **구현 대상**: `components/kanban-card-detail.tsx` — 카드 상세 모달 (설명, 우선순위, 태그, 서브태스크 CRUD, 삭제 확인)
- **수용 기준**:
  - [ ] `__tests__/kanban-card-detail.test.tsx` 통과
  - [ ] 카드 클릭 → 모달에 제목, 설명, 우선순위, 태그, 서브태스크 섹션 표시
  - [ ] 설명 입력 "마트 가서 장보기" → 저장 → 재오픈 시 유지
  - [ ] 우선순위 "High" 선택 → 카드에 반영
  - [ ] 태그 "개인" 추가 → 카드에 표시
  - [ ] 서브태스크 "우유 사기" 추가 → 체크리스트에 표시
  - [ ] 서브태스크 체크 → 완료 표시, 진행률 "1/1"
  - [ ] 서브태스크 2개 중 1개 완료 시 진행률 "1/2" 표시
  - [ ] 서브태스크 섹션에 시각적 progress bar 표시 (완료 비율 반영)
  - [ ] 삭제 버튼 → "정말 삭제하시겠습니까?" 확인 → 확인 시 삭제, 취소 시 유지

---

### Task 7: 검색 및 필터

- **시나리오**: KANBAN-017~021, KANBAN-028, KANBAN-029
- **의존성**: Task 4 (보드 레이아웃), Task 5 (카드 표시)
- **참조**:
  - shadcn — Input, Select 컴포넌트
  - wireframe.html — 검색·필터 화면
- **구현 대상**: `components/kanban-search-filter.tsx` — 검색바 (X 초기화 버튼 포함), 우선순위/태그 필터 드롭다운
- **수용 기준**:
  - [ ] `__tests__/kanban-search-filter.test.tsx` 통과
  - [ ] 검색 "장" 입력 → "장보기"만 표시, "공부하기"/"운동하기" 숨김
  - [ ] 검색 "하기" 입력 → 3개 카드 모두 표시
  - [ ] 검색창 X 버튼 클릭 → 검색어 초기화, 모든 카드 표시
  - [ ] 우선순위 "High" 선택 → High 카드만 표시
  - [ ] 태그 "개인" 선택 → 해당 태그 카드만 표시
  - [ ] 검색 "장" + 우선순위 "High" → AND 조합, "장보기"만 표시
  - [ ] 필터 "전체" 선택 → 모든 카드 표시

---

### Task 8: 다크모드 토글

- **시나리오**: KANBAN-022, KANBAN-023, KANBAN-026
- **의존성**: Task 4 (보드 레이아웃)
- **참조**:
  - wireframe.html — 다크모드 화면
  - app/layout.tsx — ThemeProvider 설정 확인
- **구현 대상**: `components/kanban-header.tsx` — 앱 헤더에 다크모드 토글 버튼, next-themes 연동
- **수용 기준**:
  - [ ] 라이트모드에서 토글 클릭 → 다크모드 전환
  - [ ] 다크모드에서 토글 클릭 → 라이트모드 전환
  - [ ] 다크모드 설정이 새로고침 후 유지 (localStorage)

---

### Task 9: 드래그&드롭 + 페이지 통합

- **시나리오**: KANBAN-015, KANBAN-016, KANBAN-027, KANBAN-024, KANBAN-025
- **의존성**: Task 4 (보드), Task 5 (카드), Task 6 (모달), Task 7 (필터), Task 8 (헤더)
- **참조**:
  - @atlaskit/pragmatic-drag-and-drop 공식 문서
  - wireframe.html — 카드 보드 화면 (드롭 영역)
- **구현 대상**: 드래그&드롭 기능 통합 (드래그 중 드롭 영역 시각적 피드백 포함), `app/page.tsx` 수정하여 칸반 보드를 메인 페이지로 연결
- **수용 기준**:
  - [ ] `__tests__/kanban-dnd.test.tsx` 통과
  - [ ] "장보기" 카드를 "In Progress"로 드래그&드롭 → 칼럼 이동
  - [ ] "In Progress"의 "장보기"를 "Done"으로 드래그&드롭 → 칼럼 이동
  - [ ] "공부하기" 카드를 "장보기" 위(index 0)로 드래그&드롭 → 순서 ["공부하기", "장보기", "운동하기"]
  - [ ] 드래그 중 대상 칼럼에 드롭 영역 시각적 피드백 표시
  - [ ] 새로고침 후 카드 3개, 칼럼 위치 유지
  - [ ] `bun run test` 실행 시 모든 spec 테스트 통과 (Green)

---

## 미결정 사항

없음
