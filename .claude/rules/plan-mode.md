# Plan Mode 규칙

- 수용 기준이 있으면 spec 테스트 작성을 첫 번째 task로 배치한다. 선행 작업이 필요하면 사유를 명시한다.
- 순수 로직의 구현 테스트(*.test.tsx) 작성을 구현 task에 포함한다
- 계획 마지막에 미결정 질문 목록을 추가한다

## 참조할 artifacts
- `artifacts/<feature>/spec.md` — 행동 명세와 성공 기준
- `artifacts/<feature>/wireframe.md` — 배치와 컴포넌트 인벤토리

## React/Next.js Best Practices
- 계획 수립 시 `vercel-react-best-practices` skill에서 관련 규칙을 식별하고 반영한다
