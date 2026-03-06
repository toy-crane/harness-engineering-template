---
feature: kanban-todo
total_screens: 4
generated: 0
---
# Screen Plan: kanban-todo

### 01-board-default
- **Title:** 칸반 보드 기본 상태
- **Scenarios:** 1. 카드 추가, 4. 드래그 앤 드롭으로 칼럼 이동
- **Description:** 3개 칼럼(Todo, In Progress, Done)이 나란히 배치된 칸반 보드. 각 칼럼에 우선순위(High=빨강, Medium=노랑, Low=초록) 배지와 태그가 달린 카드 2-3장씩 표시. Todo 칼럼 하단에 "새 카드 추가" 입력 영역. 상단 헤더에 앱 제목, 검색바, 필터 드롭다운, 다크모드 토글 배치.
- **Mode:** light
- **Status:** [ ] pending

### 02-card-edit-delete
- **Title:** 카드 편집 및 삭제 확인
- **Scenarios:** 2. 카드 인라인 편집, 3. 카드 삭제
- **Description:** 보드 위에 하나의 카드가 인라인 편집 모드로 열려있는 상태. 제목이 편집 가능한 입력 필드로 변환되고, 우선순위 셀렉트와 태그 입력이 보임. 동시에 다른 카드에 대한 삭제 확인 AlertDialog가 오버레이로 표시.
- **Mode:** light
- **Status:** [ ] pending

### 03-search-filter
- **Title:** 검색 및 필터 활성 상태
- **Scenarios:** 5. 검색 및 필터링
- **Description:** 상단 검색바에 "버그"라는 검색어가 입력된 상태. 우선순위 필터가 "High"로 선택됨. 조건에 맞는 카드만 표시되고 나머지 카드는 숨겨져 칼럼이 일부 비어있는 모습. 활성 필터를 해제할 수 있는 UI 표시.
- **Mode:** light
- **Status:** [ ] pending

### 04-board-dark
- **Title:** 다크 모드 칸반 보드
- **Scenarios:** 6. 다크모드 토글
- **Description:** 01-board-default와 동일한 구조이되, 다크 모드 테마가 적용된 전체 보드. 다크 배경(Near-Black #0A0A0A), 카드 배경(Ink Black #171717), 텍스트(Near-White Smoke #FAFAFA). 다크모드 토글이 활성 상태.
- **Mode:** dark
- **Status:** [ ] pending
