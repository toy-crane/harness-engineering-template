# Feed Me 구현 계획

## Architecture Decisions

| 결정 사항 | 선택 | 사유 |
|-----------|------|------|
| 콘텐츠 추출 위치 | Next.js API Route (서버 사이드) | URL fetch + defuddle 파싱에 DOM 구현체 필요, CORS 제약 회피 |
| DOM 구현체 | linkedom | 경량, defuddle 공식 권장, 서버리스 환경에 적합 |
| UI 프레임워크 | shadcn (radix-nova) + Tailwind v4 | 프로젝트 기존 설정 활용 |
| Open In Chat | @ai-elements 레지스트리에서 설치 | components.json에 레지스트리 이미 등록됨 |

## Data Model

### ExtractResult
- title (required)
- author (optional)
- published (optional)
- siteName (optional)
- content (required) — 추출된 본문 텍스트 (defuddle의 markdown 출력, YouTube의 경우 타임스탬프 포함 transcript)

## Required Skills

| 스킬 | 적용 Task | 용도 |
|------|-----------|------|
| next-best-practices | Task 3 | API Route 패턴, RSC 경계 |
| shadcn | Task 4, 5 | 컴포넌트 설치 및 활용 |
| vercel-react-best-practices | Task 4, 5 | 상태 관리, 렌더링 최적화 |

## Affected Files

| 파일 경로 | 변경 유형 | 관련 Task |
|-----------|----------|-----------|
| `app/page.tsx` | 수정 | Task 5 |
| `app/layout.tsx` | 수정 | Task 5 |
| `app/api/extract/route.ts` | 신규 | Task 3 |
| `types/extract.ts` | 신규 | Task 2 |
| `lib/extract.ts` | 신규 | Task 3 |
| `components/url-input-form.tsx` | 신규 | Task 4 |
| `components/content-preview.tsx` | 신규 | Task 5 |
| `components/open-in-chat-button.tsx` | 신규 | Task 6 |
| `__tests__/feed-me.spec.test.tsx` | 신규 | Task 1 |
| `__tests__/extract.test.ts` | 신규 | Task 3 |
| `__tests__/url-input-form.test.tsx` | 신규 | Task 4 |

변경 유형: 신규 | 수정 | 삭제

## Tasks

### Task 1: Spec 테스트 작성

- **시나리오**: FEED-EXT-001, FEED-EXT-002, FEED-EXT-003, FEED-SEND-001, FEED-SEND-002, FEED-SEND-003, FEED-ERR-001, FEED-ERR-002
- **의존성**: 없음
- **구현 대상**:
  - `__tests__/feed-me.spec.test.tsx`
    - FEED-EXT-001: URL 제출 → 제목, 저자, 본문 미리보기 표시 확인
    - FEED-EXT-002: YouTube URL 제출 → 제목, transcript 미리보기 표시 확인
    - FEED-EXT-003: URL 제출 직후 로딩 인디케이터 표시 확인
    - FEED-SEND-001: 미리보기 상태에서 Open In Chat 드롭다운에 ChatGPT, Claude 옵션 확인
    - FEED-SEND-002: ChatGPT 선택 시 chatgpt.com으로 이동 확인
    - FEED-SEND-003: Claude 선택 시 claude.ai로 이동 확인
    - FEED-ERR-001: 잘못된 URL → "올바른 URL을 입력해주세요" 오류 메시지 확인
    - FEED-ERR-002: 추출 실패 → "콘텐츠를 추출할 수 없습니다" 오류 메시지 확인
- **수용 기준**:
  - [ ] spec 테스트가 존재하고, 아직 구현이 없으므로 실패한다 (Red)

---

### Task 2: 패키지 설치 및 타입 정의

- **시나리오**: 전체
- **의존성**: 없음
- **참조**:
  - defuddle — npm 패키지, 서버 사이드 파싱
  - linkedom — DOM 구현체
  - @ai-elements/open-in-chat — shadcn 레지스트리에서 설치
- **구현 대상**:
  - `package.json`
    - defuddle, linkedom 의존성 추가
  - `types/extract.ts`
    - ExtractResult 타입 (title, author, published, siteName, content)
  - Open In Chat 컴포넌트 설치 (`bunx shadcn@latest add @ai-elements/open-in-chat`)
- **수용 기준**:
  - [ ] `bun run build` 시 타입 에러 없이 통과한다
  - [ ] Open In Chat 컴포넌트가 `components/ui/` 아래에 설치된다

---

### Task 3: 콘텐츠 추출 API Route 구현

- **시나리오**: FEED-EXT-001, FEED-EXT-002, FEED-ERR-002
- **의존성**: Task 2 (패키지 및 타입)
- **참조**:
  - next-best-practices — route handler 패턴
- **구현 대상**:
  - `lib/extract.ts`
    - URL로 HTML fetch → linkedom으로 파싱 → defuddle로 콘텐츠 추출
    - ExtractResult 반환
  - `app/api/extract/route.ts`
    - POST 핸들러: body에서 url 받아 lib/extract.ts 호출
    - URL 유효성 검증, 추출 실패 시 적절한 에러 응답
  - `__tests__/extract.test.ts`
    - 정상 HTML → 제목/본문 추출 확인
    - 잘못된 URL → 에러 반환 확인
- **수용 기준**:
  - [ ] `__tests__/extract.test.ts` 테스트가 통과한다
  - [ ] POST `/api/extract` with `{ url: "https://example.com" }` → `{ title, content, ... }` 응답

---

### Task 4: URL 입력 폼 컴포넌트

- **시나리오**: FEED-EXT-001, FEED-EXT-002, FEED-EXT-003, FEED-ERR-001
- **의존성**: Task 2 (타입)
- **참조**:
  - shadcn — Input, Button 컴포넌트
  - vercel-react-best-practices — 폼 상태 관리
- **구현 대상**:
  - `components/url-input-form.tsx`
    - URL 입력란 + "가져오기" 버튼
    - URL 형식 유효성 검증 → 에러 메시지 표시 (Lucide alert-circle 아이콘 포함)
    - 제출 시 onSubmit 콜백 호출
    - 로딩 중 비활성화 상태
  - `__tests__/url-input-form.test.tsx`
    - 유효한 URL 입력 후 제출 → onSubmit 호출 확인
    - 잘못된 URL 입력 후 제출 → "올바른 URL을 입력해주세요" 표시 확인
    - 로딩 상태 → 버튼 비활성화 확인
- **수용 기준**:
  - [ ] `__tests__/url-input-form.test.tsx` 테스트가 통과한다

---

### Task 5: 콘텐츠 미리보기 컴포넌트 및 페이지 조립

- **시나리오**: FEED-EXT-001, FEED-EXT-002, FEED-EXT-003, FEED-ERR-002
- **의존성**: Task 3 (API Route), Task 4 (URL 입력 폼)
- **참조**:
  - shadcn — Card 컴포넌트
  - vercel-react-best-practices — 상태 관리 패턴
- **구현 대상**:
  - `components/content-preview.tsx`
    - 메타데이터 표시: 제목, 저자(Lucide user 아이콘), 발행일(calendar 아이콘), 사이트명(globe 아이콘)
    - 본문 미리보기 (스크롤 가능, markdown 렌더링)
    - YouTube transcript의 경우 타임스탬프 + 텍스트 쌍 구조로 표시
    - 로딩 스켈레톤 상태
  - `app/page.tsx`
    - Feed Me 페이지로 교체
    - URL 입력 → API 호출 → 로딩 → 결과/에러 표시 흐름 조립
  - `app/layout.tsx`
    - metadata 타이틀을 "Feed Me"로 변경
- **수용 기준**:
  - [ ] URL 제출 → 로딩 인디케이터 표시 → 추출 결과 미리보기 표시
  - [ ] 추출 실패 시 "콘텐츠를 추출할 수 없습니다" 오류 메시지 표시

---

### Task 6: Open In Chat 버튼 연결

- **시나리오**: FEED-SEND-001, FEED-SEND-002, FEED-SEND-003
- **의존성**: Task 2 (Open In Chat 컴포넌트 설치), Task 5 (미리보기 페이지)
- **참조**:
  - @ai-elements/open-in-chat — 컴포넌트 API
- **구현 대상**:
  - `components/open-in-chat-button.tsx`
    - Open In Chat 래퍼: query에 추출된 원문 텍스트 전달
    - ChatGPT, Claude 두 옵션만 표시
  - `components/content-preview.tsx`
    - 하단에 OpenInChatButton 배치
- **수용 기준**:
  - [ ] 미리보기 상태에서 Open In Chat 드롭다운 클릭 → ChatGPT, Claude 옵션 표시
  - [ ] spec 테스트 전체 통과 (`bun run test`)

---

## 미결정 사항

- 없음
