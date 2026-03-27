---
name: sketch-wireframe
description: spec.yaml 기반 HTML 와이어프레임을 생성한다. 레이아웃을 시각적으로 확인하고 피드백 루프를 돌린다. UI 기능이 포함된 프로젝트에서만 사용. "/sketch-wireframe", "와이어프레임", "wireframe", "레이아웃 확인" 등으로 실행.
argument-hint: "feature 이름"
---

# Wireframe: Spec → HTML 와이어프레임

레이아웃 검증이 목적이다. 디자인이 아니다.

## 전제 조건

`spec.yaml`에서 해당 feature의 시나리오를 확인한다. 없으면 "먼저 `/write-spec`을 실행하세요." 출력 후 종료.

## 스타일 규칙

- 색상 5개: `#f5f5f5`(배경), `#ccc`(테두리), `#555`(텍스트), `#aaa`(보조), `#eee`(필드)
- Tailwind 유틸리티만 사용
- 모든 `<input>`, `<select>`, `<button>`에 `disabled`
- Lucide 아이콘(`data-lucide` 속성)
- 시스템 monospace 폰트

이 규칙 외의 색상, 폰트, 스타일을 사용하지 않는다.

## Step 1: 기존 화면 확인

프로젝트에 실행 가능한 앱이 있으면, 관련 화면의 현재 구현을 확인한다. 기존 화면에 요소를 추가하는 경우, 기존 레이아웃을 기반으로 wireframe을 만든다.

## Step 2: 화면 그룹핑

spec.yaml의 시나리오를 시각적으로 구분되는 화면 상태로 그룹핑하고 사용자에게 출력한다.
첫 번째 화면은 항상 기본 화면(시나리오 매핑 없음)으로 고정한다.

```
N개 화면으로 구성합니다:
1. 기본 화면 -- (시나리오 없음)
   대표 데이터가 채워진 평상시 모습
2. 화면 이름 -- FEATURE-001, 002
3. 화면 이름 -- FEATURE-003
```

## Step 3: 기본 화면

기본 화면을 상호작용 없는 기본 상태로 생성한다.

출력: `artifacts/<feature>/wireframe.html`

Vite dev server를 실행하고 피드백을 받는다:
```
Bash(run_in_background): bunx vite artifacts/<feature> --port=3456
open http://localhost:3456/wireframe.html
```

피드백 루프:
- 사용자가 자연어로 피드백 → wireframe.html 수정
- **spec 변경이 필요하면 wireframe을 중단하고 `/write-spec`으로 돌아간다. wireframe에서 spec.yaml을 직접 수정하지 않는다.**

레이아웃이 확정되면 Step 4로 진행한다.

## Step 4: 시나리오 화면

확정된 레이아웃 위에 나머지 시나리오별 화면을 추가한다.
- 각 화면에 시나리오 ID를 명시적으로 참조한다
- spec.yaml의 examples에서 구체적 데이터를 사용한다

동일한 피드백 루프로 검증한다.

## Step 5: 커버리지 검증

spec.yaml의 모든 시나리오 ID가 wireframe 화면에서 참조되었는지 확인한다. 누락된 시나리오가 있으면 사용자에게 보고하고, 화면에 추가할지 확인한다.

## 완료

완료 후 사용자에게 `/draft-plan <feature>` 진행 여부를 물어본다.
