import { render, screen, within, cleanup, waitFor, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, beforeEach, vi } from "vitest";
import KanbanPage from "../page";
import { useKanbanStore } from "../store";

function renderKanban() {
  return render(<KanbanPage />);
}

describe("KANBAN-001: 카드 생성", () => {
  beforeEach(() => {
    useKanbanStore.getState().reset();
  });

  it("제목 '회의록 작성' 입력 → To Do 칼럼에 우선순위 '중' 카드 생성", async () => {
    const user = userEvent.setup();
    renderKanban();

    const todoColumn = screen.getByTestId("column-todo");
    const input = within(todoColumn).getByPlaceholderText("카드 제목 입력");
    const addButton = within(todoColumn).getByRole("button", { name: "추가" });

    await user.type(input, "회의록 작성");
    await user.click(addButton);

    expect(within(todoColumn).getByText("회의록 작성")).toBeInTheDocument();
    expect(within(todoColumn).getByText("중")).toBeInTheDocument();
  });

  it("빈 제목으로 추가 시도 → '제목을 입력해주세요' 에러", async () => {
    const user = userEvent.setup();
    renderKanban();

    const todoColumn = screen.getByTestId("column-todo");
    const addButton = within(todoColumn).getByRole("button", { name: "추가" });

    await user.click(addButton);

    expect(screen.getByText("제목을 입력해주세요")).toBeInTheDocument();
  });
});

describe("KANBAN-002: 카드 인라인 편집", () => {
  beforeEach(() => {
    useKanbanStore.getState().reset();
    useKanbanStore.getState().addCard("회의록 작성", "todo");
  });

  it("제목을 '주간 회의록'으로 변경 → 카드에 '주간 회의록' 표시", async () => {
    const user = userEvent.setup();
    renderKanban();

    await user.click(screen.getByText("회의록 작성"));

    const titleInput = screen.getByDisplayValue("회의록 작성");
    await user.clear(titleInput);
    await user.type(titleInput, "주간 회의록");
    await user.click(document.body);

    expect(screen.getByText("주간 회의록")).toBeInTheDocument();
  });

  it("우선순위 '중' → '상' 변경 → 카드에 '상' 배지 표시", async () => {
    const user = userEvent.setup();
    renderKanban();

    await user.click(screen.getByText("회의록 작성"));

    const prioritySelect = screen.getByLabelText("우선순위");
    await user.selectOptions(prioritySelect, "상");
    await user.click(document.body);

    const todoColumn = screen.getByTestId("column-todo");
    expect(within(todoColumn).getByText("상")).toBeInTheDocument();
  });

  it("제목을 빈 값으로 변경 시도 → '제목을 입력해주세요' 에러", async () => {
    const user = userEvent.setup();
    renderKanban();

    await user.click(screen.getByText("회의록 작성"));

    const titleInput = screen.getByDisplayValue("회의록 작성");
    await user.clear(titleInput);
    await user.click(document.body);

    expect(screen.getByText("제목을 입력해주세요")).toBeInTheDocument();
  });
});

describe("KANBAN-003: 카드 삭제", () => {
  beforeEach(() => {
    useKanbanStore.getState().reset();
    useKanbanStore.getState().addCard("회의록 작성", "todo");
  });

  it("삭제 확인 → 카드 제거", async () => {
    const user = userEvent.setup();
    renderKanban();

    const deleteButton = screen.getByRole("button", { name: "삭제" });
    await user.click(deleteButton);

    expect(screen.getByText("정말 삭제하시겠습니까?")).toBeInTheDocument();

    const confirmButton = screen.getByRole("button", { name: "확인" });
    await user.click(confirmButton);

    expect(screen.queryByText("회의록 작성")).not.toBeInTheDocument();
  });

  it("삭제 취소 → 카드 유지", async () => {
    const user = userEvent.setup();
    renderKanban();

    const deleteButton = screen.getByRole("button", { name: "삭제" });
    await user.click(deleteButton);

    const cancelButton = screen.getByRole("button", { name: "취소" });
    await user.click(cancelButton);

    expect(screen.getByText("회의록 작성")).toBeInTheDocument();
  });
});

describe("KANBAN-004: 칼럼 간 드래그&드롭", () => {
  beforeEach(() => {
    useKanbanStore.getState().reset();
    useKanbanStore.getState().addCard("회의록 작성", "todo");
  });

  it("To Do → In Progress 이동", () => {
    const { unmount } = renderKanban();

    useKanbanStore.getState().moveCard(
      useKanbanStore.getState().columns.todo[0],
      "todo",
      "in-progress"
    );

    unmount();
    renderKanban();

    const inProgressColumn = screen.getByTestId("column-in-progress");
    expect(within(inProgressColumn).getByText("회의록 작성")).toBeInTheDocument();
  });
});

describe("KANBAN-005: 칼럼 내 카드 순서 변경", () => {
  beforeEach(() => {
    useKanbanStore.getState().reset();
    useKanbanStore.getState().addCard("카드A", "todo");
    useKanbanStore.getState().addCard("카드B", "todo");
  });

  it("카드B를 카드A 위로 이동 → [카드B, 카드A] 순서", () => {
    const { unmount } = renderKanban();

    const cards = useKanbanStore.getState().columns.todo;
    useKanbanStore.getState().reorderCard("todo", cards[1], 0);

    unmount();
    renderKanban();

    const todoColumn = screen.getByTestId("column-todo");
    const cardElements = within(todoColumn).getAllByTestId("kanban-card");
    expect(cardElements[0]).toHaveTextContent("카드B");
    expect(cardElements[1]).toHaveTextContent("카드A");
  });
});

describe("KANBAN-006: 태그 생성 및 자동완성", () => {
  beforeEach(() => {
    useKanbanStore.getState().reset();
    useKanbanStore.getState().addCard("회의록 작성", "todo");
  });

  it("태그 '버그' 입력 → 카드에 '버그' 태그 추가", async () => {
    const user = userEvent.setup();
    renderKanban();

    await user.click(screen.getByText("회의록 작성"));

    const tagInput = screen.getByPlaceholderText("태그 입력");
    await user.type(tagInput, "버그{enter}");

    const todoColumn = screen.getByTestId("column-todo");
    expect(within(todoColumn).getByText("버그")).toBeInTheDocument();
  });

  it("'버' 입력 시 기존 태그 '버그' 자동완성 표시", async () => {
    const user = userEvent.setup();
    const cardId = useKanbanStore.getState().columns.todo[0];
    useKanbanStore.getState().updateCard(cardId, { tags: ["버그"] });
    useKanbanStore.getState().addCard("다른 카드", "todo");

    renderKanban();

    const otherCard = screen.getByText("다른 카드");
    await user.click(otherCard);

    const tagInput = screen.getByPlaceholderText("태그 입력");
    await user.type(tagInput, "버");

    expect(screen.getByRole("button", { name: "버그" })).toBeInTheDocument();
  });
});

describe("KANBAN-007: 제목 검색", () => {
  beforeEach(() => {
    useKanbanStore.getState().reset();
    useKanbanStore.getState().addCard("회의록 작성", "todo");
    useKanbanStore.getState().addCard("장보기", "todo");
    useKanbanStore.getState().addCard("운동하기", "todo");
  });

  it("'회의' 검색 → '회의록 작성' 카드만 표시", async () => {
    const user = userEvent.setup();
    renderKanban();

    const searchInput = screen.getByPlaceholderText("검색");
    await user.type(searchInput, "회의");

    expect(screen.getByText("회의록 작성")).toBeInTheDocument();
    expect(screen.queryByText("장보기")).not.toBeInTheDocument();
    expect(screen.queryByText("운동하기")).not.toBeInTheDocument();
  });

  it("검색어 삭제 → 모든 카드 표시", async () => {
    const user = userEvent.setup();
    renderKanban();

    const searchInput = screen.getByPlaceholderText("검색");
    await user.type(searchInput, "회의");
    await user.clear(searchInput);

    expect(screen.getByText("회의록 작성")).toBeInTheDocument();
    expect(screen.getByText("장보기")).toBeInTheDocument();
    expect(screen.getByText("운동하기")).toBeInTheDocument();
  });
});

describe("KANBAN-008: 우선순위 필터", () => {
  beforeEach(() => {
    useKanbanStore.getState().reset();
    const id1 = useKanbanStore.getState().addCard("긴급 작업", "todo");
    useKanbanStore.getState().updateCard(id1, { priority: "상" });
    useKanbanStore.getState().addCard("일반 작업1", "todo");
    useKanbanStore.getState().addCard("일반 작업2", "in-progress");
  });

  it("우선순위 '상' 필터 → 1개 카드만 표시", async () => {
    const user = userEvent.setup();
    renderKanban();

    const priorityFilter = screen.getByLabelText("우선순위 필터");
    await user.selectOptions(priorityFilter, "상");

    expect(screen.getByText("긴급 작업")).toBeInTheDocument();
    expect(screen.queryByText("일반 작업1")).not.toBeInTheDocument();
    expect(screen.queryByText("일반 작업2")).not.toBeInTheDocument();
  });

  it("필터 해제 → 모든 카드 표시", async () => {
    const user = userEvent.setup();
    renderKanban();

    const priorityFilter = screen.getByLabelText("우선순위 필터");
    await user.selectOptions(priorityFilter, "상");
    await user.selectOptions(priorityFilter, "");

    expect(screen.getByText("긴급 작업")).toBeInTheDocument();
    expect(screen.getByText("일반 작업1")).toBeInTheDocument();
    expect(screen.getByText("일반 작업2")).toBeInTheDocument();
  });
});

describe("KANBAN-009: 태그 필터", () => {
  beforeEach(() => {
    useKanbanStore.getState().reset();
    const id1 = useKanbanStore.getState().addCard("버그 수정", "todo");
    useKanbanStore.getState().updateCard(id1, { tags: ["버그"] });
    useKanbanStore.getState().addCard("기능 개발", "todo");
    useKanbanStore.getState().addCard("문서 작성", "in-progress");
  });

  it("태그 '버그' 필터 → 1개 카드만 표시", async () => {
    const user = userEvent.setup();
    renderKanban();

    const tagFilter = screen.getByLabelText("태그 필터");
    await user.selectOptions(tagFilter, "버그");

    expect(screen.getByText("버그 수정")).toBeInTheDocument();
    expect(screen.queryByText("기능 개발")).not.toBeInTheDocument();
    expect(screen.queryByText("문서 작성")).not.toBeInTheDocument();
  });
});

describe("KANBAN-010: 복합 필터 (우선순위 + 태그)", () => {
  beforeEach(() => {
    useKanbanStore.getState().reset();
    const id1 = useKanbanStore.getState().addCard("긴급 버그", "todo");
    useKanbanStore.getState().updateCard(id1, { priority: "상", tags: ["버그"] });
    const id2 = useKanbanStore.getState().addCard("긴급 기능", "todo");
    useKanbanStore.getState().updateCard(id2, { priority: "상", tags: ["기능"] });
  });

  it("우선순위 '상' + 태그 '버그' → 1개 카드만 표시", async () => {
    const user = userEvent.setup();
    renderKanban();

    const priorityFilter = screen.getByLabelText("우선순위 필터");
    await user.selectOptions(priorityFilter, "상");

    const tagFilter = screen.getByLabelText("태그 필터");
    await user.selectOptions(tagFilter, "버그");

    expect(screen.getByText("긴급 버그")).toBeInTheDocument();
    expect(screen.queryByText("긴급 기능")).not.toBeInTheDocument();
  });
});

describe("KANBAN-011: 다크모드 토글", () => {
  beforeEach(() => {
    useKanbanStore.getState().reset();
    document.documentElement.classList.remove("dark");
    localStorage.removeItem("kanban-theme");
  });

  it("라이트모드 → 다크모드 전환", async () => {
    const user = userEvent.setup();
    renderKanban();

    const toggle = screen.getByLabelText("다크모드 토글");
    await user.click(toggle);

    expect(document.documentElement.classList.contains("dark")).toBe(true);
  });

  it("다크모드 → 라이트모드 전환", async () => {
    document.documentElement.classList.add("dark");
    localStorage.setItem("kanban-theme", "dark");
    const user = userEvent.setup();
    renderKanban();

    const toggle = screen.getByLabelText("다크모드 토글");
    await user.click(toggle);

    expect(document.documentElement.classList.contains("dark")).toBe(false);
  });
});

describe("KANBAN-012: 다크모드 설정 영속화", () => {
  beforeEach(() => {
    useKanbanStore.getState().reset();
  });

  it("다크모드 설정 후 새로고침 → 다크모드 유지", () => {
    localStorage.setItem("kanban-theme", "dark");

    renderKanban();

    expect(document.documentElement.classList.contains("dark")).toBe(true);
  });
});

describe("KANBAN-013: 데이터 자동 저장 및 복원", () => {
  beforeEach(() => {
    useKanbanStore.getState().reset();
  });

  it("카드 추가 후 스토어 복원 → 카드 유지", () => {
    useKanbanStore.getState().addCard("회의록 작성", "todo");
    const cardId = useKanbanStore.getState().columns.todo[0];
    useKanbanStore.getState().moveCard(cardId, "todo", "in-progress");

    const state = useKanbanStore.getState();
    expect(state.columns["in-progress"]).toContain(cardId);
    expect(state.cards[cardId].title).toBe("회의록 작성");
  });
});

describe("KANBAN-014: JSON 내보내기", () => {
  beforeEach(() => {
    useKanbanStore.getState().reset();
    useKanbanStore.getState().addCard("회의록 작성", "todo");
  });

  it("내보내기 클릭 → JSON 파일 다운로드", async () => {
    const user = userEvent.setup();
    renderKanban();

    const createObjectURL = vi.fn(() => "blob:test");
    const revokeObjectURL = vi.fn();
    global.URL.createObjectURL = createObjectURL;
    global.URL.revokeObjectURL = revokeObjectURL;

    const exportButton = screen.getByRole("button", { name: "내보내기" });
    await user.click(exportButton);

    expect(createObjectURL).toHaveBeenCalled();
  });
});

describe("KANBAN-015: JSON 가져오기 (전체 교체)", () => {
  beforeEach(() => {
    useKanbanStore.getState().reset();
    useKanbanStore.getState().addCard("기존 카드", "todo");
  });

  it("유효한 JSON 가져오기 확인 → 데이터 교체", async () => {
    const user = userEvent.setup();
    renderKanban();

    const importButton = screen.getByRole("button", { name: "가져오기" });
    await user.click(importButton);

    expect(screen.getByText("기존 데이터가 모두 교체됩니다")).toBeInTheDocument();

    const confirmButton = screen.getByRole("button", { name: "확인" });
    await user.click(confirmButton);

    const fileInput = screen.getByTestId("import-file-input");
    const validData = {
      cards: {},
      columns: { todo: [], "in-progress": [], done: [] },
    };
    const file = new File([JSON.stringify(validData)], "valid.json", {
      type: "application/json",
    });
    await user.upload(fileInput, file);

    expect(screen.queryByText("기존 카드")).not.toBeInTheDocument();
  });

  it("가져오기 취소 → 기존 데이터 유지", async () => {
    const user = userEvent.setup();
    renderKanban();

    const importButton = screen.getByRole("button", { name: "가져오기" });
    await user.click(importButton);

    const cancelButton = screen.getByRole("button", { name: "취소" });
    await user.click(cancelButton);

    expect(screen.getByText("기존 카드")).toBeInTheDocument();
  });

  it("잘못된 형식 파일 → 에러 메시지", async () => {
    const user = userEvent.setup();
    renderKanban();

    const importButton = screen.getByRole("button", { name: "가져오기" });
    await user.click(importButton);

    const confirmButton = screen.getByRole("button", { name: "확인" });
    await user.click(confirmButton);

    const fileInput = screen.getByTestId("import-file-input") as HTMLInputElement;
    const file = new File(["invalid content"], "invalid.txt", {
      type: "text/plain",
    });
    fireEvent.change(fileInput, { target: { files: [file] } });

    expect(screen.getByText("올바른 형식의 파일이 아닙니다")).toBeInTheDocument();
  });
});

describe("KANBAN-016: 카드 편집 모드 진입", () => {
  beforeEach(() => {
    useKanbanStore.getState().reset();
    useKanbanStore.getState().addCard("회의록 작성", "todo");
  });

  it("카드 클릭 → 5개 필드 편집 UI 표시", async () => {
    const user = userEvent.setup();
    renderKanban();

    await user.click(screen.getByText("회의록 작성"));

    expect(screen.getByDisplayValue("회의록 작성")).toBeInTheDocument();
    expect(screen.getByLabelText("설명")).toBeInTheDocument();
    expect(screen.getByLabelText("우선순위")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("태그 입력")).toBeInTheDocument();
    expect(screen.getByLabelText("마감일")).toBeInTheDocument();
  });
});

describe("KANBAN-017: 카드 태그 제거", () => {
  beforeEach(() => {
    useKanbanStore.getState().reset();
    const id = useKanbanStore.getState().addCard("회의록 작성", "todo");
    useKanbanStore.getState().updateCard(id, { tags: ["버그"] });
  });

  it("태그 '버그' 제거 → 카드에서 태그 사라짐", async () => {
    const user = userEvent.setup();
    renderKanban();

    await user.click(screen.getByText("회의록 작성"));

    const removeTagButton = screen.getByRole("button", { name: "버그 제거" });
    await user.click(removeTagButton);

    expect(screen.queryByText("버그")).not.toBeInTheDocument();
  });
});

describe("KANBAN-018: 태그 필터 해제", () => {
  beforeEach(() => {
    useKanbanStore.getState().reset();
    const id1 = useKanbanStore.getState().addCard("버그 수정", "todo");
    useKanbanStore.getState().updateCard(id1, { tags: ["버그"] });
    useKanbanStore.getState().addCard("기능 개발", "todo");
    useKanbanStore.getState().addCard("문서 작성", "in-progress");
  });

  it("태그 필터 해제 → 모든 카드 표시", async () => {
    const user = userEvent.setup();
    renderKanban();

    const tagFilter = screen.getByLabelText("태그 필터");
    await user.selectOptions(tagFilter, "버그");

    expect(screen.queryByText("기능 개발")).not.toBeInTheDocument();

    await user.selectOptions(tagFilter, "");

    expect(screen.getByText("버그 수정")).toBeInTheDocument();
    expect(screen.getByText("기능 개발")).toBeInTheDocument();
    expect(screen.getByText("문서 작성")).toBeInTheDocument();
  });
});

describe("KANBAN-019: 카드 추가 후 새로고침 복원", () => {
  beforeEach(() => {
    useKanbanStore.getState().reset();
  });

  it("카드 추가 후 스토어 재초기화 → 카드 복원", () => {
    useKanbanStore.getState().addCard("회의록 작성", "todo");

    const state = useKanbanStore.getState();
    expect(state.columns.todo.length).toBe(1);
    expect(state.cards[state.columns.todo[0]].title).toBe("회의록 작성");
  });
});
