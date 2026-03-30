---
name: draft-plan
description: spec.yaml 기반으로 구현 계획을 작성한다. skill-researcher로 관련 스킬을 찾고, TDD 기반 task 목록을 생성한다. "/draft-plan", "계획 작성", "구현 계획" 등으로 실행.
argument-hint: "feature 이름"
---

# 구현 계획 작성

## Step 1: 전제 조건 확인

$ARGUMENTS에서 feature명을 추출한다.

- `artifacts/spec.yaml` -- 없으면 "먼저 `/write-spec`을 실행하세요." 출력 후 종료
- `artifacts/<feature>/spec.md` -- 선택
- `artifacts/<feature>/wireframe.html` -- 선택

## Step 2: 코드베이스 탐색

기존 코드를 탐색하여 아키텍처와 관련 패턴을 파악한다.

- 프로젝트 구조, 기존 컴포넌트, 상태 관리 방식 확인
- 이 feature가 영향을 줄 파일과 그 의존 관계 파악
- 유사한 기존 기능이 있으면 그 구현을 참조한다

## Step 3: 스킬 탐색

`skill-researcher` 에이전트를 호출하여 이 feature의 시나리오에 도움이 될 스킬을 찾는다.

추천 목록을 사용자에게 보여주고, 확인/조정을 받는다.

## Step 4: 빈칸 채우기

위 입력을 읽고, 구현에 필요하지만 아직 결정되지 않은 사항을 찾는다.

- 변경 비용이 큰 결정만 질문한다
- 한 번에 질문 하나, 2-4개 선택지 제시

## Step 5: 계획 문서 생성

`references/plan-template.md`를 읽고 그 형식에 맞춰 작성한다.

### 계획 요건

#### Task 작성 원칙
- task에는 What과 수용 기준만 포함한다. 코드베이스가 변할 수 있으므로 How는 제외한다
- task 참조에는 executor가 직접 찾을 수 없는 외부 소스만 포함한다 (스킬은 이름 + 키워드만)

#### 배치 순서
- spec 테스트(*.spec.test.tsx) 생성을 가장 먼저 배치한다. 선행 작업이 필요하면 사유와 함께 앞에 둔다
- 의존성이 적은 것부터 task를 배치한다

#### 테스트
- 각 구현 task의 수용 기준에 구현 테스트 통과를 포함한다

#### Wireframe 반영
- wireframe.html이 있으면, 컴포넌트 타입을 task의 구현 대상에 반영한다
- wireframe에서 식별된 컴포넌트 중 프로젝트에 없는 것은, 직접 구현 전에 패키지 레지스트리에서 설치 가능 여부를 확인한다

#### 기타
- Affected Files 섹션에 코드베이스 탐색 결과를 반영한다

`artifacts/<feature>/plan.md`로 저장한다.

## Step 6: 독립 검토

`plan-reviewer` 에이전트를 호출하여 위 입력과 plan.md 사이의 불일치를 검증한다.

갭이 있으면 사용자에게 보여주고, 반영할 갭을 선택받아 plan.md에 반영한다.

## 완료

사용자에게 `/execute-plan <feature>` 진행 여부를 안내한다.
