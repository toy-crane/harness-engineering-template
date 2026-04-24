---
name: execute-plan
description: plan.md의 Task를 메인 컨텍스트에서 직접 구현한다. `artifacts/<feature>/plan.md`가 확정돼 각 Task를 실제로 실행할 준비가 된 상태에서 트리거한다 — 사용자가 "이제 구현 시작", "플랜 실행" 같은 신호를 보낼 때. CLAUDE.md → Testing의 TDD 규율을 따르고, 각 Task를 한 커밋으로 구현한 뒤 `code-reviewer` 피드백과 사용자 리뷰를 받는다. plan.md 없이 바로 구현하려는 경우에는 쓰지 않는다. "/execute-plan", "플랜 실행", "구현 시작"으로도 호출한다.
argument-hint: "feature name"
---

# Execute Plan

plan.md의 Task를 메인 컨텍스트에서 한 번에 하나씩 직접 구현한다. 구현은 직접, 독립 검증은 `code-reviewer` sub-agent로 위임한다. 판단은 전부 직접 내리고 `artifacts/<feature>/decisions.md`에 **Harness Signal**과 함께 기록해 미래 하네스 튜닝으로 흘려보낸다.

## Step 1: 전제 조건 확인

`$ARGUMENTS`에서 feature 이름을 추출한다.

- `artifacts/<feature>/plan.md` — 없으면 "`/draft-plan`을 먼저 실행하세요." 출력 후 중단
- `artifacts/<feature>/spec.md` 읽기
- `artifacts/<feature>/wireframe.html` — 있으면 참조
- plan.md의 Required Skills에 나열된 각 SKILL.md 읽기
- `references/decisions-template.md` 읽기 — decisions.md 기록 형식 확인

## Step 2: Task 순서 결정

plan.md의 Task 목록을 분석한다.

1. Task 간 의존성을 식별한다 (공유 파일, import 관계, 데이터 흐름)
2. 실행 순서를 결정한다 — 순차, 의존성 우선
3. 순서를 간단히 출력한다

순서와 근거를 decisions.md에 기록한다.

## Step 3: Task 실행

Step 2의 순서대로 Task를 한 번에 하나씩 구현한다. 각 Task에 대해:

1. 수용 기준을 읽는다
2. 적합한 곳에 TDD (RED → GREEN)를 적용한다 — `CLAUDE.md` → Testing 규율을 따른다
3. 기준을 충족하는 최소 코드를 구현한다
4. `bun run build`와 영향받은 테스트를 실행한다
5. Task당 conventional commit 하나를 만든다
6. plan.md에서 Task를 완료로 표시한다

실패 시 우회하지 않고 근본 원인을 찾는다. 빌드 skip, 테스트 disable, 에러 swallow는 기술 부채를 가리는 단기 우회일 뿐이다.

### 유연한 판단

상황에 따라 Task 재정렬·병합, spec 범위 밖 피드백 기각, 접근 전환, 사용자 escalation을 직접 결정한다. 다음 같은 판단은 기록할 가치가 있다:

- **재정렬이 정당한 경우**: Task 3이 Task 1의 출력에 의존하는데 plan이 역순으로 배치돼 있음 — 순서를 바꿔 throwaway stub을 없앤다
- **피드백 기각이 정당한 경우**: 사용자가 "비밀번호 재설정도 같이 해달라"고 요청 — spec 범위 밖, decisions.md에 근거 기록 후 "새 feature로 다루자"고 제안한다

판단은 Harness Signal과 함께 decisions.md에 기록한다. 형식은 `references/decisions-template.md`에 있다.

## Step 4: 독립 코드 리뷰 (code-reviewer)

모든 Task 구현이 끝나면 `code-reviewer` 에이전트를 호출한다. 리뷰어는 다섯 차원(정확성·가독성·아키텍처·보안·성능)으로 평가하고 Critical / Important / Suggestion으로 분류한다.

### 결과 처리

- **Critical**: 직접 수정하고 영향받은 테스트 재실행
- **Important**: 직접 수정 (spec 범위 밖 제안이면 decisions.md에 근거 기록 후 기각)
- **Suggestion**: Step 5 보고에만 언급, 반영은 선택적

### 분류 예시

| 피드백 | 분류 | 이유 |
|---|---|---|
| 로그에 사용자 이메일이 찍힘 (PII 노출) | Critical | 프라이버시 리스크. 즉시 수정 |
| 같은 fetch 로직이 세 컴포넌트에 중복 | Important | 동작은 하나 유지보수 비용이 큼 |
| `data` 변수명을 `projects`로 바꾸면 명확 | Suggestion | 의미 전달 개선, 필수는 아님 |

판정을 decisions.md에 Harness Signal과 함께 기록한다.

## Step 5: Human Review

모든 Task가 완료되면 사용자에게 요약을 제시한다:

- Task별 수용 기준 상태 (pass / partial / fail)
- `bun run build`와 테스트 결과
- spec.md Scenario별로 관찰 가능한 결과

사용자에게 spec.md 대비 feature를 검증해 달라고 요청한다. 피드백이 있으면 직접 수정하고 재검증한다. 판단을 decisions.md에 기록한다.

다음 신호가 보이면 `/simplify`를 선택적으로 실행한다:

- code-reviewer가 같은 패턴(중복 fetch, 반복 분기)을 세 곳 이상 지적한 경우
- 새로 추가한 코드가 기존 유틸·훅과 크게 겹친다고 판단되는 경우
- Task 간 복사-붙여넣기로 보이는 블록이 누적된 경우

실행 후 재검증한다.

## Step 6: Done

사용자에게 결과를 보고한다:

- **실행 요약**: 전체 Task 개수, 생성된 커밋
- **Scenario 커버리지**: spec.md의 어느 Scenario들이 관찰 가능하게 충족되었는가
- **Decision log**: decisions.md 경로 제공 — 보고 전에 남은 모든 `Pending`을 마무리하고, **Harness Signal** 항목들의 짧은 요약을 포함해 미래 하네스 튜닝에 쓸 수 있게 한다
