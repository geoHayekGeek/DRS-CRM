import { notFound } from "next/navigation";
import Link from "next/link";
import RoundDetail from "./RoundDetail";
import { getRoundPublic, getRoundSessionsPublic } from "@/lib/public-championship";

export default async function RoundPage({
  params,
}: {
  params: { championshipId: string; roundId: string };
}) {
  const [roundData, sessions] = await Promise.all([
    getRoundPublic(params.roundId),
    getRoundSessionsPublic(params.roundId),
  ]);
  if (!roundData) notFound();

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link
        href={`/championships/${params.championshipId}`}
        className="inline-flex items-center gap-2 text-gray-700 text-sm font-medium mb-6 hover:text-gray-900"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to Championship
      </Link>
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">{roundData.round.name}</h1>
        <p className="text-gray-700 mt-1">{formatDate(roundData.round.date)}</p>
        {(roundData.round.trackName || roundData.round.location) && (
          <p className="text-gray-700 text-sm mt-1">
            {[roundData.round.trackName, roundData.round.location].filter(Boolean).join(" · ")}
          </p>
        )}
      </header>
      <RoundDetail
        roundStandings={roundData.roundStandings}
        sessions={sessions}
        images={roundData.images}
      />
    </div>
  );
}
