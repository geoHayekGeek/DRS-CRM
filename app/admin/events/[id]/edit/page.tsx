"use client";

import { useState, FormEvent, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import toast from "react-hot-toast";
import { theme } from "@/lib/theme";

function toLocalDateTimeISO(isoString: string): string {
  const d = new Date(isoString);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const hours = String(d.getHours()).padStart(2, "0");
  const mins = String(d.getMinutes()).padStart(2, "0");
  return `${year}-${month}-${day}T${hours}:${mins}`;
}

export default function EditEventPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    startsAt: "",
    endsAt: "",
    location: "",
  });

  useEffect(() => {
    if (!id) return;
    fetchEvent();
  }, [id]);

  const fetchEvent = async () => {
    try {
      setFetchLoading(true);
      const response = await fetch(`/api/admin/events/${id}`);
      if (!response.ok) {
        if (response.status === 404) {
          toast.error("Event not found");
          router.push("/admin/events");
          return;
        }
        throw new Error("Failed to fetch event");
      }
      const data = await response.json();
      setFormData({
        title: data.title,
        description: data.description || "",
        startsAt: toLocalDateTimeISO(data.startsAt),
        endsAt: data.endsAt ? toLocalDateTimeISO(data.endsAt) : "",
        location: data.location || "",
      });
      setError("");
    } catch (err) {
      toast.error("Failed to load event");
      setError("Failed to load event");
    } finally {
      setFetchLoading(false);
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (!formData.title.trim()) {
        setError("Title is required");
        toast.error("Title is required");
        setLoading(false);
        return;
      }

      if (formData.title.trim().length > 120) {
        setError("Title must be at most 120 characters");
        toast.error("Title must be at most 120 characters");
        setLoading(false);
        return;
      }

      if (!formData.startsAt.trim()) {
        setError("Start date/time is required");
        toast.error("Start date/time is required");
        setLoading(false);
        return;
      }

      const startsAt = new Date(formData.startsAt);
      if (isNaN(startsAt.getTime())) {
        setError("Invalid start date/time");
        toast.error("Invalid start date/time");
        setLoading(false);
        return;
      }

      let endsAt: string | null = null;
      if (formData.endsAt.trim()) {
        const endDate = new Date(formData.endsAt);
        if (isNaN(endDate.getTime())) {
          setError("Invalid end date/time");
          toast.error("Invalid end date/time");
          setLoading(false);
          return;
        }
        if (endDate < startsAt) {
          setError("End date/time must be on or after start date/time");
          toast.error("End date/time must be on or after start date/time");
          setLoading(false);
          return;
        }
        endsAt = endDate.toISOString();
      }

      if (formData.location.trim().length > 120) {
        setError("Location must be at most 120 characters");
        toast.error("Location must be at most 120 characters");
        setLoading(false);
        return;
      }

      const payload: { title?: string; startsAt?: string; endsAt?: string | null; location?: string | null; description?: string | null } = {
        title: formData.title.trim(),
        startsAt: startsAt.toISOString(),
        endsAt: endsAt ?? null,
        location: formData.location.trim() || null,
        description: formData.description.trim() || null,
      };

      const response = await fetch(`/api/admin/events/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        const errorMessage = data.error || "Failed to update event";
        setError(errorMessage);
        toast.error(errorMessage);
        setLoading(false);
        return;
      }

      toast.success("Event updated successfully");
      router.push("/admin/events");
    } catch (err) {
      const errorMessage = "An error occurred. Please try again.";
      setError(errorMessage);
      toast.error(errorMessage);
      setLoading(false);
    }
  };

  if (fetchLoading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 w-full min-w-0">
        <div className="text-gray-300">Loading event...</div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 w-full min-w-0">
      <div className="w-full max-w-2xl mx-auto">
        <div className="mb-6">
          <Link
            href={`/admin/events/${id}`}
            className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Event
          </Link>
        </div>

        <h1
          className="text-2xl sm:text-3xl font-heading font-semibold mb-6"
          style={{ color: theme.colors.primary.red }}
        >
          Edit Event
        </h1>

        <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                Title *
              </label>
              <input
                id="title"
                type="text"
                required
                maxLength={120}
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="block w-full min-h-[44px] px-3 py-3 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200"
                style={{ "--tw-ring-color": theme.colors.primary.red } as React.CSSProperties & { "--tw-ring-color": string }}
                onFocus={(e) => (e.currentTarget.style.boxShadow = `0 0 0 2px ${theme.colors.primary.red}`)}
                onBlur={(e) => (e.currentTarget.style.boxShadow = "")}
              />
              <p className="mt-1 text-xs text-gray-600">Max 120 characters</p>
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Description (optional)
              </label>
              <textarea
                id="description"
                rows={4}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="block w-full min-h-[44px] px-3 py-3 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200"
                style={{ "--tw-ring-color": theme.colors.primary.red } as React.CSSProperties & { "--tw-ring-color": string }}
                onFocus={(e) => (e.currentTarget.style.boxShadow = `0 0 0 2px ${theme.colors.primary.red}`)}
                onBlur={(e) => (e.currentTarget.style.boxShadow = "")}
                placeholder="Plain text description"
              />
            </div>

            <div>
              <label htmlFor="startsAt" className="block text-sm font-medium text-gray-700 mb-2">
                Start date/time *
              </label>
              <input
                id="startsAt"
                type="datetime-local"
                required
                value={formData.startsAt}
                onChange={(e) => setFormData({ ...formData, startsAt: e.target.value })}
                className="block w-full min-h-[44px] px-3 py-3 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200"
                style={{ "--tw-ring-color": theme.colors.primary.red } as React.CSSProperties & { "--tw-ring-color": string }}
                onFocus={(e) => (e.currentTarget.style.boxShadow = `0 0 0 2px ${theme.colors.primary.red}`)}
                onBlur={(e) => (e.currentTarget.style.boxShadow = "")}
              />
            </div>

            <div>
              <label htmlFor="endsAt" className="block text-sm font-medium text-gray-700 mb-2">
                End date/time (optional)
              </label>
              <input
                id="endsAt"
                type="datetime-local"
                value={formData.endsAt}
                onChange={(e) => setFormData({ ...formData, endsAt: e.target.value })}
                min={formData.startsAt || undefined}
                className="block w-full min-h-[44px] px-3 py-3 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200"
                style={{ "--tw-ring-color": theme.colors.primary.red } as React.CSSProperties & { "--tw-ring-color": string }}
                onFocus={(e) => (e.currentTarget.style.boxShadow = `0 0 0 2px ${theme.colors.primary.red}`)}
                onBlur={(e) => (e.currentTarget.style.boxShadow = "")}
              />
              <p className="mt-1 text-xs text-gray-500">Leave empty for point-in-time events</p>
            </div>

            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
                Location (optional)
              </label>
              <input
                id="location"
                type="text"
                maxLength={120}
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="block w-full min-h-[44px] px-3 py-3 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200"
                style={{ "--tw-ring-color": theme.colors.primary.red } as React.CSSProperties & { "--tw-ring-color": string }}
                onFocus={(e) => (e.currentTarget.style.boxShadow = `0 0 0 2px ${theme.colors.primary.red}`)}
                onBlur={(e) => (e.currentTarget.style.boxShadow = "")}
                placeholder="Optional"
              />
              <p className="mt-1 text-xs text-gray-600">Max 120 characters</p>
            </div>

            {error && (
              <div className="bg-red-50 border-l-4 p-4 rounded-r-lg" style={{ borderLeftColor: theme.colors.primary.red }}>
                <p className="text-sm font-medium" style={{ color: theme.colors.primary.red }}>{error}</p>
              </div>
            )}

            <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
              <button
                type="submit"
                disabled={loading}
                className="w-full sm:w-auto min-h-[44px] px-6 py-3 text-white font-semibold rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                style={{ backgroundColor: theme.colors.primary.red }}
                onMouseEnter={(e) => !loading && (e.currentTarget.style.backgroundColor = "#A01516")}
                onMouseLeave={(e) => !loading && (e.currentTarget.style.backgroundColor = theme.colors.primary.red)}
              >
                {loading ? "Saving..." : "Save Changes"}
              </button>
              <button
                type="button"
                onClick={() => router.push("/admin/events")}
                disabled={loading}
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
