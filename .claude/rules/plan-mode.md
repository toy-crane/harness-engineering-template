# Plan Mode 규칙

- `artifacts/spec.yaml`의 시나리오를 기반으로 spec 테스트 생성을 첫 번째 task로 배치한다. 선행 작업이 필요하면 사유를 명시한다.
- 순수 로직의 구현 테스트(*.test.tsx) 작성을 구현 task에 포함한다
- 계획 마지막에 미결정 질문 목록을 추가한다

## 참조할 artifacts
- `artifacts/spec.yaml` — 전체 앱의 불변 계약 (시나리오와 성공 기준)
- `artifacts/<feature>/spec.md` — 행동 명세 (설계 문서)
- `artifacts/<feature>/wireframe.md` — 배치와 컴포넌트 인벤토리

## React/Next.js Best Practices
- 계획 수립 시 `vercel-react-best-practices` skill에서 관련 규칙을 식별하고 반영한다
