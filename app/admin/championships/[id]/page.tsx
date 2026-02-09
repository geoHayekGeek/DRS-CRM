"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import toast from "react-hot-toast";
import { theme } from "@/lib/theme";

interface Round {
  id: string;
  name: string;
  date: string;
  createdAt: string;
}

interface Championship {
  id: string;
  name: string;
  isCurrent: boolean;
  startDate: string;
  endDate: string | null;
  createdAt: string;
  updatedAt: string;
  rounds: Round[];
}

interface AssignedDriver {
  id: string;
  driverId: string;
  fullName: string;
  createdAt: string;
}

interface Driver {
  id: string;
  fullName: string;
}

export default function ChampionshipDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [championship, setChampionship] = useState<Championship | null>(null);
  const [assignedDrivers, setAssignedDrivers] = useState<AssignedDriver[]>([]);
  const [allDrivers, setAllDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [driversLoading, setDriversLoading] = useState(false);
  const [assignAllLoading, setAssignAllLoading] = useState(false);
  const [error, setError] = useState("");
  const addDriversSelectRef = useRef<HTMLSelectElement>(null);

  useEffect(() => {
    fetchChampionship();
  }, [id]);

  useEffect(() => {
    if (id && championship) {
      fetchAssignedDrivers();
    }
  }, [id, championship]);

  const fetchAssignedDrivers = async () => {
    try {
      setDriversLoading(true);
      const [assignedRes, allRes] = await Promise.all([
        fetch(`/api/admin/championships/${id}/drivers`),
        fetch("/api/admin/drivers"),
      ]);
      if (assignedRes.ok) {
        const data = await assignedRes.json();
        setAssignedDrivers(data);
      }
      if (allRes.ok) {
        const data = await allRes.json();
        setAllDrivers(data);
      }
    } catch {
      toast.error("Failed to load drivers");
    } finally {
      setDriversLoading(false);
    }
  };

  const fetchChampionship = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/championships/${id}`);
      if (!response.ok) {
        throw new Error("Failed to fetch championship");
      }
      const data = await response.json();
      setChampionship(data);
    } catch (err) {
      const errorMessage = "Failed to load championship";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const assignedDriverIds = new Set(assignedDrivers.map((d) => d.driverId));

  const handleAddDrivers = async (driverIds: string[]) => {
    const toAdd = driverIds.filter((did) => !assignedDriverIds.has(did));
    if (toAdd.length === 0) {
      toast.error("Selected drivers are already assigned");
      return;
    }
    try {
      const res = await fetch(`/api/admin/championships/${id}/drivers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ driverIds: toAdd }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(data.error || "Failed to add drivers");
        return;
      }
      toast.success(`Added ${data.added ?? toAdd.length} driver(s)`);
      if (addDriversSelectRef.current) addDriversSelectRef.current.selectedIndex = -1;
      await fetchAssignedDrivers();
    } catch {
      toast.error("Failed to add drivers");
    }
  };

  const handleRemoveDriver = async (driverId: string) => {
    try {
      const res = await fetch(`/api/admin/championships/${id}/drivers/${driverId}`, {
        method: "DELETE",
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(data.error || "Failed to remove driver");
        return;
      }
      toast.success("Driver removed");
      await fetchAssignedDrivers();
    } catch {
      toast.error("Failed to remove driver");
    }
  };

  const handleAssignAll = async () => {
    try {
      setAssignAllLoading(true);
      const res = await fetch(`/api/admin/championships/${id}/drivers/assign-all`, {
        method: "POST",
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(data.error || "Failed to assign all drivers");
        return;
      }
      toast.success(data.added ? `Assigned ${data.added} driver(s)` : data.message || "Done");
      await fetchAssignedDrivers();
    } catch {
      toast.error("Failed to assign all drivers");
    } finally {
      setAssignAllLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-gray-300">Loading championship details...</div>
        </div>
      </div>
    );
  }

  if (error || !championship) {
    return (
      <div className="p-8">
        <div className="max-w-4xl mx-auto">
          <div
            className="bg-red-50 border-l-4 p-4 rounded-r-lg mb-4"
            style={{ borderLeftColor: theme.colors.primary.red }}
          >
            <p className="text-sm font-medium" style={{ color: theme.colors.primary.red }}>
              {error || "Championship not found"}
            </p>
          </div>
          <button
            onClick={() => router.push("/admin/championships")}
            className="px-4 py-2 border border-gray-400 text-gray-200 font-semibold rounded-lg transition-all duration-200 hover:bg-white hover:text-gray-900"
          >
            Back to Championships
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
            className="text-3xl font-heading font-semibold"
            style={{ color: theme.colors.primary.red }}
          >
            {championship.name}
          </h1>
          <button
            onClick={() => router.push(`/admin/championships/${id}/edit`)}
            className="px-4 py-2 text-white font-semibold rounded-lg transition-all duration-200"
            style={{ backgroundColor: theme.colors.primary.red }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#A01516")}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = theme.colors.primary.red)}
          >
            Edit
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6 space-y-6">
          <div>
            <h2 className="text-lg font-heading font-semibold text-gray-900 mb-4">Championship Information</h2>
            <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <dt className="text-sm font-medium text-gray-500">Championship Name</dt>
                <dd className="mt-1 text-sm text-gray-900">{championship.name}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Current</dt>
                <dd className="mt-1 text-sm text-gray-900">{championship.isCurrent ? "Yes" : "No"}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Start Date</dt>
                <dd className="mt-1 text-sm text-gray-900">{formatDate(championship.startDate)}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">End Date</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {championship.endDate ? formatDate(championship.endDate) : "Not set"}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Created</dt>
                <dd className="mt-1 text-sm text-gray-900">{formatDate(championship.createdAt)}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Last Updated</dt>
                <dd className="mt-1 text-sm text-gray-900">{formatDate(championship.updatedAt)}</dd>
              </div>
            </dl>
          </div>

          <div>
            <h2 className="text-lg font-heading font-semibold text-gray-900 mb-4">Assigned Drivers</h2>
            <p className="text-sm text-gray-500 mb-4">
              Only assigned drivers appear in standings and can be used in round setup for this championship.
            </p>
            {driversLoading ? (
              <p className="text-sm text-gray-500">Loading drivers...</p>
            ) : (
              <>
                <div className="mb-4 flex flex-wrap gap-2 items-center">
                  <select
                    ref={addDriversSelectRef}
                    multiple
                    className="block w-full max-w-md min-h-[100px] px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:border-transparent text-sm"
                    style={{
                      "--tw-ring-color": theme.colors.primary.red,
                    } as React.CSSProperties & { "--tw-ring-color": string }}
                    aria-label="Select drivers to add"
                  >
                    {allDrivers
                      .filter((d) => !assignedDriverIds.has(d.id))
                      .map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.fullName}
                        </option>
                      ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => {
                      const sel = addDriversSelectRef.current;
                      if (!sel) return;
                      const selected = Array.from(sel.selectedOptions).map((o) => o.value);
                      if (selected.length) handleAddDrivers(selected);
                      else toast.error("Select at least one driver to add");
                    }}
                    className="px-4 py-2 text-white font-semibold rounded-lg transition-all duration-200 text-sm"
                    style={{ backgroundColor: theme.colors.primary.red }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#A01516")}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = theme.colors.primary.red)}
                  >
                    Add selected
                  </button>
                </div>
                {championship.isCurrent && allDrivers.length > 0 && (
                  <div className="mb-4">
                    <button
                      type="button"
                      onClick={handleAssignAll}
                      disabled={assignAllLoading || assignedDrivers.length >= allDrivers.length}
                      className="px-4 py-2 border border-gray-300 text-gray-700 font-semibold rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                      {assignAllLoading ? "Assigning..." : "Assign all existing drivers"}
                    </button>
                  </div>
                )}
                {assignedDrivers.length === 0 ? (
                  <p className="text-sm text-gray-500">No drivers assigned. Add drivers above or use "Assign all existing drivers" for the current championship.</p>
                ) : (
                  <ul className="border border-gray-200 rounded-lg divide-y divide-gray-200">
                    {assignedDrivers.map((a) => (
                      <li key={a.id} className="flex justify-between items-center px-4 py-2 hover:bg-gray-50">
                        <span className="text-sm text-gray-900">{a.fullName}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveDriver(a.driverId)}
                          className="text-sm font-medium px-2 py-1 rounded border border-gray-300 text-gray-700 hover:bg-gray-100"
                        >
                          Remove
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </>
            )}
          </div>

          <div>
            <h2 className="text-lg font-heading font-semibold text-gray-900 mb-4">Rounds in this Championship</h2>
            {championship.rounds.length === 0 ? (
              <p className="text-sm text-gray-500">No rounds have been created for this championship yet.</p>
            ) : (
              <p className="text-sm text-gray-500">This championship contains {championship.rounds.length} round(s).</p>
            )}
          </div>
        </div>

        <div className="mt-6">
          <button
            onClick={() => router.push("/admin/championships")}
            className="px-4 py-2 border border-gray-400 text-gray-200 font-semibold rounded-lg transition-all duration-200 hover:bg-white hover:text-gray-900"
          >
            Back to Championships
          </button>
        </div>
      </div>
    </div>
  );
}
