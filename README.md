# Harness Engineering Template

Next.js 16 + React 19 프로젝트 템플릿

## 기술 스택

- **Framework**: Next.js 16 (App Router)
- **UI**: React 19, Tailwind CSS 4, shadcn/ui
- **Testing**: Vitest, Testing Library
- **Lint**: ESLint

## 시작하기

```bash
bun install
bun dev
```

[http://localhost:3000](http://localhost:3000)에서 결과를 확인할 수 있습니다.

## 스크립트

| 명령어 | 설명 |
|---|---|
| `bun dev` | 개발 서버 실행 |
| `bun run build` | 프로덕션 빌드 |
| `bun start` | 프로덕션 서버 실행 |
| `bun lint` | ESLint 실행 |
| `bun test` | 테스트 실행 |
| `bun run test:watch` | 테스트 워치 모드 |

## Hooks

Claude Code hooks 기반 자동 품질 게이트 (`.claude/settings.json`)

| 단계 | 트리거 | 동작 |
|---|---|---|
| **PostToolUse** | `Write\|Edit` | ESLint auto-fix + `auto-test.sh` — 관련 테스트 자동 실행 |
| **Stop** | 작업 완료 시 | `final-test-gate.sh` — 전체 테스트 실행, 실패 시 중단 |

## Claude Code 워크플로우

이 프로젝트는 `/spec` → `/wireframe` → `Plan Mode` → `Implementation` 순서로 개발합니다.

### 1. Spec (`/spec`)

기능의 요구사항을 구조화합니다. 시나리오, 성공 기준, 전제 조건을 정의하고 `artifacts/<feature>/spec.md`에 저장합니다. 승인 후 `artifacts/spec.yaml`에 구조화된 시나리오를 추출합니다.

### 2. Wireframe (`/wireframe`)

spec을 기반으로 HTML 와이어프레임을 생성합니다. 레이아웃과 컴포넌트 구조를 브라우저에서 빠르게 검증하고 `artifacts/<feature>/wireframe.html`에 저장합니다.

### 3. Plan Mode

spec.yaml과 wireframe을 참조하여 구현 계획을 수립합니다. spec.yaml 기반 spec 테스트(`*.spec.test.tsx`) 생성을 첫 번째 태스크로 배치하고, 각 태스크에 수용 기준을 포함합니다.

### 4. Implementation

TDD로 구현합니다.

1. spec.yaml 기반 spec 테스트 생성 (`*.spec.test.tsx`) — 수용 기준 정의 (Red)
2. 구현 테스트 작성 (`*.test.tsx`) — 단위 로직 검증 (Red)
3. 최소 코드 구현 (Green)
4. 리팩터링
