import { PrismaClient } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import museumsData from "@/data/museums.json" with { type: "json" };
import reviewsData from "@/data/reviews.json" with { type: "json" };

type Category = "CORPORATE" | "CITY_HISTORY";

const connectionString = process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL!;
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
  for (const museum of museumsData) {
    await prisma.museum.upsert({
      where: { id: museum.id },
      update: {},
      create: {
        id: museum.id,
        name: museum.name,
        category: museum.category as Category,
        description: museum.description,
        latitude: museum.latitude,
        longitude: museum.longitude,
        address: museum.address,
        websiteUrl: museum.websiteUrl,
        createdAt: new Date(museum.createdAt),
        updatedAt: new Date(museum.updatedAt),
      },
    });
  }

  for (const review of reviewsData) {
    await prisma.review.upsert({
      where: { id: review.id },
      update: {},
      create: {
        id: review.id,
        rating: review.rating,
        comment: review.comment,
        userId: review.userId,
        museumId: review.museumId,
        userName: review.userName,
        createdAt: new Date(review.createdAt),
      },
    });
  }

  console.log("Seed completed");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
