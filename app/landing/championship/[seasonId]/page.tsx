"use client";
import React, { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { CHAMPIONSHIP_DATA } from "@/app/lib/data";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa";

export default function SeasonPage() {
  const params = useParams();
  const router = useRouter();
  const seasonId = params.seasonId as string;
  const data = CHAMPIONSHIP_DATA[seasonId];
  const [tab, setTab] = useState("rounds");

  if (!data) return <div className="p-10 text-center">Season Not Found</div>;

  return (
    <div className="container mx-auto px-4 py-8 space-y-8 min-h-screen pb-24">
      {/* Back Button (Updated Link) */}
      <Link href="/landing/championship" className="flex items-center gap-2 text-gray-500 font-bold uppercase text-xs">
        <FaArrowLeft /> Back to Hub
      </Link>

      <div className="text-center space-y-2">
        <h1 className="text-5xl md:text-7xl font-black italic uppercase text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-orange-500">
          {data.name}
        </h1>
      </div>

      <div className="flex justify-center gap-4 border-b border-gray-200 pb-1 overflow-x-auto">
        <button onClick={() => setTab("rounds")} className={`px-4 py-3 font-bold uppercase tracking-wider text-sm border-b-4 ${tab === "rounds" ? "text-red-600 border-red-600" : "text-gray-400 border-transparent"}`}>Rounds</button>
        <button onClick={() => setTab("standings")} className={`px-4 py-3 font-bold uppercase tracking-wider text-sm border-b-4 ${tab === "standings" ? "text-red-600 border-red-600" : "text-gray-400 border-transparent"}`}>Standings</button>
        <button onClick={() => setTab("media")} className={`px-4 py-3 font-bold uppercase tracking-wider text-sm border-b-4 ${tab === "media" ? "text-red-600 border-red-600" : "text-gray-400 border-transparent"}`}>Media</button>
      </div>

      <div className="min-h-[50vh]">
        {tab === "rounds" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in-up">
            {data.rounds.map((round: any) => (
              <Link 
                // FIX: Removed "/rounds/" and used "championship" (singular)
                href={`/landing/championship/${seasonId}/${round.id}`} 
                key={round.id} 
                className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 hover:border-red-500 transition group hover:-translate-y-1"
              >
                <div className="flex justify-between items-start mb-4">
                  <span className="text-4xl">{round.flag}</span>
                  <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${round.status === 'Completed' ? 'bg-gray-100 text-gray-600' : 'bg-red-100 text-red-600'}`}>{round.status}</span>
                </div>
                <h3 className="text-2xl font-black italic uppercase text-gray-800 group-hover:text-red-600 transition-colors">{round.name}</h3>
                <p className="text-gray-500 text-sm mt-1">{round.circuit} • {round.date}</p>
                <div className="mt-6 flex items-center gap-2 text-sm font-bold text-red-600 opacity-0 group-hover:opacity-100 transition-opacity">
                  View Round <FaArrowRight />
                </div>
              </Link>
            ))}
          </div>
        )}
        {tab === "standings" && <div className="p-10 text-center border-2 border-dashed rounded-2xl">Season Standings</div>}
        {tab === "media" && <div className="p-10 text-center border-2 border-dashed rounded-2xl">Season Media</div>}
      </div>
    </div>
  );
}