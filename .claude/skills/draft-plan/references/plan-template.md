# <Feature> 구현 계획

## Architecture Decisions

| Decision | Choice | Reason |
|---|---|---|

## Infrastructure Resources

애플리케이션 코드 바깥에서 이 feature가 필요로 하는 런타임 자원. 해당 없으면 "None"으로 비워 둔다.

| Resource | Type | Declared in | Creation Task |
|---|---|---|---|
|   |   |   |   |

Type 예시: Storage bucket · Cron job · Edge function · Env var · OAuth provider · Webhook · Email sender

## Data Model

### EntityName
- field (required)
- field → RelatedEntity[]

## Required Skills

| Skill | Applicable Task | Purpose |
|---|---|---|

## Affected Files

| File Path | Change Type | Related Task |
|---|---|---|

Change Type: New | Modify | Delete

## Tasks

### Task 1: (제목 — 하나의 vertical slice, "and" 없음)

- **Covers**: Scenario 1 (full) | Scenario 2 (partial — happy path only)
- **Size**: S (1-2 파일) | M (3-5 파일)
- **Dependencies**: None | Task N (이유), Task M (이유)
- **References**:
  - (스킬명 — 키워드)
  - (외부 문서 URL)
  - (프로젝트 파일 경로)
- **Implementation targets**:
  - `components/<feature>/<component>.tsx`
  - `components/<feature>/<component>.test.tsx` (colocated; App Router 페이지는 `app/**/__tests__/`)
- **Acceptance**:
  - [ ] 구체적 입력 → 관찰 가능한 결과 (커버되는 Success Criteria 하나당 한 줄)
  - [ ] 구체적 입력 → 관찰 가능한 결과
- **Verification**:
  - `bun run test -- <pattern>`
  - `bun run build`
  - Browser MCP (`mcp__claude-in-chrome__*`) — 사용자에게 보이는 UI 변경이 있는 Task. 영향받는 라우트로 이동해 관찰 가능한 결과를 단언하고, 증거를 `artifacts/<feature>/evidence/<task-N>.<ext>`에 저장한다

---

### Checkpoint: Tasks 1-N 이후
- [ ] 모든 테스트 통과: `bun run test`
- [ ] 빌드 성공: `bun run build`
- [ ] (vertical slice 설명)이 end-to-end로 동작

---

## Undecided Items
