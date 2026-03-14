---
description: Plan mode 진입 시 적용되는 계획 수립 규칙
---

# Plan Mode 규칙

## Phase 1: Gap Analysis (계획 작성 전)

artifacts를 읽고, 구현에 필요하지만 아직 결정되지 않은 사항을 `AskUserQuestion`으로 질문한다.
답변을 받은 후 계획을 작성한다.

- artifacts에 이미 답이 있거나, 프로젝트에 이미 사용 중인 기술은 질문하지 않는다
- artifacts에 명시되지 않은 구현 결정을 임의로 내리지 않는다
- **여러 대안이 존재하고, 구현 후 변경 비용이 큰 결정은 절대 임의로 내리지 않는다. 반드시 사용자에게 질문한다.**

## Phase 2: 계획 작성

- `artifacts/spec.yaml`의 시나리오를 기반으로 spec 테스트 생성을 첫 번째 task로 배치한다. 선행 작업이 필요하면 사유를 명시한다.
- 순수 로직의 구현 테스트(*.test.tsx) 작성을 구현 task에 포함한다
- 각 task 완료 시 커밋한다
- `artifacts/<feature>/wireframe.html`에서 모든 UI 컴포넌트를 추출하고, 프로젝트의 컴포넌트 시스템에 매핑한다. 부족한 컴포넌트는 설치 목록에 포함한다.
- 계획 마지막에 미결정 질문 목록을 추가한다

## 참조할 artifacts
- `artifacts/spec.yaml` — 전체 앱의 불변 계약 (시나리오와 성공 기준)
- `artifacts/<feature>/spec.md` — 행동 명세 (설계 문서)
- `artifacts/<feature>/wireframe.html` — UI 배치·순서·형태의 기준. 와이어프레임의 UI 형태를 임의로 변경하지 않는다.

## React/Next.js Best Practices
- 계획 수립 시 `vercel-react-best-practices` skill에서 관련 규칙을 식별하고 반영한다
