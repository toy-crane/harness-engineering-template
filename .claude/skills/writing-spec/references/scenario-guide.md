# 시나리오 작성 가이드

## 체크 기준

> "이 문장만 읽고 테스트 코드를 작성할 수 있는가?"

given/when/then과 examples의 expect 모두 **화면에서 확인 가능한 값**이라는 동일 원칙을 따른다.

---

## 1. given/when/then 작성 기준

### 필드별 기준표

| 필드 | 작성 기준 | 허용 | 금지 |
|---|---|---|---|
| given | 화면 상태, 데이터 개수, 적용된 조건 등 **관찰 가능한 전제** | "할 일 3개가 표시된 목록", "검색어 '우유'가 입력된 상태" | "todos 배열에 3개 존재", "isLoading이 true" |
| when | **구체적 UI 요소 + 동작** (클릭, 입력, 드래그 등) | "'삭제' 버튼을 클릭한다", "'제목' 입력란에 '회의록'을 입력한다" | "삭제 함수를 호출한다", "상태를 변경한다" |
| then | 화면에서 **단언 가능한 결과** | "'할 일 2개' 텍스트가 표시된다", "빈 목록 안내 문구가 나타난다" | "todos.length가 2이다", "API가 호출된다" |

### Good/Bad 예시

#### 단순 케이스

**Good:**
```yaml
given: "'제목' 입력란이 비어 있는 할 일 추가 폼"
when: "'추가' 버튼을 클릭한다"
then: "'제목을 입력해주세요' 오류 메시지가 표시된다"
```

**Bad:**
```yaml
# Bad: given이 내부 상태를 서술
given: "formState.title이 빈 문자열"
when: "submit 이벤트를 발생시킨다"
then: "validation error가 설정된다"
```

#### 복합 UI 케이스

**Good:**
```yaml
given: "'진행 중' 컬럼에 카드 3개가 표시된 칸반 보드"
when: "첫 번째 카드를 '완료' 컬럼으로 드래그한다"
then: "'진행 중' 컬럼에 카드 2개, '완료' 컬럼에 카드 1개가 표시된다"
```

**Bad:**
```yaml
# Bad: when이 구현 용어, then이 내부 상태
given: "칸반 보드가 렌더링된 상태"
when: "onDragEnd 핸들러가 실행된다"
then: "columns 상태가 업데이트된다"
```

---

## 2. examples 작성 기준

### expect에 허용되는 값

화면에서 직접 확인(assert)할 수 있는 값만 쓴다.

| 유형 | 예시 |
|---|---|
| 화면 텍스트 | `{ message: "할 일이 추가되었습니다" }` |
| 요소 개수 | `{ cardCount: 3 }` |
| 존재 여부 | `{ deleteButton: true }` |
| 입력 필드 값 | `{ titleField: "회의록 작성" }` |
| CSS 상태 | `{ status: "completed", opacity: "0.5" }` |
| 목록/순서 | `{ columns: ["To Do", "In Progress", "Done"] }` |

### expect에 금지되는 값

| 유형 | 이유 |
|---|---|
| 내부 상태 (state, store) | 사용자가 화면에서 확인 불가 |
| 함수 호출 여부 | 구현 종속적 |
| DB/API 원본 데이터 | 화면이 아닌 서버 내부 값 |

### Good/Bad 예시

#### Good

```yaml
examples:
  - input: { title: "우유 사기" }
    expect: { itemText: "우유 사기", itemCount: 1 }
  - input: { title: "" }
    expect: { errorMessage: "제목을 입력해주세요" }
```

#### Bad

```yaml
examples:
  # Bad: 내부 상태를 expect로 사용
  - input: { title: "우유 사기" }
    expect: { todos: [{ id: 1, title: "우유 사기", done: false }] }
  # Bad: 함수 호출 여부를 expect로 사용
  - input: { title: "우유 사기" }
    expect: { addTodoCalled: true, apiResponse: 201 }
```
