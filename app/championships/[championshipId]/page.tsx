import { notFound } from "next/navigation";
import Link from "next/link";
import ChampionshipDetail from "./ChampionshipDetail";
import { getChampionshipPublic } from "@/lib/public-championship";

export default async function ChampionshipPage({
  params,
}: {
  params: { championshipId: string };
}) {
  const data = await getChampionshipPublic(params.championshipId);
  if (!data) notFound();

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link
        href="/championships"
        className="inline-flex items-center gap-2 text-gray-700 text-sm font-medium mb-6 hover:text-gray-900"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to Championships
      </Link>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">{data.championship.name}</h1>
      <ChampionshipDetail
        championshipId={data.championship.id}
        rounds={data.rounds}
        standings={data.standings}
      />
    </div>
  );
}
