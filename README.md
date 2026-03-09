# Harness Engineering Template

Next.js 16 + React 19 프로젝트 템플릿

## 기술 스택

- **Framework**: Next.js 16 (App Router)
- **UI**: React 19, Tailwind CSS 4, shadcn/ui
- **Testing**: Vitest, Testing Library
- **Lint**: ESLint

## 시작하기

```bash
npm install
npm run dev
```

[http://localhost:3000](http://localhost:3000)에서 결과를 확인할 수 있습니다.

## 스크립트

| 명령어 | 설명 |
|---|---|
| `npm run dev` | 개발 서버 실행 |
| `npm run build` | 프로덕션 빌드 |
| `npm run start` | 프로덕션 서버 실행 |
| `npm run lint` | ESLint 실행 |
| `npm test` | 테스트 실행 |
| `npm run test:watch` | 테스트 워치 모드 |

## Claude Code 워크플로우

이 프로젝트는 `/spec` → `/wireframe` → `Plan Mode` → `Implementation` 순서로 개발합니다.

### 1. Spec (`/spec`)

기능의 요구사항을 구조화합니다. 시나리오, 성공 기준, 전제 조건을 정의하고 `artifacts/<feature>/spec.md`에 저장합니다.

### 2. Wireframe (`/wireframe`)

spec을 기반으로 ASCII 와이어프레임을 생성합니다. 레이아웃과 컴포넌트 구조를 빠르게 검증하고 `artifacts/<feature>/wireframe.md`에 저장합니다.

### 3. Plan Mode

spec과 wireframe을 참조하여 구현 계획을 수립합니다. Spec 테스트(`*.spec.test.tsx`) 작성을 첫 번째 태스크로 배치하고, 각 태스크에 수용 기준을 포함합니다.

### 4. Implementation

TDD로 구현합니다.

1. Spec 테스트 작성 (`*.spec.test.tsx`) — 수용 기준 정의 (Red)
2. 구현 테스트 작성 (`*.test.tsx`) — 단위 로직 검증 (Red)
3. 최소 코드 구현 (Green)
4. 리팩터링
