"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Eye, Pencil, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import { theme } from "@/lib/theme";

interface Driver {
  id: string;
  fullName: string;
  weight: number | null;
  height: number | null;
  createdAt: string;
}

export default function DriversPage() {
  const router = useRouter();
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    fetchDrivers();
  }, []);

  const fetchDrivers = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/drivers");
      if (!response.ok) {
        throw new Error("Failed to fetch drivers");
      }
      const data = await response.json();
      setDrivers(data);
      setError("");
    } catch (err) {
      const errorMessage = "Failed to load drivers";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    const deleteToast = toast(
      (t) => (
        <div className="space-y-2">
          <p className="text-sm font-medium">Delete {name}?</p>
          <div className="flex gap-2">
            <button
              onClick={async () => {
                toast.dismiss(t.id);
                try {
                  setDeletingId(id);
                  const response = await fetch(`/api/admin/drivers/${id}`, {
                    method: "DELETE",
                  });

                  if (!response.ok) {
                    throw new Error("Failed to delete driver");
                  }

                  toast.success("Driver deleted successfully");
                  await fetchDrivers();
                } catch (err) {
                  toast.error("Failed to delete driver");
                } finally {
                  setDeletingId(null);
                }
              }}
              className="px-3 py-1 text-xs font-medium rounded bg-red-600 hover:bg-red-700 text-white transition-colors"
            >
              Confirm
            </button>
            <button
              onClick={() => toast.dismiss(t.id)}
              className="px-3 py-1 text-xs font-medium rounded bg-gray-600 hover:bg-gray-700 text-white transition-colors"
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

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1
            className="text-3xl font-bold"
            style={{ color: theme.colors.primary.red }}
          >
            Drivers
          </h1>
          <button
            onClick={() => router.push("/admin/drivers/new")}
            className="px-4 py-2 text-white font-medium rounded-lg transition-all duration-200"
            style={{ backgroundColor: theme.colors.primary.red }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#A01516")}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = theme.colors.primary.red)}
          >
            Add Driver
          </button>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border-l-4 rounded-r-lg" style={{ borderLeftColor: theme.colors.primary.red }}>
            <p className="text-sm font-medium" style={{ color: theme.colors.primary.red }}>
              {error}
            </p>
          </div>
        )}

        {loading ? (
          <div className="text-gray-300">Loading drivers...</div>
        ) : drivers.length === 0 ? (
          <div className="text-gray-300">No drivers found. Add your first driver to get started.</div>
        ) : (
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Full Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Weight
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Height
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Created Date
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {drivers.map((driver) => (
                  <tr key={driver.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {driver.fullName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {driver.weight ? `${driver.weight} kg` : "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {driver.height ? `${driver.height} cm` : "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(driver.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-3">
                        <button
                          onClick={() => router.push(`/admin/drivers/${driver.id}`)}
                          className="p-1.5 text-gray-600 hover:text-blue-600 transition-colors rounded"
                          aria-label={`View ${driver.fullName}`}
                          title="View driver"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => router.push(`/admin/drivers/${driver.id}/edit`)}
                          className="p-1.5 text-gray-600 hover:text-blue-600 transition-colors rounded"
                          aria-label={`Edit ${driver.fullName}`}
                          title="Edit driver"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(driver.id, driver.fullName)}
                          disabled={deletingId === driver.id}
                          className="p-1.5 text-red-600 hover:text-red-700 transition-colors rounded disabled:opacity-50 disabled:cursor-not-allowed"
                          aria-label={`Delete ${driver.fullName}`}
                          title="Delete driver"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
