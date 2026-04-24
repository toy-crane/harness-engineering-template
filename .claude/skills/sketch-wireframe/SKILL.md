---
name: sketch-wireframe
description: spec.md를 기반으로 HTML 와이어프레임을 생성한다. 새 화면·새 레이아웃·화면 간 흐름이 포함된 UI feature에서 사용한다. 서버·데이터 전용 변경, 단일 카피 변경, 토글 상태만 바꾸는 변경, 비UI feature에는 쓰지 않는다. 레이아웃을 시각적으로 검증하고 피드백 루프를 돈다. "/sketch-wireframe", "wireframe", "와이어프레임", "레이아웃 확인"으로도 호출한다.
argument-hint: "feature name"
---

# Wireframe: Spec → HTML Wireframe

## 와이어프레임이란

컴포넌트 배치, 정보 계층, 화면 간 흐름을 검증하는 도구. 시각 디자인(색상, 테마), 비즈니스 로직, 기술 동작을 검증하는 도구는 아니다.

## 제약

- feature의 시나리오를 `artifacts/<feature>/spec.md`에서 읽는다. 파일이 없으면 "`/write-spec <feature>`를 먼저 실행하세요." 출력 후 중단
- spec.md를 직접 수정하지 않는다. 변경이 필요하면 wireframe을 멈추고 `/write-spec`으로 돌아간다

## 스타일

- **5개의 CSS 변수** (`--w-bg`, `--w-border`, `--w-text`, `--w-muted`, `--w-fill`)와 텍스트·레이블로 상태를 구분한다. 그 외 색상은 쓰지 않는다. **왜**: wireframe은 시각 디자인이 아니라 구조를 검증한다. 팔레트를 미니멀하게 고정해야 사용자의 주의가 레이아웃과 정보 계층으로 집중된다
- **Mobile-first, Tailwind v4 utilities만**. `@container` + `@md:` prefix로 반응형. **왜**: 프로젝트의 실제 구현 스택과 동일하므로 확정된 wireframe의 유틸리티를 거의 그대로 plan 단계로 옮길 수 있다
- Lucide 아이콘: `<i data-lucide="icon-name"></i>`
- 시스템 monospace 폰트
- 커스텀 클래스가 필요하면 `<style>` 블록에 `w-` prefix로 추가

## Step 1: 기존 화면과 참조 자료 확인

프로젝트에 기존 구현이 있으면 관련 컴포넌트 코드를 읽어 레이아웃 구조를 파악한다. 기존 화면에 요소를 추가하는 경우 기존 레이아웃을 바탕으로 와이어프레임을 만든다.

`artifacts/<feature>/references/` 디렉토리에 참조 이미지가 있으면 읽는다. 이미지에서 레이아웃 구조(컴포넌트 배치, 정보 계층, 화면 분할 방식)를 추출해 Step 2의 와이어프레임 생성에 적용한다. 시각 디자인(색상, 폰트, 그림자 등)은 무시하고 구조만 참조한다.

## Step 2: Base Screens

1. 이 스킬의 `assets/template.html`을 읽어 HTML 보일러플레이트를 얻는다
2. template.html 주석의 삽입 패턴(`NAV_BUTTONS`, `SCREEN_CONTENT`)을 따라 base 화면들을 생성한다
3. 각 화면 하단에 Screen Notes를 쓴다 — 트리거(진입 조건), 인터랙션(핵심 행동), 전환(다른 화면으로 이동하는 조건)

### Screen Notes 예시

좋음:
```
트리거: 로그인 성공 직후 진입
인터랙션: 상단 "새 할 일" 버튼 클릭 → 입력 폼 표시 / 리스트 항목 클릭 → 상세 화면 전환
전환: "로그아웃" 클릭 → 로그인 화면으로 이동
```

나쁨 (비즈니스 로직·유효성 규칙이 섞임):
```
트리거: 로그인 성공 직후 진입
인터랙션: "새 할 일" 제출 시 제목이 빈 문자열이면 에러, 100자 초과면 에러, 중복이면 경고 dialog 표시
```
(유효성 규칙은 spec.md 소관)

출력: `artifacts/<feature>/wireframe.html`

서버 시작: `Bash(run_in_background): bunx vite artifacts/<feature> --port=3456`. 3456 포트가 점유 중이면 Vite가 다음 빈 포트로 자동 이동한다 — 백그라운드 출력에서 실제 `Local:` URL을 확인해 사용한다.

### 피드백 루프

- 사용자에게 `http://localhost:<actual-port>/wireframe.html` 확인 안내 (Mobile/Desktop 토글 양쪽 검증)
- 사용자 피드백을 받아 wireframe.html을 수정한다

레이아웃이 확정되면 Step 3으로 넘어간다.

## Step 3: Scenario Screens

확정된 레이아웃 위에 나머지 시나리오를 탭으로 추가한다.

### 새 화면 vs 기존 화면 매핑

- **새 요소 배치·레이아웃 구조가 필요한 시나리오** → 새 화면으로 만든다
- **기존 화면과 데이터·상태만 다른 시나리오** → 시나리오 번호를 해당 화면의 `data-scenario`에 매핑한다

판정 예시:

| 시나리오 차이 | 판정 |
|---|---|
| 빈 리스트 → 항목 3개 있는 리스트 | 기존 화면 재사용 (`data-scenario` 매핑) |
| 모바일 1컬럼 → 데스크톱 사이드바 + 본문 2컬럼 | 새 화면 (레이아웃 구조가 다름) |
| 제목 에러 상태 → 에러 텍스트 노출 | 기존 화면 재사용 |
| 일반 리스트 → 필터·검색 UI 추가된 리스트 | 새 화면 (새 요소 배치) |

### 규칙

- 시나리오 번호는 `data-scenario` 속성에 `scenario-N` 형식으로 지정한다 (본문 텍스트에 번호를 쓰지 않는다)
- 각 시나리오의 성공 기준에 있는 구체적 값을 예시 데이터로 사용한다
- Screen Notes: 화면 흐름만 쓴다 (진입 조건, 전환, 요소 역할). 유효성 규칙과 비즈니스 로직은 spec.md에 속한다

Step 2의 **피드백 루프**를 같은 방식으로 적용해 검증한다.

## Step 4: Coverage 검증

spec.md에서 시각적 변경이 있는 모든 시나리오가 wireframe 화면에 포함되었는지 점검한다. 누락된 것을 사용자에게 보고한다. 비시각적 시나리오(데이터 저장, 유효성 로직 등)는 wireframe 커버리지 대상이 아니다.

## Done

완료 후 사용자에게 `/draft-plan <feature>`로 진행할지 묻는다.
