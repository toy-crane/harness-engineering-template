> 이 template는 형식이다. 원칙과 Why는 `SKILL.md` Step 4를 본다.

# <Feature> 구현 계획

## 아키텍처 결정

| 결정 | 선택 | 이유 |
|---|---|---|

## 인프라 리소스

애플리케이션 코드 바깥에서 이 feature가 필요로 하는 런타임 자원. 해당 없으면 "None"으로 비워 둔다.

| 리소스 | 유형 | 선언 위치 | 생성 Task |
|---|---|---|---|
|   |   |   |   |

유형 예시: Storage bucket · Cron job · Edge function · Env var · OAuth provider · Webhook · Email sender

## 데이터 모델

### EntityName
- field (required)
- field → RelatedEntity[]

## 필요 스킬

| 스킬 | 적용 Task | 용도 |
|---|---|---|

## 영향 받는 파일

| 파일 경로 | 변경 유형 | 관련 Task |
|---|---|---|

변경 유형: New | Modify | Delete

## Tasks

### Task 1: (제목 — 하나의 vertical slice, "and" 없음)

- **담당 시나리오**: Scenario 1 (full) | Scenario 2 (partial — happy path only)
- **크기**: S (1-2 파일) | M (3-5 파일)
- **의존성**: None | Task N (이유), Task M (이유)
- **참조**:
  - (스킬명 — 키워드)
  - (외부 문서 URL)
  - (프로젝트 파일 경로)
- **구현 대상**:
  - `components/<feature>/<component>.tsx`
  - `components/<feature>/<component>.test.tsx` (colocated; App Router 페이지는 `app/**/__tests__/`)
- **수용 기준**:
  - [ ] 구체적 입력 → 관찰 가능한 결과 (담당하는 성공 기준 하나당 한 줄)
  - [ ] 구체적 입력 → 관찰 가능한 결과
- **검증**: SKILL.md Step 4의 Verification 표에서 적합한 도구·명령을 선택해 적는다
  - 예: `bun run test -- <pattern>`
  - 예: `bun run build`
  - 예: Browser MCP — 영향받는 라우트로 이동, 결과 단언, 증거 `artifacts/<feature>/evidence/<task-N>.<ext>` 저장

---

### Checkpoint: Tasks 1-N 이후
- [ ] 모든 테스트 통과: `bun run test`
- [ ] 빌드 성공: `bun run build`
- [ ] (vertical slice 설명)이 end-to-end로 동작

---

## 미결정 항목
