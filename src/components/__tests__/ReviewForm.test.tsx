import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeAll, afterAll, afterEach } from "vitest";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import { ReviewForm } from "../ReviewForm";

const server = setupServer();

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe("ReviewForm", () => {
  it("should render rating selector and submit button", () => {
    render(<ReviewForm museumId={1} onSuccess={vi.fn()} />);
    expect(screen.getByRole("group", { name: "評価" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "投稿する" })).toBeInTheDocument();
  });

  it("should render comment textarea", () => {
    render(<ReviewForm museumId={1} onSuccess={vi.fn()} />);
    expect(screen.getByRole("textbox", { name: "コメント" })).toBeInTheDocument();
  });

  it("should disable submit button when no rating is selected", () => {
    render(<ReviewForm museumId={1} onSuccess={vi.fn()} />);
    expect(screen.getByRole("button", { name: "投稿する" })).toBeDisabled();
  });

  it("should enable submit button when rating is selected", async () => {
    render(<ReviewForm museumId={1} onSuccess={vi.fn()} />);
    await userEvent.click(screen.getByRole("radio", { name: "3" }));
    expect(screen.getByRole("button", { name: "投稿する" })).toBeEnabled();
  });

  it("should call onSuccess after successful submission", async () => {
    server.use(
      http.post("/api/museums/1/reviews", () => {
        return HttpResponse.json({ id: 1 }, { status: 201 });
      })
    );
    const onSuccess = vi.fn();
    render(<ReviewForm museumId={1} onSuccess={onSuccess} />);

    await userEvent.click(screen.getByRole("radio", { name: "4" }));
    await userEvent.click(screen.getByRole("button", { name: "投稿する" }));

    await waitFor(() => expect(onSuccess).toHaveBeenCalled());
  });

  it("should show error message on submission failure", async () => {
    server.use(
      http.post("/api/museums/1/reviews", () => {
        return HttpResponse.json({ error: "エラーが発生しました" }, { status: 400 });
      })
    );
    render(<ReviewForm museumId={1} onSuccess={vi.fn()} />);

    await userEvent.click(screen.getByRole("radio", { name: "4" }));
    await userEvent.click(screen.getByRole("button", { name: "投稿する" }));

    await waitFor(() => {
      expect(screen.getByRole("alert")).toBeInTheDocument();
    });
  });
});
