"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Eye, Pencil, Trash2, Search, X } from "lucide-react";
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
  const [searchTerm, setSearchTerm] = useState("");

  const filteredDrivers = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return drivers;
    return drivers.filter((driver) =>
      driver.fullName.toLowerCase().includes(term)
    );
  }, [drivers, searchTerm]);

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
    toast(
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
              className="px-3 py-1 text-xs font-semibold rounded bg-red-600 hover:bg-red-700 text-white transition-colors"
            >
              Confirm
            </button>
            <button
              onClick={() => toast.dismiss(t.id)}
              className="px-3 py-1 text-xs font-semibold rounded bg-gray-600 hover:bg-gray-700 text-white transition-colors"
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

  const isSearching = searchTerm.trim().length > 0;

  return (
    <div className="p-4 sm:p-6 lg:p-8 w-full min-w-0">
      <div className="w-full max-w-7xl mx-auto space-y-4">
        {/* Row 1: Title + count (left), Add Driver (right) */}
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-start">
          <div>
            <h1
              className="text-2xl sm:text-3xl font-heading font-semibold"
              style={{ color: theme.colors.primary.red }}
            >
              Drivers
            </h1>
            {!loading && (
              <p className="mt-1 text-sm text-white">
                {isSearching
                  ? `Showing ${filteredDrivers.length} of ${drivers.length} drivers`
                  : `Total Drivers: ${drivers.length}`}
              </p>
            )}
          </div>
          <button
            onClick={() => router.push("/admin/drivers/new")}
            className="w-full sm:w-auto min-h-[44px] px-4 py-2 text-white font-semibold rounded-lg transition-all duration-200 flex items-center justify-center shrink-0"
            style={{ backgroundColor: theme.colors.primary.red }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#A01516")}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = theme.colors.primary.red)}
          >
            Add Driver
          </button>
        </div>

        {/* Row 2: Full-width search */}
        <div className="w-full">
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"
              aria-hidden
            />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search drivers by name..."
              className="w-full pl-10 pr-10 py-2.5 rounded-lg border border-gray-300 bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-0 transition-shadow focus:ring-[#BA1718]"
              aria-label="Search drivers by name"
            />
            {searchTerm.length > 0 && (
              <button
                type="button"
                onClick={() => setSearchTerm("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 rounded transition-colors"
                aria-label="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border-l-4 rounded-r-lg" style={{ borderLeftColor: theme.colors.primary.red }}>
            <p className="text-sm font-medium" style={{ color: theme.colors.primary.red }}>
              {error}
            </p>
          </div>
        )}

        {loading ? (
          <div className="text-gray-300 py-8">Loading drivers...</div>
        ) : drivers.length === 0 ? (
          <div className="text-gray-300 py-8">No drivers found. Add your first driver to get started.</div>
        ) : (
          <div className="bg-white rounded-lg shadow-lg overflow-hidden overflow-x-auto">
            <table className="w-full min-w-[600px]">
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
                {filteredDrivers.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-6 py-12 text-center text-sm text-gray-500"
                    >
                      No drivers found.
                    </td>
                  </tr>
                ) : (
                  filteredDrivers.map((driver) => (
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
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
