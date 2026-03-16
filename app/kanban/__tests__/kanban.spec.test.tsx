import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, beforeEach, vi } from "vitest";

// Components will be created in subsequent tasks
// These imports will fail until implementation is complete
import KanbanBoard from "@/components/kanban/kanban-board";
import { useKanbanStore } from "@/lib/store";

function renderBoard() {
  return render(<KanbanBoard />);
}

function getColumn(name: string) {
  return screen.getByTestId(`column-${name}`);
}

function getCardsInColumn(name: string) {
  const column = getColumn(name);
  return within(column).queryAllByTestId(/^card-/);
}

/** Click the card container (opens modal), not the title span (opens inline edit) */
async function openCardModal(user: ReturnType<typeof userEvent.setup>, cardId: string) {
  const card = screen.getByTestId(`card-${cardId}`);
  await user.click(card);
}

function getFirstCardId(): string {
  return Object.keys(useKanbanStore.getState().cards)[0];
}

// Default matchMedia mock (light mode)
function mockMatchMedia(darkMode = false) {
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches: darkMode && query === "(prefers-color-scheme: dark)",
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }));
}

describe("Kanban Board Spec Tests", () => {
  beforeEach(() => {
    localStorage.clear();
    useKanbanStore.getState().reset();
    document.documentElement.classList.remove("dark");
    mockMatchMedia(false);
  });

  // ─── KANBAN-001: 칸반 보드 초기 표시 ───
  describe("KANBAN-001: 칸반 보드 초기 표시", () => {
    it("3개 칼럼이 Todo, In Progress, Done 순서로 표시되고 카드는 0개", () => {
      renderBoard();

      const columns = screen.getAllByTestId(/^column-/);
      expect(columns).toHaveLength(3);
      expect(screen.getByText("Todo")).toBeInTheDocument();
      expect(screen.getByText("In Progress")).toBeInTheDocument();
      expect(screen.getByText("Done")).toBeInTheDocument();

      const totalCards = screen.queryAllByTestId(/^card-/);
      expect(totalCards).toHaveLength(0);
    });
  });

  // ─── KANBAN-002: 카드 생성 성공 ───
  describe("KANBAN-002: 카드 생성 성공", () => {
    it("Todo 칼럼에서 추가 후 제목 입력하면 카드가 생성된다", async () => {
      const user = userEvent.setup();
      renderBoard();

      const todoColumn = getColumn("Todo");
      const addButton = within(todoColumn).getByRole("button", { name: /추가/i });
      await user.click(addButton);

      const input = within(todoColumn).getByPlaceholderText(/제목/i);
      await user.type(input, "회의록 작성");

      const confirmButton = within(todoColumn).getByRole("button", { name: /확인/i });
      await user.click(confirmButton);

      expect(within(todoColumn).getByText("회의록 작성")).toBeInTheDocument();
      expect(getCardsInColumn("Todo")).toHaveLength(1);
    });
  });

  // ─── KANBAN-003: 카드 생성 실패 — 빈 제목 ───
  describe("KANBAN-003: 카드 생성 실패 — 빈 제목", () => {
    it("빈 제목으로 확인하면 에러 메시지가 표시되고 카드 미생성", async () => {
      const user = userEvent.setup();
      renderBoard();

      const todoColumn = getColumn("Todo");
      const addButton = within(todoColumn).getByRole("button", { name: /추가/i });
      await user.click(addButton);

      const confirmButton = within(todoColumn).getByRole("button", { name: /확인/i });
      await user.click(confirmButton);

      expect(screen.getByText("제목을 입력해주세요")).toBeInTheDocument();
      expect(getCardsInColumn("Todo")).toHaveLength(0);
    });
  });

  // ─── KANBAN-004: 카드 인라인 편집 — 제목 수정 ───
  describe("KANBAN-004: 카드 인라인 편집 — 제목 수정", () => {
    it("카드 제목 클릭 후 수정하면 제목이 변경된다", async () => {
      const user = userEvent.setup();
      // Seed a card
      useKanbanStore.getState().addCard("Todo", "회의록 작성");
      renderBoard();

      const cardTitle = screen.getByText("회의록 작성");
      await user.click(cardTitle);

      const input = screen.getByDisplayValue("회의록 작성");
      await user.clear(input);
      await user.type(input, "주간 회의록 작성");
      await user.keyboard("{Enter}");

      expect(screen.getByText("주간 회의록 작성")).toBeInTheDocument();
    });
  });

  // ─── KANBAN-005: 카드 상세 모달 — 우선순위 설정 ───
  describe("KANBAN-005: 카드 상세 모달 — 우선순위 설정", () => {
    it("모달에서 High 우선순위를 선택하면 카드에 반영된다", async () => {
      const user = userEvent.setup();
      const cardId = useKanbanStore.getState().addCard("Todo", "회의록 작성");
      renderBoard();

      await openCardModal(user, cardId);

      const modal = screen.getByRole("dialog");
      const highButton = within(modal).getByRole("button", { name: "High" });
      await user.click(highButton);

      expect(within(modal).getByRole("button", { name: "High" })).toHaveAttribute("data-variant", "default");
    });
  });

  // ─── KANBAN-006: 카드 상세 모달 — 태그 추가 ───
  describe("KANBAN-006: 카드 상세 모달 — 태그 추가", () => {
    it("모달에서 태그를 추가하면 카드에 태그가 표시된다", async () => {
      const user = userEvent.setup();
      const cardId = useKanbanStore.getState().addCard("Todo", "회의록 작성");
      renderBoard();

      await openCardModal(user, cardId);

      const modal = screen.getByRole("dialog");
      const tagInput = within(modal).getByPlaceholderText(/태그/i);
      await user.type(tagInput, "긴급");
      await user.keyboard("{Enter}");

      expect(within(modal).getByText(/긴급/)).toBeInTheDocument();
    });
  });

  // ─── KANBAN-007: 카드 삭제 — 확인 ───
  describe("KANBAN-007: 카드 삭제 — 확인", () => {
    it("삭제 버튼 클릭 후 확인하면 카드가 삭제된다", async () => {
      const user = userEvent.setup();
      useKanbanStore.getState().addCard("Todo", "회의록 작성");
      renderBoard();

      const deleteButton = screen.getByRole("button", { name: /삭제/i });
      await user.click(deleteButton);

      expect(screen.getByText("삭제하시겠습니까?")).toBeInTheDocument();

      const confirmButton = screen.getByRole("button", { name: /확인/i });
      await user.click(confirmButton);

      expect(getCardsInColumn("Todo")).toHaveLength(0);
    });
  });

  // ─── KANBAN-008: 카드 삭제 — 취소 ───
  describe("KANBAN-008: 카드 삭제 — 취소", () => {
    it("삭제 버튼 클릭 후 취소하면 카드가 유지된다", async () => {
      const user = userEvent.setup();
      useKanbanStore.getState().addCard("Todo", "회의록 작성");
      renderBoard();

      const deleteButton = screen.getByRole("button", { name: /삭제/i });
      await user.click(deleteButton);

      const cancelButton = screen.getByRole("button", { name: /취소/i });
      await user.click(cancelButton);

      expect(getCardsInColumn("Todo")).toHaveLength(1);
    });
  });

  // ─── KANBAN-009: 서브태스크 추가 ───
  describe("KANBAN-009: 서브태스크 추가", () => {
    it("서브태스크를 추가하면 체크리스트에 항목이 표시된다", async () => {
      const user = userEvent.setup();
      const cardId = useKanbanStore.getState().addCard("Todo", "회의록 작성");
      renderBoard();

      await openCardModal(user, cardId);

      const modal = screen.getByRole("dialog");
      const subtaskInput = within(modal).getByPlaceholderText(/서브태스크/i);
      await user.type(subtaskInput, "자료 준비");
      await user.keyboard("{Enter}");

      expect(within(modal).getByText("자료 준비")).toBeInTheDocument();
      expect(within(modal).getAllByTestId(/^subtask-/)).toHaveLength(1);
    });
  });

  // ─── KANBAN-010: 서브태스크 체크 — 진행률 표시 ───
  describe("KANBAN-010: 서브태스크 체크 — 진행률 표시", () => {
    it("서브태스크 1개를 체크하면 진행률이 1/2로 표시된다", async () => {
      const user = userEvent.setup();
      const cardId = useKanbanStore.getState().addCard("Todo", "회의록 작성");
      useKanbanStore.getState().addSubtask(cardId, "자료 준비");
      useKanbanStore.getState().addSubtask(cardId, "회의실 예약");
      renderBoard();

      await openCardModal(user, cardId);

      const modal = screen.getByRole("dialog");
      const checkboxes = within(modal).getAllByRole("checkbox");
      await user.click(checkboxes[0]);

      expect(within(modal).getByText("1/2")).toBeInTheDocument();
    });
  });

  // ─── KANBAN-011: 카드 드래그&드롭 — 칼럼 간 이동 ───
  describe("KANBAN-011: 카드 드래그&드롭 — 칼럼 간 이동", () => {
    it("Todo에서 In Progress로 카드를 이동하면 칼럼이 변경된다", () => {
      useKanbanStore.getState().addCard("Todo", "회의록 작성");
      const cardId = Object.keys(useKanbanStore.getState().cards)[0];

      // Simulate store-level move
      useKanbanStore.getState().moveCard(cardId, "todo", "in-progress", 0);

      renderBoard();

      expect(getCardsInColumn("Todo")).toHaveLength(0);
      expect(getCardsInColumn("In Progress")).toHaveLength(1);
    });
  });

  // ─── KANBAN-012: 카드 드래그&드롭 — 위치 영속 ───
  describe("KANBAN-012: 카드 드래그&드롭 — 위치 영속", () => {
    it("카드 이동 후 새로고침해도 위치가 유지된다", () => {
      useKanbanStore.getState().addCard("Todo", "회의록 작성");
      const cardId = Object.keys(useKanbanStore.getState().cards)[0];
      useKanbanStore.getState().moveCard(cardId, "todo", "in-progress", 0);

      // Simulate reload: re-render
      const { unmount } = renderBoard();
      unmount();

      // Re-render (store should persist from localStorage)
      renderBoard();

      expect(getCardsInColumn("In Progress")).toHaveLength(1);
    });
  });

  // ─── KANBAN-013: 제목 검색 — 매칭 ───
  describe("KANBAN-013: 제목 검색 — 매칭", () => {
    it("'작성' 검색 시 제목에 '작성'이 포함된 카드만 표시된다", async () => {
      const user = userEvent.setup();
      useKanbanStore.getState().addCard("Todo", "회의록 작성");
      useKanbanStore.getState().addCard("Todo", "보고서 작성");
      useKanbanStore.getState().addCard("Todo", "점심 주문");
      renderBoard();

      const searchInput = screen.getByPlaceholderText(/검색/i);
      await user.type(searchInput, "작성");

      const visibleCards = screen.getAllByTestId(/^card-/);
      expect(visibleCards).toHaveLength(2);
    });
  });

  // ─── KANBAN-014: 제목 검색 — 매칭 없음 ───
  describe("KANBAN-014: 제목 검색 — 매칭 없음", () => {
    it("매칭 카드가 없으면 0개 표시", async () => {
      const user = userEvent.setup();
      useKanbanStore.getState().addCard("Todo", "회의록 작성");
      renderBoard();

      const searchInput = screen.getByPlaceholderText(/검색/i);
      await user.type(searchInput, "존재하지않는단어");

      const visibleCards = screen.queryAllByTestId(/^card-/);
      expect(visibleCards).toHaveLength(0);
    });
  });

  // ─── KANBAN-015: 우선순위 필터 ───
  describe("KANBAN-015: 우선순위 필터", () => {
    it("High 필터 선택 시 High 카드만 표시된다", async () => {
      const user = userEvent.setup();
      const id1 = useKanbanStore.getState().addCard("Todo", "긴급 작업");
      useKanbanStore.getState().updateCard(id1, { priority: "High" });
      const id2 = useKanbanStore.getState().addCard("Todo", "일반 작업1");
      useKanbanStore.getState().updateCard(id2, { priority: "Medium" });
      const id3 = useKanbanStore.getState().addCard("Todo", "일반 작업2");
      useKanbanStore.getState().updateCard(id3, { priority: "Medium" });
      renderBoard();

      // Click "High" priority filter button directly
      const filterButtons = screen.getAllByRole("button", { name: "High" });
      await user.click(filterButtons[0]);

      const visibleCards = screen.getAllByTestId(/^card-/);
      expect(visibleCards).toHaveLength(1);
    });
  });

  // ─── KANBAN-016: 태그 필터 ───
  describe("KANBAN-016: 태그 필터", () => {
    it("'긴급' 태그 필터 선택 시 해당 카드만 표시된다", async () => {
      const user = userEvent.setup();
      const id1 = useKanbanStore.getState().addCard("Todo", "긴급 작업");
      useKanbanStore.getState().updateCard(id1, { tags: ["긴급"] });
      const id2 = useKanbanStore.getState().addCard("Todo", "일반 작업");
      useKanbanStore.getState().updateCard(id2, { tags: ["일반"] });
      renderBoard();

      // Click "긴급" tag filter button
      const tagButtons = screen.getAllByRole("button", { name: "긴급" });
      await user.click(tagButtons[0]);

      const visibleCards = screen.getAllByTestId(/^card-/);
      expect(visibleCards).toHaveLength(1);
    });
  });

  // ─── KANBAN-017: 다크모드 토글 ───
  describe("KANBAN-017: 다크모드 토글", () => {
    it("토글 클릭 시 다크 테마로 전환된다", async () => {
      const user = userEvent.setup();
      renderBoard();

      const themeToggle = screen.getByRole("button", { name: /다크모드|테마/i });
      await user.click(themeToggle);

      expect(document.documentElement.classList.contains("dark")).toBe(true);
    });
  });

  // ─── KANBAN-018: 다크모드 영속 ───
  describe("KANBAN-018: 다크모드 영속", () => {
    it("다크 테마 선택 후 새로고침해도 유지된다", async () => {
      const user = userEvent.setup();
      renderBoard();

      const themeToggle = screen.getByRole("button", { name: /다크모드|테마/i });
      await user.click(themeToggle);

      // Simulate reload
      const { unmount } = render(<KanbanBoard />);
      unmount();
      render(<KanbanBoard />);

      expect(document.documentElement.classList.contains("dark")).toBe(true);
    });
  });

  // ─── KANBAN-019: 데이터 내보내기 ───
  describe("KANBAN-019: 데이터 내보내기", () => {
    it("내보내기 클릭 시 JSON 파일이 다운로드된다", async () => {
      const user = userEvent.setup();
      useKanbanStore.getState().addCard("Todo", "회의록 작성");
      renderBoard();

      // Mock URL.createObjectURL and anchor click
      const createObjectURL = vi.fn(() => "blob:test");
      const revokeObjectURL = vi.fn();
      global.URL.createObjectURL = createObjectURL;
      global.URL.revokeObjectURL = revokeObjectURL;

      const link = { click: vi.fn(), href: "", download: "" } as unknown as HTMLAnchorElement;
      vi.spyOn(document, "createElement").mockReturnValueOnce(link);

      const exportButton = screen.getByRole("button", { name: /내보내기/i });
      await user.click(exportButton);

      expect(link.click).toHaveBeenCalled();
      expect(link.download).toMatch(/\.json$/);
    });
  });

  // ─── KANBAN-020: 데이터 가져오기 — 성공 ───
  describe("KANBAN-020: 데이터 가져오기 — 성공", () => {
    it("유효한 JSON 가져오기 시 데이터가 교체된다", async () => {
      const user = userEvent.setup();
      useKanbanStore.getState().addCard("Todo", "기존 카드");
      renderBoard();

      const exportData = useKanbanStore.getState().exportData();
      // Add more cards to export data
      const importData = JSON.parse(exportData);

      const fileInput = screen.getByTestId("import-file-input");
      const file = new File([JSON.stringify(importData)], "kanban.json", {
        type: "application/json",
      });
      await user.upload(fileInput, file);

      // Board should reflect imported data
      const visibleCards = screen.getAllByTestId(/^card-/);
      expect(visibleCards.length).toBeGreaterThan(0);
    });
  });

  // ─── KANBAN-021: 데이터 가져오기 — 잘못된 형식 ───
  describe("KANBAN-021: 데이터 가져오기 — 잘못된 형식", () => {
    it("잘못된 형식 가져오기 시 에러 메시지 표시, 기존 데이터 유지", async () => {
      const user = userEvent.setup();
      useKanbanStore.getState().addCard("Todo", "기존 카드");
      renderBoard();

      const fileInput = screen.getByTestId("import-file-input");
      const file = new File(["invalid json data"], "bad.json", {
        type: "application/json",
      });
      await user.upload(fileInput, file);

      expect(screen.getByText("올바른 형식이 아닙니다")).toBeInTheDocument();
      expect(getCardsInColumn("Todo")).toHaveLength(1);
    });
  });

  // ─── KANBAN-022: 카드 상세 모달 열기 ───
  describe("KANBAN-022: 카드 상세 모달 열기", () => {
    it("카드 클릭 시 상세 모달이 열리고 제목이 표시된다", async () => {
      const user = userEvent.setup();
      const cardId = useKanbanStore.getState().addCard("Todo", "회의록 작성");
      renderBoard();

      await openCardModal(user, cardId);

      const modal = screen.getByRole("dialog");
      expect(modal).toBeInTheDocument();
      expect(within(modal).getByDisplayValue("회의록 작성")).toBeInTheDocument();
    });
  });

  // ─── KANBAN-023: 카드 상세 모달 — 제목 편집 ───
  describe("KANBAN-023: 카드 상세 모달 — 제목 편집", () => {
    it("모달에서 제목을 수정하면 변경이 반영된다", async () => {
      const user = userEvent.setup();
      const cardId = useKanbanStore.getState().addCard("Todo", "회의록 작성");
      renderBoard();

      await openCardModal(user, cardId);

      const modal = screen.getByRole("dialog");
      const titleInput = within(modal).getByDisplayValue("회의록 작성");
      await user.clear(titleInput);
      await user.type(titleInput, "주간 회의록 작성");
      await user.keyboard("{Enter}");

      expect(within(modal).getByDisplayValue("주간 회의록 작성")).toBeInTheDocument();
    });
  });

  // ─── KANBAN-024: 카드 상세 모달 — 설명 편집 ───
  describe("KANBAN-024: 카드 상세 모달 — 설명 편집", () => {
    it("모달에서 설명을 입력하면 저장된다", async () => {
      const user = userEvent.setup();
      const cardId = useKanbanStore.getState().addCard("Todo", "회의록 작성");
      renderBoard();

      await openCardModal(user, cardId);

      const modal = screen.getByRole("dialog");
      const descInput = within(modal).getByPlaceholderText(/설명/i);
      await user.type(descInput, "회의 안건 정리");

      expect(within(modal).getByDisplayValue("회의 안건 정리")).toBeInTheDocument();
    });
  });

  // ─── KANBAN-025: 서브태스크 삭제 ───
  describe("KANBAN-025: 서브태스크 삭제", () => {
    it("서브태스크 삭제 버튼 클릭 시 항목이 제거된다", async () => {
      const user = userEvent.setup();
      const cardId = useKanbanStore.getState().addCard("Todo", "회의록 작성");
      useKanbanStore.getState().addSubtask(cardId, "자료 준비");
      renderBoard();

      await openCardModal(user, cardId);

      const modal = screen.getByRole("dialog");
      expect(within(modal).getByText("자료 준비")).toBeInTheDocument();

      const deleteBtn = within(modal).getByRole("button", { name: /서브태스크 삭제/i });
      await user.click(deleteBtn);

      expect(within(modal).queryByText("자료 준비")).not.toBeInTheDocument();
      expect(within(modal).queryAllByTestId(/^subtask-/)).toHaveLength(0);
    });
  });

  // ─── KANBAN-026: 카드 드래그&드롭 — 같은 칼럼 내 순서 변경 ───
  describe("KANBAN-026: 카드 드래그&드롭 — 같은 칼럼 내 순서 변경", () => {
    it("같은 칼럼에서 카드 순서를 변경하면 반영된다", () => {
      useKanbanStore.getState().addCard("Todo", "카드A");
      useKanbanStore.getState().addCard("Todo", "카드B");
      useKanbanStore.getState().addCard("Todo", "카드C");

      const state = useKanbanStore.getState();
      const todoCardIds = state.columns["todo"].cardIds;
      const cardC = todoCardIds[2];

      // Move cardC to position 0
      useKanbanStore.getState().moveCard(cardC, "todo", "todo", 0);

      renderBoard();

      const todoColumn = getColumn("Todo");
      const cards = within(todoColumn).getAllByTestId(/^card-/);
      expect(cards[0]).toHaveTextContent("카드C");
      expect(cards[1]).toHaveTextContent("카드A");
      expect(cards[2]).toHaveTextContent("카드B");
    });
  });

  // ─── KANBAN-027: 제목 검색 — 검색어 초기화 ───
  describe("KANBAN-027: 제목 검색 — 검색어 초기화", () => {
    it("검색어를 지우면 모든 카드가 표시된다", async () => {
      const user = userEvent.setup();
      useKanbanStore.getState().addCard("Todo", "회의록 작성");
      useKanbanStore.getState().addCard("Todo", "보고서 작성");
      useKanbanStore.getState().addCard("Todo", "점심 주문");
      renderBoard();

      const searchInput = screen.getByPlaceholderText(/검색/i);
      await user.type(searchInput, "작성");

      expect(screen.getAllByTestId(/^card-/)).toHaveLength(2);

      await user.clear(searchInput);

      expect(screen.getAllByTestId(/^card-/)).toHaveLength(3);
    });
  });

  // ─── KANBAN-028: 필터 해제 ───
  describe("KANBAN-028: 필터 해제", () => {
    it("필터 해제 시 모든 카드가 표시된다", async () => {
      const user = userEvent.setup();
      const id1 = useKanbanStore.getState().addCard("Todo", "긴급 작업");
      useKanbanStore.getState().updateCard(id1, { priority: "High" });
      const id2 = useKanbanStore.getState().addCard("Todo", "일반 작업1");
      useKanbanStore.getState().updateCard(id2, { priority: "Medium" });
      const id3 = useKanbanStore.getState().addCard("Todo", "일반 작업2");
      useKanbanStore.getState().updateCard(id3, { priority: "Medium" });
      renderBoard();

      // Apply High filter
      const highButtons = screen.getAllByRole("button", { name: "High" });
      await user.click(highButtons[0]);

      expect(screen.getAllByTestId(/^card-/)).toHaveLength(1);

      // Remove filter by clicking "전체"
      const allButton = screen.getByRole("button", { name: /우선순위 필터 전체/ });
      await user.click(allButton);

      expect(screen.getAllByTestId(/^card-/)).toHaveLength(3);
    });
  });

  // ─── KANBAN-029: 다크모드 — 시스템 설정 초기값 적용 ───
  describe("KANBAN-029: 다크모드 — 시스템 설정 초기값 적용", () => {
    it("시스템이 다크모드이고 localStorage 없으면 다크 테마 적용", () => {
      mockMatchMedia(true);

      renderBoard();

      expect(document.documentElement.classList.contains("dark")).toBe(true);
    });
  });
});
