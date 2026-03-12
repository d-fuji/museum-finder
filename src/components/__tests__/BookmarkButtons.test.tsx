import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeAll, afterAll, afterEach } from "vitest";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import { BookmarkButtons } from "../BookmarkButtons";
import type { BookmarkStatus } from "@/types/api";

const server = setupServer();

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

function setupPutHandler(status = 200) {
  server.use(
    http.put("/api/bookmarks", async ({ request }) => {
      if (status !== 200) {
        return HttpResponse.json({ error: "エラー" }, { status });
      }
      const body = (await request.json()) as {
        museumId: number;
        status: BookmarkStatus;
        visitedAt?: string;
      };
      return HttpResponse.json({
        id: 1,
        userId: "user-1",
        museumId: body.museumId,
        status: body.status,
        visitedAt: body.visitedAt,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    })
  );
}

function setupDeleteHandler(status = 204) {
  server.use(
    http.delete("/api/bookmarks/:museumId", () => {
      if (status !== 204) {
        return HttpResponse.json({ error: "エラー" }, { status });
      }
      return new HttpResponse(null, { status: 204 });
    })
  );
}

describe("BookmarkButtons", () => {
  it("should render '行きたい' and '行った' buttons when no current status", () => {
    render(<BookmarkButtons museumId={1} currentStatus={null} onUpdate={vi.fn()} />);
    expect(screen.getByRole("button", { name: /行きたい/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /行った/ })).toBeInTheDocument();
  });

  it("should show '行きたい' as active when currentStatus is WANT_TO_GO", () => {
    render(<BookmarkButtons museumId={1} currentStatus="WANT_TO_GO" onUpdate={vi.fn()} />);
    const wantButton = screen.getByRole("button", { name: /行きたい/ });
    expect(wantButton).toHaveAttribute("data-active", "true");
  });

  it("should show '行った' as active when currentStatus is VISITED", () => {
    render(<BookmarkButtons museumId={1} currentStatus="VISITED" onUpdate={vi.fn()} />);
    const visitedButton = screen.getByRole("button", { name: /行った/ });
    expect(visitedButton).toHaveAttribute("data-active", "true");
  });

  it("should call upsert with WANT_TO_GO when '行きたい' is clicked", async () => {
    setupPutHandler();
    const onUpdate = vi.fn();
    render(<BookmarkButtons museumId={1} currentStatus={null} onUpdate={onUpdate} />);

    await userEvent.click(screen.getByRole("button", { name: /行きたい/ }));

    await waitFor(() => expect(onUpdate).toHaveBeenCalled());
  });

  it("should call upsert with VISITED when '行った' is clicked", async () => {
    setupPutHandler();
    const onUpdate = vi.fn();
    render(<BookmarkButtons museumId={1} currentStatus={null} onUpdate={onUpdate} />);

    await userEvent.click(screen.getByRole("button", { name: /行った/ }));

    await waitFor(() => expect(onUpdate).toHaveBeenCalled());
  });

  it("should call delete when active '行きたい' is clicked again", async () => {
    setupDeleteHandler();
    const onUpdate = vi.fn();
    render(<BookmarkButtons museumId={1} currentStatus="WANT_TO_GO" onUpdate={onUpdate} />);

    await userEvent.click(screen.getByRole("button", { name: /行きたい/ }));

    await waitFor(() => expect(onUpdate).toHaveBeenCalled());
  });

  it("should show confirmation when VISITED '行った' is clicked again", async () => {
    render(<BookmarkButtons museumId={1} currentStatus="VISITED" onUpdate={vi.fn()} />);

    await userEvent.click(screen.getByRole("button", { name: /行った/ }));

    expect(screen.getByText("「行った」を解除しますか？")).toBeInTheDocument();
  });

  it("should delete after confirming VISITED deletion", async () => {
    setupDeleteHandler();
    const onUpdate = vi.fn();
    render(<BookmarkButtons museumId={1} currentStatus="VISITED" onUpdate={onUpdate} />);

    await userEvent.click(screen.getByRole("button", { name: /行った/ }));
    await userEvent.click(screen.getByRole("button", { name: "変更する" }));

    await waitFor(() => expect(onUpdate).toHaveBeenCalled());
  });

  it("should show confirmation when VISITED → WANT_TO_GO", async () => {
    render(<BookmarkButtons museumId={1} currentStatus="VISITED" onUpdate={vi.fn()} />);

    await userEvent.click(screen.getByRole("button", { name: /行きたい/ }));

    expect(screen.getByText("「行きたい」に変更しますか？")).toBeInTheDocument();
  });

  it("should downgrade after confirming VISITED → WANT_TO_GO", async () => {
    setupPutHandler();
    const onUpdate = vi.fn();
    render(<BookmarkButtons museumId={1} currentStatus="VISITED" onUpdate={onUpdate} />);

    await userEvent.click(screen.getByRole("button", { name: /行きたい/ }));
    await userEvent.click(screen.getByRole("button", { name: "変更する" }));

    await waitFor(() => expect(onUpdate).toHaveBeenCalled());
  });

  it("should not execute when confirmation is cancelled", async () => {
    const onUpdate = vi.fn();
    render(<BookmarkButtons museumId={1} currentStatus="VISITED" onUpdate={onUpdate} />);

    await userEvent.click(screen.getByRole("button", { name: /行った/ }));
    await userEvent.click(screen.getByRole("button", { name: "キャンセル" }));

    expect(onUpdate).not.toHaveBeenCalled();
  });

  it("should show error message when API call fails", async () => {
    setupPutHandler(500);
    const onUpdate = vi.fn();
    render(<BookmarkButtons museumId={1} currentStatus={null} onUpdate={onUpdate} />);

    await userEvent.click(screen.getByRole("button", { name: /行きたい/ }));

    await waitFor(() =>
      expect(screen.getByText("操作に失敗しました。もう一度お試しください。")).toBeInTheDocument()
    );
    expect(onUpdate).not.toHaveBeenCalled();
  });
});
