/**
 * Optional migration: Add group-based sessions for rounds with old structure.
 *
 * Old structure: QUALIFYING 1-4 (group null), RACE per group, FINAL_QUALIFYING (null), FINAL_RACE (null).
 * New structure: All session types created per group.
 *
 * This script adds missing group-based sessions WITHOUT removing old sessions or results.
 * Run manually: npx tsx scripts/migrate-sessions-to-group-based.ts
 *
 * Existing results remain tied to old sessions. New group-based sessions start empty.
 * Use only if you want to migrate data (e.g. map Qualifying 1 -> Group A Qualifying) manually.
 */

import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

const SESSION_TYPES = [
  "QUALIFYING",
  "RACE",
  "FINAL_QUALIFYING",
  "FINAL_RACE",
] as const;

async function main() {
  const rounds = await db.round.findMany({
    where: { setupCompleted: true },
    include: {
      sessions: { select: { id: true, type: true, group: true } },
      groupAssignments: {
        select: { group: true },
        distinct: ["group"],
      },
    },
  });

  const groupsByRound = new Map<string, string[]>();
  for (const r of rounds) {
    const groups = [...new Set(r.groupAssignments.map((a) => a.group))].sort();
    groupsByRound.set(r.id, groups);
  }

  let added = 0;
  for (const round of rounds) {
    const groups = groupsByRound.get(round.id) ?? [];
    if (groups.length === 0) continue;

    const existing = new Set(
      round.sessions.map((s) => `${s.type}:${s.group ?? ""}`)
    );

    const sessionsForRound = await db.session.findMany({
      where: { roundId: round.id },
      select: { order: true },
    });
    const maxOrder =
      sessionsForRound.length > 0
        ? Math.max(...sessionsForRound.map((s) => s.order))
        : 0;

    let order = maxOrder + 1;
    for (const type of SESSION_TYPES) {
      for (const group of groups) {
        const key = `${type}:${group}`;
        if (existing.has(key)) continue;

        await db.session.create({
          data: {
            roundId: round.id,
            type,
            group,
            order: order++,
          },
        });
        added++;
      }
    }
  }

  console.log(`Added ${added} group-based sessions.`);
}

main()
  .catch(console.error)
  .finally(() => db.$disconnect());
