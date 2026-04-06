# improve-log 구현 계획

## 배경

`execute-plan`이 생산하는 `decisions.md`는 `improve-harness`의 핵심 입력 데이터다.
현재는 자유 형식 텍스트로 기록되고, improve-harness가 이를 참조하지 않아 연결이 끊겨 있다.
두 스킬 사이의 데이터 파이프라인을 구조화하여, 판단 실패 패턴이 하네스 개선으로 자연스럽게 흘러가게 한다.

## 개선 포인트 → Task 매핑

| # | 개선 포인트 | 반영 Task |
|---|---|---|
| 1 | outcome 필드 추가 | Task 1 |
| 2 | 구조화된 스키마 정의 | Task 1 |
| 3 | improve-harness에서 명시적 참조 | Task 3 |
| 4 | 승격 힌트(promotion hint) | Task 1 |
| 5 | cross-feature 누적 메커니즘 | Task 3 |

## Affected Files

| 파일 경로 | 변경 유형 | 관련 Task |
|---|---|---|
| `.claude/skills/execute-plan/references/decisions-template.md` | 신규 | Task 1 |
| `.claude/skills/execute-plan/SKILL.md` | 수정 | Task 2 |
| `.claude/skills/improve-harness/SKILL.md` | 수정 | Task 3 |

## Tasks

### Task 1: decisions.md 구조화된 템플릿 생성

- **의존성**: 없음
- **구현 대상**:
  - `.claude/skills/execute-plan/references/decisions-template.md`
    - 엔트리별 구조화된 필드 정의 (시점, 카테고리, 내용, 근거, 승격 힌트)
    - outcome 섹션: 실행 완료 후 Team Lead가 판단 결과를 기록하는 구조
    - 카테고리 enum 정의 (team-composition, execution-order, feedback-triage, scope-change, approach-pivot)
    - 승격 힌트 필드: `promotion-hint` (none, rule, hook, skill, claude-md)
- **수용 기준**:
  - [ ] 템플릿에 category, decision, rationale, outcome, promotion-hint 필드가 모두 존재한다
  - [ ] outcome은 초기 기록 시 `pending`이고, 실행 완료 후 `confirmed` 또는 `reverted`로 갱신하는 구조다
  - [ ] 카테고리 enum이 5개 정의되고, 각각 1줄 설명이 있다

---

### Task 2: execute-plan SKILL.md에 decisions 기록 규칙 반영

- **의존성**: Task 1 (템플릿 참조)
- **구현 대상**:
  - `.claude/skills/execute-plan/SKILL.md`
    - Step 1에서 `references/decisions-template.md` 읽기 추가
    - 기존 "decisions.md에 기록한다" 지시를 템플릿 참조로 변경
    - Step 5 완료 후 outcome 갱신 단계 추가 (이전 판단들의 결과를 기록)
    - Step 7에 decisions.md 요약 포함
- **수용 기준**:
  - [ ] Step 1에서 decisions-template.md를 읽는 지시가 있다
  - [ ] "decisions.md에 기록" 지시가 템플릿 형식을 따르도록 변경되었다
  - [ ] Step 5 이후에 outcome 갱신 단계가 존재한다
  - [ ] Step 7 보고에 decisions 요약이 포함된다

---

### Task 3: improve-harness에서 decisions.md를 데이터 소스로 연결

- **의존성**: Task 1 (스키마 기준), Task 2 (생산자 확정)
- **구현 대상**:
  - `.claude/skills/improve-harness/SKILL.md`
    - Step 1에 `artifacts/*/decisions.md` 전체 스캔 지시 추가 (cross-feature)
    - `outcome: reverted` 엔트리를 우선 수집 대상으로 명시
    - `promotion-hint != none` 엔트리를 후보로 바로 올리는 로직 추가
    - Step 2 분류 시 decisions.md의 category를 활용하는 지시 추가
- **수용 기준**:
  - [ ] Step 1에 `artifacts/*/decisions.md`를 glob으로 수집하는 지시가 있다
  - [ ] `outcome: reverted` 엔트리가 우선 수집 대상으로 명시되어 있다
  - [ ] `promotion-hint`가 none이 아닌 엔트리가 승격 후보로 언급되어 있다
  - [ ] Step 2에서 category 필드를 활용한 패턴 그루핑이 지시되어 있다

---

## 미결정 사항

- decisions.md를 마크다운 테이블로 할지, 구조화된 리스트로 할지 (Task 1에서 결정)
