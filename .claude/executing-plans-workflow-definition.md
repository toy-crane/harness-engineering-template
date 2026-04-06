---
title: "Executing Plans 워크플로우 정의"
date: 2026-03-26
tags:
  - ai/agents
  - productivity/automation
  - workflow
aliases:
  - "executing-plans 워크플로우"
  - "Generator-Evaluator 워크플로우 정의"
  - "하네스 워크플로우"
description: "Generator-Evaluator 구조를 적용한 executing-plans 스킬의 전체 워크플로우 정의"
---

# Executing Plans 워크플로우 정의

## 전체 파이프라인

기존 4단계 파이프라인을 Generator-Evaluator 구조로 확장한 워크플로우다.

### 기존 파이프라인

```
사용자 요구 -> [Spec] -> [Wireframe] -> [Plan] -> [TDD 구현]
```

### 확장 파이프라인

```
사용자 요구 -> [Spec] -> [Wireframe] -> [Plan] -> [execute-plan 스킬]
                                                        |
                                                        v
                                                [Generator 구현]
                                                        |
                                                        v
                                                [E2E Reviewer] <---- spec.yaml
                                                [Wireframe Reviewer] <---- wireframe.html
                                                [Design Reviewer] <---- design rules
                                                [React Reviewer] <---- react best practices
                                                        |
                                                pass/fail
                                                        |
                                                    전체 pass
                                                        |
                                                        v
                                                [Code Simplifier]
                                                        |
                                                        v
                                                      완료
```

## 파일 구조

```
.claude/
  skills/
    execute-plan/
      SKILL.md          <- 오케스트레이션 로직 (Generator + 반복 루프)
  agents/
    e2e-reviewer.md         <- Playwright 기반 기능 검증
    wireframe-reviewer.md   <- wireframe ↔ 구현 레이아웃 정합성 검증
    design-reviewer.md      <- 디자인 시스템 규칙 검증
    react-reviewer.md       <- React/Next.js 성능 패턴 검증
```

## 각 컴포넌트 역할

### 1. execute-plan 스킬 (오케스트레이터)

- plan.md를 읽고 태스크 목록을 순서대로 실행
- Generator 역할을 직접 수행 (단일 에이전트)
- 구현 완료 후 E2E -> Design -> React 순서로 Reviewer 호출
- 반복 루프 관리 (재시도, pivot 판단, 종료)

### 2. Wireframe Reviewer (에이전트)

- 입력: wireframe.html (Read), 구현 앱 URL, wireframe screen ↔ 구현 URL 매핑
- 도구: Playwright 스크린샷 (`scripts/capture-screenshots.ts`), LLM 시각 비교
- 판정: screen별 레이아웃 pass/fail (구조적 정합성)
- 출력: 불일치 screen 목록 + 구체적 수정 방향
- 비교 대상: 컴포넌트 배치, grid/flex 구조, 정보 계층, 반응형 전환
- 무시 대상: 색상, 폰트, 아이콘, 그림자, border 스타일

### 3. E2E Reviewer (에이전트)

- 입력: spec.yaml, 실행 중인 앱 URL
- 도구: Playwright MCP
- 판정: spec 시나리오별 pass/fail (이진)
- 출력: 실패 시나리오 목록 + 재현 방법
- 전체 pass 시 종료

### 4. React Reviewer (에이전트)

- 입력: 구현된 컴포넌트/페이지 파일 목록
- 도구: vercel-react-best-practices 스킬 규칙
- 판정: 파일별 pass/fail (CRITICAL/HIGH 위반만 fail, MEDIUM 이하는 advisory)
- 출력: 위반 목록 (파일:행, 규칙 출처, 수정 방향) + advisory 목록
- Next.js 미사용 시 `server-*` 규칙 건너뜀

## 반복 루프 종료 조건 요약

| Reviewer | 판정 방식 | 종료 조건 |
|----------|----------|----------|
| E2E | spec 시나리오별 pass/fail | 전체 pass |
| Wireframe | screen별 레이아웃 pass/fail | 전체 pass |
| Design | 디자인 시스템 규칙 pass/fail | 전체 pass |
| React | fail-tier 규칙 위반 pass/fail | fail-tier 전체 pass |

## 핵심 설계 원칙

1. **Generator는 단일 에이전트 유지**: 모델 역량 향상으로 분해 불필요
2. **E2E Reviewer는 독립 검증자**: spec.yaml만을 기준으로 객관적 판정
3. **오케스트레이션은 스킬 프롬프트 안에**: 별도 YAML 불필요
4. **레이아웃 구성 품질은 wireframe에서 검증하고 구현 후 재검증**: 위계, 밀도, 흐름, 상태를 wireframe 피드백 루프에서 확인하고, Wireframe Reviewer가 구현 결과의 레이아웃 정합성을 재검증
5. **spec test는 읽기 전용**: 테스트가 실패하면 구현을 고침

## 기존 하네스와의 관계

- Spec, Wireframe, Plan 단계는 그대로 유지
- Plan 이후 "직접 코딩" 단계를 execute-plan 스킬로 대체
- 기존 stop-test hook과 lint-fix hook은 Generator 내부에서 계속 사용
- spec-reviewer, plan-reviewer 에이전트 패턴을 구현 단계로 확장
