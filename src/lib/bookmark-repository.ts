import { prisma } from "@/lib/prisma";
import type { BookmarkStatus } from "@/types/api";

const museumInclude = {
  reviews: { select: { rating: true } },
  tags: { select: { id: true, name: true } },
};

export const bookmarkRepository = {
  async findByUser(userId: string, status?: BookmarkStatus) {
    return prisma.bookmark.findMany({
      where: { userId, ...(status ? { status } : {}) },
      include: { museum: { include: museumInclude } },
      orderBy: { createdAt: "desc" },
    });
  },

  async upsert(userId: string, museumId: number, status: BookmarkStatus, visitedAt?: string) {
    return prisma.bookmark.upsert({
      where: { userId_museumId: { userId, museumId } },
      update: {
        status,
        visitedAt: visitedAt ? new Date(visitedAt) : null,
      },
      create: {
        userId,
        museumId,
        status,
        visitedAt: visitedAt ? new Date(visitedAt) : null,
      },
    });
  },

  async delete(userId: string, museumId: number) {
    return prisma.bookmark.delete({
      where: { userId_museumId: { userId, museumId } },
    });
  },

  async findOne(userId: string, museumId: number) {
    return prisma.bookmark.findUnique({
      where: { userId_museumId: { userId, museumId } },
    });
  },

  async museumExists(museumId: number) {
    const museum = await prisma.museum.findUnique({ where: { id: museumId } });
    return museum !== null;
  },
};
