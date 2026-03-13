## 개발 워크플로우

### 불변 계약
- `artifacts/spec.yaml`이 전체 앱의 단일 불변 계약이다
- spec.yaml의 시나리오에서 spec 테스트(`*.spec.test.tsx`)를 파생한다
- 구현이 spec.yaml과 맞지 않으면, 구현을 수정한다

### TDD
1. spec.yaml 기반으로 spec 테스트(*.spec.test.tsx) 생성 (Red)
2. 구현 테스트(*.test.tsx)로 순수 로직 단위 테스트 작성 (Red)
3. 테스트를 통과하는 최소 코드 구현 (Green)
4. 양쪽 테스트 통과를 유지하며 리팩터링

### 테스트 파일 컨벤션

| 파일 패턴 | 용도 |
|---|---|
| `*.spec.test.tsx` | 수용 기준 테스트 (spec.yaml에서 파생) |
| `*.test.tsx` | 구현 테스트 (단위/통합) |
