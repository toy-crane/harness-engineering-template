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
                                                [QA Evaluator] <---- spec.yaml
                                                        |
                                                pass/fail (최대 3회)
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
    spec-evaluator.md     <- Playwright 기반 기능 검증
```

## 각 컴포넌트 역할

### 1. execute-plan 스킬 (오케스트레이터)

- plan.md를 읽고 태스크 목록을 순서대로 실행
- Generator 역할을 직접 수행 (단일 에이전트)
- 구현 완료 후 QA -> Design 순서로 Evaluator 호출
- 반복 루프 관리 (재시도, pivot 판단, 종료)

### 2. QA Evaluator (에이전트)

- 입력: spec.yaml, 실행 중인 앱 URL
- 도구: Playwright MCP
- 판정: spec 시나리오별 pass/fail (이진)
- 출력: 실패 시나리오 목록 + 재현 방법
- 최대 3회 반복, 전체 pass 시 종료

## 반복 루프 종료 조건 요약

| Evaluator | 판정 방식 | 최대 반복 | 종료 조건 |
|-----------|----------|----------|----------|
| QA | spec 시나리오별 pass/fail | 3회 | 전체 pass, 또는 3회 소진 시 사용자 보고 |

## 핵심 설계 원칙

1. **Generator는 단일 에이전트 유지**: 모델 역량 향상으로 분해 불필요
2. **QA Evaluator는 독립 검증자**: spec.yaml만을 기준으로 객관적 판정
3. **오케스트레이션은 스킬 프롬프트 안에**: 별도 YAML 불필요
4. **레이아웃 구성 품질은 wireframe에서 검증**: 위계, 밀도, 흐름, 상태를 wireframe 피드백 루프에서 확인
5. **spec test는 읽기 전용**: 테스트가 실패하면 구현을 고침

## 기존 하네스와의 관계

- Spec, Wireframe, Plan 단계는 그대로 유지
- Plan 이후 "직접 코딩" 단계를 execute-plan 스킬로 대체
- 기존 stop-test hook과 lint-fix hook은 Generator 내부에서 계속 사용
- spec-reviewer, plan-reviewer 에이전트 패턴을 구현 단계로 확장
