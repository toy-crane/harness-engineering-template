# Kanban 구현 계획

## Architecture Decisions

| 결정 사항 | 선택 | 사유 |
|-----------|------|------|
| 드래그&드롭 | `@atlaskit/pragmatic-drag-and-drop` | 사용자 선택. 성능 우수, 프레임워크 비의존적, 칸반 보드 예제 공식 제공 |
| 상태 관리 | `zustand` + `persist` 미들웨어 | localStorage 영속 내장, 보일러플레이트 최소 |
| 프레임워크 | Next.js (App Router) | 기존 프로젝트 구조 유지 |

## Required Skills

| 스킬 | 용도 |
|------|------|
| shadcn | UI 컴포넌트 설치 및 사용 |

## UI Components

### 설치 필요

| 컴포넌트 | 설치 명령 |
|----------|-----------|
| dialog | `bunx shadcn@latest add dialog` |
| checkbox | `bunx shadcn@latest add checkbox` |
| progress | `bunx shadcn@latest add progress` |

### 이미 설치됨

| 컴포넌트 | 용도 |
|----------|------|
| button | 추가/삭제/취소 등 액션 버튼 |
| card | 칸반 카드 래퍼 |
| input | 제목 입력, 검색, 태그 추가 |
| textarea | 카드 설명 편집 |
| badge | 우선순위, 태그 표시 |
| alert-dialog | 카드 삭제 확인 다이얼로그 |
| select | 우선순위/태그 필터 드롭다운 |
| switch | 다크모드 토글 |
| label | 폼 필드 라벨 |
| separator | 구분선 |

### 커스텀 컴포넌트

| 컴포넌트 | 역할 |
|----------|------|
| `KanbanBoard` | 보드 전체 레이아웃 (헤더 + 검색/필터 + 칼럼 그리드) |
| `KanbanColumn` | 칼럼 래퍼 (헤더 + 카드 리스트 + 드롭 영역) |
| `KanbanCard` | 카드 (제목, 배지, 서브태스크 진행률, 삭제 버튼, 드래그 소스) |
| `AddCardForm` | 칼럼 하단 카드 추가 입력 폼 |
| `CardDetailModal` | 카드 상세 편집 모달 (dialog 기반) |
| `SearchFilterBar` | 검색 입력 + 우선순위/태그 필터 |
| `SubtaskList` | 서브태스크 체크리스트 + 진행률 |
| `ThemeProvider` | 다크모드 context + 시스템 설정 감지 |

## 실행 프로토콜

- 각 task 시작 전, **참조 규칙**에 나열된 파일을 반드시 읽고 규칙을 준수하며 구현한다

## Tasks

### Task 0: 프로젝트 의존성 설치 및 shadcn 컴포넌트 추가

**시나리오**: (선행 작업)
**참조 규칙**: `.claude/rules/shadcn-guard.md`
**구현 대상**: `@atlaskit/pragmatic-drag-and-drop`, `zustand` 패키지 설치. `dialog`, `checkbox`, `progress` shadcn 컴포넌트 추가
**수용 기준**:
- [ ] `bun add @atlaskit/pragmatic-drag-and-drop zustand` 성공
- [ ] `bunx shadcn@latest add dialog checkbox progress` 성공
- [ ] `bun run build` 에러 없음
**커밋**: `chore: kanban 의존성 및 shadcn 컴포넌트 추가`

---

### Task 1: Spec 테스트 작성

**시나리오**: KANBAN-001 ~ KANBAN-029
**참조 규칙**: `.claude/rules/shadcn-guard.md`
**구현 대상**: `app/kanban/__tests__/kanban.spec.test.tsx` — spec.yaml의 모든 시나리오를 수용 기준 테스트로 작성. 모두 Red 상태
**수용 기준**:
- [ ] 29개 시나리오 각각에 대한 테스트 케이스 존재
- [ ] `bun test kanban.spec.test` 실행 → 29개 테스트 모두 FAIL (Red 상태)
- [ ] 각 테스트가 spec.yaml의 input/expect와 1:1 대응
**커밋**: `test: kanban spec 테스트 작성 (Red)`

---

### Task 2: 데이터 모델 및 zustand 스토어

**시나리오**: KANBAN-001, KANBAN-012, KANBAN-018
**참조 규칙**: `.claude/rules/shadcn-guard.md`
**구현 대상**: `app/kanban/store.ts` — Card, Column, Board 타입 정의. zustand 스토어 + persist 미들웨어로 localStorage 영속. CRUD 액션(addCard, updateCard, deleteCard, moveCard, reorderCard)
**수용 기준**:
- [ ] 스토어 초기 상태 → columns: ["Todo", "In Progress", "Done"], cards: []
- [ ] `addCard("Todo", "회의록 작성")` → Todo 칼럼에 카드 1개
- [ ] `deleteCard(cardId)` → 해당 카드 제거
- [ ] `moveCard(cardId, "In Progress")` → 카드의 columnId 변경
- [ ] 스토어 변경 → localStorage에 자동 저장
- [ ] `bun test store.test` 통과
**커밋**: `feat: kanban 데이터 모델 및 zustand 스토어 구현`

---

### Task 3: 보드 레이아웃 및 칼럼 렌더링

**시나리오**: KANBAN-001
**참조 규칙**: `.claude/rules/shadcn-guard.md`
**구현 대상**: `KanbanBoard`, `KanbanColumn` 컴포넌트. `app/kanban/page.tsx` 라우트. 3칼럼 그리드 레이아웃, 빈 상태 표시
**수용 기준**:
- [ ] `/kanban` 접속 → "Todo", "In Progress", "Done" 3개 칼럼 가로 나열
- [ ] localStorage 비어있음 → 각 칼럼 카드 0개
- [ ] 데스크톱: 3칼럼 그리드 / 모바일: 세로 스택
- [ ] KANBAN-001 spec 테스트 통과 (Green)
**커밋**: `feat: kanban 보드 레이아웃 및 칼럼 렌더링`

---

### Task 4: 카드 생성

**시나리오**: KANBAN-002, KANBAN-003
**참조 규칙**: `.claude/rules/shadcn-guard.md`
**구현 대상**: `AddCardForm` 컴포넌트. 칼럼 ＋ 버튼 클릭 → 입력 필드 표시, 제목 입력 후 추가/취소
**수용 기준**:
- [ ] ＋ 버튼 클릭 → 입력 필드 표시
- [ ] "회의록 작성" 입력 후 추가 → Todo 칼럼에 카드 표시
- [ ] 빈 제목으로 추가 → "제목을 입력해주세요" 에러 메시지
- [ ] 취소 → 입력 필드 닫힘
- [ ] KANBAN-002, KANBAN-003 spec 테스트 통과
**커밋**: `feat: kanban 카드 생성 기능`

---

### Task 5: 카드 렌더링 및 인라인 편집

**시나리오**: KANBAN-004
**참조 규칙**: `.claude/rules/shadcn-guard.md`
**구현 대상**: `KanbanCard` 컴포넌트. 제목 표시, 우선순위/태그 배지, 서브태스크 진행률. 제목 클릭 → 인라인 편집 모드
**수용 기준**:
- [ ] 카드에 제목, 우선순위 배지, 태그 배지, 서브태스크 진행률 표시
- [ ] 제목 클릭 → 입력 필드 전환, 현재 값 표시
- [ ] 수정 후 확인 → 변경된 제목 반영
- [ ] KANBAN-004 spec 테스트 통과
**커밋**: `feat: kanban 카드 렌더링 및 인라인 편집`

---

### Task 6: 카드 삭제

**시나리오**: KANBAN-007, KANBAN-008
**참조 규칙**: `.claude/rules/shadcn-guard.md`
**구현 대상**: 카드 삭제 버튼 + `alert-dialog` 확인 다이얼로그
**수용 기준**:
- [ ] 🗑 클릭 → "삭제하시겠습니까?" 다이얼로그 표시
- [ ] 확인 → 카드 제거
- [ ] 취소 → 카드 유지
- [ ] KANBAN-007, KANBAN-008 spec 테스트 통과
**커밋**: `feat: kanban 카드 삭제 기능`

---

### Task 7: 카드 상세 모달

**시나리오**: KANBAN-005, KANBAN-006, KANBAN-009, KANBAN-010, KANBAN-022, KANBAN-023, KANBAN-024, KANBAN-025
**참조 규칙**: `.claude/rules/shadcn-guard.md`
**구현 대상**: `CardDetailModal` 컴포넌트 (dialog 기반). 제목, 설명, 우선순위, 태그, 서브태스크 편집. `SubtaskList` 컴포넌트 (체크리스트 + 진행률 바)
**수용 기준**:
- [ ] 카드 클릭 → 상세 모달 열림, 현재 데이터 표시
- [ ] 모달에서 제목 수정 → 반영
- [ ] 설명 입력 → 저장
- [ ] 우선순위 High/Medium/Low 선택 → 카드에 반영
- [ ] 태그 "긴급" 추가 → 배지 표시, ✕로 제거
- [ ] 서브태스크 추가/체크/삭제 → 진행률(1/2) 업데이트
- [ ] KANBAN-005, 006, 009, 010, 022, 023, 024, 025 spec 테스트 통과
**커밋**: `feat: kanban 카드 상세 모달`

---

### Task 8: 드래그&드롭

**시나리오**: KANBAN-011, KANBAN-012, KANBAN-026
**참조 규칙**: `.claude/rules/shadcn-guard.md`
**구현 대상**: `@atlaskit/pragmatic-drag-and-drop`으로 카드 드래그 소스 + 칼럼 드롭 타겟 설정. 칼럼 간 이동, 칼럼 내 순서 변경, 위치 영속
**수용 기준**:
- [ ] Todo → In Progress 드래그 → 카드 이동
- [ ] 같은 칼럼 내 순서 변경 → 변경된 순서 유지
- [ ] 이동 후 새로고침 → 위치 그대로 (localStorage 영속)
- [ ] KANBAN-011, 012, 026 spec 테스트 통과
**커밋**: `feat: kanban 드래그&드롭 구현`

---

### Task 9: 검색 및 필터

**시나리오**: KANBAN-013, KANBAN-014, KANBAN-015, KANBAN-016, KANBAN-027, KANBAN-028
**참조 규칙**: `.claude/rules/shadcn-guard.md`
**구현 대상**: `SearchFilterBar` 컴포넌트. 검색 입력 (실시간 필터링), 우선순위 드롭다운, 태그 드롭다운. 칼럼에 필터링된 카드만 표시
**수용 기준**:
- [ ] "작성" 입력 → 제목에 "작성" 포함된 카드만 표시
- [ ] 검색어 삭제 → 전체 카드 표시
- [ ] 매칭 없음 → 빈 칼럼 표시
- [ ] 우선순위 "High" → High 카드만 표시
- [ ] 태그 "긴급" → 해당 태그 카드만 표시
- [ ] 필터 해제 → 전체 카드 표시
- [ ] KANBAN-013, 014, 015, 016, 027, 028 spec 테스트 통과
**커밋**: `feat: kanban 검색 및 필터 기능`

---

### Task 10: 다크모드

**시나리오**: KANBAN-017, KANBAN-018, KANBAN-029
**참조 규칙**: `.claude/rules/shadcn-guard.md`
**구현 대상**: `ThemeProvider` + 다크모드 토글. 시스템 설정 감지(`prefers-color-scheme`), localStorage 영속, `<html>` 클래스 토글
**수용 기준**:
- [ ] 초기 진입 시 시스템 설정에 따른 테마 적용
- [ ] 토글 클릭 → 반대 테마 전환
- [ ] 새로고침 → 선택한 테마 유지
- [ ] KANBAN-017, 018, 029 spec 테스트 통과
**커밋**: `feat: kanban 다크모드 토글`

---

### Task 11: 데이터 내보내기/가져오기

**시나리오**: KANBAN-019, KANBAN-020, KANBAN-021
**참조 규칙**: `.claude/rules/shadcn-guard.md`
**구현 대상**: 내보내기 버튼 → JSON 파일 다운로드. 가져오기 버튼 → 파일 선택 → 검증 후 데이터 교체
**수용 기준**:
- [ ] 내보내기 클릭 → .json 파일 다운로드, 전체 보드 데이터 포함
- [ ] 유효 JSON 가져오기 → 기존 데이터 교체, 보드 갱신
- [ ] 잘못된 형식 → "올바른 형식이 아닙니다" 에러 표시
- [ ] KANBAN-019, 020, 021 spec 테스트 통과
**커밋**: `feat: kanban 데이터 내보내기/가져오기`

---

## 미결정 사항

- 없음
