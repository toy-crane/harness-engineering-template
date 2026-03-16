# Kanban 구현 계획

## Architecture Decisions

| 결정 사항 | 선택 | 사유 |
|-----------|------|------|
| 드래그&드롭 라이브러리 | @atlaskit/pragmatic-drag-and-drop | 사용자 선택. Atlassian 유지보수, 프레임워크 비의존적, 성능 우수 |
| 상태 관리 | Zustand + persist 미들웨어 | localStorage 영속화 자동 처리, 보일러플레이트 최소 |
| 카드 ID 생성 | nanoid | 경량 고유 ID 생성. UUID 대비 짧고 URL-safe |

## Required Skills

| 스킬 | 용도 |
|------|------|
| shadcn | switch 컴포넌트 설치 |

## UI Components

### 설치 필요

| 컴포넌트 | 설치 명령 |
|----------|-----------|
| switch | `bunx shadcn@latest add switch` |

### 기존 활용

| 컴포넌트 | 용도 |
|----------|------|
| card | 칸반 카드 컨테이너 |
| badge | 우선순위, 태그 표시 |
| button | 추가, 삭제, 내보내기, 가져오기 버튼 |
| input | 카드 제목, 검색창, 마감일 입력 |
| textarea | 카드 설명 입력 |
| select | 우선순위 선택 (편집, 필터) |
| combobox | 태그 입력 자동완성 |
| alert-dialog | 삭제 확인, 가져오기 확인 다이얼로그 |
| label | 편집 모드 필드 레이블 |
| separator | 헤더 영역 구분 |

### 커스텀 컴포넌트

| 컴포넌트 | 역할 |
|----------|------|
| KanbanBoard | 3개 칼럼 레이아웃, 검색/필터 툴바, 헤더 |
| KanbanColumn | 칼럼 컨테이너, 카드 목록, 카드 추가 폼 |
| KanbanCard | 카드 표시 (접힌 상태) 및 인라인 편집 (펼친 상태) |
| TagInput | 태그 입력 + 자동완성 + 제거 |
| ThemeToggle | 다크/라이트 모드 전환 switch |

## Tasks

### Task 1: 프로젝트 의존성 설치

**시나리오**: 없음 (선행 작업)

**선행 배치 사유**: spec 테스트와 구현 모두 zustand 스토어 타입과 DnD 라이브러리에 의존하므로 먼저 설치가 필요하다

**구현 대상**:
- zustand, @atlaskit/pragmatic-drag-and-drop, nanoid 패키지 설치
- shadcn switch 컴포넌트 설치
- 칸반 페이지 라우트 (`app/kanban/page.tsx`) 생성 (빈 페이지)

**수용 기준**:
- [ ] `bun install` 성공, 새 패키지가 node_modules에 존재
- [ ] `bunx shadcn@latest add switch` 성공, `components/ui/switch.tsx` 존재
- [ ] `/kanban` 경로 접근 시 빈 페이지 렌더링

**커밋**: `chore: add kanban dependencies and route`

---

### Task 2: Spec 테스트 생성

**시나리오**: KANBAN-001 ~ KANBAN-019

**구현 대상**:
- spec.yaml의 19개 시나리오를 `app/kanban/__tests__/kanban.spec.test.tsx`로 변환
- 모든 테스트가 Red 상태 (실패)

**수용 기준**:
- [ ] `bun test kanban.spec.test` 실행 시 19개 시나리오에 대한 테스트가 존재
- [ ] 모든 테스트가 실패 (구현 미완료 상태)
- [ ] 각 테스트 이름에 시나리오 ID 포함 (예: `KANBAN-001: 카드 생성`)

**커밋**: `test: add kanban spec tests from spec.yaml`

---

### Task 3: 데이터 모델 및 Zustand 스토어

**시나리오**: KANBAN-001, KANBAN-013, KANBAN-019

**구현 대상**:
- Card 타입 (id, title, description, priority, tags, dueDate)
- Board 상태 (3개 고정 칼럼, 각 칼럼의 카드 배열)
- Zustand 스토어: 카드 CRUD 액션, 칼럼 이동, 순서 변경
- persist 미들웨어로 localStorage 자동 영속화

**수용 기준**:
- [ ] `addCard("회의록 작성", "todo")` → 스토어에 priority "중"인 카드 추가
- [ ] `addCard("", "todo")` → 에러 반환, 카드 미추가
- [ ] 스토어 변경 → localStorage `kanban-storage` 키에 자동 저장
- [ ] 스토어 초기화 시 localStorage에서 복원

**커밋**: `feat: add kanban zustand store with persistence`

---

### Task 4: 보드 레이아웃 및 카드 생성

**시나리오**: KANBAN-001

**구현 대상**:
- KanbanBoard: 헤더(타이틀, 내보내기/가져오기/다크모드), 툴바(검색, 필터), 3칼럼 그리드
- KanbanColumn: 칼럼 헤더(이름, 카드 수), 카드 목록, 하단 카드 추가 폼
- KanbanCard: 접힌 상태 — 제목, 우선순위 배지, 태그 배지, 마감일, 삭제 버튼

**수용 기준**:
- [ ] `/kanban` 접근 → To Do, In Progress, Done 3개 칼럼 표시
- [ ] 제목 "회의록 작성" 입력 + 추가 → To Do 칼럼에 카드 표시, 우선순위 "중"
- [ ] 빈 제목으로 추가 시도 → "제목을 입력해주세요" 에러 메시지

**커밋**: `feat: add kanban board layout and card creation`

---

### Task 5: 카드 인라인 편집

**시나리오**: KANBAN-002, KANBAN-016

**구현 대상**:
- KanbanCard 펼친 상태: 제목, 설명, 우선순위, 태그, 마감일 편집 UI
- 카드 클릭 시 편집 모드 진입, 외부 클릭 시 종료 (자동 저장)
- 빈 제목 유효성 검증

**수용 기준**:
- [ ] 카드 클릭 → 5개 필드(제목, 설명, 우선순위, 태그, 마감일) 편집 UI 표시
- [ ] 제목 "회의록 작성" → "주간 회의록" 변경 → 카드에 "주간 회의록" 표시
- [ ] 우선순위 "중" → "상" 변경 → 카드에 "상" 배지 표시
- [ ] 제목을 빈 값으로 변경 시도 → "제목을 입력해주세요" 에러

**커밋**: `feat: add card inline editing`

---

### Task 6: 카드 삭제

**시나리오**: KANBAN-003

**구현 대상**:
- 삭제 버튼 클릭 → AlertDialog로 확인 대화상자
- 카드 이름이 대화상자 본문에 표시
- 확인 시 카드 삭제, 취소 시 유지

**수용 기준**:
- [ ] 삭제 버튼 클릭 → "정말 삭제하시겠습니까?" 대화상자 표시
- [ ] 확인 클릭 → 카드가 칼럼에서 제거
- [ ] 취소 클릭 → 카드 유지

**커밋**: `feat: add card deletion with confirmation`

---

### Task 7: 드래그&드롭

**시나리오**: KANBAN-004, KANBAN-005

**구현 대상**:
- @atlaskit/pragmatic-drag-and-drop으로 카드 드래그 구현
- 칼럼 간 카드 이동
- 같은 칼럼 내 카드 순서 변경

**수용 기준**:
- [ ] To Do 카드를 In Progress로 드래그 → In Progress 칼럼에 카드 표시
- [ ] 같은 칼럼 내 카드 드래그 → 카드 순서 변경

**커밋**: `feat: add drag and drop for cards`

---

### Task 8: 태그 관리

**시나리오**: KANBAN-006, KANBAN-017

**구현 대상**:
- TagInput: 태그 텍스트 입력, 기존 태그 자동완성 드롭다운
- 태그 추가 (입력 또는 자동완성 선택)
- 태그 제거 (✕ 버튼)

**수용 기준**:
- [ ] "버그" 입력 → 카드에 "버그" 태그 배지 추가
- [ ] "버" 입력 시 기존 태그 "버그" 존재 → 자동완성 목록에 "버그" 표시
- [ ] 태그 "버그"의 ✕ 클릭 → 카드에서 태그 제거

**커밋**: `feat: add tag management with autocomplete`

---

### Task 9: 검색 및 필터

**시나리오**: KANBAN-007, KANBAN-008, KANBAN-009, KANBAN-010, KANBAN-018

**구현 대상**:
- 제목 검색: 실시간 필터링, 검색어 포함 카드만 표시
- 우선순위 필터: 드롭다운에서 상/중/하 선택
- 태그 필터: 드롭다운에서 태그 선택
- 복합 필터: 우선순위 + 태그 AND 조합
- 필터 해제 시 전체 카드 복원

**수용 기준**:
- [ ] "회의" 검색 → "회의록 작성" 카드만 표시, 나머지 숨김
- [ ] 검색어 삭제 → 모든 카드 표시
- [ ] 우선순위 "상" 필터 → 우선순위 "상" 카드만 표시
- [ ] 태그 "버그" 필터 → "버그" 태그 카드만 표시
- [ ] 우선순위 "상" + 태그 "버그" → 두 조건 모두 만족하는 카드만 표시
- [ ] 필터 해제 → 모든 카드 표시

**커밋**: `feat: add search and filter functionality`

---

### Task 10: 다크모드

**시나리오**: KANBAN-011, KANBAN-012

**구현 대상**:
- ThemeToggle: switch 컴포넌트로 라이트/다크 전환
- HTML `class="dark"` 토글 방식 (Tailwind dark mode)
- 테마 설정 localStorage 영속화 (새로고침 후 유지)

**수용 기준**:
- [ ] 라이트모드에서 토글 → 다크모드 전환
- [ ] 다크모드에서 토글 → 라이트모드 전환
- [ ] 새로고침 후 → 마지막 테마 설정 유지

**커밋**: `feat: add dark mode toggle`

---

### Task 11: JSON 내보내기/가져오기

**시나리오**: KANBAN-014, KANBAN-015

**구현 대상**:
- 내보내기: 현재 보드 데이터를 JSON 파일로 다운로드 (Blob + anchor)
- 가져오기: AlertDialog로 확인 → 파일 선택 → 데이터 교체
- 유효성 검증: 잘못된 형식 파일 시 에러 메시지

**수용 기준**:
- [ ] 내보내기 클릭 → JSON 파일 다운로드, 모든 칼럼/카드 데이터 포함
- [ ] 파일 선택 후 → "기존 데이터가 모두 교체됩니다" 확인 대화상자
- [ ] 확인 → 가져온 데이터로 보드 교체
- [ ] 취소 → 기존 데이터 유지
- [ ] 잘못된 형식 파일 → "올바른 형식의 파일이 아닙니다" 에러

**커밋**: `feat: add JSON export and import`

---

## 미결정 사항

- 없음 (모든 주요 결정 완료)
