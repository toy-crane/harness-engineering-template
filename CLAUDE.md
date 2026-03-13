## 패키지 매니저: bun

## 개발 워크플로우

### 불변 계약
- `artifacts/spec.yaml`이 전체 앱의 단일 불변 계약이다
- spec.yaml의 시나리오에서 spec 테스트(`*.spec.test.tsx`)를 파생한다
- 구현이 spec.yaml과 맞지 않으면, 구현을 수정한다

### TDD
1. spec.yaml 기반으로 spec 테스트(*.spec.test.tsx) 생성 (Red)
2. 구현 테스트(*.test.tsx)로 순수 로직 단위 테스트 작성 (Red)
3. 테스트를 통과하는 최소 코드 구현 (Green)
4. 양쪽 테스트 통과를 유지하며 리팩터링

### 테스트 파일 컨벤션

| 파일 패턴 | 용도 |
|---|---|
| `*.spec.test.tsx` | 수용 기준 테스트 (spec.yaml에서 파생) |
| `*.test.tsx` | 구현 테스트 (단위/통합) |

### 커밋 규칙
- 기능 단위로 커밋, 여러 기능을 섞지 않는다
- Conventional Commits: `feat:`, `fix:`, `docs:`, `refactor:`, `test:`, `chore:`

### 작업 규칙
- 모든 작업에 수용 기준(Acceptance Criteria)을 포함한다:
  1. 구현 검증을 위한 구체적 테스트/명령을 정의한다
  2. 구체적 입력과 기대 출력을 명시한다
  3. 구현 후 모든 수용 기준을 실행하고 통과를 확인한다
