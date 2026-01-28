import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Starting championship migration...");

  // Check if there are existing rounds
  const existingRounds = await prisma.round.findMany();
  console.log(`Found ${existingRounds.length} existing rounds`);

  if (existingRounds.length > 0) {
    // Check if a default championship already exists
    let defaultChampionship = await prisma.championship.findFirst({
      where: { name: "DRS Championship 2026" },
    });

    if (!defaultChampionship) {
      // Create default championship
      defaultChampionship = await prisma.championship.create({
        data: {
          name: "DRS Championship 2026",
          isCurrent: true,
          startDate: new Date("2026-01-01"),
          endDate: null,
        },
      });
      console.log(`Created default championship: ${defaultChampionship.id}`);
    } else {
      console.log(`Using existing default championship: ${defaultChampionship.id}`);
    }

    // Update all rounds without a championship to use the default
    // Note: This assumes championshipId is nullable during migration
    const allRounds = await prisma.round.findMany();
    const roundsWithoutChampionship = allRounds.filter(
      (round) => !round.championshipId
    );

    if (roundsWithoutChampionship.length > 0) {
      for (const round of roundsWithoutChampionship) {
        await prisma.round.update({
          where: { id: round.id },
          data: {
            championshipId: defaultChampionship.id,
          },
        });
      }
      console.log(`Assigned ${roundsWithoutChampionship.length} rounds to default championship`);
    }
  }

  console.log("Championship migration completed successfully!");
}

main()
  .catch((e) => {
    console.error("Error during migration:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
