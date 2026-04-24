# decisions.md 작성 가이드

Team Lead의 판단을 `artifacts/<feature>/decisions.md`에 기록한다.

이 파일의 주된 목적은 **미래 하네스 업데이트**가 스킬을 개선할 수 있을 만큼 맥락을 남기는 것이다. 형식보다 명료함을 우선한다 — 중요한 신호를 포착한다.

## 항목 형식

```markdown
## <Title>

**When**: <어느 Step / 어떤 상황이 판단을 촉발했는가>
**Decision**: <무엇을 결정했는가>
**Why**: <근거 — spec 경로, 이전 케이스, 제약을 인용>
**Harness Signal**: <이 판단이 재발할 가능성이 높다면, SKILL.md에 추가할 규칙은 무엇인가 — 또는 현재 규칙의 어느 부분이 불명확했는가. 일반화할 것이 없으면 "N/A">
**Result**: Pending → Success / Partial / Failure + 구체적 관찰

<선택 자유 노트: 고려한 대안, 트레이드오프, 후속 작업>
```

### 예시

```markdown
## auth-login을 submit-project보다 먼저 실행

**When**: Step 2, Task ordering
**Decision**: `auth-login`을 먼저, 이어서 `submit-project`를 실행한다. 둘은 `profiles` 스키마를 공유한다.
**Why**: `submit-project`가 `auth-login`이 도입하는 `profiles` 타입을 import한다. 역순이면 throwaway stub이 필요하다.
**Harness Signal**: plan.md는 현재 Task 간 entity 수준 의존성을 표시하지 않는다. Task마다 "Depends on" 필드를 추가하면 수동 의존성 분석 없이 순서를 잡을 수 있다.
**Result**: Pending
```

## 기록 시점

판단이 내려질 때마다 로그한다. 전형적 트리거:

| Event | Step |
|---|---|
| Task 실행 순서 (의존성) | Step 2 |
| Spec 모호성 — 하나의 해석을 선택 | Step 3 |
| Task 범위 변경 (추가 / 제거 / 병합) | Step 3 |
| 빌드 또는 테스트 실패 — 복구 경로 | Step 3 |
| 사용자 피드백 판단 (accept / reject / partial) | Step 4 |
| 사용자 escalation | any Step |

자명한 결정(예: "대안 없이 plan.md를 그대로 따름")은 기록하지 않는다.

## Result 업데이트

각 항목은 `Result: Pending`으로 시작한다. 실행이 진행되면 업데이트:

| Status | 의미 |
|---|---|
| Success | 결정이 의도대로 동작했다 |
| Partial | 동작했으나 추가 수정이 필요했다 |
| Failure | 다른 접근이 필요했다 |

상태 뒤에 구체적 결과를 자유 형식으로 기술한다.

```markdown
- Result: Success — 첫 리뷰에서 테스트 통과 및 사용자 승인
- Result: Partial — 동작하지만 shadcn 토큰 준수를 위해 한 번 더 수정 필요
- Result: Failure — 역순이 circular import를 만들었고 Task 중간에 되돌림
```

### 업데이트 시점

- **Step 3 진행 중**: 해당 결정의 영향을 받은 Task가 끝나면 Pending → Partial / Failure를 빠르게 갱신
- **Step 4 (human review) 이후**: Step 2 (Task 순서) 결과와 사용자 피드백 판단을 마무리
- **Step 5 (done)에서**: 남은 모든 Pending을 해소하고 최종 보고에 Harness Signal 노트를 요약
