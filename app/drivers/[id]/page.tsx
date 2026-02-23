import { headers } from "next/headers";
import { notFound } from "next/navigation";
import Link from "next/link";
import { DriverPerformance } from "@/components/drivers/DriverPerformance";
import type { DriverPublic, CareerStats, ChampionshipPublic } from "@/components/drivers/DriverPerformance";

export type DriverResponse = {
  driver: DriverPublic;
  performance?: {
    careerStats: CareerStats;
    championships: ChampionshipPublic[];
  };
};

async function getDriver(id: string): Promise<DriverResponse | null> {
  const headersList = await headers();
  const host = headersList.get("host") ?? "localhost:3000";
  const protocol = headersList.get("x-forwarded-proto") ?? "http";
  const base = `${protocol}://${host}`;
  const res = await fetch(`${base}/api/public/drivers/${id}`, {
    cache: "no-store",
  });
  if (res.status === 404) return null;
  if (!res.ok) return null;
  return res.json();
}

export default async function DriverPage({
  params,
}: {
  params: { id: string };
}) {
  const data = await getDriver(params.id);
  if (!data) notFound();

  const { driver, performance } = data;

  const careerStats = performance?.careerStats ?? {
    totalPoints: 0,
    wins: 0,
    podiums: 0,
    poles: 0,
  };
  const championships = performance?.championships ?? [];

  return (
    <div className="min-h-screen pt-20 pb-16 px-4">
      <div className="max-w-4xl mx-auto">
        <Link
          href="/drivers"
          className="inline-flex items-center text-sm text-gray-500 hover:text-gray-900 mb-8"
        >
          <svg
            className="w-4 h-4 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Back to drivers
        </Link>

        <DriverPerformance
          driver={driver}
          performance={{ careerStats, championships }}
        />
      </div>
    </div>
  );
}
