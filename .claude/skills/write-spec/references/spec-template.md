## Overview
이 feature가 해결하는 문제와 사용자에게 나타나는 관찰 가능한 변화를 1-2 문장으로 설명한다.

## Scope

### Included
- 이번에 사용자가 경험할 것

### Excluded
- 의도적으로 제외하는 것과 그 이유

## Scenarios

### 1. Scenario Title
- **Given** — 사용자나 시스템의 초기 상태
- **When** — 사용자가 취하는 행동
- **Then** — 관찰 가능한 결과

Success Criteria:
- [ ] 구체적 입력 → 관찰 가능한 출력 (UI, API 응답, 저장 상태)
- [ ] 구체적 입력 → 관찰 가능한 출력

### 2. Scenario Title
- **Given** — ...
- **When** — ...
- **Then** — ...

Success Criteria:
- [ ] ...

(3-5개 시나리오)

## Invariants (optional)
모든 시나리오에 걸쳐 유지되어야 하는 규칙. 전형적인 범주:
- **Security / privacy**: 접근 경로와 무관하게 누가 무엇을 볼 수 있는지에 관한 규칙
- **Performance**: 시스템 전반에 적용되는 응답 시간 또는 부하 임계값
- **Data consistency**: 어떤 작업 후에도 참이어야 하는 불변 규칙

이런 규칙이 없는 feature라면 이 섹션을 생략한다.

## Dependencies
이 작업을 시작하기 전에 존재해야 하는 feature나 외부 시스템. (환경 설정은 plan.md에 둔다. 여기가 아니다.)

## Undecided Items
- 질문했으나 사용자가 결정하지 못한 항목

---

## 작성 규칙

- **WHAT만, HOW는 없다.** 파일 경로, 테이블/컬럼명, 테스트 유형, 구현 라이브러리는 언급하지 않는다. 그런 결정은 plan.md에 속한다.
- **Success Criteria는 관찰 가능해야 한다.** 내부 상태, 함수 호출, DB 행 모양은 허용되지 않는다. 오직 사용자, API 소비자, 테스트 하네스가 외부에서 관찰할 수 있는 것만.
- **각 Success Criteria 항목은 최소 하나의 테스트 케이스에 매핑된다.** 구체적으로 쓴다 (플레이스홀더가 아니라 실제 값).
- **Excluded 항목에는 이유를 단다.** 미래의 독자가 왜 미뤘는지 이해해야 한다.
- **Undecided Items는 사용자가 명시적으로 결정하지 못한 항목만 기록한다.** 모호한 요구사항을 조용히 채우지 않는다.
