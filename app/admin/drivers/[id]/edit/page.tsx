"use client";

import { useState, FormEvent, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import toast from "react-hot-toast";
import { theme } from "@/lib/theme";

interface Driver {
  id: string;
  fullName: string;
  weight: number | null;
  height: number | null;
  notes: string | null;
}

export default function EditDriverPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
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
    } catch (err) {
      const errorMessage = "Failed to load driver";
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
      const payload: any = {
        fullName: formData.fullName.trim(),
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
      <div className="p-8">
        <div className="max-w-2xl mx-auto">
          <div className="text-gray-300">Loading driver...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="max-w-2xl mx-auto">
        <h1
          className="text-3xl font-heading font-semibold mb-6"
          style={{ color: theme.colors.primary.red }}
        >
          Edit Driver
        </h1>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
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
                className="block w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200"
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
                className="block w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200"
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
                className="block w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200"
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
                className="block w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200"
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

            <div className="flex gap-4">
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2 text-white font-semibold rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
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
