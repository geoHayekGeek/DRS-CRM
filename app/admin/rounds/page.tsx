"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Eye, Pencil, Trash2, BarChart3 } from "lucide-react";
import toast from "react-hot-toast";
import { theme } from "@/lib/theme";
import { formatPoints } from "@/lib/format-points";

interface Track {
  id: string;
  name: string;
  location: string | null;
}

interface Championship {
  id: string;
  name: string;
  isCurrent: boolean;
}

interface Round {
  id: string;
  name: string;
  date: string;
  track: Track | null;
  championship: Championship | null;
  createdAt: string;
  roundStatus: "UPCOMING" | "PENDING" | "IN_PROGRESS" | "COMPLETED";
}

export default function RoundsPage() {
  const router = useRouter();
  const [rounds, setRounds] = useState<Round[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [pointsModalRound, setPointsModalRound] = useState<{ id: string; name: string } | null>(null);

  useEffect(() => {
    fetchRounds();
  }, []);

  const fetchRounds = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/rounds");
      if (!response.ok) {
        throw new Error("Failed to fetch rounds");
      }
      const data = await response.json();
      setRounds(data);
      setError("");
    } catch (err) {
      const errorMessage = "Failed to load rounds";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    const deleteToast = toast(
      (t) => (
        <div className="space-y-2">
          <p className="text-sm font-medium">Delete {name}?</p>
          <div className="flex gap-2">
            <button
              onClick={async () => {
                toast.dismiss(t.id);
                try {
                  setDeletingId(id);
                  const response = await fetch(`/api/admin/rounds/${id}`, {
                    method: "DELETE",
                  });

                  if (!response.ok) {
                    throw new Error("Failed to delete round");
                  }

                  toast.success("Round deleted successfully");
                  await fetchRounds();
                } catch (err) {
                  toast.error("Failed to delete round");
                } finally {
                  setDeletingId(null);
                }
              }}
              className="px-3 py-1 text-xs font-semibold rounded bg-red-600 hover:bg-red-700 text-white transition-colors"
            >
              Confirm
            </button>
            <button
              onClick={() => toast.dismiss(t.id)}
              className="px-3 py-1 text-xs font-semibold rounded bg-gray-600 hover:bg-gray-700 text-white transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      ),
      {
        duration: Infinity,
        style: {
          background: "#1F2937",
          color: "#F9FAFB",
          border: "1px solid #374151",
        },
      }
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 w-full min-w-0">
      <div className="w-full max-w-7xl mx-auto">
        <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center mb-6">
          <h1
            className="text-2xl sm:text-3xl font-heading font-semibold"
            style={{ color: theme.colors.primary.red }}
          >
            Rounds
          </h1>
          <button
            onClick={() => router.push("/admin/rounds/new")}
            className="w-full sm:w-auto min-h-[44px] px-4 py-2 text-white font-semibold rounded-lg transition-all duration-200 flex items-center justify-center"
            style={{ backgroundColor: theme.colors.primary.red }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#A01516")}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = theme.colors.primary.red)}
          >
            Add Round
          </button>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border-l-4 rounded-r-lg" style={{ borderLeftColor: theme.colors.primary.red }}>
            <p className="text-sm font-medium" style={{ color: theme.colors.primary.red }}>
              {error}
            </p>
          </div>
        )}

        {loading ? (
          <div className="text-gray-300">Loading rounds...</div>
        ) : rounds.length === 0 ? (
          <div className="text-gray-300">No rounds found. Add your first round to get started.</div>
        ) : (
          <div className="bg-white rounded-lg shadow-lg overflow-hidden overflow-x-auto">
            <table className="w-full min-w-[600px]">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Round Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Championship
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Track
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Created Date
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {rounds.map((round) => (
                  <tr key={round.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {round.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-0.5 text-xs font-medium uppercase tracking-wider rounded ${
                          round.roundStatus === "COMPLETED"
                            ? "bg-green-100 text-green-800"
                            : round.roundStatus === "IN_PROGRESS"
                              ? "bg-amber-50 text-amber-800"
                              : round.roundStatus === "UPCOMING"
                                ? "bg-blue-50 text-blue-800"
                                : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {round.roundStatus === "COMPLETED"
                          ? "COMPLETED"
                          : round.roundStatus === "IN_PROGRESS"
                            ? "IN PROGRESS"
                            : round.roundStatus === "UPCOMING"
                              ? "UPCOMING"
                              : "PENDING"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(round.date)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {round.championship?.name ?? "—"}{round.championship?.isCurrent ? " (Current)" : ""}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {round.track?.name ?? "—"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(round.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-3 flex-wrap">
                        <button
                          onClick={() => setPointsModalRound({ id: round.id, name: round.name })}
                          className="inline-flex items-center gap-1.5 px-2 py-1 text-xs font-medium border border-gray-300 rounded hover:bg-gray-50 text-gray-700 transition-colors"
                        >
                          <BarChart3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => router.push(`/admin/rounds/${round.id}`)}
                          className="p-1.5 text-gray-600 hover:text-blue-600 transition-colors rounded"
                          aria-label={`View ${round.name}`}
                          title="View round"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => router.push(`/admin/rounds/${round.id}/edit`)}
                          className="p-1.5 text-gray-600 hover:text-blue-600 transition-colors rounded"
                          aria-label={`Edit ${round.name}`}
                          title="Edit round"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(round.id, round.name)}
                          disabled={deletingId === round.id}
                          className="p-1.5 text-red-600 hover:text-red-700 transition-colors rounded disabled:opacity-50 disabled:cursor-not-allowed"
                          aria-label={`Delete ${round.name}`}
                          title="Delete round"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {pointsModalRound && (
          <PointsSummaryModal
            roundId={pointsModalRound.id}
            roundName={pointsModalRound.name}
            onClose={() => setPointsModalRound(null)}
          />
        )}
      </div>
    </div>
  );
}

interface PointsSummaryModalProps {
  roundId: string;
  roundName: string;
  onClose: () => void;
}

function PointsSummaryModal({ roundId, roundName, onClose }: PointsSummaryModalProps) {
  const [items, setItems] = useState<{ position: number; driverName: string; totalPoints: number }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/admin/rounds/${roundId}/points-summary`);
        if (!res.ok) throw new Error("Failed to fetch");
        const data = await res.json();
        if (!cancelled) setItems(data.items ?? []);
      } catch {
        if (!cancelled) setItems([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [roundId]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="points-summary-title"
    >
      <div
        className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 id="points-summary-title" className="text-lg font-semibold text-gray-900">
            Points Summary - {roundName}
          </h2>
        </div>
        <div className="flex-1 overflow-auto p-6">
          {loading ? (
            <p className="text-sm text-gray-500">Loading...</p>
          ) : items.length === 0 ? (
            <p className="text-sm text-gray-500">No points recorded yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-0">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Position
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Driver
                    </th>
                    <th className="px-4 py-2 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Total Points
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {items.map((row, i) => (
                    <tr
                      key={row.position}
                      className={
                        i < 3
                          ? "bg-amber-50/50"
                          : "hover:bg-gray-50"
                      }
                    >
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">
                        {row.position}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {row.driverName}
                      </td>
                      <td className="px-4 py-3 text-sm text-right font-medium text-gray-900">
                        {formatPoints(row.totalPoints)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        <div className="px-6 py-4 border-t border-gray-200">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
