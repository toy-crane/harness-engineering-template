## 구현 파이프라인

```
/spec → /wireframe → plan mode → TDD
```

| 단계 | 역할 | 다루지 않는 것 |
|---|---|---|
| /spec | 시스템이 무엇을 하는가 (행동) | UI 구조 |
| /wireframe | 화면에 무엇이 어디에 있는가 (배치) | 컴포넌트 타입, props |
| plan mode | 어떤 컴포넌트로 어떻게 만드는가 (구현) | - |
| TDD | 코드 작성 + 검증 | - |

### Phase 분리
- **Phase 1**: 디자인 시스템 확정 (프로젝트당 1번, 충분히 시간 투자)
- **Phase 2**: 화면별 구현 (위 파이프라인 반복)

## 개발 워크플로우

### TDD (테스트 주도 개발)
1. 수용 기준을 바탕으로 실패하는 테스트를 먼저 작성한다
2. 테스트를 통과하는 최소한의 코드를 구현한다
3. 테스트가 통과하는 상태를 유지하면서 리팩터링한다
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
- 모든 계획의 마지막에 미결정 질문 목록을 추가한다

### 참조할 artifacts
- `artifacts/<feature>/spec.md` — 행동 명세와 성공 기준
- `artifacts/<feature>/wireframe.md` — 배치와 컴포넌트 인벤토리

### React/Next.js Best Practices 참조
- 필요 시 `.claude/skills/vercel-react-best-practices/rules/` 카테고리를 참조한다

## 작업 규칙
- 모든 작업에 수용 기준(Acceptance Criteria)을 반드시 포함한다:
  1. 구현이 올바른지 검증할 구체적 테스트/명령을 정의한다
  2. 적합성 기준 형식을 사용한다: 구체적 입력과 기대 출력을 명시한다
  3. 구현 후: 모든 수용 기준을 실행하고 통과를 확인한다
