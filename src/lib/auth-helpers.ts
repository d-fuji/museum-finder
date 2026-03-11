import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export async function findUserByEmail(email: string) {
  return prisma.user.findUnique({ where: { email } });
}

export async function verifyPassword(plainPassword: string, hashedPassword: string) {
  return bcrypt.compare(plainPassword, hashedPassword);
}
