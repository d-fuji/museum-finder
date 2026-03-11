import { PrismaClient } from "@/generated/prisma/client";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

async function createAdapter() {
  if (process.env.NODE_ENV === "production") {
    const { PrismaNeon } = await import("@prisma/adapter-neon");
    return new PrismaNeon({ connectionString: process.env.DATABASE_URL! });
  }
  const { PrismaPg } = await import("@prisma/adapter-pg");
  return new PrismaPg({ connectionString: process.env.DATABASE_URL! });
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter: await createAdapter() });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
