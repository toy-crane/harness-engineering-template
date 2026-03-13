---
description: spec.yaml(불변 계약)을 수정할 때 적용되는 보호 규칙
globs:
  - "artifacts/spec.yaml"
---

# Spec YAML Guard

`artifacts/spec.yaml`은 전체 앱의 행동을 정의하는 **불변 계약**이다.

## 원칙

- `/spec` 스킬 실행 시에만 시나리오를 추가한다
- 기존 시나리오의 수정/삭제는 사용자 승인 없이 하지 않는다
- 구현이 spec.yaml과 맞지 않으면, **구현을 수정**한다

## 금지 사항

- 구현 편의를 위해 examples의 expect 값을 변경하는 것
- 테스트를 통과시키기 위해 시나리오를 삭제하거나 수정하는 것
- `/spec` 스킬 외의 맥락에서 spec.yaml을 수정하는 것
