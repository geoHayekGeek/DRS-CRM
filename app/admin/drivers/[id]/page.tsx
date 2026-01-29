"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import toast from "react-hot-toast";
import { theme } from "@/lib/theme";

type SessionType = "QUALIFYING" | "RACE" | "FINAL_QUALIFYING" | "FINAL_RACE";

interface SessionResultWithSession {
  id: string;
  position: number;
  points: number;
  session: {
    type: SessionType;
    group: string | null;
    order: number;
    round: {
      name: string;
      date: string;
      championship: { name: string } | null;
      track: { name: string };
    };
  };
}

interface Driver {
  id: string;
  fullName: string;
  profileImageUrl: string | null;
  weight: number | null;
  height: number | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  sessionResults?: SessionResultWithSession[];
}

function formatSessionType(type: SessionType): string {
  switch (type) {
    case "QUALIFYING":
      return "Qualifying";
    case "RACE":
      return "Race";
    case "FINAL_QUALIFYING":
      return "Final Qualifying";
    case "FINAL_RACE":
      return "Final Race";
    default:
      return type;
  }
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
            className="px-4 py-2 border border-gray-400 text-gray-200 font-semibold rounded-lg transition-all duration-200 hover:bg-white hover:text-gray-900"
          >
            Back to Drivers
          </button>
        </div>
      </div>
    );
  }

  const history = driver.sessionResults ?? [];

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-start mb-6">
          <h1
            className="text-3xl font-heading font-semibold"
            style={{ color: theme.colors.primary.red }}
          >
            {driver.fullName}
          </h1>
          <button
            onClick={() => router.push(`/admin/drivers/${id}/edit`)}
            className="px-4 py-2 text-white font-semibold rounded-lg transition-all duration-200"
            style={{ backgroundColor: theme.colors.primary.red }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#A01516")}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = theme.colors.primary.red)}
          >
            Edit
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6 space-y-6">
          <div className="flex flex-col sm:flex-row gap-6 items-start">
            <div className="shrink-0">
              {driver.profileImageUrl ? (
                <img
                  src={driver.profileImageUrl}
                  alt=""
                  className="h-32 w-32 rounded-full object-cover border border-gray-200"
                />
              ) : (
                <div
                  className="h-32 w-32 rounded-full border border-gray-200 flex items-center justify-center bg-gray-100 text-gray-400 text-sm"
                  aria-hidden
                >
                  No photo
                </div>
              )}
            </div>
            <div className="min-w-0">
              <h2 className="text-lg font-heading font-semibold text-gray-900 mb-2">
                {driver.fullName}
              </h2>
              <dl className="space-y-1">
                {driver.weight != null && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Weight</dt>
                    <dd className="text-sm text-gray-900">{driver.weight} kg</dd>
                  </div>
                )}
                {driver.height != null && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Height</dt>
                    <dd className="text-sm text-gray-900">{driver.height} cm</dd>
                  </div>
                )}
              </dl>
              {driver.notes && (
                <div className="mt-3">
                  <dt className="text-sm font-medium text-gray-500">Notes</dt>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap mt-0.5">{driver.notes}</p>
                </div>
              )}
            </div>
          </div>

          <div>
            <h2 className="text-lg font-heading font-semibold text-gray-900 mb-4">Race History</h2>
            {history.length === 0 ? (
              <p className="text-sm text-gray-500">No results yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr>
                      <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Championship
                      </th>
                      <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Round
                      </th>
                      <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Session
                      </th>
                      <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Group
                      </th>
                      <th scope="col" className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Position
                      </th>
                      <th scope="col" className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Points
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {history.map((result) => (
                      <tr key={result.id}>
                        <td className="px-4 py-2 text-sm text-gray-900 whitespace-nowrap">
                          {result.session.round.championship?.name ?? "—"}
                        </td>
                        <td className="px-4 py-2 text-sm text-gray-900 whitespace-nowrap">
                          {result.session.round.name}
                        </td>
                        <td className="px-4 py-2 text-sm text-gray-900 whitespace-nowrap">
                          {formatSessionType(result.session.type)}
                        </td>
                        <td className="px-4 py-2 text-sm text-gray-900 whitespace-nowrap">
                          {result.session.group ?? "—"}
                        </td>
                        <td className="px-4 py-2 text-sm text-gray-900 text-right">
                          {result.position}
                        </td>
                        <td className="px-4 py-2 text-sm text-gray-900 text-right">
                          {result.points}
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
            onClick={() => router.push("/admin/drivers")}
            className="px-4 py-2 border border-gray-400 text-gray-200 font-semibold rounded-lg transition-all duration-200 hover:bg-white hover:text-gray-900"
          >
            Back to Drivers
          </button>
        </div>
      </div>
    </div>
  );
}
