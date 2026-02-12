"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { CHAMPIONSHIP_DATA } from "@/app/lib/data";
import { 
  FaArrowLeft, FaFlagCheckered, FaImages, FaListOl, FaTrophy, FaCalendarAlt, FaMapMarkerAlt 
} from "react-icons/fa";

export default function RoundPage() {
  const params = useParams();
  const router = useRouter();
  
  // 1. Get IDs from URL
  const seasonId = params.seasonId as string;
  const roundsId = params.roundsId as string;
  
  // 2. Find Data
  const season = CHAMPIONSHIP_DATA[seasonId];
  const round = season?.rounds.find((r: any) => r.id === roundsId);

  // 3. States
  // Tabs: 'standing' (Round Level) vs 'races' (Race Level) vs 'media'
  const [activeTab, setActiveTab] = useState<'standing' | 'races' | 'media'>('standing');
  // State for switching between races (Sprint vs Feature)
  const [selectedRaceIndex, setSelectedRaceIndex] = useState(0);

  if (!round) return <div className="p-20 text-center text-white font-bold">Round Not Found</div>;

  const currentRace = round.races && round.races[selectedRaceIndex];

  return (
    <div className="container mx-auto px-4 py-8 space-y-8 min-h-screen pb-24 text-gray-800">
      
      {/* --- NAVIGATION --- */}
      <button 
        onClick={() => router.back()} 
        className="flex items-center gap-2 text-gray-500 font-bold hover:text-black uppercase text-xs"
      >
        <FaArrowLeft /> Back to Season
      </button>

      {/* --- HEADER --- */}
      <div className="bg-gray-900 text-white p-8 rounded-3xl shadow-2xl flex flex-col md:flex-row justify-between items-center relative overflow-hidden">
        {/* Abstract Red Glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-red-600 blur-[100px] opacity-20 pointer-events-none"></div>
        
        <div className="relative z-10">
          <span className="text-red-500 font-bold uppercase tracking-widest text-sm mb-2 block">
            {season.name}
          </span>
          <h1 className="text-4xl md:text-6xl font-black italic uppercase leading-none">
            {round.name}
          </h1>
          <div className="flex gap-4 mt-4 text-gray-400 text-sm font-medium">
            <span className="flex items-center gap-2"><FaMapMarkerAlt /> {round.circuit}</span>
            <span className="flex items-center gap-2"><FaCalendarAlt /> {round.date}</span>
          </div>
        </div>
        <div className="text-6xl md:text-9xl opacity-20 font-black italic relative z-10">
          {round.flag}
        </div>
      </div>

      {/* --- MAIN TABS --- */}
      <div className="flex justify-start md:justify-center border-b border-gray-200 overflow-x-auto no-scrollbar">
         <div className="flex gap-4 md:gap-8 px-2">
            <TabButton 
              active={activeTab === 'standing'} 
              onClick={() => setActiveTab('standing')} 
              icon={<FaTrophy />}
              label="Round Standing" 
            />
            <TabButton 
              active={activeTab === 'races'} 
              onClick={() => setActiveTab('races')} 
              icon={<FaFlagCheckered />}
              label="Race Sessions" 
            />
            <TabButton 
              active={activeTab === 'media'} 
              onClick={() => setActiveTab('media')} 
              icon={<FaImages />}
              label="Media Gallery" 
            />
         </div>
      </div>

      {/* --- CONTENT AREA --- */}
      <div className="min-h-[40vh] animate-fade-in-up">
        
        {/* 1. ROUND STANDING (Overall Weekend Points) */}
        {activeTab === 'standing' && (
          <div className="max-w-4xl mx-auto">
            <div className="mb-6 text-center">
              <h3 className="text-2xl font-black italic uppercase">Round Classification</h3>
              <p className="text-gray-500">Total points accumulated during this round.</p>
            </div>
            {round.roundStandings ? (
               <ResultTable data={round.roundStandings} isPoints />
            ) : (
               <EmptyState />
            )}
          </div>
        )}

        {/* 2. RACES (Drill Down) */}
        {activeTab === 'races' && (
          <div className="space-y-8">
            {round.races && round.races.length > 0 ? (
              <>
                {/* Race Selector (Pills) */}
                <div className="flex justify-center gap-4">
                  {round.races.map((race: any, idx: number) => (
                    <button
                      key={race.id}
                      onClick={() => setSelectedRaceIndex(idx)}
                      className={`
                        px-6 py-3 rounded-full font-bold uppercase text-sm transition-all shadow-sm
                        ${selectedRaceIndex === idx 
                          ? 'bg-red-600 text-white shadow-red-500/30 scale-105' 
                          : 'bg-white text-gray-500 border border-gray-200 hover:bg-gray-50'}
                      `}
                    >
                      {race.name}
                    </button>
                  ))}
                </div>

                {/* Specific Race Data */}
                <div className="bg-gray-50 p-6 md:p-8 rounded-3xl border border-gray-200 max-w-5xl mx-auto">
                   <div className="flex items-center gap-3 mb-6 border-b border-gray-200 pb-4">
                      <FaFlagCheckered className="text-2xl text-red-600" />
                      <h2 className="text-2xl font-black italic uppercase text-gray-900">
                        {currentRace.name} Results
                      </h2>
                   </div>
                   
                   {/* RACE STANDING TABLE */}
                   <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                      <ResultTable data={currentRace.raceStandings} />
                   </div>
                </div>
              </>
            ) : (
              <EmptyState message="No race sessions found for this round." />
            )}
          </div>
        )}

        {/* 3. MEDIA */}
        {activeTab === 'media' && (
          <div className="max-w-4xl mx-auto">
             <SlideshowView images={round.roundMedia} />
          </div>
        )}

      </div>
    </div>
  );
}

// --- COMPONENTS ---

const TabButton = ({ active, onClick, icon, label }: any) => (
  <button 
    onClick={onClick} 
    className={`
      flex items-center gap-2 px-4 py-4 border-b-4 font-bold uppercase tracking-wider text-sm transition-colors whitespace-nowrap
      ${active ? 'border-red-600 text-red-600' : 'border-transparent text-gray-400 hover:text-gray-600'}
    `}
  >
    {icon} {label}
  </button>
);

const ResultTable = ({ data, isPoints = false }: { data: any[], isPoints?: boolean }) => (
  <div className="overflow-x-auto">
    <table className="w-full text-sm text-left">
      <thead className="bg-gray-100 text-gray-500 font-bold uppercase text-xs">
        <tr>
          <th className="px-6 py-4">Pos</th>
          <th className="px-6 py-4">Driver</th>
          <th className="px-6 py-4 hidden md:table-cell">Team</th>
          {!isPoints && <th className="px-6 py-4 text-right">Time</th>}
          <th className="px-6 py-4 text-right">Pts</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-100">
        {data.map((row: any, i: number) => (
          <tr key={i} className="hover:bg-red-50 transition-colors">
            <td className={`px-6 py-4 font-bold ${i === 0 ? 'text-yellow-600' : 'text-gray-900'}`}>{row.pos}</td>
            <td className="px-6 py-4 font-bold text-gray-900">{row.driver}</td>
            <td className="px-6 py-4 text-gray-500 hidden md:table-cell">{row.team}</td>
            {!isPoints && <td className="px-6 py-4 text-right font-mono text-gray-600">{row.time}</td>}
            <td className={`px-6 py-4 text-right font-black ${isPoints ? 'text-lg text-gray-900' : 'text-gray-900'}`}>
              {isPoints ? row.pts : `+${row.pts}`}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

const SlideshowView = ({ images }: { images: string[] }) => {
  if (!images || images.length === 0) return <EmptyState message="No media available." />;
  return (
    <div className="bg-black rounded-2xl overflow-hidden h-96 relative group">
      <img src={images[0]} className="w-full h-full object-cover opacity-90" />
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <span className="text-white font-bold uppercase tracking-widest bg-black/50 px-4 py-2 rounded backdrop-blur-md">Gallery View</span>
      </div>
    </div>
  );
};

const EmptyState = ({ message = "No data available yet." }) => (
  <div className="text-center py-20 border-2 border-dashed border-gray-200 rounded-2xl bg-gray-50 text-gray-400 font-medium">
    {message}
  </div>
);