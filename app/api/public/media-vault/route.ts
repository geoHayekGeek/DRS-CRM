import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export type MediaVaultImage = {
  id: string;
  imageUrl: string;
  roundId: string;
  roundName: string;
  championshipName: string;
  createdAt: string;
};

export type MediaVaultYear = {
  year: number;
  championshipId: string;
  championshipName: string;
  images: MediaVaultImage[];
};

export async function GET() {
  try {
    const roundImages = await db.roundImage.findMany({
      where: {
        round: {
          championshipId: { not: null },
        },
      },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        imageUrl: true,
        createdAt: true,
        roundId: true,
        round: {
          select: {
            name: true,
            championshipId: true,
            championship: {
              select: {
                id: true,
                name: true,
                startDate: true,
              },
            },
          },
        },
      },
    });

    const byYear = new Map<number, MediaVaultImage[]>();

    for (const img of roundImages) {
      const championship = img.round.championship;
      if (!championship) continue;

      const year = new Date(championship.startDate).getFullYear();
      if (!byYear.has(year)) byYear.set(year, []);
      const list = byYear.get(year)!;
      list.push({
        id: img.id,
        imageUrl: img.imageUrl,
        roundId: img.roundId,
        roundName: img.round.name,
        championshipName: championship.name,
        createdAt: img.createdAt.toISOString(),
      });
    }

    const result: MediaVaultYear[] = Array.from(byYear.entries())
      .filter(([, images]) => images.length > 0)
      .sort(([a], [b]) => b - a)
      .map(([year, images]) => {
        const firstImg = roundImages.find(
          (img) =>
            img.round.championship &&
            new Date(img.round.championship.startDate).getFullYear() === year
        );
        const championship = firstImg?.round.championship;
        return {
          year,
          championshipId: championship?.id ?? "",
          championshipName: championship?.name ?? "",
          images,
        };
      });

    return NextResponse.json(result);
  } catch (error) {
    console.error("[media-vault]", error);
    return NextResponse.json([], { status: 200 });
  }
}
