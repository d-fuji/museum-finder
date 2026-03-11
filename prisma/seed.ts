import { PrismaClient, Category } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import museumsData from "@/data/museums.json" with { type: "json" };
import tagsData from "@/data/tags.json" with { type: "json" };

const connectionString = process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL!;
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
  await prisma.$transaction(
    async (tx) => {
    // Clear existing data (order matters for FK constraints)
    await tx.review.deleteMany();
    await tx.museum.deleteMany();
    await tx.tag.deleteMany();

    // Create tags
    await tx.tag.createMany({
      data: tagsData.map((t) => ({ name: t.name })),
    });
    const allTags = await tx.tag.findMany();
    const tagNameToId = new Map(allTags.map((t) => [t.name, t.id]));

    // Create museums with tag connections
    for (const m of museumsData) {
      await tx.museum.create({
        data: {
          name: m.name,
          category: m.category as Category,
          description: m.description,
          latitude: m.latitude,
          longitude: m.longitude,
          address: m.address,
          websiteUrl: m.websiteUrl,
          tags: {
            connect: m.tags
              .map((name) => tagNameToId.get(name))
              .filter((id): id is number => id !== undefined)
              .map((id) => ({ id })),
          },
        },
      });
    }

    },
    { timeout: 30000 }
  );

  console.log("Seed completed");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
