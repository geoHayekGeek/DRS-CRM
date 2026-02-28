"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import toast from "react-hot-toast";
import { Trophy, Medal, Flag, Target, ChevronDown, ChevronUp } from "lucide-react";
import { theme } from "@/lib/theme";
import { getSessionDisplayName } from "@/lib/session-utils";
import { formatPoints } from "@/lib/format-points";

interface PerformanceSession {
  sessionId: string;
  sessionType: string;
  group: string | null;
  position: number;
  points: number;
  multiplier: string | null;
}

interface PerformanceRound {
  roundId: string;
  roundName: string;
  trackName: string;
  roundPoints: number;
  wins: number;
  podiums: number;
  polePositions: number;
  sessions: PerformanceSession[];
}

interface PerformanceChampionship {
  championshipId: string;
  championshipName: string;
  totalPoints: number;
  roundsParticipated: number;
  positionInChampionship: number | null;
  wins: number;
  podiums: number;
  polePositions: number;
  rounds: PerformanceRound[];
}

interface CareerOverview {
  totalPoints: number;
  wins: number;
  podiums: number;
  polePositions: number;
}

interface PerformanceDriver {
  id: string;
  fullName: string;
  profileImageUrl: string | null;
  weight: number | null;
  height: number | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

interface PerformanceResponse {
  driver: PerformanceDriver;
  careerOverview?: CareerOverview;
  championships: PerformanceChampionship[];
}

function formatMultiplier(multiplier: string | null): string {
  if (!multiplier) return "—";
  switch (multiplier) {
    case "NORMAL":
      return "1x";
    case "HALF":
      return "0.5x";
    case "DOUBLE":
      return "2x";
    default:
      return multiplier;
  }
}

export default function DriverDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [data, setData] = useState<PerformanceResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandedRounds, setExpandedRounds] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchPerformance();
  }, [id]);

  const fetchPerformance = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/drivers/${id}/performance`);
      if (!response.ok) {
        throw new Error("Failed to fetch driver");
      }
      const json = await response.json();
      setData(json);
    } catch (err) {
      const errorMessage = "Failed to load driver";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const toggleRound = (roundId: string) => {
    setExpandedRounds((prev) => {
      const next = new Set(prev);
      if (next.has(roundId)) next.delete(roundId);
      else next.add(roundId);
      return next;
    });
  };

  if (loading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 w-full min-w-0">
        <div className="w-full max-w-4xl mx-auto">
          <div className="text-gray-300">Loading driver details...</div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 w-full min-w-0">
        <div className="w-full max-w-4xl mx-auto">
          <div
            className="bg-red-50 border-l-4 p-4 rounded-r-lg mb-4"
            style={{ borderLeftColor: theme.colors.primary.red }}
          >
            <p className="text-sm font-medium" style={{ color: theme.colors.primary.red }}>
              {error || "Driver not found"}
            </p>
          </div>
          <button
            onClick={() => router.push("/admin/drivers")}
            className="w-full sm:w-auto min-h-[44px] px-4 py-3 border border-gray-400 text-gray-200 font-semibold rounded-lg transition-all duration-200 hover:bg-white hover:text-gray-900 flex items-center justify-center"
          >
            Back to Drivers
          </button>
        </div>
      </div>
    );
  }

  const { driver, careerOverview, championships } = data;
  const hasResults = championships.length > 0;
  const career = careerOverview ?? {
    totalPoints: 0,
    wins: 0,
    podiums: 0,
    polePositions: 0,
  };

  const statCards = [
    {
      label: "Total Points",
      value: formatPoints(career.totalPoints),
      icon: Target,
    },
    { label: "Wins", value: String(career.wins), icon: Trophy },
    { label: "Podiums", value: String(career.podiums), icon: Medal },
    { label: "Pole Positions", value: String(career.polePositions), icon: Flag },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 w-full min-w-0">
      <div className="w-full max-w-4xl mx-auto">
        <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-start mb-6">
          <h1
            className="text-2xl sm:text-3xl font-heading font-semibold break-words"
            style={{ color: theme.colors.primary.red }}
          >
            {driver.fullName}
          </h1>
          <button
            onClick={() => router.push(`/admin/drivers/${id}/edit`)}
            className="w-full sm:w-auto min-h-[44px] px-4 py-3 text-white font-semibold rounded-lg transition-all duration-200 flex items-center justify-center shrink-0"
            style={{ backgroundColor: theme.colors.primary.red }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#A01516")}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = theme.colors.primary.red)}
          >
            Edit
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 space-y-6">
          <div className="flex flex-col sm:flex-row gap-6 items-start">
            <div className="shrink-0">
              {driver.profileImageUrl ? (
                <img
                  src={driver.profileImageUrl}
                  alt=""
                  className="h-32 w-32 rounded-full object-cover border border-gray-200"
                />
              ) : (
                <div
                  className="h-32 w-32 rounded-full border border-gray-200 flex items-center justify-center bg-gray-100 text-gray-400 text-sm"
                  aria-hidden
                >
                  No photo
                </div>
              )}
            </div>
            <div className="min-w-0">
              <h2 className="text-lg font-heading font-semibold text-gray-900 mb-2">
                Driver Information
              </h2>
              <h3 className="text-base font-medium text-gray-800 mb-1">{driver.fullName}</h3>
              <dl className="space-y-1">
                {driver.weight != null && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Weight</dt>
                    <dd className="text-sm text-gray-900">{driver.weight} kg</dd>
                  </div>
                )}
                {driver.height != null && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Height</dt>
                    <dd className="text-sm text-gray-900">{driver.height} cm</dd>
                  </div>
                )}
              </dl>
              {driver.notes && (
                <div className="mt-3">
                  <dt className="text-sm font-medium text-gray-500">Notes</dt>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap mt-0.5">{driver.notes}</p>
                </div>
              )}
            </div>
          </div>

          <div>
            <h2 className="text-lg font-heading font-semibold text-gray-900 mb-4">
              Performance Breakdown
            </h2>
            {!hasResults ? (
              <>
                <section className="mb-8" aria-label="Career overview">
                  <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">
                    Career Overview (All Time)
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {statCards.map(({ label, value, icon: Icon }) => (
                      <div
                        key={label}
                        className="rounded-lg border border-gray-200 bg-gray-50/50 p-3 flex items-center gap-3"
                      >
                        <div
                          className="shrink-0 w-9 h-9 rounded-md flex items-center justify-center text-gray-400"
                          style={{ backgroundColor: theme.colors.neutral.gray200 }}
                        >
                          <Icon className="w-4 h-4" strokeWidth={2} />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-medium text-gray-500 truncate">{label}</p>
                          <p className="text-lg font-semibold text-gray-900 tabular-nums">{value}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
                <p className="text-sm text-gray-500">
                  This driver has not participated in any sessions yet.
                </p>
              </>
            ) : (
              <div className="space-y-8">
                {/* Section 1 — Career Overview */}
                <section aria-label="Career overview">
                  <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">
                    Career Overview (All Time)
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {statCards.map(({ label, value, icon: Icon }) => (
                      <div
                        key={label}
                        className="rounded-lg border border-gray-200 bg-gray-50/50 p-3 flex items-center gap-3"
                      >
                        <div
                          className="shrink-0 w-9 h-9 rounded-md flex items-center justify-center text-gray-400"
                          style={{ backgroundColor: theme.colors.neutral.gray200 }}
                        >
                          <Icon className="w-4 h-4" strokeWidth={2} />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-medium text-gray-500 truncate">{label}</p>
                          <p className="text-lg font-semibold text-gray-900 tabular-nums">{value}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                {/* Section 2 — Per Championship Breakdown */}
                <section aria-label="Per championship breakdown">
                  <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">
                    Per Championship
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {championships.map((champ) => (
                      <div
                        key={champ.championshipId || champ.championshipName}
                        className="rounded-lg border border-gray-200 bg-white p-4 hover:border-gray-300 transition-colors"
                      >
                        <div className="mb-3">
                          {champ.championshipId ? (
                            <Link
                              href={`/admin/standings?championshipId=${champ.championshipId}`}
                              className="text-base font-semibold text-gray-900 hover:underline"
                            >
                              {champ.championshipName}
                            </Link>
                          ) : (
                            <span className="text-base font-semibold text-gray-900">
                              {champ.championshipName}
                            </span>
                          )}
                        </div>
                        <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-sm">
                          <span className="text-gray-500">Points</span>
                          <span className="text-gray-900 font-medium text-right tabular-nums">
                            {formatPoints(champ.totalPoints)}
                          </span>
                          <span className="text-gray-500">Position</span>
                          <span className="text-gray-900 font-medium text-right tabular-nums">
                            {champ.positionInChampionship != null
                              ? champ.positionInChampionship
                              : "—"}
                          </span>
                          <span className="text-gray-500">Wins</span>
                          <span className="text-gray-900 font-medium text-right tabular-nums">
                            {champ.wins ?? 0}
                          </span>
                          <span className="text-gray-500">Podiums</span>
                          <span className="text-gray-900 font-medium text-right tabular-nums">
                            {champ.podiums ?? 0}
                          </span>
                          <span className="text-gray-500">Poles</span>
                          <span className="text-gray-900 font-medium text-right tabular-nums">
                            {champ.polePositions ?? 0}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                {/* Section 3 — Per Round Breakdown (accordion) */}
                <section aria-label="Per round breakdown">
                  <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">
                    Per Round
                  </h3>
                  <div className="space-y-2">
                    {championships.map((champ) =>
                      champ.rounds.map((round) => {
                        const isExpanded = expandedRounds.has(round.roundId);
                        const wins = round.wins ?? 0;
                        const podiums = round.podiums ?? 0;
                        const poles = round.polePositions ?? 0;
                        return (
                          <div
                            key={round.roundId}
                            className="rounded-lg border border-gray-200 overflow-hidden bg-white"
                          >
                            <button
                              type="button"
                              onClick={() => toggleRound(round.roundId)}
                              className="w-full px-4 py-3 flex flex-wrap items-center justify-between gap-2 text-left hover:bg-gray-50 transition-colors"
                            >
                              <span className="font-medium text-gray-900">{round.roundName}</span>
                              <span className="text-sm text-gray-600">
                                {round.trackName} · {formatPoints(round.roundPoints)} pts
                              </span>
                              <span className="shrink-0 text-gray-400">
                                {isExpanded ? (
                                  <ChevronUp className="w-5 h-5" />
                                ) : (
                                  <ChevronDown className="w-5 h-5" />
                                )}
                              </span>
                            </button>
                            {isExpanded && (
                              <div className="border-t border-gray-200 bg-gray-50/50 px-4 py-3">
                                <div className="flex flex-wrap gap-4 mb-3 text-sm">
                                  <span className="text-gray-600">
                                    <span className="font-medium text-gray-900">{wins}</span> Wins
                                  </span>
                                  <span className="text-gray-600">
                                    <span className="font-medium text-gray-900">{podiums}</span>{" "}
                                    Podiums
                                  </span>
                                  <span className="text-gray-600">
                                    <span className="font-medium text-gray-900">{poles}</span> Poles
                                  </span>
                                </div>
                                <table className="min-w-full divide-y divide-gray-200">
                                  <thead>
                                    <tr>
                                      <th
                                        scope="col"
                                        className="py-1.5 pr-3 text-left text-xs font-medium text-gray-500 uppercase"
                                      >
                                        Session
                                      </th>
                                      <th
                                        scope="col"
                                        className="py-1.5 px-2 text-right text-xs font-medium text-gray-500 uppercase"
                                      >
                                        Position
                                      </th>
                                      <th
                                        scope="col"
                                        className="py-1.5 px-2 text-right text-xs font-medium text-gray-500 uppercase"
                                      >
                                        Points
                                      </th>
                                      <th
                                        scope="col"
                                        className="py-1.5 pl-2 text-right text-xs font-medium text-gray-500 uppercase"
                                      >
                                        Multiplier
                                      </th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-gray-200">
                                    {round.sessions.map((session) => (
                                      <tr key={session.sessionId}>
                                        <td className="py-1.5 pr-3 text-sm">
                                          <Link
                                            href={`/admin/sessions/${session.sessionId}`}
                                            className="text-gray-900 hover:underline"
                                          >
                                            {getSessionDisplayName(
                                              session.sessionType,
                                              session.group
                                            )}
                                          </Link>
                                        </td>
                                        <td className="py-1.5 px-2 text-sm text-gray-900 text-right tabular-nums">
                                          {session.position}
                                        </td>
                                        <td className="py-1.5 px-2 text-sm text-gray-900 text-right tabular-nums">
                                          {formatPoints(session.points)}
                                        </td>
                                        <td className="py-1.5 pl-2 text-sm text-gray-900 text-right">
                                          {formatMultiplier(session.multiplier)}
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>
                </section>
              </div>
            )}
          </div>
        </div>

        <div className="mt-6">
          <button
            onClick={() => router.push("/admin/drivers")}
            className="w-full sm:w-auto min-h-[44px] px-4 py-3 border border-gray-400 text-gray-200 font-semibold rounded-lg transition-all duration-200 hover:bg-white hover:text-gray-900 flex items-center justify-center"
          >
            Back to Drivers
          </button>
        </div>
      </div>
    </div>
  );
}
