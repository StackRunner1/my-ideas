/**
 * Tests for chat UI components.
 *
 * Validates:
 * - MessageCard rendering for user/assistant messages
 * - QueryResultsTable display and pagination
 * - Copy to clipboard functionality
 * - Metadata expansion
 */

import { describe, it, expect, vi } from "vitest";
import { renderWithProviders, screen, waitFor } from "../../../test/utils";
import { MessageCard } from "../MessageCard";
import { QueryResultsTable } from "../QueryResultsTable";
import type { Message } from "../../../store/chatSlice";
import userEvent from "@testing-library/user-event";

describe("MessageCard", () => {
  it("renders user message with correct styling", () => {
    const message: Message = {
      id: "msg-1",
      role: "user",
      content: "Show me all ideas",
      timestamp: Date.now(),
    };

    renderWithProviders(<MessageCard message={message} />);

    expect(screen.getByText("You")).toBeInTheDocument();
    expect(screen.getByText("Show me all ideas")).toBeInTheDocument();
  });

  it("renders assistant message with correct styling", () => {
    const message: Message = {
      id: "msg-2",
      role: "assistant",
      content: "Here are your ideas",
      timestamp: Date.now(),
    };

    renderWithProviders(<MessageCard message={message} />);

    expect(screen.getByText("AI Assistant")).toBeInTheDocument();
    expect(screen.getByText("Here are your ideas")).toBeInTheDocument();
  });

  it("displays SQL code for assistant messages with SQL", () => {
    const message: Message = {
      id: "msg-3",
      role: "assistant",
      content: "Here are your ideas",
      timestamp: Date.now(),
      metadata: {
        generatedSql: "SELECT * FROM ideas ORDER BY created_at DESC LIMIT 10",
        explanation: "Fetched all ideas",
      },
    };

    renderWithProviders(<MessageCard message={message} />);

    expect(screen.getByText("Generated SQL:")).toBeInTheDocument();
    expect(
      screen.getByText(
        /SELECT \* FROM ideas ORDER BY created_at DESC LIMIT 10/i
      )
    ).toBeInTheDocument();
  });

  it("does not display SQL section for user messages", () => {
    const message: Message = {
      id: "msg-4",
      role: "user",
      content: "Show me ideas",
      timestamp: Date.now(),
    };

    renderWithProviders(<MessageCard message={message} />);

    expect(screen.queryByText("Generated SQL:")).not.toBeInTheDocument();
  });

  it("shows metadata section when expanded", async () => {
    const user = userEvent.setup();

    const message: Message = {
      id: "msg-5",
      role: "assistant",
      content: "Response",
      timestamp: Date.now(),
      metadata: {
        tokenUsage: {
          promptTokens: 100,
          completionTokens: 50,
          totalTokens: 150,
        },
        cost: 0.01,
      },
    };

    renderWithProviders(<MessageCard message={message} />);

    // Find and click show metadata button
    const showButton = screen.getByRole("button", {
      name: /show (details|metadata)/i,
    });
    await user.click(showButton);

    // Check if token usage is displayed
    await waitFor(() => {
      expect(screen.getByText(/150/)).toBeInTheDocument(); // total tokens
    });
  });

  it("formats relative timestamps correctly", () => {
    const now = Date.now();
    const message: Message = {
      id: "msg-6",
      role: "user",
      content: "Test",
      timestamp: now - 30000, // 30 seconds ago
    };

    renderWithProviders(<MessageCard message={message} />);

    expect(screen.getByText("just now")).toBeInTheDocument();
  });

  it("handles copy to clipboard", async () => {
    const user = userEvent.setup();

    // Mock clipboard API
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn().mockResolvedValue(undefined),
      },
    });

    const message: Message = {
      id: "msg-7",
      role: "assistant",
      content: "Response",
      timestamp: Date.now(),
      metadata: {
        generatedSql: "SELECT * FROM ideas LIMIT 10",
      },
    };

    renderWithProviders(<MessageCard message={message} />);

    const copyButton = screen.getByRole("button", { name: /copy/i });
    await user.click(copyButton);

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
      "SELECT * FROM ideas LIMIT 10"
    );

    // Should show "Copied" feedback
    await waitFor(() => {
      expect(screen.getByText(/copied/i)).toBeInTheDocument();
    });
  });

  it("displays warnings if present in metadata", () => {
    const message: Message = {
      id: "msg-8",
      role: "assistant",
      content: "Query executed",
      timestamp: Date.now(),
      metadata: {
        warnings: ["Query returned large dataset", "Consider adding LIMIT"],
      },
    };

    renderWithProviders(<MessageCard message={message} />);

    // Warnings might be in metadata section - expand it first
    const showButton = screen.queryByRole("button", { name: /show/i });
    if (showButton) {
      userEvent.click(showButton);
    }

    // Check warnings are present (implementation may vary)
    expect(
      screen.getByText(/query returned large dataset/i) ||
        screen.getByText(/consider adding limit/i)
    ).toBeTruthy();
  });
});

describe("QueryResultsTable", () => {
  it("renders empty state when no results", () => {
    renderWithProviders(<QueryResultsTable results={[]} />);

    expect(screen.getByText("No results to display")).toBeInTheDocument();
  });

  it("renders table with results", () => {
    const results = [
      { id: 1, title: "Idea 1", status: "active" },
      { id: 2, title: "Idea 2", status: "draft" },
    ];

    renderWithProviders(<QueryResultsTable results={results} />);

    // Check headers
    expect(screen.getByText("id")).toBeInTheDocument();
    expect(screen.getByText("title")).toBeInTheDocument();
    expect(screen.getByText("status")).toBeInTheDocument();

    // Check data
    expect(screen.getByText("Idea 1")).toBeInTheDocument();
    expect(screen.getByText("Idea 2")).toBeInTheDocument();
    expect(screen.getByText("active")).toBeInTheDocument();
    expect(screen.getByText("draft")).toBeInTheDocument();
  });

  it("limits rows by default and shows 'Show all' button", () => {
    const results = Array.from({ length: 15 }, (_, i) => ({
      id: i + 1,
      title: `Idea ${i + 1}`,
    }));

    renderWithProviders(<QueryResultsTable results={results} maxRows={10} />);

    // Should show first 10 rows
    expect(screen.getByText("Idea 1")).toBeInTheDocument();
    expect(screen.getByText("Idea 10")).toBeInTheDocument();
    expect(screen.queryByText("Idea 11")).not.toBeInTheDocument();

    // Should show "Show all" button
    expect(screen.getByText(/show all 15 rows/i)).toBeInTheDocument();
  });

  it("expands to show all rows when button clicked", async () => {
    const user = userEvent.setup();

    const results = Array.from({ length: 15 }, (_, i) => ({
      id: i + 1,
      title: `Idea ${i + 1}`,
    }));

    renderWithProviders(<QueryResultsTable results={results} maxRows={10} />);

    // Click "Show all" button
    const showAllButton = screen.getByText(/show all 15 rows/i);
    await user.click(showAllButton);

    // Should now show all rows
    await waitFor(() => {
      expect(screen.getByText("Idea 15")).toBeInTheDocument();
    });
  });

  it("formats different value types correctly", () => {
    const results = [
      {
        id: 1,
        name: "Test",
        count: 42,
        active: true,
        score: null,
        created: "2024-01-01T00:00:00Z",
      },
    ];

    renderWithProviders(<QueryResultsTable results={results} />);

    expect(screen.getByText("Test")).toBeInTheDocument();
    expect(screen.getByText("42")).toBeInTheDocument();
    expect(screen.getByText("true")).toBeInTheDocument();
  });

  it("handles empty results array gracefully", () => {
    renderWithProviders(<QueryResultsTable results={[]} />);

    expect(screen.getByText("No results to display")).toBeInTheDocument();
    expect(screen.queryByRole("table")).not.toBeInTheDocument();
  });

  it("respects custom maxRows prop", () => {
    const results = Array.from({ length: 10 }, (_, i) => ({
      id: i + 1,
      title: `Idea ${i + 1}`,
    }));

    renderWithProviders(<QueryResultsTable results={results} maxRows={5} />);

    expect(screen.getByText("Idea 1")).toBeInTheDocument();
    expect(screen.getByText("Idea 5")).toBeInTheDocument();
    expect(screen.queryByText("Idea 6")).not.toBeInTheDocument();
  });
});
