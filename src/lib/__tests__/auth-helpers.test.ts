import { describe, it, expect } from "vitest";
import bcrypt from "bcryptjs";
import { verifyPassword } from "@/lib/auth-helpers";

describe("verifyPassword", () => {
  it("should return true when password matches hash", async () => {
    const password = "testpassword123";
    const hash = await bcrypt.hash(password, 10);

    const result = await verifyPassword(password, hash);

    expect(result).toBe(true);
  });

  it("should return false when password does not match hash", async () => {
    const hash = await bcrypt.hash("correctpassword", 10);

    const result = await verifyPassword("wrongpassword", hash);

    expect(result).toBe(false);
  });
});
