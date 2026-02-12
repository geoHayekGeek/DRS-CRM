"use client";

import { useState, FormEvent, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import toast from "react-hot-toast";
import { theme } from "@/lib/theme";

const ALLOWED_TYPES = "image/jpeg,image/png,image/webp";
const MAX_SIZE_MB = 5;

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
  trackImages?: TrackImage[];
}

export default function EditTrackPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const layoutInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingLayout, setUploadingLayout] = useState(false);
  const [uploadingGallery, setUploadingGallery] = useState(false);
  const [error, setError] = useState("");
  const [layoutImageUrl, setLayoutImageUrl] = useState<string | null>(null);
  const [trackImages, setTrackImages] = useState<TrackImage[]>([]);
  const [formData, setFormData] = useState({
    name: "",
    lengthMeters: "",
    location: "",
  });

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
      const track: Track = await response.json();
      setFormData({
        name: track.name,
        lengthMeters: track.lengthMeters.toString(),
        location: track.location || "",
      });
      setLayoutImageUrl(track.layoutImageUrl ?? null);
      setTrackImages(track.trackImages ?? []);
    } catch (err) {
      const errorMessage = "Failed to load track";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleLayoutUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.match(/^image\/(jpeg|png|webp)$/)) {
      toast.error("Use JPG, PNG, or WebP only.");
      return;
    }
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      toast.error(`File must be under ${MAX_SIZE_MB}MB.`);
      return;
    }
    setUploadingLayout(true);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch(`/api/admin/tracks/${id}/layout`, {
        method: "POST",
        body: form,
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Upload failed");
        return;
      }
      setLayoutImageUrl(data.url);
      toast.success("Layout image uploaded");
    } catch {
      toast.error("Upload failed");
    } finally {
      setUploadingLayout(false);
      if (layoutInputRef.current) layoutInputRef.current.value = "";
    }
  };

  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.match(/^image\/(jpeg|png|webp)$/)) {
      toast.error("Use JPG, PNG, or WebP only.");
      return;
    }
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      toast.error(`File must be under ${MAX_SIZE_MB}MB.`);
      return;
    }
    setUploadingGallery(true);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch(`/api/admin/tracks/${id}/images`, {
        method: "POST",
        body: form,
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Upload failed");
        return;
      }
      setTrackImages((prev) => [...prev, { id: data.id, imageUrl: data.imageUrl, createdAt: data.createdAt }]);
      toast.success("Image added to gallery");
    } catch {
      toast.error("Upload failed");
    } finally {
      setUploadingGallery(false);
      if (galleryInputRef.current) galleryInputRef.current.value = "";
    }
  };

  const handleDeleteGalleryImage = async (imageId: string) => {
    try {
      const res = await fetch(`/api/admin/tracks/images/${imageId}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error || "Delete failed");
        return;
      }
      setTrackImages((prev) => prev.filter((img) => img.id !== imageId));
      toast.success("Image removed");
    } catch {
      toast.error("Delete failed");
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setSaving(true);

    try {
      if (!formData.name.trim()) {
        setError("Track name is required");
        setSaving(false);
        return;
      }

      if (!formData.lengthMeters.trim()) {
        setError("Length in meters is required");
        setSaving(false);
        return;
      }

      const lengthMeters = parseFloat(formData.lengthMeters);
      if (isNaN(lengthMeters) || lengthMeters <= 0) {
        setError("Length must be a valid positive number");
        setSaving(false);
        return;
      }

      const payload: any = {
        name: formData.name.trim(),
        lengthMeters,
      };

      if (formData.location.trim()) {
        payload.location = formData.location.trim();
      } else {
        payload.location = null;
      }

      const response = await fetch(`/api/admin/tracks/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        const errorMessage = data.error || "Failed to update track";
        setError(errorMessage);
        toast.error(errorMessage);
        setSaving(false);
        return;
      }

      toast.success("Track updated successfully");
      router.push(`/admin/tracks/${id}`);
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
          <div className="text-gray-300">Loading track...</div>
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
          Edit Track
        </h1>

        <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Track Name *
              </label>
              <input
                id="name"
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="block w-full min-h-[44px] px-3 py-3 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200"
                style={{
                  "--tw-ring-color": theme.colors.primary.red,
                } as React.CSSProperties & { "--tw-ring-color": string }}
                onFocus={(e) => (e.currentTarget.style.boxShadow = `0 0 0 2px ${theme.colors.primary.red}`)}
                onBlur={(e) => (e.currentTarget.style.boxShadow = "")}
              />
            </div>

            <div>
              <label htmlFor="lengthMeters" className="block text-sm font-medium text-gray-700 mb-2">
                Length (meters) *
              </label>
              <input
                id="lengthMeters"
                type="number"
                step="0.1"
                min="0.1"
                required
                value={formData.lengthMeters}
                onChange={(e) => setFormData({ ...formData, lengthMeters: e.target.value })}
                className="block w-full min-h-[44px] px-3 py-3 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200"
                style={{
                  "--tw-ring-color": theme.colors.primary.red,
                } as React.CSSProperties & { "--tw-ring-color": string }}
                onFocus={(e) => (e.currentTarget.style.boxShadow = `0 0 0 2px ${theme.colors.primary.red}`)}
                onBlur={(e) => (e.currentTarget.style.boxShadow = "")}
              />
            </div>

            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
                Location
              </label>
              <input
                id="location"
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="block w-full min-h-[44px] px-3 py-3 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200"
                style={{
                  "--tw-ring-color": theme.colors.primary.red,
                } as React.CSSProperties & { "--tw-ring-color": string }}
                onFocus={(e) => (e.currentTarget.style.boxShadow = `0 0 0 2px ${theme.colors.primary.red}`)}
                onBlur={(e) => (e.currentTarget.style.boxShadow = "")}
                placeholder="Optional"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Track layout image (optional)
              </label>
              {layoutImageUrl && (
                <div className="mb-3">
                  <img
                    src={layoutImageUrl}
                    alt="Layout"
                    className="max-h-48 rounded-lg border border-gray-200 object-contain"
                  />
                </div>
              )}
              <input
                ref={layoutInputRef}
                type="file"
                accept={ALLOWED_TYPES}
                onChange={handleLayoutUpload}
                disabled={uploadingLayout}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-bold file:text-white file:cursor-pointer file:shadow-lg disabled:opacity-50"
                style={{
                  // @ts-expect-error CSS custom property
                  "--tw-file-color": theme.colors.primary.red,
                  "--tw-file-text-shadow": "0 1px 3px rgba(0, 0, 0, 0.5)",
                }}
              />
              <p className="mt-1 text-xs text-gray-500">JPG, PNG or WebP, max {MAX_SIZE_MB}MB</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Gallery images (optional)
              </label>
              {trackImages.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-3">
                  {trackImages.map((img) => (
                    <div key={img.id} className="relative group">
                      <img
                        src={img.imageUrl}
                        alt="Gallery"
                        className="w-full aspect-square object-cover rounded-lg border border-gray-200"
                      />
                      <button
                        type="button"
                        onClick={() => handleDeleteGalleryImage(img.id)}
                        className="absolute top-1 right-1 px-2 py-1 text-xs font-medium text-white rounded opacity-0 group-hover:opacity-100 transition-opacity"
                        style={{ backgroundColor: theme.colors.primary.red }}
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <input
                ref={galleryInputRef}
                type="file"
                accept={ALLOWED_TYPES}
                onChange={handleGalleryUpload}
                disabled={uploadingGallery}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-bold file:text-white file:cursor-pointer file:shadow-lg disabled:opacity-50"
                style={{
                  // @ts-expect-error CSS custom property
                  "--tw-file-color": theme.colors.primary.red,
                  "--tw-file-text-shadow": "0 1px 3px rgba(0, 0, 0, 0.5)",
                }}
              />
              <p className="mt-1 text-xs text-gray-500">JPG, PNG or WebP, max {MAX_SIZE_MB}MB. Add more over time.</p>
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
                {saving ? "Saving..." : "Save Changes"}
              </button>
              <button
                type="button"
                onClick={() => router.push(`/admin/tracks/${id}`)}
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
