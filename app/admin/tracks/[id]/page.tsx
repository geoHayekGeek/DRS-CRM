"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Eye } from "lucide-react";
import toast from "react-hot-toast";
import { theme } from "@/lib/theme";

interface Round {
  id: string;
  name: string;
  date: string;
  createdAt: string;
}

interface TrackImage {
  id: string;
  imageUrl: string;
  createdAt: string;
}

interface Track {
  id: string;
  name: string;
  lengthMeters: number;
  location: string | null;
  layoutImageUrl: string | null;
  createdAt: string;
  updatedAt: string;
  rounds: Round[];
  trackImages?: TrackImage[];
}

export default function TrackDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [track, setTrack] = useState<Track | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);
  const [layoutUploading, setLayoutUploading] = useState(false);
  const [galleryUploading, setGalleryUploading] = useState(false);

  useEffect(() => {
    fetchTrack();
  }, [id]);

  const fetchTrack = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/tracks/${id}`);
      if (!response.ok) {
        throw new Error("Failed to fetch track");
      }
      const data = await response.json();
      setTrack(data);
    } catch (err) {
      const errorMessage = "Failed to load track";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const handleLayoutUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      setLayoutUploading(true);
      const res = await fetch(`/api/admin/tracks/${id}/layout`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error || "Upload failed");
        return;
      }

      const data = await res.json();
      setTrack((prev) => (prev ? { ...prev, layoutImageUrl: data.url } : null));
      toast.success("Layout image uploaded");
    } catch {
      toast.error("Upload failed");
    } finally {
      setLayoutUploading(false);
      e.target.value = "";
    }
  };

  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    try {
      setGalleryUploading(true);
      const uploads = Array.from(files).map(async (file) => {
        const formData = new FormData();
        formData.append("file", file);
        const res = await fetch(`/api/admin/tracks/${id}/images`, {
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
      setTrack((prev) =>
        prev
          ? {
              ...prev,
              trackImages: [...(prev.trackImages ?? []), ...results],
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

  if (loading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 w-full min-w-0">
        <div className="w-full max-w-4xl mx-auto">
          <div className="text-gray-300">Loading track details...</div>
        </div>
      </div>
    );
  }

  if (error || !track) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 w-full min-w-0">
        <div className="w-full max-w-4xl mx-auto">
          <div
            className="bg-red-50 border-l-4 p-4 rounded-r-lg mb-4"
            style={{ borderLeftColor: theme.colors.primary.red }}
          >
            <p className="text-sm font-medium" style={{ color: theme.colors.primary.red }}>
              {error || "Track not found"}
            </p>
          </div>
          <button
            onClick={() => router.push("/admin/tracks")}
            className="px-4 py-2 border border-gray-400 text-gray-200 font-semibold rounded-lg transition-all duration-200 hover:bg-white hover:text-gray-900"
          >
            Back to Tracks
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
            {track.name}
          </h1>
          <button
            onClick={() => router.push(`/admin/tracks/${id}/edit`)}
            className="w-full sm:w-auto min-h-[44px] px-4 py-3 text-white font-semibold rounded-lg transition-all duration-200 flex items-center justify-center shrink-0"
            style={{ backgroundColor: theme.colors.primary.red }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#A01516")}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = theme.colors.primary.red)}
          >
            Edit
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6 space-y-6">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-heading font-semibold text-gray-900">Track Layout</h2>
              <label
                className="px-4 py-2 text-sm font-bold text-white rounded-lg cursor-pointer transition-all duration-200 shadow-lg"
                style={{ 
                  backgroundColor: theme.colors.primary.red,
                  textShadow: "0 1px 3px rgba(0, 0, 0, 0.5)"
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#A01516")}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = theme.colors.primary.red)}
              >
                {layoutUploading ? "Uploading..." : track.layoutImageUrl ? "Replace Layout" : "Upload Layout"}
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleLayoutUpload}
                  disabled={layoutUploading}
                  className="hidden"
                />
              </label>
            </div>
            {track.layoutImageUrl && (
              <div className="rounded-lg overflow-hidden border border-gray-200">
                <img
                  src={track.layoutImageUrl}
                  alt="Track layout"
                  className="w-full max-h-80 object-contain bg-gray-50"
                />
              </div>
            )}
            {!track.layoutImageUrl && (
              <p className="text-sm text-gray-500">No layout image uploaded yet.</p>
            )}
          </div>

          <div>
            <h2 className="text-lg font-heading font-semibold text-gray-900 mb-4">Track Information</h2>
            <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <dt className="text-sm font-medium text-gray-500">Track Name</dt>
                <dd className="mt-1 text-sm text-gray-900">{track.name}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Length</dt>
                <dd className="mt-1 text-sm text-gray-900">{track.lengthMeters} meters</dd>
              </div>
              {track.location != null && track.location !== "" && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">Location</dt>
                  <dd className="mt-1 text-sm text-gray-900">{track.location}</dd>
                </div>
              )}
              <div>
                <dt className="text-sm font-medium text-gray-500">Created</dt>
                <dd className="mt-1 text-sm text-gray-900">{formatDate(track.createdAt)}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Last Updated</dt>
                <dd className="mt-1 text-sm text-gray-900">{formatDate(track.updatedAt)}</dd>
              </div>
            </dl>
          </div>

          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-heading font-semibold text-gray-900">Photo Gallery</h2>
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
            {(track.trackImages?.length ?? 0) > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {track.trackImages?.map((img) => (
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
                          const res = await fetch(`/api/admin/tracks/images/${img.id}`, { method: "DELETE" });
                          if (!res.ok) {
                            const data = await res.json();
                            toast.error(data.error || "Delete failed");
                            return;
                          }
                          setTrack((prev) =>
                            prev
                              ? {
                                  ...prev,
                                  trackImages: prev.trackImages?.filter((i) => i.id !== img.id) ?? [],
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
              <p className="text-sm text-gray-500">No gallery images uploaded yet.</p>
            )}
          </div>

          <div>
            <h2 className="text-lg font-heading font-semibold text-gray-900 mb-4">Rounds</h2>
            {track.rounds.length === 0 ? (
              <p className="text-sm text-gray-500">No rounds have been created for this track yet.</p>
            ) : (
              <div className="mt-4 overflow-x-auto overflow-hidden">
                <table className="w-full min-w-[500px]">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Round Name
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-4 py-2 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {track.rounds.map((round) => (
                      <tr key={round.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">
                          {round.name}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-500">
                          {formatDate(round.date)}
                        </td>
                        <td className="px-4 py-3 text-right text-sm font-medium">
                          <button
                            onClick={() => router.push(`/admin/rounds/${round.id}`)}
                            className="p-1.5 text-gray-600 hover:text-blue-600 transition-colors rounded"
                            aria-label={`View ${round.name}`}
                            title="View round"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        <div className="mt-6">
          <button
            onClick={() => router.push("/admin/tracks")}
            className="px-4 py-2 border border-gray-400 text-gray-200 font-semibold rounded-lg transition-all duration-200 hover:bg-white hover:text-gray-900"
          >
            Back to Tracks
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
