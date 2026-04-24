---
name: write-spec
description: 사용자와 대화하며 feature의 spec을 작성한다. 사용자 흐름을 시뮬레이션하고, 빈칸을 질문으로 채운 뒤, spec.md(scope/scenarios/invariants를 담은 WHAT 전용 사양서)를 생성한다. "/write-spec", "write spec", "스펙 작성", "기능 정의" 등으로 실행한다.
argument-hint: "feature description"
---

# Write Spec

이 스킬의 산출물은 하나의 문서다: `artifacts/<feature-name>/spec.md`. spec은 feature가 **외부에서 관찰 가능한 관점**에서 무엇을 해야 하는지(WHAT)를 기술한다. 구현 선택(파일 배치, 테이블 스키마, 테스트 유형, 라이브러리)은 `plan.md`에 둔다. 여기가 아니다.

## Step 1: Pre-exploration

질문하기 전에 기존 맥락을 탐색한다. 다음 파일이 있으면 순서대로 읽는다:

1. `artifacts/<feature>/idea.md` — 핵심 아이디어와 설계 원칙 (이미 결정된 항목을 다시 묻지 않는다)
2. `artifacts/<feature>/spec.md` — 이전 패스의 논의 기록 (있다면)

완전히 새로운 feature라면 idea.md만 확인한다.

## Step 2: Surface Assumptions

질문하기 전에 탐색을 바탕으로 내가 가정하는 것들을 먼저 나열한다:

```
내가 지금 가정하고 있는 것:
1. ...
2. ...
→ 지금 바로잡거나, 이대로 진행한다.
```

모호한 요구사항을 조용히 채우지 않는다. spec의 목적은 코드를 쓰기 전에 오해를 드러내는 것이다.

## Step 3: Reframe as Success Criteria

사용자 설명의 모호한 요구사항을 구체적이고 테스트 가능한 조건으로 번역한다:

```
요구사항: "대시보드를 더 빠르게 만든다"

재구성:
- 4G 연결에서 대시보드 LCP < 2.5s
- 초기 데이터 로드 < 500ms
→ 이 목표가 맞는가?
```

사용자 설명이 이미 구체적이라면 이 단계는 건너뛴다.

## Step 4: Iterative Questioning

`$ARGUMENTS`에 대한 사용자 흐름을 시뮬레이션하며 빈칸을 찾는다. 각 단계에서 happy path, error paths, boundary conditions, 기존 feature와의 교차를 점검한다.

질문은 사용자가 **관찰할 수 있는 것(WHAT)** 에 관한 것이어야 한다. 만드는 방식(HOW)에 관한 것이 아니다. 파일 경로, 레이어 배치, 테이블 설계, 테스트 전략에 관한 질문은 피한다.

변경 비용으로 분류:
- **High cost of change**: 반드시 묻는다
- **Low cost of change**: 기본값을 제안하고 넘어간다

### 질문 규칙

- 한 번에 한 질문. 2-4개의 선택지를 제시하고, 답을 받기 전에는 진행하지 않는다
- 묻기 전에, 답이 코드베이스나 기존 spec/idea 문서에 이미 있는지 확인한다
- 질문이 기존 시나리오와 교차하면 그 시나리오를 명시적으로 언급한다
- 새로운 발견 없이 3라운드가 지나면 다음 단계로 넘어간다 — 단 변경 비용이 높은 미탐색 갈래가 남아 있으면 그것부터 묻는다

## Step 5: Generate spec.md

사용자가 이미지를 첨부했다면, 먼저 `artifacts/<feature-name>/references/`에 저장한다.

`references/spec-template.md`를 읽고 그 형식을 따른다. `references/spec-example.md`는 톤과 구체성의 모델로, `references/scenario-guide.md`는 Given/When/Then과 Success Criteria 규칙으로 참고한다.

### 작성 규칙

- **WHAT만 쓴다.** 파일 경로, 테이블/컬럼명, 테스트 유형, 라이브러리명은 spec.md에 나타나지 않는다.
- **Success Criteria는 관찰 가능해야 한다.** 모든 항목은 사용자, API 소비자, 테스트 하네스가 외부에서 검증할 수 있는 입력 → 출력을 기술한다. 내부 상태나 함수 호출은 절대 참조하지 않는다.
- **Excluded 항목에는 이유를 단다.**
- **Undecided Items**는 사용자가 명시적으로 결정할 수 없었던 항목만 기록한다.
- **시나리오 전반에 걸친 규칙은 Invariants에 쓴다** (보안, 성능, 데이터 일관성). 해당 없으면 섹션을 생략한다.

파일명: `artifacts/<feature-name>/spec.md`

## Done

spec에 UI 변경이 포함되면 `/sketch-wireframe`으로 안내한다. 그 외에는 `/draft-plan`으로 안내한다.
