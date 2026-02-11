"use client";

import React from "react";
import { FaMapMarkerAlt, FaCalendarAlt, FaFlagCheckered, FaTrophy } from "react-icons/fa";

const rounds = [
  {
    id: 1,
    name: "Bahrain Grand Prix",
    circuit: "Bahrain International Circuit",
    date: "Mar 02, 2025",
    status: "Completed",
    winner: "Max Verstappen",
    flag: "🇧🇭",
  },
  {
    id: 2,
    name: "Saudi Arabian Grand Prix",
    circuit: "Jeddah Corniche Circuit",
    date: "Mar 09, 2025",
    status: "Completed",
    winner: "Sergio Perez",
    flag: "🇸🇦",
  },
  {
    id: 3,
    name: "Australian Grand Prix",
    circuit: "Albert Park Circuit",
    date: "Mar 24, 2025",
    status: "Next", 
    flag: "🇦🇺",
  },
  {
    id: 4,
    name: "Japanese Grand Prix",
    circuit: "Suzuka Circuit",
    date: "Apr 07, 2025",
    status: "Upcoming",
    flag: "🇯🇵",
  },
  {
    id: 5,
    name: "Chinese Grand Prix",
    circuit: "Shanghai International Circuit",
    date: "Apr 21, 2025",
    status: "Upcoming",
    flag: "🇨🇳",
  },
  {
    id: 6,
    name: "Miami Grand Prix",
    circuit: "Miami International Autodrome",
    date: "May 05, 2025",
    status: "Upcoming",
    flag: "🇺🇸",
  },
];

export default function RoundsPage() {
  const nextRace = rounds.find((r) => r.status === "Next");
  const otherRounds = rounds.filter((r) => r.status !== "Next");

  return (
    <div className="container mx-auto px-4 py-12 space-y-12">
      
      <div className="text-center space-y-4">
        <h1 className="text-5xl md:text-7xl font-black tracking-tighter uppercase italic text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-red-400 drop-shadow-sm">
          Race Calendar
        </h1>
        <p className="text-gray-600 font-medium text-lg uppercase tracking-widest">
          2026 Season
        </p>
      </div>

      {nextRace && (
        <div className="relative group w-full max-w-4xl mx-auto">
          <div className="absolute -inset-1 bg-gradient-to-r from-red-600 via-orange-500 to-red-600 rounded-2xl blur opacity-30 group-hover:opacity-75 transition duration-1000 group-hover:duration-200 animate-tilt"></div>
          
          <div className="relative bg-white/80 backdrop-blur-xl border border-white/40 p-8 md:p-12 rounded-2xl shadow-2xl flex flex-col md:flex-row items-center justify-between gap-8">
            
            <div className="text-center md:text-left space-y-4">
              <span className="inline-block px-4 py-1 rounded-full bg-red-100 text-red-600 text-xs font-bold uppercase tracking-wider animate-pulse">
                Up Next
              </span>
              <h2 className="text-4xl md:text-5xl font-black text-gray-900 uppercase italic">
                {nextRace.flag} {nextRace.name}
              </h2>
              <div className="flex flex-col space-y-2 text-gray-600 font-medium">
                <div className="flex items-center gap-2 justify-center md:justify-start">
                  <FaMapMarkerAlt className="text-red-500" />
                  {nextRace.circuit}
                </div>
                <div className="flex items-center gap-2 justify-center md:justify-start">
                  <FaCalendarAlt className="text-red-500" />
                  {nextRace.date}
                </div>
              </div>
            </div>

            <div className="flex flex-col items-center gap-4">
              <div className="text-center p-4 bg-gray-50 rounded-xl border border-gray-100 shadow-inner">
                 <span className="text-xs text-gray-400 uppercase font-bold">Race Day</span>
                 <div className="text-3xl font-black text-red-600 font-mono">
                   SUN 24
                 </div>
              </div>
              <button className="px-8 py-3 bg-black text-white font-bold uppercase rounded-lg hover:bg-red-600 transition-colors shadow-lg hover:shadow-red-500/30">
                View Details
              </button>
            </div>

          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {otherRounds.map((round) => (
          <div 
            key={round.id}
            className={`
              relative p-6 rounded-xl border backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl
              ${round.status === 'Completed' 
                ? 'bg-gray-100/50 border-gray-200 opacity-80 hover:opacity-100' 
                : 'bg-white/60 border-white/50 hover:border-red-500/30'
              }
            `}
          >
            <div className="absolute top-4 right-4 text-4xl font-black text-gray-200 -z-10 italic">
              R{round.id}
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <span className="text-3xl shadow-sm">{round.flag}</span>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 leading-tight uppercase italic">
                    {round.name}
                  </h3>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded uppercase ${round.status === 'Completed' ? 'bg-gray-200 text-gray-500' : 'bg-blue-100 text-blue-600'}`}>
                    {round.status}
                  </span>
                </div>
              </div>

              <hr className="border-gray-200/50" />

              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <FaMapMarkerAlt className="text-gray-400" />
                  {round.circuit}
                </div>
                <div className="flex items-center gap-2">
                  <FaCalendarAlt className="text-gray-400" />
                  {round.date}
                </div>
                
                {round.status === 'Completed' && (
                  <div className="mt-4 flex items-center gap-2 text-green-700 font-bold bg-green-50 p-2 rounded-lg">
                    <FaTrophy className="text-yellow-500" />
                    <span>{round.winner}</span>
                  </div>
                )}
              </div>

              {round.status !== 'Completed' && (
                <button className="w-full mt-2 py-2 text-sm font-bold text-gray-700 border border-gray-300 rounded hover:bg-black hover:text-white hover:border-transparent transition-colors">
                  Ticket Info
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}