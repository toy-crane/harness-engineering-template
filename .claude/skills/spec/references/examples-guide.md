# examples 작성 가이드

## expect에 허용되는 값

화면에서 직접 확인(assert)할 수 있는 값만 쓴다.

| 유형 | 예시 |
|---|---|
| 화면 텍스트 | `{ message: "할 일이 추가되었습니다" }` |
| 요소 개수 | `{ cardCount: 3 }` |
| 존재 여부 | `{ deleteButton: true }` |
| 입력 필드 값 | `{ titleField: "회의록 작성" }` |
| CSS 상태 | `{ status: "completed", opacity: "0.5" }` |
| 목록/순서 | `{ columns: ["To Do", "In Progress", "Done"] }` |

## expect에 금지되는 값

| 유형 | 이유 |
|---|---|
| 내부 상태 (state, store) | 사용자가 화면에서 확인 불가 |
| 함수 호출 여부 | 구현 종속적 |
| DB/API 원본 데이터 | 화면이 아닌 서버 내부 값 |

## Good/Bad 예시

### Good

```yaml
examples:
  - input: { title: "우유 사기" }
    expect: { itemText: "우유 사기", itemCount: 1 }
  - input: { title: "" }
    expect: { errorMessage: "제목을 입력해주세요" }
```

### Bad

```yaml
examples:
  # Bad: 내부 상태를 expect로 사용
  - input: { title: "우유 사기" }
    expect: { todos: [{ id: 1, title: "우유 사기", done: false }] }
  # Bad: 함수 호출 여부를 expect로 사용
  - input: { title: "우유 사기" }
    expect: { addTodoCalled: true, apiResponse: 201 }
```
