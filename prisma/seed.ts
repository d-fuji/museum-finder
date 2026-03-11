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
      // Upsert tags
      for (const t of tagsData) {
        await tx.tag.upsert({
          where: { name: t.name },
          update: {},
          create: { name: t.name },
        });
      }
      const allTags = await tx.tag.findMany();
      const tagNameToId = new Map(allTags.map((t) => [t.name, t.id]));

      // Align codes for existing museums (one-time migration support)
      // If a museum exists by name but with a wrong code, and no museum
      // with the target code exists yet, update the code.
      for (const m of museumsData) {
        const byCode = await tx.museum.findUnique({ where: { code: m.code } });
        if (byCode) continue; // code already assigned correctly

        const byName = await tx.museum.findFirst({ where: { name: m.name } });
        if (byName) {
          await tx.museum.update({
            where: { id: byName.id },
            data: { code: m.code },
          });
        }
      }

      // Delete orphan museums (exist in DB but not in JSON, with no reviews)
      const jsonCodes = new Set(museumsData.map((m) => m.code));
      const allMuseums = await tx.museum.findMany({
        select: { id: true, code: true, _count: { select: { reviews: true } } },
      });
      for (const m of allMuseums) {
        if (!jsonCodes.has(m.code) && m._count.reviews === 0) {
          await tx.operatingHours.deleteMany({ where: { museumId: m.id } });
          await tx.museum.delete({ where: { id: m.id } });
        }
      }

      // Upsert museums (reviews are preserved)
      for (const m of museumsData) {
        const museumData = {
          name: m.name,
          category: m.category as Category,
          description: m.description,
          latitude: m.latitude,
          longitude: m.longitude,
          address: m.address,
          websiteUrl: m.websiteUrl,
          admissionFee: m.admissionFee,
          isClosed: m.isClosed,
          closedMessage: "closedMessage" in m ? (m.closedMessage as string) : null,
        };

        const tagIds = m.tags
          .map((name) => tagNameToId.get(name))
          .filter((id): id is number => id !== undefined)
          .map((id) => ({ id }));

        const hoursData = m.operatingHours.map((h) => ({
          dayOfWeek: h.dayOfWeek,
          openTime: h.openTime,
          closeTime: h.closeTime,
          isClosed: h.isClosed,
          note: "note" in h ? (h.note as string) : undefined,
        }));

        const museum = await tx.museum.upsert({
          where: { code: m.code },
          update: {
            ...museumData,
            tags: { set: tagIds },
          },
          create: {
            code: m.code,
            ...museumData,
            tags: { connect: tagIds },
          },
        });

        // Replace operating hours (delete + create)
        await tx.operatingHours.deleteMany({ where: { museumId: museum.id } });
        await tx.operatingHours.createMany({
          data: hoursData.map((h) => ({ ...h, museumId: museum.id })),
        });
      }
    },
    { timeout: 120000 }
  );

  console.log("Seed completed");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
