"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import toast from "react-hot-toast";
import { theme } from "@/lib/theme";

interface Track {
  id: string;
  name: string;
  location: string | null;
}

interface Championship {
  id: string;
  name: string;
  isCurrent: boolean;
  _count?: { championshipDrivers: number };
}

interface RoundImage {
  id: string;
  imageUrl: string;
  createdAt: string;
}

interface Round {
  id: string;
  name: string;
  date: string;
  track: Track;
  championship: Championship;
  numberOfGroups: number;
  availableKarts: number[];
  setupCompleted: boolean;
  createdAt: string;
  updatedAt: string;
  roundImages?: RoundImage[];
}

interface Session {
  id: string;
  type: string;
  group: string | null;
  order: number;
  hasResults: boolean;
  pointsMultiplier: string | null;
}

interface Driver {
  id: string;
  fullName: string;
}

interface GroupAssignment {
  id: string;
  group: string;
  kartNumber: number;
  driver: Driver;
}

export default function RoundDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [round, setRound] = useState<Round | null>(null);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [assignments, setAssignments] = useState<GroupAssignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [setupLoading, setSetupLoading] = useState(false);
  const [error, setError] = useState("");
  const [galleryUploading, setGalleryUploading] = useState(false);
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);

  useEffect(() => {
    fetchRound();
    fetchSessions();
    fetchAssignments();
  }, [id]);

  const fetchRound = async () => {
    try {
      const response = await fetch(`/api/admin/rounds/${id}`);
      if (!response.ok) {
        throw new Error("Failed to fetch round");
      }
      const data = await response.json();
      setRound(data);
    } catch (err) {
      const errorMessage = "Failed to load round";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const fetchSessions = async () => {
    try {
      const response = await fetch(`/api/admin/rounds/${id}/sessions`);
      if (response.ok) {
        const data = await response.json();
        setSessions(data);
      }
    } catch (err) {
      // Silently fail - sessions may not exist yet
    }
  };

  const fetchAssignments = async () => {
    try {
      const response = await fetch(`/api/admin/rounds/${id}/assignments`);
      if (response.ok) {
        const data = await response.json();
        setAssignments(data);
      }
    } catch (err) {
      // Silently fail - assignments may not exist yet
    }
  };

  const handleSetup = () => {
    const setupToast = toast(
      (t) => (
        <div className="space-y-2">
          <p className="text-sm font-medium">Setup this round?</p>
          <p className="text-xs text-gray-400">This will assign drivers to groups, assign karts, and create all sessions. This action cannot be undone.</p>
          <div className="flex gap-2">
            <button
              onClick={async () => {
                toast.dismiss(t.id);
                try {
                  setSetupLoading(true);
                  const response = await fetch(`/api/admin/rounds/${id}/setup`, {
                    method: "POST",
                  });

                  const data = await response.json();

                  if (!response.ok) {
                    throw new Error(data.error || "Failed to set up round");
                  }

                  toast.success("Round set up successfully");
                  await fetchRound();
                  await fetchSessions();
                  await fetchAssignments();
                } catch (err: any) {
                  toast.error(err.message || "Failed to set up round");
                } finally {
                  setSetupLoading(false);
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

  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    try {
      setGalleryUploading(true);
      const uploads = Array.from(files).map(async (file) => {
        const formData = new FormData();
        formData.append("file", file);
        const res = await fetch(`/api/admin/rounds/${id}/images`, {
          method: "POST",
          body: formData,
        });
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || "Upload failed");
        }
        return res.json();
      });

      const results = await Promise.all(uploads);
      setRound((prev) =>
        prev
          ? {
              ...prev,
              roundImages: [...(prev.roundImages ?? []), ...results],
            }
          : null
      );
      toast.success(`${results.length} image${results.length > 1 ? "s" : ""} uploaded`);
    } catch (err: any) {
      toast.error(err.message || "Upload failed");
    } finally {
      setGalleryUploading(false);
      e.target.value = "";
    }
  };

  const roundHasResults = sessions.some((s) => s.hasResults);
  const assignedDriverCount = round?.championship?._count?.championshipDrivers ?? 0;
  const canSetup = !round?.setupCompleted && assignedDriverCount > 0;

  const handleExport = async (format: "pdf" | "xlsx") => {
    try {
      const res = await fetch(`/api/admin/exports/rounds/${id}?format=${format}`);
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        toast.error(data.error || "Export failed");
        return;
      }
      const blob = await res.blob();
      const disposition = res.headers.get("Content-Disposition");
      const match = disposition?.match(/filename="?([^";\n]+)"?/);
      const filename = match?.[1] ?? `round-export.${format}`;
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

  if (loading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 w-full min-w-0">
        <div className="w-full max-w-4xl mx-auto">
          <div className="text-gray-300">Loading round details...</div>
        </div>
      </div>
    );
  }

  if (error || !round) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 w-full min-w-0">
        <div className="w-full max-w-4xl mx-auto">
          <div
            className="bg-red-50 border-l-4 p-4 rounded-r-lg mb-4"
            style={{ borderLeftColor: theme.colors.primary.red }}
          >
            <p className="text-sm font-medium" style={{ color: theme.colors.primary.red }}>
              {error || "Round not found"}
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

  return (
    <div className="p-4 sm:p-6 lg:p-8 w-full min-w-0">
      <div className="w-full max-w-4xl mx-auto">
        <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-start mb-6">
          <h1
            className="text-2xl sm:text-3xl font-heading font-semibold break-words"
            style={{ color: theme.colors.primary.red }}
          >
            {round.name}
          </h1>
          <div className="flex flex-wrap gap-3 shrink-0">
            {!round.setupCompleted && (
              <>
                {round.championship && assignedDriverCount === 0 && (
                  <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                    No drivers assigned to this championship. Assign drivers on the championship page to enable round setup.
                  </p>
                )}
                <button
                  onClick={handleSetup}
                  disabled={setupLoading || !canSetup}
                  className="px-4 py-2 text-white font-semibold rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ backgroundColor: theme.colors.primary.red }}
                  onMouseEnter={(e) => !setupLoading && canSetup && (e.currentTarget.style.backgroundColor = "#A01516")}
                  onMouseLeave={(e) => !setupLoading && canSetup && (e.currentTarget.style.backgroundColor = theme.colors.primary.red)}
                >
                  {setupLoading ? "Setting up..." : "Setup Round"}
                </button>
              </>
            )}
            <button
              onClick={() => handleExport("pdf")}
              disabled={!roundHasResults}
              className="px-4 py-2 border border-gray-300 text-white font-semibold rounded-lg transition-all duration-200 hover:bg-gray-50 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Export full round PDF
            </button>
            <button
              onClick={() => handleExport("xlsx")}
              disabled={!roundHasResults}
              className="px-4 py-2 border border-gray-300 text-white font-semibold rounded-lg transition-all duration-200 hover:bg-gray-50 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Export full round Excel
            </button>
            <button
              onClick={() => router.push(`/admin/rounds/${id}/edit`)}
              className="px-4 py-2 text-white font-semibold rounded-lg transition-all duration-200"
              style={{ backgroundColor: theme.colors.primary.red }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#A01516")}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = theme.colors.primary.red)}
            >
              Edit
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6 space-y-6">
          <div>
            <h2 className="text-lg font-heading font-semibold text-gray-900 mb-4">Round Information</h2>
            <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <dt className="text-sm font-medium text-gray-500">Round Name</dt>
                <dd className="mt-1 text-sm text-gray-900">{round.name}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Date</dt>
                <dd className="mt-1 text-sm text-gray-900">{formatDate(round.date)}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Championship</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {round.championship.name}{round.championship.isCurrent ? " (Current)" : ""}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Track</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {round.track.name}{round.track.location ? ` - ${round.track.location}` : ""}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Number of groups</dt>
                <dd className="mt-1 text-sm text-gray-900">{round.numberOfGroups ?? "—"}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Available karts</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {round.availableKarts?.length
                    ? round.availableKarts.join(", ")
                    : "—"}
                </dd>
              </div>
              {round.setupCompleted && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">Setup status</dt>
                  <dd className="mt-1 text-sm text-gray-900">Completed (groups and karts cannot be changed)</dd>
                </div>
              )}
              <div>
                <dt className="text-sm font-medium text-gray-500">Created</dt>
                <dd className="mt-1 text-sm text-gray-900">{formatDate(round.createdAt)}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Last Updated</dt>
                <dd className="mt-1 text-sm text-gray-900">{formatDate(round.updatedAt)}</dd>
              </div>
            </dl>
          </div>

          {assignments.length > 0 && (
            <div>
              <h2 className="text-lg font-heading font-semibold text-gray-900 mb-4">Group Assignments</h2>
              <div className="mt-4 overflow-x-auto overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Driver
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Group
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Kart Number
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {assignments.map((assignment) => (
                      <tr key={assignment.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">
                          {assignment.driver.fullName}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-500">
                          {assignment.group}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-500">
                          {assignment.kartNumber}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-heading font-semibold text-gray-900">Round Gallery</h2>
              <label
                className="px-4 py-2 text-sm font-bold text-white rounded-lg cursor-pointer transition-all duration-200 shadow-lg"
                style={{ 
                  backgroundColor: theme.colors.primary.red,
                  textShadow: "0 1px 3px rgba(0, 0, 0, 0.5)"
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#A01516")}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = theme.colors.primary.red)}
              >
                {galleryUploading ? "Uploading..." : "Add Images"}
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  multiple
                  onChange={handleGalleryUpload}
                  disabled={galleryUploading}
                  className="hidden"
                />
              </label>
            </div>
            {(round.roundImages?.length ?? 0) > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-6">
                {round.roundImages?.map((img) => (
                  <div key={img.id} className="relative group">
                    <button
                      type="button"
                      onClick={() => setLightboxUrl(img.imageUrl)}
                      className="block w-full aspect-square rounded-lg overflow-hidden border border-gray-200 hover:ring-2 hover:ring-red-600 focus:ring-2 focus:ring-red-600 focus:outline-none"
                    >
                      <img
                        src={img.imageUrl}
                        alt="Gallery"
                        className="w-full h-full object-cover"
                      />
                    </button>
                    <button
                      type="button"
                      onClick={async () => {
                        try {
                          const res = await fetch(`/api/admin/rounds/images/${img.id}`, { method: "DELETE" });
                          if (!res.ok) {
                            const data = await res.json();
                            toast.error(data.error || "Delete failed");
                            return;
                          }
                          setRound((prev) =>
                            prev
                              ? {
                                  ...prev,
                                  roundImages: prev.roundImages?.filter((i) => i.id !== img.id) ?? [],
                                }
                              : null
                          );
                          toast.success("Image removed");
                        } catch {
                          toast.error("Delete failed");
                        }
                      }}
                      className="absolute top-2 right-2 px-2 py-1 text-xs font-medium text-white rounded opacity-0 group-hover:opacity-100 transition-opacity"
                      style={{ backgroundColor: theme.colors.primary.red }}
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 mb-6">No gallery images uploaded yet.</p>
            )}
          </div>

          <div>
            <h2 className="text-lg font-heading font-semibold text-gray-900 mb-4">Sessions</h2>
            {sessions.length === 0 ? (
              <p className="text-sm text-gray-500">No sessions have been created for this round yet. Click "Setup Round" to generate sessions and assignments.</p>
            ) : (
              <div className="mt-4 overflow-x-auto overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Session
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Multiplier
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {sessions.map((session) => {
                      const getSessionName = () => {
                        if (session.type === "QUALIFYING") {
                          return `Qualifying ${session.order}`;
                        }
                        if (session.type === "RACE") {
                          return `Group ${session.group} Race`;
                        }
                        if (session.type === "FINAL_QUALIFYING") {
                          return "Final Qualifying";
                        }
                        if (session.type === "FINAL_RACE") {
                          return "Final Race";
                        }
                        return session.type.replace(/_/g, " ");
                      };

                      const isRaceSession = session.type === "RACE" || session.type === "FINAL_RACE";

                      return (
                        <tr key={session.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm font-medium">
                            <button
                              onClick={() => router.push(`/admin/sessions/${session.id}`)}
                              className="text-blue-600 hover:text-blue-800 hover:underline"
                            >
                              {getSessionName()}
                            </button>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-500">
                            {session.hasResults ? (
                              <span className="text-green-600 font-medium">Complete</span>
                            ) : (
                              <span className="text-gray-400">Incomplete</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-500">
                            {isRaceSession && session.pointsMultiplier
                              ? session.pointsMultiplier === "HALF"
                                ? "Half (50%)"
                                : session.pointsMultiplier === "DOUBLE"
                                ? "Double (200%)"
                                : "Normal (100%)"
                              : "—"}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        <div className="mt-6">
          <button
            onClick={() => router.push("/admin/rounds")}
            className="px-4 py-2 border border-gray-400 text-gray-200 font-semibold rounded-lg transition-all duration-200 hover:bg-white hover:text-gray-900"
          >
            Back to Rounds
          </button>
        </div>
      </div>

      {lightboxUrl && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={() => setLightboxUrl(null)}
          role="dialog"
          aria-modal="true"
          aria-label="View image"
        >
          <button
            type="button"
            onClick={() => setLightboxUrl(null)}
            className="absolute top-4 right-4 px-3 py-1 text-sm font-medium text-white rounded bg-gray-700 hover:bg-gray-600"
          >
            Close
          </button>
          <img
            src={lightboxUrl}
            alt="Enlarged"
            className="max-w-full max-h-full object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}
