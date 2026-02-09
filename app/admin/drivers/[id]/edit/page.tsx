"use client";

import { useState, FormEvent, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import toast from "react-hot-toast";
import { theme } from "@/lib/theme";

const ALLOWED_TYPES = "image/jpeg,image/png,image/webp";
const MAX_SIZE_MB = 5;

interface Driver {
  id: string;
  fullName: string;
  profileImageUrl: string | null;
  weight: number | null;
  height: number | null;
  notes: string | null;
}

export default function EditDriverPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [currentImageUrl, setCurrentImageUrl] = useState<string | null>(null);
  const [profileFile, setProfileFile] = useState<File | null>(null);
  const [profilePreviewUrl, setProfilePreviewUrl] = useState<string | null>(null);
  const [removeImage, setRemoveImage] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    weight: "",
    height: "",
    notes: "",
  });

  useEffect(() => {
    fetchDriver();
  }, [id]);

  const fetchDriver = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/drivers/${id}`);
      if (!response.ok) {
        throw new Error("Failed to fetch driver");
      }
      const driver: Driver = await response.json();
      setFormData({
        fullName: driver.fullName,
        weight: driver.weight?.toString() || "",
        height: driver.height?.toString() || "",
        notes: driver.notes || "",
      });
      setCurrentImageUrl(driver.profileImageUrl || null);
    } catch (err) {
      const errorMessage = "Failed to load driver";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      setProfileFile(null);
      if (profilePreviewUrl) URL.revokeObjectURL(profilePreviewUrl);
      setProfilePreviewUrl(null);
      setRemoveImage(false);
      return;
    }
    if (!file.type.match(/^image\/(jpeg|png|webp)$/)) {
      toast.error("Use JPG, PNG, or WebP only.");
      return;
    }
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      toast.error(`File must be under ${MAX_SIZE_MB}MB.`);
      return;
    }
    if (profilePreviewUrl) URL.revokeObjectURL(profilePreviewUrl);
    setProfileFile(file);
    setProfilePreviewUrl(URL.createObjectURL(file));
    setRemoveImage(false);
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setSaving(true);

    try {
      let profileImageUrl: string | null = currentImageUrl;

      if (removeImage) {
        profileImageUrl = null;
      } else if (profileFile) {
        const form = new FormData();
        form.append("file", profileFile);
        const uploadRes = await fetch("/api/admin/drivers/upload", {
          method: "POST",
          body: form,
        });
        const uploadData = await uploadRes.json();
        if (!uploadRes.ok) {
          const msg = uploadData.error || "Upload failed";
          setError(msg);
          toast.error(msg);
          setSaving(false);
          return;
        }
        profileImageUrl = uploadData.url ?? null;
      }

      const payload: Record<string, unknown> = {
        fullName: formData.fullName.trim(),
        profileImageUrl,
      };

      if (formData.weight.trim()) {
        const weight = parseFloat(formData.weight);
        if (isNaN(weight) || weight < 0) {
          setError("Weight must be a valid positive number");
          setSaving(false);
          return;
        }
        payload.weight = weight;
      } else {
        payload.weight = null;
      }

      if (formData.height.trim()) {
        const height = parseFloat(formData.height);
        if (isNaN(height) || height < 0) {
          setError("Height must be a valid positive number");
          setSaving(false);
          return;
        }
        payload.height = height;
      } else {
        payload.height = null;
      }

      if (formData.notes.trim()) {
        payload.notes = formData.notes.trim();
      } else {
        payload.notes = null;
      }

      const response = await fetch(`/api/admin/drivers/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        const errorMessage = data.error || "Failed to update driver";
        setError(errorMessage);
        toast.error(errorMessage);
        setSaving(false);
        return;
      }

      toast.success("Driver updated successfully");
      router.push(`/admin/drivers/${id}`);
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
          <div className="text-gray-300">Loading driver...</div>
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
          Edit Driver
        </h1>

        <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Profile image (optional)
              </label>
              {(currentImageUrl || profilePreviewUrl) && !removeImage ? (
                <div className="flex items-center gap-4">
                  <img
                    src={profilePreviewUrl || currentImageUrl || ""}
                    alt="Profile"
                    className="h-24 w-24 rounded-full object-cover border border-gray-200"
                  />
                  <div className="space-y-2">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept={ALLOWED_TYPES}
                      onChange={handleFileChange}
                      className="block w-full text-sm text-gray-500 file:mr-2 file:py-1.5 file:px-3 file:rounded file:border-0 file:text-sm file:font-semibold file:text-white file:cursor-pointer"
                      style={{
                        // @ts-expect-error CSS custom property
                        "--tw-file-color": theme.colors.primary.red,
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setRemoveImage(true);
                        setProfileFile(null);
                        if (profilePreviewUrl) URL.revokeObjectURL(profilePreviewUrl);
                        setProfilePreviewUrl(null);
                        if (fileInputRef.current) fileInputRef.current.value = "";
                      }}
                      className="text-sm text-gray-600 hover:text-gray-900 underline"
                    >
                      Remove image
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept={ALLOWED_TYPES}
                    onChange={handleFileChange}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:text-white file:cursor-pointer"
                    style={{
                      // @ts-expect-error CSS custom property
                      "--tw-file-color": theme.colors.primary.red,
                    }}
                  />
                  <p className="mt-1 text-xs text-gray-500">JPG, PNG or WebP, max {MAX_SIZE_MB}MB</p>
                  {removeImage && (
                    <button
                      type="button"
                      onClick={() => setRemoveImage(false)}
                      className="mt-2 text-sm text-white hover:text-gray-900 underline"
                    >
                      Keep current image
                    </button>
                  )}
                </div>
              )}
            </div>

            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-2">
                Full Name *
              </label>
              <input
                id="fullName"
                type="text"
                required
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                className="block w-full min-h-[44px] px-3 py-3 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200"
                style={{
                  "--tw-ring-color": theme.colors.primary.red,
                } as React.CSSProperties & { "--tw-ring-color": string }}
                onFocus={(e) => (e.currentTarget.style.boxShadow = `0 0 0 2px ${theme.colors.primary.red}`)}
                onBlur={(e) => (e.currentTarget.style.boxShadow = "")}
              />
            </div>

            <div>
              <label htmlFor="weight" className="block text-sm font-medium text-gray-700 mb-2">
                Weight (kg)
              </label>
              <input
                id="weight"
                type="number"
                step="0.1"
                min="0"
                value={formData.weight}
                onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
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
              <label htmlFor="height" className="block text-sm font-medium text-gray-700 mb-2">
                Height (cm)
              </label>
              <input
                id="height"
                type="number"
                step="0.1"
                min="0"
                value={formData.height}
                onChange={(e) => setFormData({ ...formData, height: e.target.value })}
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
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
                Notes
              </label>
              <textarea
                id="notes"
                rows={4}
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="block w-full min-h-[44px] px-3 py-3 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200"
                style={{
                  "--tw-ring-color": theme.colors.primary.red,
                } as React.CSSProperties & { "--tw-ring-color": string }}
                onFocus={(e) => (e.currentTarget.style.boxShadow = `0 0 0 2px ${theme.colors.primary.red}`)}
                onBlur={(e) => (e.currentTarget.style.boxShadow = "")}
                placeholder="Optional notes about the driver"
              />
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
                onClick={() => router.push(`/admin/drivers/${id}`)}
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
