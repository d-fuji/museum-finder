import bcrypt from "bcryptjs";

export async function findUserByEmail(email: string) {
  const { prisma } = await import("@/lib/prisma");
  return prisma.user.findUnique({ where: { email } });
}

export async function verifyPassword(plainPassword: string, hashedPassword: string) {
  return bcrypt.compare(plainPassword, hashedPassword);
}
