"use client";

import { useState } from "react";
import Image from "next/image";
import { Trophy, Medal, Flag } from "lucide-react";
import { theme } from "@/lib/theme";
import { formatPoints } from "@/lib/format-points";

const SESSION_TYPE_ORDER = ["QUALIFYING", "RACE", "FINAL_QUALIFYING", "FINAL_RACE"] as const;
const SESSION_LABELS: Record<string, string> = {
  QUALIFYING: "Qualifying",
  RACE: "Race",
  FINAL_QUALIFYING: "Final Qualifying",
  FINAL_RACE: "Final Race",
};

export type SessionPublic = {
  type: string;
  position: number;
  points: number;
};

export type RoundPublic = {
  roundId: string;
  roundName: string;
  trackName: string;
  roundPoints: number;
  positionInRound: number | null;
  wins: number;
  podiums: number;
  poles: number;
  sessions: SessionPublic[];
};

export type ChampionshipPublic = {
  championshipName: string;
  totalPoints: number;
  positionInChampionship: number | null;
  wins: number;
  podiums: number;
  poles: number;
  rounds: RoundPublic[];
};

export type CareerStats = {
  totalPoints: number;
  wins: number;
  podiums: number;
  poles: number;
};

export type DriverPublic = {
  fullName: string;
  profileImageUrl: string | null;
  weight: number | null;
  height: number | null;
  notes: string | null;
};

type DriverPerformanceProps = {
  driver: DriverPublic;
  performance: {
    careerStats: CareerStats;
    championships: ChampionshipPublic[];
  };
};

function PositionBadge({ position }: { position: number }) {
  const isP1 = position === 1;
  const isP2 = position === 2;
  const isP3 = position === 3;
  return (
    <span
      className="inline-flex items-center justify-center min-w-[2.25rem] px-2 py-0.5 rounded text-sm font-bold tabular-nums"
      style={{
        backgroundColor: isP1
          ? "rgba(212, 175, 55, 0.2)"
          : isP2
            ? "rgba(192, 192, 192, 0.25)"
            : isP3
              ? "rgba(205, 127, 50, 0.2)"
              : theme.colors.neutral.gray100,
        color: isP1
          ? "#B8860B"
          : isP2
            ? "#6B7280"
            : isP3
              ? "#CD7F32"
              : theme.colors.neutral.gray700,
      }}
    >
      P{position}
    </span>
  );
}

function RoundCard({
  round,
  championshipName,
}: {
  round: RoundPublic;
  championshipName: string;
}) {
  const [expanded, setExpanded] = useState(false);

  const sortedSessions = [...round.sessions].sort(
    (a, b) =>
      SESSION_TYPE_ORDER.indexOf(a.type as (typeof SESSION_TYPE_ORDER)[number]) -
      SESSION_TYPE_ORDER.indexOf(b.type as (typeof SESSION_TYPE_ORDER)[number])
  );

  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{
        boxShadow: "0 1px 3px 0 rgba(0,0,0,0.06), 0 1px 2px -1px rgba(0,0,0,0.04)",
      }}
    >
      <div className="bg-white p-4 sm:p-5">
        <div className="flex flex-col gap-3">
          <p className="text-base font-semibold text-gray-900">
            {round.roundName} — {round.trackName}
          </p>
          <div className="flex flex-wrap items-center gap-3">
            {round.positionInRound != null && (
              <PositionBadge position={round.positionInRound} />
            )}
            <span className="text-gray-700 font-medium tabular-nums">
              {formatPoints(round.roundPoints)} pts
            </span>
          </div>
        </div>
        <div className="mt-3 flex flex-wrap gap-4 text-sm text-gray-600">
          <span className="inline-flex items-center gap-1.5">
            <Trophy className="w-4 h-4 text-amber-600 shrink-0" aria-hidden />
            <span><span className="font-semibold text-gray-900">{round.wins ?? 0}</span> Wins</span>
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Medal className="w-4 h-4 text-gray-500 shrink-0" aria-hidden />
            <span><span className="font-semibold text-gray-900">{round.podiums ?? 0}</span> Podiums</span>
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Flag className="w-4 h-4 text-gray-500 shrink-0" aria-hidden />
            <span><span className="font-semibold text-gray-900">{round.poles ?? 0}</span> Poles</span>
          </span>
        </div>
        <div className="mt-4 flex justify-end">
          <button
            type="button"
            onClick={() => setExpanded((e) => !e)}
            className="text-sm font-semibold px-4 py-2 rounded-lg transition-colors min-h-[44px] flex items-center justify-center"
            style={{
              color: theme.colors.primary.red,
              backgroundColor: "rgba(186, 23, 24, 0.08)",
            }}
          >
            {expanded ? "Hide details" : "View details"}
          </button>
        </div>
      </div>
      <div
        className="grid transition-[grid-template-rows] duration-300 ease-out"
        style={{ gridTemplateRows: expanded ? "1fr" : "0fr" }}
      >
        <div className="min-h-0 overflow-hidden">
          <div className="bg-gray-50/80 border-t border-gray-100">
            <div className="p-4 sm:p-5">
              <div className="flex flex-col gap-0">
                {sortedSessions.map((session, idx) => (
                  <div
                    key={`${session.type}-${idx}`}
                    className={
                      idx > 0
                        ? "pt-4 mt-4 border-t border-gray-200"
                        : ""
                    }
                  >
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5">
                      {SESSION_LABELS[session.type] ?? session.type.replace(/_/g, " ")}
                    </p>
                    <div className="flex items-center gap-3">
                      <PositionBadge position={session.position} />
                      <span className="text-gray-700 tabular-nums">
                        {formatPoints(session.points)} pts
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function DriverPerformance({ driver, performance }: DriverPerformanceProps) {
  const { careerStats, championships } = performance;

  return (
    <>
      {/* Section A — Driver Hero */}
      <header className="flex flex-col sm:flex-row gap-6 sm:gap-8 items-start mb-10">
        <div className="shrink-0">
          {driver.profileImageUrl ? (
            <div className="relative w-36 h-36 sm:w-44 sm:h-44 rounded-full overflow-hidden ring-2 ring-gray-100">
              <Image
                src={driver.profileImageUrl}
                alt=""
                fill
                className="object-cover"
                sizes="176px"
                priority
              />
            </div>
          ) : (
            <div
              className="w-36 h-36 sm:w-44 sm:h-44 rounded-full flex items-center justify-center ring-2 ring-gray-100"
              style={{ backgroundColor: theme.colors.neutral.gray100 }}
              aria-hidden
            >
              <svg
                className="w-14 h-14 text-gray-400"
                fill="currentColor"
                viewBox="0 0 24 24"
                aria-hidden
              >
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
              </svg>
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight mb-6">
            {driver.fullName}
          </h1>
          <div
            className="flex flex-wrap gap-6 sm:gap-8"
            role="list"
            aria-label="Career stats"
          >
            <div>
              <p className="text-2xl sm:text-3xl font-bold text-gray-900 tabular-nums">
                {careerStats.wins ?? 0}
              </p>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mt-0.5">
                Wins
              </p>
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-bold text-gray-900 tabular-nums">
                {careerStats.podiums ?? 0}
              </p>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mt-0.5">
                Podiums
              </p>
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-bold text-gray-900 tabular-nums">
                {careerStats.poles ?? 0}
              </p>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mt-0.5">
                Poles
              </p>
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-bold text-gray-900 tabular-nums">
                {formatPoints(careerStats.totalPoints ?? 0)}
              </p>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mt-0.5">
                Total Points
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Driver info — under hero, above championship */}
      <section className="mb-10" aria-label="Driver info">
        <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-4">
          Driver info
        </h2>
        <div
          className="rounded-xl p-6 space-y-3"
          style={{
            backgroundColor: "rgba(249, 250, 251, 0.8)",
            boxShadow: "0 1px 3px 0 rgba(0,0,0,0.04)",
          }}
        >
          <p className="text-gray-700">
            <span className="font-medium text-gray-500">Weight:</span>{" "}
            {driver.weight != null ? `${driver.weight} kg` : "—"}
          </p>
          <p className="text-gray-700">
            <span className="font-medium text-gray-500">Height:</span>{" "}
            {driver.height != null ? `${driver.height} cm` : "—"}
          </p>
          {driver.notes != null && driver.notes.trim() !== "" && (
            <div>
              <p className="font-medium text-gray-500 mb-1">Notes</p>
              <p className="text-gray-700 whitespace-pre-wrap">{driver.notes}</p>
            </div>
          )}
        </div>
      </section>

      {/* Section B — Championship Performance */}
      {championships.length > 0 && (
        <section className="mb-10" aria-label="Championship performance">
          <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-4">
            Championship Performance
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {championships.map((champ) => (
              <div
                key={champ.championshipName}
                className="rounded-xl p-5 bg-white"
                style={{
                  boxShadow: "0 1px 3px 0 rgba(0,0,0,0.06), 0 1px 2px -1px rgba(0,0,0,0.04)",
                }}
              >
                <p className="text-lg font-semibold text-gray-900 mb-3">
                  {champ.championshipName}
                </p>
                <div className="flex flex-wrap items-center gap-3 mb-3">
                  {champ.positionInChampionship != null && (
                    <PositionBadge position={champ.positionInChampionship} />
                  )}
                  <span className="text-gray-700 font-semibold tabular-nums">
                    {formatPoints(champ.totalPoints)} pts
                  </span>
                </div>
                <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                  <span className="inline-flex items-center gap-1.5">
                    <Trophy className="w-4 h-4 text-amber-600" aria-hidden />
                    <span>{champ.wins ?? 0} Wins</span>
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Medal className="w-4 h-4 text-gray-500" aria-hidden />
                    <span>{champ.podiums ?? 0} Podiums</span>
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Flag className="w-4 h-4 text-gray-500" aria-hidden />
                    <span>{champ.poles ?? 0} Poles</span>
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Section C — Round Performance */}
      {championships.length > 0 && (
        <section aria-label="Round performance">
          <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-4">
            Round Performance
          </h2>
          <div className="space-y-4">
            {championships.map((champ) =>
              champ.rounds.map((round) => (
                <RoundCard
                  key={round.roundId}
                  round={round}
                  championshipName={champ.championshipName}
                />
              ))
            )}
          </div>
        </section>
      )}
    </>
  );
}
