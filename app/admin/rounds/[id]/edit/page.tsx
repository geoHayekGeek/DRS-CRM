"use client";

import { useState, FormEvent, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import toast from "react-hot-toast";
import { theme } from "@/lib/theme";
import { DriverMultiSelect } from "@/components/admin/DriverMultiSelect";

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
  trackId: string;
  championshipId: string;
  numberOfGroups: number;
  availableKarts: number[];
  setupCompleted: boolean;
  track: Track;
  championship: Championship;
}

export default function EditRoundPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
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
    numberOfGroups: "0",
    availableKarts: "",
  });
  const [setupCompleted, setSetupCompleted] = useState(false);
  const [allDrivers, setAllDrivers] = useState<{ id: string; fullName: string }[]>([]);
  const [selectedDriverIds, setSelectedDriverIds] = useState<string[]>([]);
  const [driversLoading, setDriversLoading] = useState(true);

  useEffect(() => {
    fetchTracks();
    fetchChampionships();
    fetchDrivers();
    fetchRound();
  }, [id]);

  const fetchDrivers = async () => {
    try {
      setDriversLoading(true);
      const response = await fetch("/api/admin/drivers");
      if (response.ok) {
        const data = await response.json();
        setAllDrivers(data);
      }
    } catch {
      toast.error("Failed to load drivers");
    } finally {
      setDriversLoading(false);
    }
  };

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

  const fetchRound = async () => {
    try {
      setLoading(true);
      const [roundRes, driversRes] = await Promise.all([
        fetch(`/api/admin/rounds/${id}`),
        fetch(`/api/admin/rounds/${id}/drivers`),
      ]);
      if (!roundRes.ok) {
        throw new Error("Failed to fetch round");
      }
      const round: Round = await roundRes.json();
      const dateStr = new Date(round.date).toISOString().split("T")[0];
      setSetupCompleted(round.setupCompleted ?? false);
      setFormData({
        name: round.name,
        date: dateStr,
        trackId: round.trackId ?? "",
        championshipId: round.championshipId ?? "",
        numberOfGroups: String(round.numberOfGroups ?? 0),
        availableKarts: (round.availableKarts ?? []).join(", "),
      });
      if (driversRes.ok) {
        const driversData = await driversRes.json();
        setSelectedDriverIds(driversData.map((d: { driverId: string }) => d.driverId));
      }
    } catch (err) {
      const errorMessage = "Failed to load round";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setSaving(true);

    try {
      if (!formData.name.trim()) {
        setError("Round name is required");
        setSaving(false);
        return;
      }

      if (!formData.date) {
        setError("Date is required");
        setSaving(false);
        return;
      }

      if (!formData.championshipId) {
        setError("Championship is required");
        setSaving(false);
        return;
      }

      const payload: Record<string, unknown> = {
        name: formData.name.trim(),
        date: formData.date,
        championshipId: formData.championshipId,
      };
      if (formData.trackId.trim()) {
        (payload as Record<string, unknown>).trackId = formData.trackId.trim();
      } else {
        (payload as Record<string, unknown>).trackId = null;
      }

      if (!setupCompleted) {
        const raw = formData.numberOfGroups.trim();
        const numGroups = raw === "" ? 0 : parseInt(formData.numberOfGroups, 10);
        if (isNaN(numGroups) || numGroups < 0) {
          setError("Number of groups must be 0 or greater");
          setSaving(false);
          return;
        }
        const kartsRaw = formData.availableKarts
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean);
        const karts: number[] = [];
        const seen = new Set<number>();
        for (const p of kartsRaw) {
          const n = parseInt(p, 10);
          if (isNaN(n) || !Number.isInteger(n)) {
            setError("Available karts must be unique integers (e.g. 1, 2, 3, 4)");
            setSaving(false);
            return;
          }
          if (seen.has(n)) {
            setError("Kart numbers must be unique");
            setSaving(false);
            return;
          }
          seen.add(n);
          karts.push(n);
        }
        payload.numberOfGroups = numGroups;
        payload.availableKarts = karts;
      }

      const response = await fetch(`/api/admin/rounds/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        const errorMessage = data.error || "Failed to update round";
        setError(errorMessage);
        toast.error(errorMessage);
        setSaving(false);
        return;
      }

      if (!setupCompleted) {
        const driversRes = await fetch(`/api/admin/rounds/${id}/drivers`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ driverIds: selectedDriverIds }),
        });
        if (!driversRes.ok) {
          const driversData = await driversRes.json().catch(() => ({}));
          toast.error(driversData.error || "Failed to update participating drivers");
          setSaving(false);
          return;
        }
      }

      toast.success("Round updated successfully");
      router.push(`/admin/rounds/${id}`);
    } catch (err) {
      const errorMessage = "An error occurred. Please try again.";
      setError(errorMessage);
      toast.error(errorMessage);
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 w-full min-w-0">
        <div className="w-full max-w-2xl mx-auto">
          <div className="text-gray-300">Loading round...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 w-full min-w-0">
      <div className="w-full max-w-2xl mx-auto">
        <h1
          className="text-2xl sm:text-3xl font-heading font-semibold mb-6"
          style={{ color: theme.colors.primary.red }}
        >
          Edit Round
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
            </div>

            {!setupCompleted && (
              <>
                <div>
                  <label htmlFor="participating-drivers" className="block text-sm font-medium text-gray-700 mb-2">
                    Participating Drivers
                  </label>
                  <p className="text-xs text-gray-500 mb-2">
                    Select drivers for this round (optional). Setup requires at least one driver.
                  </p>
                  <DriverMultiSelect
                    id="participating-drivers"
                    drivers={allDrivers}
                    selectedDriverIds={selectedDriverIds}
                    onChange={setSelectedDriverIds}
                    loading={driversLoading}
                    required={false}
                  />
                </div>
                <div>
                  <label htmlFor="numberOfGroups" className="block text-sm font-medium text-gray-700 mb-2">
                    Number of groups
                  </label>
                  <input
                    id="numberOfGroups"
                    type="number"
                    min={0}
                    value={formData.numberOfGroups}
                    onChange={(e) => setFormData({ ...formData, numberOfGroups: e.target.value })}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200"
                    style={{
                      "--tw-ring-color": theme.colors.primary.red,
                    } as React.CSSProperties & { "--tw-ring-color": string }}
                  />
                </div>
                <div>
                  <label htmlFor="availableKarts" className="block text-sm font-medium text-gray-700 mb-2">
                    Available karts
                  </label>
                  <input
                    id="availableKarts"
                    type="text"
                    value={formData.availableKarts}
                    onChange={(e) => setFormData({ ...formData, availableKarts: e.target.value })}
                    placeholder="e.g. 1, 2, 3, 4, 5, 6, 7, 8"
                    className="block w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200"
                    style={{
                      "--tw-ring-color": theme.colors.primary.red,
                    } as React.CSSProperties & { "--tw-ring-color": string }}
                  />
                </div>
              </>
            )}
            {setupCompleted && (
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-sm font-medium text-gray-700">Setup completed</p>
                <p className="text-xs text-gray-500 mt-1">Number of groups, available karts, and participating drivers cannot be changed after setup.</p>
              </div>
            )}

            <div>
              <label htmlFor="trackId" className="block text-sm font-medium text-gray-700 mb-2">
                Track
              </label>
              <select
                id="trackId"
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
                <option value="">Select a track (optional)</option>
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

            <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
              <button
                type="submit"
                disabled={saving || tracksLoading || championshipsLoading || driversLoading}
                className="w-full sm:w-auto min-h-[44px] px-6 py-3 text-white font-semibold rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                style={{ backgroundColor: theme.colors.primary.red }}
                onMouseEnter={(e) => !saving && !tracksLoading && !championshipsLoading && !driversLoading && (e.currentTarget.style.backgroundColor = "#A01516")}
                onMouseLeave={(e) => !saving && !tracksLoading && !championshipsLoading && !driversLoading && (e.currentTarget.style.backgroundColor = theme.colors.primary.red)}
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>
              <button
                type="button"
                onClick={() => router.push(`/admin/rounds/${id}`)}
                disabled={saving}
                className="w-full sm:w-auto min-h-[44px] px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 flex items-center justify-center"
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
