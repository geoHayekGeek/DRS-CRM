"use client";

import React, { useState } from "react";
import Link from "next/link";
import { formatPoints } from "@/lib/format-points";

type Round = {
  id: string;
  name: string;
  date: string;
  trackName: string;
  location: string | null;
  status: string;
};

type Props = {
  championshipId: string;
  rounds: Round[];
  standings: { fullName: string; totalPoints: number; roundsPlayed?: number }[];
};

export default function ChampionshipDetail({
  championshipId,
  rounds,
  standings,
}: Props) {
  const [tab, setTab] = useState<"rounds" | "standings">("rounds");

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div>
      <div className="flex border-b border-gray-200 mb-6">
        <button
          type="button"
          onClick={() => setTab("rounds")}
          className={`px-4 py-3 font-semibold text-sm border-b-2 transition ${
            tab === "rounds"
              ? "border-red-600 text-red-600"
              : "border-transparent text-gray-700 hover:text-gray-900"
          }`}
        >
          ROUNDS
        </button>
        <button
          type="button"
          onClick={() => setTab("standings")}
          className={`px-4 py-3 font-semibold text-sm border-b-2 transition ${
            tab === "standings"
              ? "border-red-600 text-red-600"
              : "border-transparent text-gray-700 hover:text-gray-900"
          }`}
        >
          STANDINGS
        </button>
      </div>

      {tab === "rounds" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {rounds.length === 0 ? (
            <p className="text-gray-700 col-span-full py-8">No rounds yet.</p>
          ) : (
            rounds.map((r) => (
              <Link
                key={r.id}
                href={`/championships/${championshipId}/rounds/${r.id}`}
                className="block bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:border-red-500 hover:shadow-md transition"
              >
                <h3 className="text-lg font-bold text-gray-900">{r.name}</h3>
                <p className="text-gray-700 text-sm mt-1">{formatDate(r.date)}</p>
                {r.trackName && (
                  <p className="text-gray-700 text-sm">{r.trackName}</p>
                )}
                {r.location && (
                  <p className="text-gray-700 text-sm">{r.location}</p>
                )}
                <span
                  className={`inline-block mt-3 text-xs font-semibold uppercase ${
                    r.status === "Completed"
                      ? "text-gray-700"
                      : "text-red-600"
                  }`}
                >
                  {r.status}
                </span>
              </Link>
            ))
          )}
        </div>
      )}

      {tab === "standings" && (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          {standings.length === 0 ? (
            <div className="px-6 py-8 text-center text-gray-700">—</div>
          ) : (
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 font-semibold text-gray-900 uppercase tracking-wider">
                    Pos
                  </th>
                  <th className="px-6 py-3 font-semibold text-gray-900 uppercase tracking-wider">
                    Driver
                  </th>
                  <th className="px-6 py-3 font-semibold text-gray-900 text-right uppercase tracking-wider">
                    Pts
                  </th>
                  <th className="px-6 py-3 font-semibold text-gray-500 text-center uppercase tracking-wider">
                    Rounds
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {standings.map((row, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium text-gray-900">
                      {index + 1}
                    </td>
                    <td className="px-6 py-4 text-gray-900">{row.fullName}</td>
                    <td className="px-6 py-4 text-right font-bold text-gray-900">
                      {formatPoints(row.totalPoints)}
                    </td>
                    <td className="px-6 py-4 text-center text-gray-500">
                      {row.roundsPlayed ?? 0}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}
