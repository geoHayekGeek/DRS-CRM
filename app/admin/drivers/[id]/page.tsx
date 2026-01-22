"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import toast from "react-hot-toast";
import { theme } from "@/lib/theme";

interface Driver {
  id: string;
  fullName: string;
  profileImageUrl: string | null;
  weight: number | null;
  height: number | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export default function DriverDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [driver, setDriver] = useState<Driver | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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
      const data = await response.json();
      setDriver(data);
    } catch (err) {
      const errorMessage = "Failed to load driver";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-gray-300">Loading driver details...</div>
        </div>
      </div>
    );
  }

  if (error || !driver) {
    return (
      <div className="p-8">
        <div className="max-w-4xl mx-auto">
          <div
            className="bg-red-50 border-l-4 p-4 rounded-r-lg mb-4"
            style={{ borderLeftColor: theme.colors.primary.red }}
          >
            <p className="text-sm font-medium" style={{ color: theme.colors.primary.red }}>
              {error || "Driver not found"}
            </p>
          </div>
          <button
            onClick={() => router.push("/admin/drivers")}
            className="px-4 py-2 border border-gray-400 text-gray-200 font-medium rounded-lg transition-all duration-200 hover:bg-white hover:text-gray-900"
          >
            Back to Drivers
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-start mb-6">
          <h1
            className="text-3xl font-bold"
            style={{ color: theme.colors.primary.red }}
          >
            {driver.fullName}
          </h1>
          <button
            onClick={() => router.push(`/admin/drivers/${id}/edit`)}
            className="px-4 py-2 text-white font-medium rounded-lg transition-all duration-200"
            style={{ backgroundColor: theme.colors.primary.red }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#A01516")}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = theme.colors.primary.red)}
          >
            Edit
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6 space-y-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Driver Information</h2>
            <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <dt className="text-sm font-medium text-gray-500">Full Name</dt>
                <dd className="mt-1 text-sm text-gray-900">{driver.fullName}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Weight</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {driver.weight ? `${driver.weight} kg` : "Not specified"}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Height</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {driver.height ? `${driver.height} cm` : "Not specified"}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Created</dt>
                <dd className="mt-1 text-sm text-gray-900">{formatDate(driver.createdAt)}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Last Updated</dt>
                <dd className="mt-1 text-sm text-gray-900">{formatDate(driver.updatedAt)}</dd>
              </div>
            </dl>
          </div>

          {driver.notes && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">Notes</h2>
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{driver.notes}</p>
            </div>
          )}

          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Race History</h2>
            <p className="text-sm text-gray-500">Race history will be displayed here in the future.</p>
          </div>
        </div>

        <div className="mt-6">
          <button
            onClick={() => router.push("/admin/drivers")}
            className="px-4 py-2 border border-gray-400 text-gray-200 font-medium rounded-lg transition-all duration-200 hover:bg-white hover:text-gray-900"
          >
            Back to Drivers
          </button>
        </div>
      </div>
    </div>
  );
}
