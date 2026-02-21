"use client";

import { useState, useEffect, FormEvent } from "react";
import { useRouter, useParams } from "next/navigation";
import toast from "react-hot-toast";
import { theme } from "@/lib/theme";
import {
  calculateSessionPoints,
  SessionType,
  PointsMultiplier,
} from "@/lib/points";
import { getSessionDisplayName } from "@/lib/session-utils";
import { formatPoints } from "@/lib/format-points";

interface Driver {
  id: string;
  fullName: string;
  group: string;
  kartNumber?: number;
  result: {
    position: number;
    points: number;
  } | null;
}

interface SessionData {
  session: {
    id: string;
    type: string;
    group: string | null;
    order: number;
    status?: string;
    pointsMultiplier: string | null;
  };
  round: {
    id: string;
    name: string;
    date: string;
    track: {
      id: string;
      name: string;
      location: string | null;
    };
    championship: {
      id: string;
      name: string;
      isCurrent: boolean;
    };
  };
  drivers: Driver[];
}

export default function SessionResultsPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [sessionData, setSessionData] = useState<SessionData | null>(null);
  const [pointsMultiplier, setPointsMultiplier] = useState<string>("NORMAL");
  const [positions, setPositions] = useState<Record<string, number>>({});
  const [regenerating, setRegenerating] = useState(false);

  useEffect(() => {
    fetchSessionData();
  }, [id]);

  const fetchSessionData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/sessions/${id}`);
      if (!response.ok) {
        throw new Error("Failed to fetch session");
      }
      const data: SessionData = await response.json();
      setSessionData(data);

      // Set multiplier from existing session data
      if (data.session.pointsMultiplier) {
        setPointsMultiplier(data.session.pointsMultiplier);
      }

      // Pre-fill positions from existing results
      const initialPositions: Record<string, number> = {};
      data.drivers.forEach((driver) => {
        if (driver.result) {
          initialPositions[driver.id] = driver.result.position;
        }
      });
      setPositions(initialPositions);
    } catch (err) {
      const errorMessage = "Failed to load session";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleAutoFill = () => {
    if (!sessionData) return;

    const sortedDrivers = [...sessionData.drivers].sort((a, b) =>
      a.fullName.localeCompare(b.fullName)
    );

    const newPositions: Record<string, number> = {};
    sortedDrivers.forEach((driver, index) => {
      newPositions[driver.id] = index + 1;
    });

    setPositions(newPositions);
  };

  const getSessionName = () => {
    if (!sessionData) return "";
    const session = sessionData.session;
    return getSessionDisplayName(session.type, session.group, session.order);
  };

  const getPreviewPoints = (driverId: string, position: number): number => {
    if (!sessionData || !position) return 0;

    const sessionType = sessionData.session.type as SessionType;
    const multiplier =
      sessionType === "RACE" || sessionType === "FINAL_RACE"
        ? (pointsMultiplier as PointsMultiplier)
        : null;

    return calculateSessionPoints(sessionType, position, multiplier);
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setSaving(true);

    try {
      if (!sessionData) {
        throw new Error("Session data not loaded");
      }

      // Validate all positions are filled
      const missingPositions = sessionData.drivers.filter(
        (driver) => !positions[driver.id] || positions[driver.id] < 1
      );

      if (missingPositions.length > 0) {
        setError("All drivers must have a position assigned");
        setSaving(false);
        return;
      }

      // Validate no duplicate positions
      const positionValues = Object.values(positions);
      const uniquePositions = new Set(positionValues);
      if (positionValues.length !== uniquePositions.size) {
        setError("Duplicate positions are not allowed");
        setSaving(false);
        return;
      }

      // Prepare results array
      const results = sessionData.drivers.map((driver) => ({
        driverId: driver.id,
        position: positions[driver.id],
      }));

      const payload: any = {
        results,
      };

      // Add multiplier for race sessions
      const isRaceSession =
        sessionData.session.type === "RACE" ||
        sessionData.session.type === "FINAL_RACE";
      if (isRaceSession) {
        payload.pointsMultiplier = pointsMultiplier;
      }

      const response = await fetch(`/api/admin/sessions/${id}/results`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        const errorMessage = data.error || "Failed to save results";
        setError(errorMessage);
        toast.error(errorMessage);
        setSaving(false);
        return;
      }

      toast.success("Results saved successfully");
      router.push(`/admin/rounds/${sessionData.round.id}`);
    } catch (err: any) {
      const errorMessage = err.message || "An error occurred. Please try again.";
      setError(errorMessage);
      toast.error(errorMessage);
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 w-full min-w-0">
        <div className="w-full max-w-4xl mx-auto">
          <div className="text-gray-300">Loading session...</div>
        </div>
      </div>
    );
  }

  if (error && !sessionData) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 w-full min-w-0">
        <div className="w-full max-w-4xl mx-auto">
          <div
            className="bg-red-50 border-l-4 p-4 rounded-r-lg mb-4"
            style={{ borderLeftColor: theme.colors.primary.red }}
          >
            <p className="text-sm font-medium" style={{ color: theme.colors.primary.red }}>
              {error}
            </p>
          </div>
          <button
            onClick={() => router.push("/admin/rounds")}
            className="px-4 py-2 border border-gray-400 text-gray-200 font-semibold rounded-lg transition-all duration-200 hover:bg-white hover:text-gray-900"
          >
            Back to Rounds
          </button>
        </div>
      </div>
    );
  }

  if (!sessionData) {
    return null;
  }

  const isRaceSession =
    sessionData.session.type === "RACE" ||
    sessionData.session.type === "FINAL_RACE";

  const hasResults = sessionData.drivers.some((d) => d.result != null);
  const isFinalQualifying =
    sessionData.session.type === "FINAL_QUALIFYING" &&
    sessionData.session.group === null;
  const isFinalRace =
    sessionData.session.type === "FINAL_RACE" &&
    sessionData.session.group === null;
  const isPending = sessionData.session.status === "PENDING";
  const pendingMessage = isFinalQualifying
    ? "Final Qualifying is waiting for qualifying results to determine drivers."
    : isFinalRace
    ? "Final Race is waiting for final qualifying to determine grid."
    : "Waiting for prerequisites.";

  const handleRegenerate = async () => {
    try {
      setRegenerating(true);
      const res = await fetch(`/api/admin/sessions/${id}/regenerate`, {
        method: "POST",
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(data.error || "Regenerate failed");
        return;
      }
      toast.success(data.message || "Regenerated");
      await fetchSessionData();
    } catch {
      toast.error("Regenerate failed");
    } finally {
      setRegenerating(false);
    }
  };

  const handleExport = async (format: "pdf" | "xlsx") => {
    try {
      const res = await fetch(`/api/admin/exports/sessions/${id}?format=${format}`);
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        toast.error(data.error || "Export failed");
        return;
      }
      const blob = await res.blob();
      const disposition = res.headers.get("Content-Disposition");
      const match = disposition?.match(/filename="?([^";\n]+)"?/);
      const filename = match?.[1] ?? `session-export.${format}`;
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      toast.error("Export failed");
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 w-full min-w-0">
      <div className="w-full max-w-4xl mx-auto">
        <div className="mb-6">
          <button
            onClick={() => router.push(`/admin/rounds/${sessionData.round.id}`)}
            className="min-h-[44px] px-3 py-2 text-sm text-white hover:text-gray-200 mb-4 inline-flex items-center"
          >
            ← Back to Round
          </button>
          <h1
            className="text-2xl sm:text-3xl font-heading font-semibold break-words"
            style={{ color: theme.colors.primary.red }}
          >
            {getSessionName()}
          </h1>
          <div className="mt-2 text-sm text-white">
            <p>
              <span className="font-medium">Championship:</span>{" "}
              {sessionData.round.championship.name}
              {sessionData.round.championship.isCurrent && " (Current)"}
            </p>
            <p>
              <span className="font-medium">Round:</span> {sessionData.round.name} -{" "}
              {new Date(sessionData.round.date).toLocaleDateString()}
            </p>
            <p>
              <span className="font-medium">Track:</span> {sessionData.round.track.name}
              {sessionData.round.track.location && ` - ${sessionData.round.track.location}`}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6">
          {isPending ? (
            <div className="py-12 text-center">
              <p className="text-gray-600 font-medium">{pendingMessage}</p>
            </div>
          ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {isFinalQualifying &&
              (sessionData.session.status === "READY" ||
                sessionData.session.status === "COMPLETED") && (
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleRegenerate}
                  disabled={regenerating}
                  className="text-sm px-3 py-2 border border-amber-500 text-amber-700 font-medium rounded hover:bg-amber-50 disabled:opacity-50"
                >
                  {regenerating ? "Regenerating..." : "Regenerate Final Qualifying"}
                </button>
              </div>
            )}
            {isRaceSession && (
              <div>
                <label htmlFor="pointsMultiplier" className="block text-sm font-medium text-gray-700 mb-2">
                  Points Multiplier *
                </label>
                <select
                  id="pointsMultiplier"
                  required
                  value={pointsMultiplier}
                  onChange={(e) => setPointsMultiplier(e.target.value)}
                  className="block w-full min-h-[44px] px-3 py-3 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200"
                  style={{
                    "--tw-ring-color": theme.colors.primary.red,
                  } as React.CSSProperties & { "--tw-ring-color": string }}
                  onFocus={(e) => (e.currentTarget.style.boxShadow = `0 0 0 2px ${theme.colors.primary.red}`)}
                  onBlur={(e) => (e.currentTarget.style.boxShadow = "")}
                >
                  <option value="NORMAL">Normal (100%)</option>
                  <option value="HALF">Half (50%)</option>
                  <option value="DOUBLE">Double (200%)</option>
                </select>
              </div>
            )}

            <div>
              <div className="flex flex-wrap justify-between items-center gap-2 mb-4">
                <h2 className="text-lg font-heading font-semibold text-gray-900">
                  Results
                </h2>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleAutoFill}
                    className="text-sm px-3 py-1 border border-gray-300 text-gray-700 font-medium rounded transition-all duration-200 hover:bg-gray-50"
                  >
                    Auto-fill Positions
                  </button>
                  <button
                    type="button"
                    onClick={() => handleExport("pdf")}
                    disabled={!hasResults}
                    className="text-sm px-3 py-1 border border-gray-300 text-gray-700 font-medium rounded transition-all duration-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Export PDF
                  </button>
                  <button
                    type="button"
                    onClick={() => handleExport("xlsx")}
                    disabled={!hasResults}
                    className="text-sm px-3 py-1 border border-gray-300 text-gray-700 font-medium rounded transition-all duration-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Export Excel
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[500px]">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Driver
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Group
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Kart
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Position
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Points
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {sessionData.drivers.map((driver) => (
                      <tr key={driver.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">
                          {driver.fullName}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-500">
                          {driver.group}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-500">
                          {driver.kartNumber ?? "—"}
                        </td>
                        <td className="px-4 py-3">
                          <input
                            type="number"
                            min="1"
                            max={sessionData.drivers.length}
                            value={positions[driver.id] || ""}
                            onChange={(e) =>
                              setPositions({
                                ...positions,
                                [driver.id]: parseInt(e.target.value) || 0,
                              })
                            }
                            className="w-20 px-2 py-1 border border-gray-300 rounded text-sm text-gray-900 focus:outline-none focus:ring-2 focus:border-transparent"
                            style={{
                              "--tw-ring-color": theme.colors.primary.red,
                            } as React.CSSProperties & { "--tw-ring-color": string }}
                            required
                          />
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-500">
                          {positions[driver.id]
                            ? formatPoints(
                                getPreviewPoints(driver.id, positions[driver.id])
                              )
                            : "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {error && (
              <div
                className="bg-red-50 border-l-4 p-4 rounded-r-lg"
                style={{ borderLeftColor: theme.colors.primary.red }}
              >
                <p className="text-sm font-medium" style={{ color: theme.colors.primary.red }}>
                  {error}
                </p>
              </div>
            )}

            <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
              <button
                type="submit"
                disabled={saving}
                className="w-full sm:w-auto min-h-[44px] px-6 py-3 text-white font-semibold rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                style={{ backgroundColor: theme.colors.primary.red }}
                onMouseEnter={(e) => !saving && (e.currentTarget.style.backgroundColor = "#A01516")}
                onMouseLeave={(e) => !saving && (e.currentTarget.style.backgroundColor = theme.colors.primary.red)}
              >
                {saving ? "Saving..." : "Save Results"}
              </button>
              <button
                type="button"
                onClick={() => router.push(`/admin/rounds/${sessionData.round.id}`)}
                disabled={saving}
                className="w-full sm:w-auto min-h-[44px] px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 flex items-center justify-center"
              >
                Cancel
              </button>
            </div>
          </form>
          )}
        </div>
      </div>
    </div>
  );
}
