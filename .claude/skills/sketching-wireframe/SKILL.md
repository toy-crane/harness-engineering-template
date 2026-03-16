---
name: sketching-wireframe
description: spec을 기반으로 HTML 와이어프레임을 생성합니다. Tailwind + 시스템 monospace로 시각적 레이아웃을 빠르게 검증합니다. "/sketching-wireframe", "와이어프레임", "wireframe", "layout", "레이아웃 검증", "UI 구성", "화면 설계", "목업" 등으로 실행합니다. spec.md가 있는 기능의 UI를 시각적으로 확인하고 싶을 때 사용하세요.
argument-hint: "feature 이름"
allowed-tools:
  - "Read"
  - "Write"
  - "Edit"
  - "Glob"
  - "Bash"
  - "AskUserQuestion"
---

# Wireframe: Spec → HTML 와이어프레임

UI 컴포넌트 추출과 사용자 흐름을 시각적으로 검증하기 위한 low-fidelity 와이어프레임을 생성한다.

## 전제 조건

1. `artifacts/<feature>/spec.md` 존재 확인. 없으면 "먼저 `/writing-spec <feature>`를 실행하세요." 출력 후 종료.
2. `artifacts/spec.yaml`에서 해당 feature의 시나리오를 확인한다.

## 화면 그룹핑

spec.md의 시나리오를 **시각적으로 구분되는 화면 상태**로 그룹핑하고 사용자에게 출력한 뒤, 바로 와이어프레임 생성으로 진행한다.

**그룹핑 원칙:**
- 한 화면 = 사용자가 한 순간에 보는 전체 화면. 개별 액션 단위로 쪼개지 않는다
- 같은 레이아웃의 상태 변화(입력 중, 편집 중 등)는 별도 화면으로 분리하되 전체 레이아웃을 유지한다
- 오버레이는 독립 화면으로 분리한다

**출력 형식:**
```
N개 화면으로 구성합니다:
1. 화면 이름 — FEATURE-001, 002, 003
   ↳ 반응형: 3칼럼 그리드 → 단일 칼럼 스택
2. 화면 이름 — FEATURE-004, 005
   ↳ 반응형: sidebar → bottom sheet
3. 화면 이름 — FEATURE-006
   ↳ 반응형: 변환 없음
```

## 와이어프레임 생성

- 입력: `assets/template.html`, `references/style-guide.md`
- 출력: `artifacts/<feature>/wireframe.html`

### 고유 규칙

- Screen Notes에 관련 시나리오 ID(예: KANBAN-001)를 명시적으로 참조한다
- spec.md에서 구체적인 예시 데이터를 사용한다

### 피드백 루프

1. 피드백 서버를 백그라운드로 실행한다:
   ```
   Bash(run_in_background): bun run .claude/skills/sketching-wireframe/assets/feedback-server.ts <feature>
   ```
2. 브라우저에서 연다: `open http://localhost:3456`
3. 실시간 피드백 루프 (유저가 터미널에 입력할 때까지 자동 반복):
   - `curl -s http://localhost:3456/api/next-feedback`로 블로킹 대기
   - 피드백 수신 → wireframe.html 수정
   - spec 변경이 필요하면 사용자 승인 후 `spec.md`와 `spec.yaml`을 함께 반영 (spec-schema.yaml 형식)
   - `curl -s -X POST http://localhost:3456/api/reload`로 브라우저 리로드
   - 위 과정 반복 (유저가 터미널에 입력하면 루프 종료)

## 완료

완료 후 사용자에게 `/writing-plan <feature>` 진행 여부를 물어본다.
