"use client";

import React from "react";
import Link from "next/link";

export type RoundsFeedRound = {
  id: string;
  name: string;
  championship_id: string | null;
  championship_name: string;
  date: string;
  track_name: string;
  computed_status: "UPCOMING" | "PENDING" | "IN_PROGRESS" | "COMPLETED";
  updated_at: string;
};

type Props = {
  rounds: RoundsFeedRound[];
};

function formatRoundDate(isoString: string): string {
  const date = new Date(isoString);
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
  }).format(date);
}

function StatusDot({ status }: { status: RoundsFeedRound["computed_status"] }) {
  const dotClass =
    status === "IN_PROGRESS"
      ? "bg-green-500"
      : status === "UPCOMING"
        ? "bg-blue-500"
        : "bg-gray-400";
  return (
    <span
      className={`inline-block w-2 h-2 rounded-full shrink-0 ${dotClass}`}
      aria-hidden
    />
  );
}

const RoundsCard = ({ rounds }: Props) => {
  const list = Array.isArray(rounds) ? rounds : [];

  return (
    <div className="relative rounded-2xl bg-white/90 backdrop-blur-sm border border-gray-200/80 shadow-xl overflow-hidden transform rotate-[-2deg] hover:rotate-0 transition duration-500 ease-out">
      <div className="flex justify-between items-center mb-4 border-b border-gray-100 pb-4 px-6 pt-6">
        <span className="font-bold text-gray-900 tracking-tight">Rounds</span>
      </div>

      {list.length === 0 ? (
        <div className="px-6 pb-6">
          <p className="font-semibold text-gray-900">No rounds scheduled</p>
          <p className="text-sm text-gray-500 mt-1">
            Upcoming rounds will appear here.
          </p>
        </div>
      ) : (
        <div
          className="overflow-y-auto px-2 pb-2 scroll-smooth"
          style={{ maxHeight: "420px", scrollbarGutter: "stable" }}
        >
          <ul className="space-y-1 px-2">
            {list.map((round) => {
              const href =
                round.championship_id
                  ? `/championships/${round.championship_id}/rounds/${round.id}`
                  : "#";
              const isClickable = !!round.championship_id;

              const content = (
                <>
                  <div className="flex items-center gap-2 mb-0.5">
                    <StatusDot status={round.computed_status} />
                    <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {round.computed_status.replace("_", " ")}
                    </span>
                  </div>
                  <p className="font-bold text-gray-900">{round.name}</p>
                  <p className="text-sm text-gray-600">{round.championship_name}</p>
                  <p className="text-sm text-gray-500 mt-0.5">
                    {formatRoundDate(round.date)}
                  </p>
                  {round.track_name && (
                    <p className="text-xs text-gray-400 mt-0.5">
                      {round.track_name}
                    </p>
                  )}
                </>
              );

              return (
                <li key={round.id}>
                  {isClickable ? (
                    <Link
                      href={href}
                      className="block p-4 rounded-xl border border-gray-100 hover:border-gray-200 hover:bg-gray-50/80 transition-colors"
                    >
                      {content}
                    </Link>
                  ) : (
                    <div className="block p-4 rounded-xl border border-gray-100 bg-gray-50/50">
                      {content}
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
};

export default RoundsCard;
