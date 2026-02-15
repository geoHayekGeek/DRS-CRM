"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import toast from "react-hot-toast";
import { theme } from "@/lib/theme";

interface EventImage {
  id: string;
  imagePath: string;
  createdAt: string;
}

interface Event {
  id: string;
  title: string;
  description: string | null;
  startsAt: string;
  endsAt: string | null;
  location: string | null;
  createdAt: string;
  updatedAt: string;
  eventImages?: EventImage[];
}

function getEventStatus(event: Event): "Upcoming" | "Ongoing" | "Past" {
  const now = new Date();
  const start = new Date(event.startsAt);
  const end = event.endsAt ? new Date(event.endsAt) : null;

  if (end && now >= start && now <= end) {
    return "Ongoing";
  }
  if (start > now) {
    return "Upcoming";
  }
  return "Past";
}

export default function EventDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [galleryUploading, setGalleryUploading] = useState(false);

  useEffect(() => {
    if (!id) return;
    fetchEvent();
  }, [id]);

  const fetchEvent = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/events/${id}`);
      if (!response.ok) {
        if (response.status === 404) {
          setError("Event not found");
          setEvent(null);
          return;
        }
        throw new Error("Failed to fetch event");
      }
      const data = await response.json();
      setEvent(data);
      setError("");
    } catch (err) {
      setError("Failed to load event");
      toast.error("Failed to load event");
      setEvent(null);
    } finally {
      setLoading(false);
    }
  };

  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0 || !event) return;

    try {
      setGalleryUploading(true);
      const uploads = Array.from(files).map(async (file) => {
        const formData = new FormData();
        formData.append("file", file);
        const res = await fetch(`/api/admin/events/${id}/images`, {
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
      setEvent((prev) =>
        prev
          ? {
              ...prev,
              eventImages: [...(prev.eventImages ?? []), ...results],
            }
          : null
      );
      toast.success(`${results.length} image${results.length > 1 ? "s" : ""} uploaded`);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setGalleryUploading(false);
      e.target.value = "";
    }
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString(undefined, {
      dateStyle: "full",
      timeStyle: "short",
    });
  };

  if (loading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 w-full min-w-0">
        <div className="text-gray-300">Loading event...</div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 w-full min-w-0">
        <div className="mb-4">
          <Link
            href="/admin/events"
            className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Events
          </Link>
        </div>
        <div className="bg-red-50 border-l-4 p-4 rounded-r-lg" style={{ borderLeftColor: theme.colors.primary.red }}>
          <p className="text-sm font-medium" style={{ color: theme.colors.primary.red }}>
            {error || "Event not found"}
          </p>
        </div>
      </div>
    );
  }

  const status = getEventStatus(event);

  return (
    <div className="p-4 sm:p-6 lg:p-8 w-full min-w-0">
      <div className="w-full max-w-2xl mx-auto">
        <div className="mb-6">
          <Link
            href="/admin/events"
            className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Events
          </Link>
        </div>

        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-6">
          <h1
            className="text-2xl sm:text-3xl font-heading font-semibold"
            style={{ color: theme.colors.primary.red }}
          >
            {event.title}
          </h1>
          <Link
            href={`/admin/events/${event.id}/edit`}
            className="w-full sm:w-auto min-h-[44px] px-4 py-2 text-white font-semibold rounded-lg transition-all duration-200 flex items-center justify-center"
            style={{ backgroundColor: theme.colors.primary.red }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#A01516")}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = theme.colors.primary.red)}
          >
            Edit Event
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6 space-y-6">
          <div>
            <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</span>
            <div className="mt-1">
              <span
                className={`inline-block px-2 py-1 text-sm font-semibold rounded uppercase ${
                  status === "Ongoing" ? "bg-green-100 text-green-800" : status === "Upcoming" ? "bg-blue-100 text-blue-800" : "bg-gray-100 text-gray-600"
                }`}
              >
                {status}
              </span>
            </div>
          </div>

          <div>
            <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Starts</span>
            <p className="mt-1 text-gray-900 font-medium">{formatDateTime(event.startsAt)}</p>
          </div>

          <div>
            <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Ends</span>
            <p className="mt-1 text-gray-900 font-medium">
              {event.endsAt ? formatDateTime(event.endsAt) : "N/A (point-in-time event)"}
            </p>
          </div>

          {event.location && (
            <div>
              <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Location</span>
              <p className="mt-1 text-gray-900 font-medium">{event.location}</p>
            </div>
          )}

          {event.description && (
            <div>
              <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Description</span>
              <p className="mt-1 text-gray-900 whitespace-pre-wrap">{event.description}</p>
            </div>
          )}

          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-heading font-semibold text-gray-900">Event Gallery</h2>
              <label
                className="px-4 py-2 text-sm font-bold text-white rounded-lg cursor-pointer transition-all duration-200 shadow-lg"
                style={{
                  backgroundColor: theme.colors.primary.red,
                  textShadow: "0 1px 3px rgba(0, 0, 0, 0.5)",
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
            {(event.eventImages?.length ?? 0) > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-6">
                {event.eventImages?.map((img) => (
                  <div key={img.id} className="relative group">
                    <button
                      type="button"
                      className="block w-full aspect-square rounded-lg overflow-hidden border border-gray-200 hover:ring-2 hover:ring-red-600 focus:ring-2 focus:ring-red-600 focus:outline-none"
                    >
                      <img
                        src={img.imagePath}
                        alt="Gallery"
                        className="w-full h-full object-cover"
                      />
                    </button>
                    <button
                      type="button"
                      onClick={async () => {
                        try {
                          const res = await fetch(`/api/admin/events/${id}/images/${img.id}`, { method: "DELETE" });
                          if (!res.ok) {
                            const data = await res.json();
                            toast.error(data.error || "Delete failed");
                            return;
                          }
                          setEvent((prev) =>
                            prev
                              ? {
                                  ...prev,
                                  eventImages: prev.eventImages?.filter((i) => i.id !== img.id) ?? [],
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
              <p className="text-sm text-gray-600 mb-6">No gallery images uploaded yet.</p>
            )}
          </div>

          <div className="pt-4 border-t border-gray-200 text-xs text-gray-600">
            Created: {new Date(event.createdAt).toLocaleString()} | Updated: {new Date(event.updatedAt).toLocaleString()}
          </div>
        </div>
      </div>
    </div>
  );
}
