import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { noStoreJson } from "@/lib/http-cache";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const aggregated = await db.sessionResult.groupBy({
      by: ["driverId"],
      _sum: { points: true },
    });

    const top4 = aggregated
      .map((a) => ({
        driverId: a.driverId,
        totalPoints: a._sum.points ?? 0,
      }))
      .sort((a, b) => b.totalPoints - a.totalPoints)
      .slice(0, 4);

    if (top4.length === 0) {
      return noStoreJson([]);
    }

    const drivers = await db.driver.findMany({
      where: { id: { in: top4.map((t) => t.driverId) } },
      select: {
        id: true,
        fullName: true,
        profileImageUrl: true,
        age: true,
        height: true,
      },
    });

    const driverMap = new Map(drivers.map((d) => [d.id, d]));
    const result = top4
      .map((t) => {
        const driver = driverMap.get(t.driverId);
        if (!driver) return null;
        return {
          id: driver.id,
          fullName: driver.fullName,
          profileImageUrl: driver.profileImageUrl,
          age: driver.age,
          height: driver.height,
        };
      })
      .filter((x): x is NonNullable<typeof x> => x != null);

    return noStoreJson(result);
  } catch (error) {
    return noStoreJson(
      { error: "Failed to fetch spotlight drivers" },
      { status: 500 }
    );
  }
}
