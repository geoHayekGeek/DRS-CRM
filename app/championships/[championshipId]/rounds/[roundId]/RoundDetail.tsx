"use client";

import React, { useState } from "react";
import Image from "next/image";

type SessionResult = {
  position: number;
  driverName: string;
  time: string;
  points: number;
};

type Session = {
  id: string;
  name: string;
  order: number;
  results: SessionResult[];
};

type Props = {
  roundStandings: { fullName: string; totalPoints: number }[];
  sessions: Session[];
  images: { url: string }[];
};

export default function RoundDetail({
  roundStandings,
  sessions,
  images,
}: Props) {
  const [tab, setTab] = useState<"standings" | "sessions" | "media">("standings");
  const [expandedSessionId, setExpandedSessionId] = useState<string | null>(
    sessions.length > 0 ? sessions[0].id : null
  );
  const [mediaIndex, setMediaIndex] = useState(0);

  const toggleSession = (id: string) => {
    setExpandedSessionId((prev) => (prev === id ? null : id));
  };

  const goPrev = () => {
    setMediaIndex((i) => (i <= 0 ? images.length - 1 : i - 1));
  };
  const goNext = () => {
    setMediaIndex((i) => (i >= images.length - 1 ? 0 : i + 1));
  };

  return (
    <div>
      <div className="flex border-b border-gray-200 mb-6 overflow-x-auto">
        <button
          type="button"
          onClick={() => setTab("standings")}
          className={`px-4 py-3 font-semibold text-sm border-b-2 whitespace-nowrap transition ${
            tab === "standings"
              ? "border-red-600 text-red-600"
              : "border-transparent text-gray-700 hover:text-gray-900"
          }`}
        >
          STANDINGS
        </button>
        <button
          type="button"
          onClick={() => setTab("sessions")}
          className={`px-4 py-3 font-semibold text-sm border-b-2 whitespace-nowrap transition ${
            tab === "sessions"
              ? "border-red-600 text-red-600"
              : "border-transparent text-gray-700 hover:text-gray-900"
          }`}
        >
          RACE SESSIONS
        </button>
        <button
          type="button"
          onClick={() => setTab("media")}
          className={`px-4 py-3 font-semibold text-sm border-b-2 whitespace-nowrap transition ${
            tab === "media"
              ? "border-red-600 text-red-600"
              : "border-transparent text-gray-700 hover:text-gray-900"
          }`}
        >
          MEDIA
        </button>
      </div>

      {tab === "standings" && (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          {roundStandings.length === 0 ? (
            <div className="px-6 py-8 text-center text-gray-700">No standings yet.</div>
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
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {roundStandings.map((row, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium text-gray-900">{index + 1}</td>
                    <td className="px-6 py-4 text-gray-900">{row.fullName}</td>
                    <td className="px-6 py-4 text-right font-bold text-gray-900">
                      {row.totalPoints}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {tab === "sessions" && (
        <div className="space-y-2">
          {sessions.length === 0 ? (
            <div className="bg-white border border-gray-200 rounded-xl px-6 py-8 text-center text-gray-700">
              No race sessions yet.
            </div>
          ) : (
            sessions.map((session) => {
              const isOpen = expandedSessionId === session.id;
              return (
                <div
                  key={session.id}
                  className="bg-white border border-gray-200 rounded-xl overflow-hidden"
                >
                  <button
                    type="button"
                    onClick={() => toggleSession(session.id)}
                    className="w-full flex items-center justify-between px-6 py-4 text-left font-semibold text-gray-900 hover:bg-gray-50 transition"
                  >
                    <span>{session.name}</span>
                    <svg
                      className={`w-5 h-5 text-gray-700 transition-transform duration-200 ${
                        isOpen ? "rotate-180" : ""
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </button>
                  <div
                    className={`grid transition-all duration-200 ease-out ${
                      isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                    }`}
                  >
                    <div className="overflow-hidden">
                      <div className="border-t border-gray-100 px-6 py-4">
                        {session.results.length === 0 ? (
                          <p className="text-gray-700 text-sm">No results.</p>
                        ) : (
                          <table className="w-full text-left text-sm">
                            <thead>
                              <tr className="text-gray-700">
                                <th className="pb-2 font-semibold">Pos</th>
                                <th className="pb-2 font-semibold">Driver</th>
                                <th className="pb-2 font-semibold text-right">Pts</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                              {session.results.map((r, i) => (
                                <tr key={i}>
                                  <td className="py-2 font-medium text-gray-900">{r.position}</td>
                                  <td className="py-2 text-gray-900">{r.driverName}</td>
                                  <td className="py-2 text-right font-medium text-gray-900">
                                    {r.points}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {tab === "media" && (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          {images.length === 0 ? (
            <div className="px-6 py-12 text-center text-gray-700">
              No media available
            </div>
          ) : (
            <div className="relative aspect-video bg-gray-900">
              {images.map((img, i) => (
                <div
                  key={i}
                  className={`absolute inset-0 transition-opacity duration-300 ${
                    i === mediaIndex ? "opacity-100 z-10" : "opacity-0 z-0"
                  }`}
                >
                  <Image
                    src={img.url}
                    alt=""
                    fill
                    className="object-contain"
                    sizes="100vw"
                  />
                </div>
              ))}
              {images.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={goPrev}
                    className="absolute left-2 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center transition"
                    aria-label="Previous"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    onClick={goNext}
                    className="absolute right-2 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center transition"
                    aria-label="Next"
                  >
                    <svg className="w-5 h-5 rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex gap-2">
                    {images.map((_, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setMediaIndex(i)}
                        className={`w-2 h-2 rounded-full transition ${
                          i === mediaIndex ? "bg-white scale-125" : "bg-white/50 hover:bg-white/70"
                        }`}
                        aria-label={`Go to slide ${i + 1}`}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
