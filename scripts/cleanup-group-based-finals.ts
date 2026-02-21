/**
 * One-time cleanup: Remove group-based FINAL_QUALIFYING and FINAL_RACE sessions.
 * Only deletes sessions that have NO results (safe).
 * Sessions with results are kept but hidden from the UI.
 *
 * Run manually: npx tsx scripts/cleanup-group-based-finals.ts
 */

import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

async function main() {
  const toDelete = await db.session.findMany({
    where: {
      OR: [
        { type: "FINAL_QUALIFYING", group: { not: null } },
        { type: "FINAL_RACE", group: { not: null } },
      ],
    },
    include: {
      results: { select: { id: true } },
    },
  });

  const noResults = toDelete.filter((s) => s.results.length === 0);
  const withResults = toDelete.filter((s) => s.results.length > 0);

  for (const session of noResults) {
    await db.session.delete({
      where: { id: session.id },
    });
  }

  console.log(
    `Deleted ${noResults.length} group-based final session(s) with no results.`
  );
  if (withResults.length > 0) {
    console.log(
      `Kept ${withResults.length} session(s) with results (hidden from UI).`
    );
  }
}

main()
  .catch(console.error)
  .finally(() => db.$disconnect());
