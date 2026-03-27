# Harness Engineering Template

Next.js 16 + React 19 프로젝트 템플릿

## 기술 스택

- **Framework**: Next.js 16 (App Router)
- **UI**: React 19, Tailwind CSS 4, shadcn/ui, Radix UI, Base UI
- **Icons**: Lucide React
- **Testing**: Vitest, Testing Library
- **Lint**: ESLint
- **Package Manager**: Bun

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
| `bun run lint` | ESLint 실행 |
| `bun run test` | 테스트 실행 |
| `bun run test:watch` | 테스트 워치 모드 |

## Hooks

Claude Code hooks 기반 자동 품질 게이트 (`.claude/settings.json`)

| 단계 | 트리거 | 동작 |
|---|---|---|
| **PreToolUse** | `Bash` | `secret-guard.sh` — git commit/add 시 gitleaks로 시크릿 탐지 |
| **PostToolUse** | `Write\|Edit` | `lint-fix.sh` — ESLint auto-fix |
| **Stop** | 작업 완료 시 | `stop-test.sh` — 전체 테스트 실행, 실패 시 재시도 (최대 3회) |

## 테스트 파일 컨벤션

| 파일 패턴 | 용도 |
|---|---|
| `*.spec.test.tsx` | 수용 기준 테스트 (`artifacts/spec.yaml`에서 파생) |
| `*.test.tsx` | 구현 테스트 (단위/통합) |

## Claude Code 워크플로우

이 프로젝트는 `/write-spec` → `/sketch-wireframe` → `/draft-plan` → `/execute-plan` 순서로 개발합니다.

`artifacts/spec.yaml`이 전체 앱의 **단일 불변 계약**입니다. spec.yaml의 시나리오에서 spec 테스트를 파생하고, 구현이 spec.yaml과 맞지 않으면 구현을 수정합니다.

### 1. Spec (`/write-spec`)

유저와 대화하며 기능의 스펙을 작성합니다. 사용자 흐름을 시뮬레이션하고 빈칸을 질문으로 채운 뒤, spec.md(논의 기록)와 spec.yaml(검증 가능한 요구사항)을 생성합니다.

### 2. Wireframe (`/sketch-wireframe`)

spec.yaml 기반 HTML 와이어프레임을 생성합니다. 레이아웃 검증이 목적이며, 피드백 루프를 돌리며 `artifacts/<feature>/wireframe.html`에 저장합니다.

### 3. Plan (`/draft-plan`)

spec.yaml과 wireframe을 참조하여 구현 계획을 수립합니다. skill-researcher로 관련 스킬을 찾고, plan-reviewer로 독립 검토합니다.

### 4. Execute (`/execute-plan`)

plan.md의 Task를 TDD로 순차 실행합니다. 완료 후 QA Evaluator(spec 시나리오 검증)와 Design Evaluator(시각적 품질 채점)로 검증하고, Code Simplifier로 정리합니다.

### 5. Improve (`/improve-harness`)

실행 중 반복된 패턴을 감지하고 Skill/Hook/Rule 변경을 제안합니다.

> spec 테스트(`*.spec.test.tsx`)는 생성 이후 수정 금지. 테스트가 실패하면 구현을 수정합니다.
