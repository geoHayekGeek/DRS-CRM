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

interface Track {
  id: string;
  name: string;
  lengthMeters: number;
  location: string | null;
  createdAt: string;
  updatedAt: string;
  rounds: Round[];
}

export default function TrackDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [track, setTrack] = useState<Track | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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

        <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 space-y-6">
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
              <div>
                <dt className="text-sm font-medium text-gray-500">Location</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {track.location || "Not specified"}
                </dd>
              </div>
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
    </div>
  );
}
