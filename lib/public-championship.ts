/**
 * Public championship/round data from DB. Use in server components so we don’t
 * depend on self-fetch (which can fail on Railway due to host/routing).
 */
import { db } from "@/lib/db";
import { getRoundStatus, type RoundStatus } from "@/lib/round-status";

const LEGACY_GROUP_FINAL = (s: { type: string; group: string | null }) =>
  (s.type === "FINAL_QUALIFYING" || s.type === "FINAL_RACE") && s.group !== null;

function isSessionComplete(s: { status: string; results: { id: string }[] }): boolean {
  return s.status === "COMPLETED" || s.results.length > 0;
}

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function isValidId(id: string): boolean {
  return !!id && UUID_REGEX.test(id);
}

export type ChampionshipPublic = {
  championship: { id: string; name: string; startDate: string; endDate: string | null };
  rounds: { id: string; name: string; date: string; trackName: string | null; location: string | null; status: string }[];
  standings: { fullName: string; totalPoints: number; roundsPlayed?: number }[];
};

export async function getChampionshipPublic(id: string): Promise<ChampionshipPublic | null> {
  if (!isValidId(id)) return null;

  const championship = await db.championship.findUnique({
    where: { id },
    select: { id: true, name: true, startDate: true, endDate: true },
  });
  if (!championship) return null;

  const rounds = await db.round.findMany({
    where: { championshipId: id },
    orderBy: { date: "asc" },
    select: {
      id: true,
      name: true,
      date: true,
      track: { select: { name: true, location: true } },
    },
  });

  const roundIds = rounds.map((r) => r.id);
  let standings: { fullName: string; totalPoints: number; roundsPlayed: number }[] = [];

  if (roundIds.length > 0) {
    const results = await db.sessionResult.findMany({
      where: { session: { roundId: { in: roundIds } } },
      select: {
        driverId: true,
        points: true,
        session: { select: { roundId: true } },
      },
    });
    const driverPoints = new Map<string, number>();
    const driverRoundIds = new Map<string, Set<string>>();
    for (const r of results) {
      const cur = driverPoints.get(r.driverId) ?? 0;
      driverPoints.set(r.driverId, cur + r.points);
      if (!driverRoundIds.has(r.driverId)) driverRoundIds.set(r.driverId, new Set());
      driverRoundIds.get(r.driverId)!.add(r.session.roundId);
    }
    const driverIds = Array.from(driverPoints.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([driverId]) => driverId);
    if (driverIds.length > 0) {
      const drivers = await db.driver.findMany({
        where: { id: { in: driverIds } },
        select: { id: true, fullName: true },
      });
      const nameMap = new Map(drivers.map((d) => [d.id, d.fullName]));
      standings = driverIds.map((driverId) => {
        const roundIdsWithResults = driverRoundIds.get(driverId) ?? new Set<string>();
        return {
          fullName: nameMap.get(driverId) ?? "—",
          totalPoints: driverPoints.get(driverId) ?? 0,
          roundsPlayed: roundIdsWithResults.size,
        };
      });
    }
  }

  const now = new Date();
  const roundsWithStatus = rounds.map((r) => ({
    id: r.id,
    name: r.name,
    date: r.date.toISOString(),
    trackName: r.track?.name ?? null,
    location: r.track?.location ?? null,
    status: r.date < now ? "Completed" : "Upcoming",
  }));

  return {
    championship: {
      id: championship.id,
      name: championship.name,
      startDate: championship.startDate.toISOString(),
      endDate: championship.endDate?.toISOString() ?? null,
    },
    rounds: roundsWithStatus,
    standings,
  };
}

export type RoundPublic = {
  round: { id: string; name: string; date: string; trackName: string | null; location: string | null };
  roundStandings: { fullName: string; totalPoints: number }[];
  images: { url: string }[];
};

export async function getRoundPublic(id: string): Promise<RoundPublic | null> {
  if (!isValidId(id)) return null;

  const round = await db.round.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      date: true,
      track: { select: { name: true, location: true } },
      roundImages: { select: { imageUrl: true } },
    },
  });
  if (!round) return null;

  const results = await db.sessionResult.findMany({
    where: { session: { roundId: id } },
    select: { driverId: true, points: true },
  });
  const driverPoints = new Map<string, number>();
  for (const r of results) {
    driverPoints.set(r.driverId, (driverPoints.get(r.driverId) ?? 0) + r.points);
  }
  const driverIds = Array.from(driverPoints.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([driverId]) => driverId);
  let roundStandings: { fullName: string; totalPoints: number }[] = [];
  if (driverIds.length > 0) {
    const drivers = await db.driver.findMany({
      where: { id: { in: driverIds } },
      select: { id: true, fullName: true },
    });
    const nameMap = new Map(drivers.map((d) => [d.id, d.fullName]));
    roundStandings = driverIds.map((driverId) => ({
      fullName: nameMap.get(driverId) ?? "—",
      totalPoints: driverPoints.get(driverId) ?? 0,
    }));
  }

  return {
    round: {
      id: round.id,
      name: round.name,
      date: round.date.toISOString(),
      trackName: round.track?.name ?? null,
      location: round.track?.location ?? null,
    },
    roundStandings,
    images: round.roundImages.map((img) => ({ url: img.imageUrl })),
  };
}

export type SessionPublic = {
  id: string;
  name: string;
  order: number;
  results: { position: number; driverName: string; time: string; points: number }[];
};

function getSessionDisplayName(type: string, group: string | null, order?: number): string {
  const typeLabels: Record<string, string> = {
    QUALIFYING: "Qualifying",
    RACE: "Race",
    FINAL_QUALIFYING: "Final Qualifying",
    FINAL_RACE: "Final Race",
  };
  const typeLabel = typeLabels[type] ?? type;
  if (group) return `Group ${group} - ${typeLabel}`;
  if (type === "QUALIFYING" && order != null) return `Qualifying ${order}`;
  return typeLabel;
}

export async function getRoundSessionsPublic(roundId: string): Promise<SessionPublic[]> {
  if (!isValidId(roundId)) return [];

  const sessions = await db.session.findMany({
    where: { roundId },
    orderBy: { order: "asc" },
    select: {
      id: true,
      type: true,
      group: true,
      order: true,
      results: {
        orderBy: { position: "asc" },
        select: {
          position: true,
          points: true,
          driver: { select: { fullName: true } },
        },
      },
    },
  });

  const isLegacyGroupFinal = (s: { type: string; group: string | null }) =>
    (s.type === "FINAL_QUALIFYING" || s.type === "FINAL_RACE") && s.group !== null;

  return sessions
    .filter((s) => !isLegacyGroupFinal(s))
    .map((s) => ({
      id: s.id,
      name: getSessionDisplayName(s.type, s.group ?? null, s.order),
      order: s.order,
      results: s.results.map((r) => ({
        position: r.position,
        driverName: r.driver.fullName,
        time: "—",
        points: r.points,
      })),
    }));
}

// --- Landing page: rounds feed + featured championship (DB direct, no self-fetch) ---

export type RoundsFeedItem = {
  id: string;
  name: string;
  championship_id: string | null;
  championship_name: string;
  date: string;
  track_name: string;
  computed_status: RoundStatus;
  updated_at: string;
};

export async function getRoundsFeedForLanding(): Promise<RoundsFeedItem[]> {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const completedCutoff = new Date(today);
    completedCutoff.setDate(completedCutoff.getDate() - 30);

    const rounds = await db.round.findMany({
      orderBy: { date: "asc" },
      include: {
        track: { select: { name: true } },
        championship: { select: { id: true, name: true } },
        sessions: {
          select: {
            type: true,
            group: true,
            status: true,
            results: { select: { id: true } },
          },
        },
        _count: { select: { roundDrivers: true } },
      },
    });

    const items: RoundsFeedItem[] = rounds.map((r) => {
      const relevantSessions = r.sessions.filter((s) => !LEGACY_GROUP_FINAL(s));
      const allSessionsComplete =
        relevantSessions.length > 0 &&
        relevantSessions.every((s) => isSessionComplete(s));

      const status = getRoundStatus({
        date: r.date,
        numberOfGroups: r.numberOfGroups,
        setupCompleted: r.setupCompleted,
        driverCount: r._count.roundDrivers,
        allSessionsComplete,
      });

      return {
        id: r.id,
        name: r.name,
        championship_id: r.championshipId,
        championship_name: r.championship?.name ?? "—",
        date: r.date.toISOString(),
        track_name: r.track?.name ?? "—",
        computed_status: status,
        updated_at: r.updatedAt.toISOString(),
      };
    });

    const filtered = items.filter((item) => {
      if (item.computed_status === "COMPLETED") {
        return new Date(item.updated_at).getTime() >= completedCutoff.getTime();
      }
      return true;
    });

    const sorted = [...filtered].sort((a, b) => {
      const statusOrder = (s: RoundStatus) =>
        s === "IN_PROGRESS" ? 0 : s === "UPCOMING" ? 1 : 2;
      const orderA = statusOrder(a.computed_status);
      const orderB = statusOrder(b.computed_status);
      if (orderA !== orderB) return orderA - orderB;
      if (a.computed_status === "UPCOMING")
        return new Date(a.date).getTime() - new Date(b.date).getTime();
      if (a.computed_status === "COMPLETED")
        return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
      return new Date(a.date).getTime() - new Date(b.date).getTime();
    });

    return sorted;
  } catch (error) {
    console.error("[getRoundsFeedForLanding]", error);
    return [];
  }
}

export type FeaturedChampionshipResult = {
  championship: { id: string; name: string; startDate: string; endDate: string | null } | null;
  hasStandings: boolean;
  standings?: { fullName: string; totalPoints: number; roundsPlayed: number }[];
};

export async function getFeaturedChampionshipForLanding(): Promise<FeaturedChampionshipResult> {
  try {
    const championships = await db.championship.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        startDate: true,
        endDate: true,
        isCurrent: true,
      },
    });

    if (championships.length === 0) {
      return { championship: null, hasStandings: false };
    }

    const resultsWithChampionship = await db.sessionResult.findMany({
      where: {
        session: {
          round: { championshipId: { not: null } },
        },
      },
      select: {
        points: true,
        driverId: true,
        session: {
          select: {
            round: { select: { championshipId: true } },
          },
        },
      },
    });

    const championshipIdsWithStandings = new Set<string>();
    for (const r of resultsWithChampionship) {
      const cid = r.session.round.championshipId;
      if (cid) championshipIdsWithStandings.add(cid);
    }

    const featured =
      championships.find(
        (c) => c.isCurrent && championshipIdsWithStandings.has(c.id)
      ) ??
      championships.find((c) => championshipIdsWithStandings.has(c.id)) ??
      championships[0] ??
      null;

    if (!featured) {
      return { championship: null, hasStandings: false };
    }

    const hasStandings = championshipIdsWithStandings.has(featured.id);
    const result: FeaturedChampionshipResult = {
      championship: {
        id: featured.id,
        name: featured.name,
        startDate: featured.startDate.toISOString(),
        endDate: featured.endDate?.toISOString() ?? null,
      },
      hasStandings,
    };

    if (hasStandings) {
      const rounds = await db.round.findMany({
        where: { championshipId: featured.id },
        select: { id: true },
      });
      const roundIds = rounds.map((r) => r.id);
      if (roundIds.length > 0) {
        const results = await db.sessionResult.findMany({
          where: { session: { roundId: { in: roundIds } } },
          select: {
            driverId: true,
            points: true,
            session: { select: { roundId: true } },
          },
        });
        const driverPoints = new Map<string, number>();
        const driverRoundIds = new Map<string, Set<string>>();
        for (const r of results) {
          driverPoints.set(r.driverId, (driverPoints.get(r.driverId) ?? 0) + r.points);
          if (!driverRoundIds.has(r.driverId)) driverRoundIds.set(r.driverId, new Set());
          driverRoundIds.get(r.driverId)!.add(r.session.roundId);
        }
        const top5 = Array.from(driverPoints.entries())
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5)
          .map(([driverId]) => driverId);

        if (top5.length > 0) {
          const drivers = await db.driver.findMany({
            where: { id: { in: top5 } },
            select: { id: true, fullName: true },
          });
          const nameMap = new Map(drivers.map((d) => [d.id, d.fullName]));
          result.standings = top5.map((driverId) => {
            const roundIdsWithResults = driverRoundIds.get(driverId) ?? new Set<string>();
            return {
              fullName: nameMap.get(driverId) ?? "—",
              totalPoints: driverPoints.get(driverId) ?? 0,
              roundsPlayed: roundIdsWithResults.size,
            };
          });
        } else {
          result.standings = [];
        }
      } else {
        result.standings = [];
      }
    }

    return result;
  } catch (error) {
    console.error("[getFeaturedChampionshipForLanding]", error);
    return { championship: null, hasStandings: false };
  }
}

export type ChampionshipListItem = {
  id: string;
  name: string;
  startDate: string;
  endDate: string | null;
};

export async function getChampionshipsList(): Promise<ChampionshipListItem[]> {
  try {
    const championships = await db.championship.findMany({
      orderBy: { createdAt: "desc" },
      select: { id: true, name: true, startDate: true, endDate: true },
    });
    return championships.map((c) => ({
      id: c.id,
      name: c.name,
      startDate: c.startDate.toISOString(),
      endDate: c.endDate?.toISOString() ?? null,
    }));
  } catch (error) {
    console.error("[getChampionshipsList]", error);
    return [];
  }
}
