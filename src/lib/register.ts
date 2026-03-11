import bcrypt from "bcryptjs";

export type RegisterInput = {
  name: string;
  email: string;
  password: string;
};

export type RegisterResult = { ok: true } | { ok: false; error: string; status: 400 | 409 };

export type UserRepository = {
  findByEmail: (email: string) => Promise<{ id: string } | null>;
  create: (data: { name: string; email: string; password: string }) => Promise<void>;
};

export async function registerUser(
  input: RegisterInput,
  repo: UserRepository
): Promise<RegisterResult> {
  const { name, email, password } = input;

  if (!name || !email || !password) {
    return { ok: false, error: "名前、メールアドレス、パスワードは必須です", status: 400 };
  }

  if (password.length < 8) {
    return { ok: false, error: "パスワードは8文字以上で入力してください", status: 400 };
  }

  const existing = await repo.findByEmail(email);
  if (existing) {
    return { ok: false, error: "このメールアドレスは既に登録されています", status: 409 };
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  await repo.create({ name, email, password: hashedPassword });

  return { ok: true };
}
