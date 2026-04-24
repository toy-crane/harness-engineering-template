---
name: self-improve
description: 실행 중 반복된 패턴을 감지해 Skill·Hook·Rule·CLAUDE.md 변경을 제안한다. feature를 3-5개 완료해 `artifacts/*/decisions.md`가 여럿 쌓였을 때, 또는 여러 feature에서 같은 함정에 반복해 빠졌다고 느낄 때 트리거한다. 단일 feature 진행 중에는 쓰지 않는다 — decisions가 축적되기 전에는 신호가 약하다. "/self-improve", "하네스 개선", "반복 패턴 승격"으로도 호출한다.
---

# Harness 개선

## Step 1: 실수·판단 수집

목적은 **같은 실수를 반복하지 않도록 하네스에 학습을 남기는 것**이다.

모든 `artifacts/*/decisions.md` 파일을 읽는다. `fail`·`partial` 결과를 우선 분석한다. 여러 feature에 걸친 교차 반복이 있으면 신호가 강하지만, **단일 feature 안에서 한 번만 발생한 큰 판단**도 포함한다 ("같은 일이 또 생길 것 같다"는 느낌이 드는 것).

추가로 다음 신호를 본다:
- 복구 경로를 거친 실패 (build/test 실패 → 우회 → 재시도)
- 같은 에러에 두 번 이상 걸린 상황
- Human Review에서 사용자가 지적한 반복 패턴
- 수동 개입이 필요했던 상황

## Step 2: 승격 대상 분류

각 패턴을 적절한 메커니즘으로 분류한다:

| 반복 유형 | 승격 대상 | 예시 |
|---|---|---|
| 같은 제약 위반이 반복됨 | **Rule** | `.tsx에서 px 단위 금지`, `components/ui/* 직접 수정 금지` |
| 100% 기계적으로 잡아야 하는 것 | **Hook** | 커밋 전 `bun run build`, 저장 후 linter 자동 실행 |
| 잘못된 사용 패턴 — 올바른 방법을 가르쳐야 함 | **Skill** | shadcn 컴포넌트 설치·조합법, 특정 라이브러리 도입 가이드 |
| 아키텍처 결정 변경 | **CLAUDE.md** | 순방향 의존성 순서, 패키지 매니저 결정 |

새 Skill은 라이브러리·도구 단위로 제안한다 (상세 주제는 `references/`로 분리). 새 skill을 실제로 만들 땐 `skill-creator` 스킬을 쓴다.

## Step 3: 변경 제안

각 제안을 사용자에게 제시한다:
- **무엇이 반복되었는가** — 근거로 해당 decisions.md 항목을 인용한다
- **어느 메커니즘으로 승격할지** — Step 2의 분류 중 하나
- **구체적 파일 경로와 내용 초안**

### 메커니즘별 기본 경로

| 메커니즘 | 위치 |
|---|---|
| Rule | `.claude/rules/<name>.md` |
| Hook | `.claude/settings.json` — `hooks` 섹션 |
| Skill | `.claude/skills/<name>/SKILL.md` |
| CLAUDE.md | 프로젝트 루트의 `CLAUDE.md` |

사용자가 승인한 것만 적용한다 (Ask-first).
