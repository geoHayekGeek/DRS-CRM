"use client";

import React, { useState, useEffect, useRef, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ChevronDown, ChevronRight } from "lucide-react";
import toast from "react-hot-toast";
import { theme } from "@/lib/theme";

interface Championship {
  id: string;
  name: string;
  isCurrent: boolean;
  startDate: string;
  endDate: string | null;
}

interface PointsByRound {
  roundId: string;
  roundName: string;
  points: number;
}

interface Standing {
  driverId: string;
  fullName: string;
  totalPoints: number;
  pointsByRound: PointsByRound[];
}

interface StandingsData {
  championship: {
    id: string;
    name: string;
  };
  rounds: { id: string; name: string; date: string }[];
  standings: Standing[];
}

function StandingsContent() {
  const searchParams = useSearchParams();
  const [championships, setChampionships] = useState<Championship[]>([]);
  const [selectedChampionshipId, setSelectedChampionshipId] = useState<string>("");
  const [standingsData, setStandingsData] = useState<StandingsData | null>(null);
  const [championshipsLoading, setChampionshipsLoading] = useState(true);
  const [standingsLoading, setStandingsLoading] = useState(false);
  const [error, setError] = useState("");
  const [expandedDriverId, setExpandedDriverId] = useState<string | null>(null);
  const hasAppliedUrlRef = useRef(false);

  useEffect(() => {
    fetchChampionships();
  }, []);

  useEffect(() => {
    if (championshipsLoading || championships.length === 0 || hasAppliedUrlRef.current) return;
    const idFromUrl = searchParams.get("championshipId");
    if (idFromUrl && championships.some((c) => c.id === idFromUrl)) {
      setSelectedChampionshipId(idFromUrl);
      hasAppliedUrlRef.current = true;
    }
  }, [championshipsLoading, championships, searchParams]);

  useEffect(() => {
    if (selectedChampionshipId) {
      fetchStandings(selectedChampionshipId);
    } else {
      setStandingsData(null);
    }
  }, [selectedChampionshipId]);

  const fetchChampionships = async () => {
    try {
      setChampionshipsLoading(true);
      const response = await fetch("/api/admin/championships");
      if (!response.ok) {
        throw new Error("Failed to fetch championships");
      }
      const data = await response.json();
      setChampionships(data);
      setError("");
    } catch (err) {
      const errorMessage = "Failed to load championships";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setChampionshipsLoading(false);
    }
  };

  const fetchStandings = async (championshipId: string) => {
    try {
      setStandingsLoading(true);
      setError("");
      const response = await fetch(`/api/admin/championships/${championshipId}/standings`);
      if (!response.ok) {
        throw new Error("Failed to fetch standings");
      }
      const data = await response.json();
      setStandingsData(data);
    } catch (err) {
      const errorMessage = "Failed to load standings";
      setError(errorMessage);
      toast.error(errorMessage);
      setStandingsData(null);
    } finally {
      setStandingsLoading(false);
    }
  };

  const toggleExpand = (driverId: string) => {
    setExpandedDriverId((prev) => (prev === driverId ? null : driverId));
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 w-full min-w-0">
      <div className="w-full max-w-4xl mx-auto">
        <div className="flex justify-between items-start mb-6">
          <h1
            className="text-2xl sm:text-3xl font-heading font-semibold"
            style={{ color: theme.colors.primary.red }}
          >
            Championship Standings
          </h1>
        </div>

        {error && (
          <div
            className="mb-4 p-4 bg-red-50 border-l-4 rounded-r-lg"
            style={{ borderLeftColor: theme.colors.primary.red }}
          >
            <p className="text-sm font-medium" style={{ color: theme.colors.primary.red }}>
              {error}
            </p>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 mb-6">
          <label htmlFor="championship" className="block text-sm font-medium text-gray-700 mb-2">
            Championship
          </label>
          <select
            id="championship"
            value={selectedChampionshipId}
            onChange={(e) => setSelectedChampionshipId(e.target.value)}
            disabled={championshipsLoading}
            className="block w-full min-h-[44px] px-3 py-3 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200 disabled:bg-gray-50 disabled:cursor-not-allowed"
            style={{
              "--tw-ring-color": theme.colors.primary.red,
            } as React.CSSProperties & { "--tw-ring-color": string }}
          >
            <option value="">Select a championship</option>
            {championships.map((championship) => (
              <option key={championship.id} value={championship.id}>
                {championship.name}
                {championship.isCurrent ? " (Current)" : ""}
              </option>
            ))}
          </select>
        </div>

        {standingsLoading && selectedChampionshipId ? (
          <div className="text-gray-300">Loading standings...</div>
        ) : standingsData && standingsData.standings.length > 0 ? (
          <div className="bg-white rounded-lg shadow-lg overflow-hidden overflow-x-auto">
            <div className="px-4 sm:px-6 py-3 border-b border-gray-200 flex justify-between items-center min-w-0">
              <h2 className="text-base sm:text-lg font-heading font-semibold text-gray-900 truncate">
                {standingsData.championship.name}
              </h2>
            </div>
            <table className="w-full min-w-[320px]">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider w-10">
                    #
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Driver
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Total Points
                  </th>
                  <th className="px-6 py-3 w-10" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {standingsData.standings.map((standing, index) => (
                  <React.Fragment key={standing.driverId}>
                    <tr className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {index + 1}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        <Link
                          href={`/admin/drivers/${standing.driverId}`}
                          className="hover:underline"
                        >
                          {standing.fullName}
                        </Link>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                        {standing.totalPoints}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {standing.pointsByRound.length > 0 && (
                          <button
                            type="button"
                            onClick={() => toggleExpand(standing.driverId)}
                            className="p-1 text-gray-500 hover:text-gray-700 rounded"
                            aria-label={
                              expandedDriverId === standing.driverId ? "Collapse" : "Expand"
                            }
                          >
                            {expandedDriverId === standing.driverId ? (
                              <ChevronDown className="w-4 h-4" />
                            ) : (
                              <ChevronRight className="w-4 h-4" />
                            )}
                          </button>
                        )}
                      </td>
                    </tr>
                    {expandedDriverId === standing.driverId &&
                      standing.pointsByRound.length > 0 && (
                        <tr key={`${standing.driverId}-detail`} className="bg-gray-50">
                          <td colSpan={4} className="px-6 py-4">
                            <div className="text-sm">
                              <p className="font-medium text-gray-700 mb-2">Points by round</p>
                              <table className="w-full max-w-md">
                                <thead>
                                  <tr className="border-b border-gray-200">
                                    <th className="text-left text-xs font-medium text-gray-500 uppercase">
                                      Round
                                    </th>
                                    <th className="text-right text-xs font-medium text-gray-500 uppercase">
                                      Points
                                    </th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {standing.pointsByRound.map((pr) => (
                                    <tr key={pr.roundId} className="border-b border-gray-100">
                                      <td className="py-1.5 text-gray-700">{pr.roundName}</td>
                                      <td className="py-1.5 text-right text-gray-600">
                                        {pr.points}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </td>
                        </tr>
                      )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        ) : standingsData && standingsData.standings.length === 0 ? (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <p className="text-sm text-gray-500">
              No results recorded for this championship yet.
            </p>
          </div>
        ) : !selectedChampionshipId ? (
          <div className="text-gray-500 text-sm">
            Select a championship to view standings.
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default function StandingsPage() {
  return (
    <Suspense fallback={
      <div className="p-4 sm:p-6 lg:p-8 w-full min-w-0">
        <div className="w-full max-w-4xl mx-auto">
          <div className="text-gray-500">Loading...</div>
        </div>
      </div>
    }>
      <StandingsContent />
    </Suspense>
  );
}
