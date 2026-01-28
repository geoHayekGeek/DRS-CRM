"use client";

import { useState, FormEvent, useEffect } from "react";
import { useRouter } from "next/navigation";
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
  startDate: string;
}

export default function NewRoundPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [tracks, setTracks] = useState<Track[]>([]);
  const [tracksLoading, setTracksLoading] = useState(true);
  const [championships, setChampionships] = useState<Championship[]>([]);
  const [championshipsLoading, setChampionshipsLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    date: "",
    trackId: "",
    championshipId: "",
  });

  useEffect(() => {
    fetchTracks();
    fetchChampionships();
  }, []);

  useEffect(() => {
    // Auto-select championship when championships are loaded
    if (championships.length > 0 && !formData.championshipId) {
      const currentChampionships = championships.filter((c) => c.isCurrent);
      
      if (currentChampionships.length === 1) {
        // Exactly one current championship - auto-select it
        setFormData((prev) => ({ ...prev, championshipId: currentChampionships[0].id }));
      } else if (currentChampionships.length > 1) {
        // Multiple current championships - select most recently created (by startDate desc, then createdAt)
        const sorted = [...currentChampionships].sort((a, b) => {
          const dateA = new Date(a.startDate).getTime();
          const dateB = new Date(b.startDate).getTime();
          return dateB - dateA; // Most recent first
        });
        setFormData((prev) => ({ ...prev, championshipId: sorted[0].id }));
      }
    }
  }, [championships]);

  const fetchTracks = async () => {
    try {
      setTracksLoading(true);
      const response = await fetch("/api/admin/tracks");
      if (!response.ok) {
        throw new Error("Failed to fetch tracks");
      }
      const data = await response.json();
      setTracks(data);
    } catch (err) {
      toast.error("Failed to load tracks");
    } finally {
      setTracksLoading(false);
    }
  };

  const fetchChampionships = async () => {
    try {
      setChampionshipsLoading(true);
      const response = await fetch("/api/admin/championships");
      if (!response.ok) {
        throw new Error("Failed to fetch championships");
      }
      const data = await response.json();
      setChampionships(data);
    } catch (err) {
      toast.error("Failed to load championships");
    } finally {
      setChampionshipsLoading(false);
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (!formData.name.trim()) {
        setError("Round name is required");
        setLoading(false);
        return;
      }

      if (!formData.date) {
        setError("Date is required");
        setLoading(false);
        return;
      }

      if (!formData.trackId) {
        setError("Track is required");
        setLoading(false);
        return;
      }

      if (!formData.championshipId) {
        setError("Championship is required");
        setLoading(false);
        return;
      }

      const payload = {
        name: formData.name.trim(),
        date: formData.date,
        trackId: formData.trackId,
        championshipId: formData.championshipId,
      };

      const response = await fetch("/api/admin/rounds", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        const errorMessage = data.error || "Failed to create round";
        setError(errorMessage);
        toast.error(errorMessage);
        setLoading(false);
        return;
      }

      toast.success("Round created successfully");
      router.push("/admin/rounds");
    } catch (err) {
      const errorMessage = "An error occurred. Please try again.";
      setError(errorMessage);
      toast.error(errorMessage);
      setLoading(false);
    }
  };

  return (
    <div className="p-8">
      <div className="max-w-2xl mx-auto">
        <h1
          className="text-3xl font-heading font-semibold mb-6"
          style={{ color: theme.colors.primary.red }}
        >
          Add New Round
        </h1>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Round Name *
              </label>
              <input
                id="name"
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="block w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200"
                style={{
                  "--tw-ring-color": theme.colors.primary.red,
                } as React.CSSProperties & { "--tw-ring-color": string }}
                onFocus={(e) => (e.currentTarget.style.boxShadow = `0 0 0 2px ${theme.colors.primary.red}`)}
                onBlur={(e) => (e.currentTarget.style.boxShadow = "")}
              />
            </div>

            <div>
              <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-2">
                Date *
              </label>
              <input
                id="date"
                type="date"
                required
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="block w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200"
                style={{
                  "--tw-ring-color": theme.colors.primary.red,
                } as React.CSSProperties & { "--tw-ring-color": string }}
                onFocus={(e) => (e.currentTarget.style.boxShadow = `0 0 0 2px ${theme.colors.primary.red}`)}
                onBlur={(e) => (e.currentTarget.style.boxShadow = "")}
              />
            </div>

            <div>
              <label htmlFor="championshipId" className="block text-sm font-medium text-gray-700 mb-2">
                Championship *
              </label>
              {championships.length === 0 ? (
                <div className="space-y-2">
                  <select
                    id="championshipId"
                    required
                    disabled
                    className="block w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
                  >
                    <option value="">No championships available</option>
                  </select>
                  <p className="text-sm text-gray-500">
                    No championships found.{" "}
                    <a
                      href="/admin/championships/new"
                      className="text-red-600 hover:text-red-700 underline font-medium"
                    >
                      Create a championship first
                    </a>
                    .
                  </p>
                </div>
              ) : (
                <select
                  id="championshipId"
                  required
                  value={formData.championshipId}
                  onChange={(e) => setFormData({ ...formData, championshipId: e.target.value })}
                  disabled={championshipsLoading}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200 disabled:bg-gray-50 disabled:cursor-not-allowed"
                  style={{
                    "--tw-ring-color": theme.colors.primary.red,
                  } as React.CSSProperties & { "--tw-ring-color": string }}
                  onFocus={(e) => (e.currentTarget.style.boxShadow = `0 0 0 2px ${theme.colors.primary.red}`)}
                  onBlur={(e) => (e.currentTarget.style.boxShadow = "")}
                >
                  <option value="">Select a championship</option>
                  {championships.map((championship) => (
                    <option key={championship.id} value={championship.id}>
                      {championship.name}{championship.isCurrent ? " (Current)" : ""}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div>
              <label htmlFor="trackId" className="block text-sm font-medium text-gray-700 mb-2">
                Track *
              </label>
              <select
                id="trackId"
                required
                value={formData.trackId}
                onChange={(e) => setFormData({ ...formData, trackId: e.target.value })}
                disabled={tracksLoading}
                className="block w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200 disabled:bg-gray-50 disabled:cursor-not-allowed"
                style={{
                  "--tw-ring-color": theme.colors.primary.red,
                } as React.CSSProperties & { "--tw-ring-color": string }}
                onFocus={(e) => (e.currentTarget.style.boxShadow = `0 0 0 2px ${theme.colors.primary.red}`)}
                onBlur={(e) => (e.currentTarget.style.boxShadow = "")}
              >
                <option value="">Select a track</option>
                {tracks.map((track) => (
                  <option key={track.id} value={track.id}>
                    {track.name}{track.location ? ` - ${track.location}` : ""}
                  </option>
                ))}
              </select>
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

            <div className="flex gap-4">
              <button
                type="submit"
                disabled={loading || tracksLoading || championshipsLoading || championships.length === 0}
                className="px-6 py-2 text-white font-semibold rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ backgroundColor: theme.colors.primary.red }}
                onMouseEnter={(e) => !loading && !tracksLoading && !championshipsLoading && championships.length > 0 && (e.currentTarget.style.backgroundColor = "#A01516")}
                onMouseLeave={(e) => !loading && !tracksLoading && !championshipsLoading && championships.length > 0 && (e.currentTarget.style.backgroundColor = theme.colors.primary.red)}
              >
                {loading ? "Creating..." : "Create Round"}
              </button>
              <button
                type="button"
                onClick={() => router.push("/admin/rounds")}
                disabled={loading}
                className="px-6 py-2 border border-gray-300 text-gray-700 font-semibold rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
