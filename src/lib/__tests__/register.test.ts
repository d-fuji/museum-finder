import { describe, it, expect, vi } from "vitest";
import bcrypt from "bcryptjs";
import { registerUser, UserRepository } from "@/lib/register";

function createMockRepo(existingUser: { id: string } | null = null): UserRepository {
  return {
    findByEmail: vi.fn().mockResolvedValue(existingUser),
    create: vi.fn().mockResolvedValue(undefined),
  };
}

describe("registerUser", () => {
  it("should return error when name is empty", async () => {
    const repo = createMockRepo();

    const result = await registerUser({ name: "", email: "a@b.com", password: "12345678" }, repo);

    expect(result).toEqual({
      ok: false,
      error: "名前、メールアドレス、パスワードは必須です",
      status: 400,
    });
  });

  it("should return error when email is empty", async () => {
    const repo = createMockRepo();

    const result = await registerUser({ name: "Test", email: "", password: "12345678" }, repo);

    expect(result).toEqual({
      ok: false,
      error: "名前、メールアドレス、パスワードは必須です",
      status: 400,
    });
  });

  it("should return error when password is shorter than 8 characters", async () => {
    const repo = createMockRepo();

    const result = await registerUser(
      { name: "Test", email: "a@b.com", password: "1234567" },
      repo
    );

    expect(result).toEqual({
      ok: false,
      error: "パスワードは8文字以上で入力してください",
      status: 400,
    });
  });

  it("should return error when email is already registered", async () => {
    const repo = createMockRepo({ id: "existing-id" });

    const result = await registerUser(
      { name: "Test", email: "a@b.com", password: "12345678" },
      repo
    );

    expect(result).toEqual({
      ok: false,
      error: "このメールアドレスは既に登録されています",
      status: 409,
    });
  });

  it("should create user with hashed password when input is valid", async () => {
    const repo = createMockRepo();

    const result = await registerUser(
      { name: "Test User", email: "test@example.com", password: "securepass123" },
      repo
    );

    expect(result).toEqual({ ok: true });
    expect(repo.create).toHaveBeenCalledOnce();

    const createCall = vi.mocked(repo.create).mock.calls[0][0];
    expect(createCall.name).toBe("Test User");
    expect(createCall.email).toBe("test@example.com");
    expect(createCall.password).not.toBe("securepass123");
    expect(await bcrypt.compare("securepass123", createCall.password)).toBe(true);
  });
});
