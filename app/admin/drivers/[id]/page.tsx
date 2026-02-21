"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import toast from "react-hot-toast";
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
  sessions: PerformanceSession[];
}

interface PerformanceChampionship {
  championshipId: string;
  championshipName: string;
  totalPoints: number;
  roundsParticipated: number;
  positionInChampionship: number | null;
  rounds: PerformanceRound[];
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

  const { driver, championships } = data;
  const hasResults = championships.length > 0;

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
              <p className="text-sm text-gray-500">
                This driver has not participated in any sessions yet.
              </p>
            ) : (
              <div className="space-y-8">
                {/* 4.1 Championship Summary */}
                <section>
                  <h3 className="text-base font-heading font-semibold text-gray-800 mb-3">
                    Championship Summary
                  </h3>
                  <div className="overflow-x-auto -mx-4 sm:mx-0">
                    <table className="min-w-full divide-y divide-gray-200 min-w-[400px]">
                      <thead>
                        <tr>
                          <th
                            scope="col"
                            className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            Championship
                          </th>
                          <th
                            scope="col"
                            className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            Total points
                          </th>
                          <th
                            scope="col"
                            className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            Rounds participated
                          </th>
                          <th
                            scope="col"
                            className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            Position
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {championships.map((champ) => (
                          <tr key={champ.championshipId || champ.championshipName}>
                            <td className="px-4 py-2 text-sm whitespace-nowrap">
                              {champ.championshipId ? (
                                <Link
                                  href={`/admin/standings?championshipId=${champ.championshipId}`}
                                  className="text-gray-900 hover:underline"
                                >
                                  {champ.championshipName}
                                </Link>
                              ) : (
                                <span className="text-gray-900">{champ.championshipName}</span>
                              )}
                            </td>
                            <td className="px-4 py-2 text-sm text-gray-900 text-right">
                              {formatPoints(champ.totalPoints)}
                            </td>
                            <td className="px-4 py-2 text-sm text-gray-900 text-right">
                              {champ.roundsParticipated}
                            </td>
                            <td className="px-4 py-2 text-sm text-gray-900 text-right">
                              {champ.positionInChampionship != null
                                ? champ.positionInChampionship
                                : "—"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </section>

                {/* 4.2 Round Breakdown + 4.3 Session History (expand/collapse) */}
                <section>
                  <h3 className="text-base font-heading font-semibold text-gray-800 mb-3">
                    Round Breakdown
                  </h3>
                  <div className="space-y-2">
                    {championships.map((champ) => (
                      <div key={champ.championshipId || champ.championshipName}>
                        <div className="text-sm font-medium text-gray-700 mb-2">
                          {champ.championshipName}
                        </div>
                        <div className="border border-gray-200 rounded-lg overflow-hidden">
                          {champ.rounds.map((round) => {
                            const isExpanded = expandedRounds.has(round.roundId);
                            return (
                              <div
                                key={round.roundId}
                                className="border-b border-gray-200 last:border-b-0"
                              >
                                <div className="px-4 py-3 flex items-center justify-between gap-2 hover:bg-gray-50 transition-colors">
                                  <Link
                                    href={`/admin/rounds/${round.roundId}`}
                                    className="text-sm font-medium text-gray-900 hover:underline flex-1 min-w-0"
                                  >
                                    {round.roundName}
                                  </Link>
                                  <span className="text-sm text-gray-600 shrink-0">
                                    {round.trackName} · {formatPoints(round.roundPoints)} pts
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => toggleRound(round.roundId)}
                                    className="shrink-0 text-gray-500 text-sm p-1 hover:text-gray-700"
                                    aria-label={isExpanded ? "Collapse" : "Expand"}
                                  >
                                    {isExpanded ? "−" : "+"}
                                  </button>
                                </div>
                                {isExpanded && (
                                  <div className="bg-gray-50 px-4 py-3 border-t border-gray-200">
                                    <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
                                      Session History
                                    </h4>
                                    <table className="min-w-full divide-y divide-gray-200">
                                      <thead>
                                        <tr>
                                          <th
                                            scope="col"
                                            className="px-3 py-1.5 text-left text-xs font-medium text-gray-500 uppercase"
                                          >
                                            Session
                                          </th>
                                          <th
                                            scope="col"
                                            className="px-3 py-1.5 text-right text-xs font-medium text-gray-500 uppercase"
                                          >
                                            Position
                                          </th>
                                          <th
                                            scope="col"
                                            className="px-3 py-1.5 text-right text-xs font-medium text-gray-500 uppercase"
                                          >
                                            Points
                                          </th>
                                          <th
                                            scope="col"
                                            className="px-3 py-1.5 text-right text-xs font-medium text-gray-500 uppercase"
                                          >
                                            Multiplier
                                          </th>
                                        </tr>
                                      </thead>
                                      <tbody className="divide-y divide-gray-200">
                                        {round.sessions.map((session) => (
                                          <tr key={session.sessionId}>
                                            <td className="px-3 py-1.5 text-sm">
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
                                            <td className="px-3 py-1.5 text-sm text-gray-900 text-right">
                                              {session.position}
                                            </td>
                                            <td className="px-3 py-1.5 text-sm text-gray-900 text-right">
                                              {formatPoints(session.points)}
                                            </td>
                                            <td className="px-3 py-1.5 text-sm text-gray-900 text-right">
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
                          })}
                        </div>
                      </div>
                    ))}
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
