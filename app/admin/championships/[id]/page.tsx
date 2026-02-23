"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import toast from "react-hot-toast";
import { theme } from "@/lib/theme";

interface Round {
  id: string;
  name: string;
  date: string;
  createdAt: string;
  setupCompleted: boolean;
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

export default function ChampionshipDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [championship, setChampionship] = useState<Championship | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchChampionship();
  }, [id]);

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

  if (loading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 w-full min-w-0">
        <div className="w-full max-w-4xl mx-auto">
          <div className="text-gray-300">Loading championship details...</div>
        </div>
      </div>
    );
  }

  if (error || !championship) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 w-full min-w-0">
        <div className="w-full max-w-4xl mx-auto">
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
    <div className="p-4 sm:p-6 lg:p-8 w-full min-w-0">
      <div className="w-full max-w-4xl mx-auto">
        <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-start mb-6">
          <h1
            className="text-2xl sm:text-3xl font-heading font-semibold break-words"
            style={{ color: theme.colors.primary.red }}
          >
            {championship.name}
          </h1>
          <button
            onClick={() => router.push(`/admin/championships/${id}/edit`)}
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
            <h2 className="text-lg font-heading font-semibold text-gray-900 mb-4">Rounds in this Championship</h2>
            {championship.rounds.length === 0 ? (
              <p className="text-sm text-gray-500">No rounds have been created for this championship yet.</p>
            ) : (
              <>
                <p className="text-sm text-gray-500 mb-3">
                  This championship contains {championship.rounds.length} round(s).
                </p>
                <ul className="space-y-2">
                  {[...championship.rounds]
                    .sort((a, b) => (new Date(a.date).getTime() || 0) - (new Date(b.date).getTime() || 0))
                    .map((round) => (
                    <li key={round.id} className="flex flex-wrap items-center gap-2">
                      <Link
                        href={`/admin/rounds/${round.id}`}
                        className="text-sm font-medium text-gray-900 hover:underline"
                        style={{ color: theme.colors.primary.red }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.textDecoration = "underline";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.textDecoration = "";
                        }}
                      >
                        {round.name}
                        {round.date && (
                          <span className="text-gray-500 font-normal ml-1">
                            — {formatDate(round.date)}
                          </span>
                        )}
                      </Link>
                      <span
                        className={`inline-flex px-2 py-0.5 text-xs font-medium rounded ${
                          round.setupCompleted
                            ? "bg-green-100 text-green-800"
                            : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {round.setupCompleted ? "Setup done" : "Not set up"}
                      </span>
                    </li>
                  ))}
                </ul>
              </>
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
