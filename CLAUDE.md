## 개발 워크플로우

### TDD (테스트 주도 개발)
1. spec 테스트(*.spec.test.tsx)로 수용 기준을 먼저 정의한다 (Red)
2. 구현 테스트(*.test.tsx)로 순수 로직(reducer, hook 등)의 단위 테스트를 작성한다 (Red)
3. 테스트를 통과하는 최소한의 코드를 구현한다 (Green)
4. 양쪽 테스트가 통과하는 상태를 유지하면서 리팩터링한다
4. 테스트 실행: `bun run test`

### 테스트 파일 컨벤션

| 파일 패턴 | 용도 | 수정 권한 |
|---|---|---|
| `*.spec.test.tsx` | 수용 기준 테스트 (spec에서 도출) | 요구사항 변경 시에만, 사용자 확인 필수 |
| `*.test.tsx` | 구현 테스트 (단위/통합) | 자유롭게 수정 가능 |

### 커밋 규칙
- 기능 단위로 커밋한다. 하나의 커밋에 여러 기능을 섞지 않는다
- Conventional Commits 형식을 사용한다: `feat:`, `fix:`, `docs:`, `refactor:`, `test:`, `chore:`

## Plan Mode 규칙

- 수용 기준이 정의되어 있으면, spec 테스트(`*.spec.test.tsx`) 작성을 첫 번째 task로 배치한다. 선행 작업이 필요하여 불가능한 경우 사유를 명시한다.
- 순수 로직(reducer, hook, 유틸 등)에 대한 구현 테스트(*.test.tsx) 작성을 구현 task에 포함한다
- 모든 계획의 마지막에 미결정 질문 목록을 추가한다

### 참조할 artifacts
- `artifacts/<feature>/spec.md` — 행동 명세와 성공 기준
- `artifacts/<feature>/wireframe.md` — 배치와 컴포넌트 인벤토리

### React/Next.js Best Practices 참조
- 계획 수립 시 `vercel-react-best-practices` skill에서 해당 기능에 관련된 규칙을 식별하고 계획에 반영한다

## 작업 규칙
- 모든 작업에 수용 기준(Acceptance Criteria)을 반드시 포함한다:
  1. 구현이 올바른지 검증할 구체적 테스트/명령을 정의한다
  2. 적합성 기준 형식을 사용한다: 구체적 입력과 기대 출력을 명시한다
  3. 구현 후: 모든 수용 기준을 실행하고 통과를 확인한다
