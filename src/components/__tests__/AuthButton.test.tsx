import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { AuthButton } from "@/components/AuthButton";

vi.mock("next-auth/react", () => ({
  useSession: vi.fn(),
  signOut: vi.fn(),
}));

import { useSession } from "next-auth/react";

describe("AuthButton", () => {
  it("should render login link when not authenticated", () => {
    vi.mocked(useSession).mockReturnValue({
      data: null,
      status: "unauthenticated",
      update: vi.fn(),
    });

    render(<AuthButton />);

    const button = screen.getByRole("button", { name: "ログイン" });
    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute("href", "/login");
  });

  it("should render user name and logout button when authenticated", () => {
    vi.mocked(useSession).mockReturnValue({
      data: {
        user: { name: "テストユーザー", email: "test@example.com" },
        expires: "2099-01-01",
      },
      status: "authenticated",
      update: vi.fn(),
    });

    render(<AuthButton />);

    expect(screen.getByText("テストユーザー")).toBeInTheDocument();
    expect(screen.getByRole("button")).toBeInTheDocument();
  });

  it("should render empty placeholder when loading", () => {
    vi.mocked(useSession).mockReturnValue({
      data: null,
      status: "loading",
      update: vi.fn(),
    });

    const { container } = render(<AuthButton />);

    expect(screen.queryByRole("link")).not.toBeInTheDocument();
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
    expect(container.firstChild).toBeInTheDocument();
  });
});
