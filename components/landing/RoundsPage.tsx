"use client";

import React, { useState, useEffect } from "react";
import { 
  FaMapMarkerAlt, FaCalendarAlt, FaFlagCheckered, FaTrophy, 
  FaTimes, FaChevronRight, FaChevronLeft, FaImages, FaListOl, FaChartBar 
} from "react-icons/fa";

// --- MOCK DATA (Same as before) ---
const ROUNDS_DATA = [
  {
    id: 1,
    name: "Bahrain Grand Prix",
    circuit: "Bahrain International Circuit",
    date: "Mar 02, 2025",
    status: "Completed",
    flag: "🇧🇭",
    winner: "Max Verstappen",
    images: ["/api/placeholder/800/400", "/api/placeholder/800/400"],
    sessions: [
      {
        name: "Race",
        date: "Sun, Mar 02",
        results: [
          { pos: 1, driver: "Max Verstappen", team: "Red Bull", time: "1:31:44.742", pts: 25 },
          { pos: 2, driver: "Sergio Perez", team: "Red Bull", time: "+22.457s", pts: 18 },
          { pos: 3, driver: "Carlos Sainz", team: "Ferrari", time: "+25.110s", pts: 15 },
        ]
      }
    ],
    standings: [
      { pos: 1, driver: "Max Verstappen", team: "Red Bull", points: 26 },
      { pos: 2, driver: "Sergio Perez", team: "Red Bull", points: 18 },
    ]
  },
  {
    id: 2,
    name: "Saudi Arabian Grand Prix",
    circuit: "Jeddah Corniche Circuit",
    date: "Mar 09, 2025",
    status: "Completed",
    flag: "🇸🇦",
    winner: "Sergio Perez",
    images: ["/api/placeholder/800/400"],
    sessions: [],
    standings: []
  },
  {
    id: 3,
    name: "Australian Grand Prix",
    circuit: "Albert Park Circuit",
    date: "Mar 24, 2025",
    status: "Next",
    flag: "🇦🇺",
    winner: null,
    images: [],
    sessions: [],
    standings: []
  },
  {
    id: 4,
    name: "Japanese Grand Prix",
    circuit: "Suzuka Circuit",
    date: "Apr 07, 2025",
    status: "Upcoming",
    flag: "🇯🇵",
    winner: null,
    images: [],
    sessions: [],
    standings: []
  },
];

export default function RoundsPage() {
  const [selectedRound, setSelectedRound] = useState<any>(null);
  const nextRace = ROUNDS_DATA.find((r) => r.status === "Next");
  const otherRounds = ROUNDS_DATA.filter((r) => r.status !== "Next");

  // Disable background scroll when modal is open
  useEffect(() => {
    if (selectedRound) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [selectedRound]);

  return (
    <div className="container mx-auto px-4 py-8 md:py-12 space-y-8 md:space-y-12 pb-24">
      
      {/* HEADER */}
      <div className="text-center space-y-2 md:space-y-4">
        <h1 className="text-4xl md:text-7xl font-black tracking-tighter uppercase italic text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-red-400 drop-shadow-sm">
          Race Calendar
        </h1>
        <p className="text-gray-600 font-medium text-sm md:text-lg uppercase tracking-widest">
          2025 Season
        </p>
      </div>

      {/* HERO CARD (Next Race) */}
      {nextRace && (
        <div 
          onClick={() => setSelectedRound(nextRace)}
          className="relative group w-full max-w-4xl mx-auto cursor-pointer"
        >
          <div className="absolute -inset-1 bg-gradient-to-r from-red-600 via-orange-500 to-red-600 rounded-2xl blur opacity-30 group-hover:opacity-75 transition duration-1000 group-hover:duration-200 animate-tilt hidden md:block"></div>
          
          <div className="relative bg-white/80 backdrop-blur-xl border border-white/40 p-6 md:p-12 rounded-2xl shadow-xl md:shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6 md:gap-8 transform transition hover:scale-[1.01]">
            <div className="text-center md:text-left space-y-3 md:space-y-4 w-full">
              <span className="inline-block px-3 py-1 rounded-full bg-red-100 text-red-600 text-[10px] md:text-xs font-bold uppercase tracking-wider animate-pulse">
                Up Next
              </span>
              <h2 className="text-3xl md:text-5xl font-black text-gray-900 uppercase italic truncate">
                {nextRace.flag} {nextRace.name}
              </h2>
              <div className="flex flex-col md:flex-row gap-2 md:gap-6 text-gray-600 font-medium justify-center md:justify-start text-sm md:text-base">
                <div className="flex items-center gap-2">
                  <FaMapMarkerAlt className="text-red-500" /> {nextRace.circuit}
                </div>
                <div className="flex items-center gap-2">
                  <FaCalendarAlt className="text-red-500" /> {nextRace.date}
                </div>
              </div>
            </div>

            <div className="flex flex-row md:flex-col items-center gap-4 w-full md:w-auto justify-between md:justify-center border-t md:border-t-0 border-gray-200 pt-4 md:pt-0">
              <div className="text-center md:p-4 md:bg-gray-50 md:rounded-xl md:border md:border-gray-100 md:shadow-inner">
                 <span className="text-[10px] md:text-xs text-gray-400 uppercase font-bold block">Race Day</span>
                 <div className="text-2xl md:text-3xl font-black text-red-600 font-mono">SUN 24</div>
              </div>
              <button className="px-6 py-2 md:px-8 md:py-3 bg-black text-white text-sm md:text-base font-bold uppercase rounded-lg group-hover:bg-red-600 transition-colors shadow-lg">
                View Hub
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ROUNDS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {otherRounds.map((round) => (
          <div 
            key={round.id}
            onClick={() => setSelectedRound(round)}
            className={`
              relative p-5 md:p-6 rounded-xl border backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl cursor-pointer group active:scale-95
              ${round.status === 'Completed' 
                ? 'bg-gray-100/80 md:bg-gray-100/50 border-gray-200 opacity-90 md:opacity-80 hover:opacity-100' 
                : 'bg-white/80 md:bg-white/60 border-white/50 hover:border-red-500/30'
              }
            `}
          >
            <div className="absolute top-4 right-4 text-3xl md:text-4xl font-black text-gray-300 md:text-gray-200 -z-10 italic">R{round.id}</div>
            <div className="space-y-3 md:space-y-4">
              <div className="flex items-center gap-3">
                <span className="text-2xl md:text-3xl shadow-sm">{round.flag}</span>
                <div>
                  <h3 className="text-lg md:text-xl font-bold text-gray-900 leading-tight uppercase italic group-hover:text-red-600 transition-colors">
                    {round.name}
                  </h3>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${round.status === 'Completed' ? 'bg-gray-200 text-gray-500' : 'bg-blue-100 text-blue-600'}`}>
                    {round.status}
                  </span>
                </div>
              </div>
              <hr className="border-gray-200/50" />
              <div className="space-y-1.5 text-xs md:text-sm text-gray-600">
                <div className="flex items-center gap-2"><FaMapMarkerAlt className="text-gray-400" /> {round.circuit}</div>
                <div className="flex items-center gap-2"><FaCalendarAlt className="text-gray-400" /> {round.date}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* DETAIL MODAL */}
      {selectedRound && (
        <RoundDetailModal 
          round={selectedRound} 
          onClose={() => setSelectedRound(null)} 
        />
      )}

    </div>
  );
}

// --- RESPONSIVE MODAL ---
const RoundDetailModal = ({ round, onClose }: { round: any; onClose: () => void }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'results' | 'standings'>('results');

  useEffect(() => {
    if (round.status !== 'Completed') setActiveTab('overview');
  }, [round]);

  return (
    <div className="fixed inset-0 z-[60] flex items-end md:items-center justify-center md:p-4">
      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>
      
      {/* Modal Content */}
      <div className="relative bg-white md:bg-white/90 md:backdrop-blur-xl w-full h-full md:h-[85vh] md:max-w-5xl rounded-none md:rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-fade-in-up">
        
        {/* Modal Header */}
        <div className="bg-gray-900 text-white p-4 md:p-6 flex justify-between items-center shrink-0 safe-area-top">
          <div className="flex items-center gap-3 md:gap-4 overflow-hidden">
             <span className="text-3xl md:text-4xl flex-shrink-0">{round.flag}</span>
             <div className="min-w-0">
               <h2 className="text-lg md:text-2xl font-black uppercase italic tracking-wide truncate">{round.name}</h2>
               <p className="text-gray-400 text-xs md:text-sm truncate">{round.circuit} • {round.date}</p>
             </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-700 rounded-full transition-colors flex-shrink-0">
            <FaTimes size={20} className="md:w-6 md:h-6" />
          </button>
        </div>

        {/* Navigation Tabs (Scrollable on mobile) */}
        <div className="flex border-b border-gray-200 shrink-0 overflow-x-auto no-scrollbar bg-gray-50 md:bg-transparent">
          {round.status === 'Completed' && (
            <>
              <TabButton active={activeTab === 'results'} onClick={() => setActiveTab('results')} icon={<FaListOl />}>Results</TabButton>
              <TabButton active={activeTab === 'standings'} onClick={() => setActiveTab('standings')} icon={<FaChartBar />}>Standings</TabButton>
            </>
          )}
           <TabButton active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} icon={<FaImages />}>Media</TabButton>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-gray-50/50 pb-20 md:pb-6">
          
          {activeTab === 'overview' && <SlideshowView round={round} />}
          
          {activeTab === 'results' && (
             <div className="space-y-6 md:space-y-8">
               {round.sessions?.length > 0 ? round.sessions.map((session: any, idx: number) => (
                 <SessionTable key={idx} session={session} />
               )) : <EmptyState message="No results available yet." />}
             </div>
          )}

          {activeTab === 'standings' && (
            round.standings?.length > 0 
              ? <StandingsTable standings={round.standings} /> 
              : <EmptyState message="Standings not updated." />
          )}
          
        </div>
      </div>
    </div>
  );
};

const EmptyState = ({ message }: { message: string }) => (
  <div className="text-center py-12 text-gray-500 bg-white rounded-xl border border-dashed border-gray-300">
    <p>{message}</p>
  </div>
);

// 1. RESPONSIVE SLIDESHOW
const SlideshowView = ({ round }: { round: any }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const hasImages = round.images && round.images.length > 0;

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % round.images.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + round.images.length) % round.images.length);

  return (
    <div className="space-y-4 md:space-y-6">
      {hasImages ? (
        <div className="relative h-56 md:h-96 w-full rounded-xl md:rounded-2xl overflow-hidden shadow-lg group bg-black">
          <img 
            src={round.images[currentSlide]} 
            alt="Race info" 
            className="w-full h-full object-cover opacity-90"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-4 md:p-6">
             <h3 className="text-white text-xl md:text-3xl font-bold uppercase italic">Visual Recap</h3>
          </div>
          <button onClick={prevSlide} className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 md:p-3 rounded-full hover:bg-red-600 transition backdrop-blur-sm">
             <FaChevronLeft size={14} className="md:w-4 md:h-4" />
          </button>
          <button onClick={nextSlide} className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 md:p-3 rounded-full hover:bg-red-600 transition backdrop-blur-sm">
             <FaChevronRight size={14} className="md:w-4 md:h-4" />
          </button>
        </div>
      ) : (
        <div className="h-48 md:h-64 flex items-center justify-center bg-gray-100 rounded-xl md:rounded-2xl border-2 border-dashed border-gray-300 text-gray-400 text-sm">
           No media available.
        </div>
      )}
      
      <div className="bg-white p-4 md:p-6 rounded-xl border border-gray-200 shadow-sm">
        <h3 className="text-lg md:text-xl font-bold text-gray-800 mb-2">Circuit Overview</h3>
        <p className="text-sm md:text-base text-gray-600 leading-relaxed">
          Detailed analysis of the {round.circuit}. The track evolution, weather conditions, 
          and strategic tire choices played a crucial role in the outcome of this event.
        </p>
      </div>
    </div>
  );
};

// 2. RESPONSIVE TABLES
const SessionTable = ({ session }: { session: any }) => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
    <div className="bg-gray-100 px-4 py-3 border-b border-gray-200 flex justify-between items-center">
      <h3 className="font-bold text-gray-800 text-sm md:text-base uppercase tracking-wide">{session.name}</h3>
      <span className="text-[10px] md:text-xs text-gray-500 font-mono">{session.date}</span>
    </div>
    
    {/* Scroll wrapper for mobile tables */}
    <div className="overflow-x-auto">
      <table className="w-full text-sm text-left whitespace-nowrap">
        <thead className="text-[10px] md:text-xs text-gray-500 uppercase bg-gray-50">
          <tr>
            <th className="px-4 py-2 md:px-6 md:py-3">Pos</th>
            <th className="px-4 py-2 md:px-6 md:py-3">Driver</th>
            <th className="px-4 py-2 md:px-6 md:py-3 hidden md:table-cell">Team</th>
            <th className="px-4 py-2 md:px-6 md:py-3 text-right">Time/Gap</th>
            <th className="px-4 py-2 md:px-6 md:py-3 text-right">Pts</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {session.results.map((res: any, idx: number) => (
            <tr key={idx} className="hover:bg-red-50/50 transition-colors">
              <td className={`px-4 py-3 md:px-6 font-bold ${idx === 0 ? 'text-yellow-600' : 'text-gray-900'}`}>{res.pos}</td>
              <td className="px-4 py-3 md:px-6 font-medium text-gray-900">
                {res.driver}
                {/* Show team name on mobile only under driver name */}
                <div className="text-[10px] text-gray-400 font-normal md:hidden">{res.team}</div>
              </td>
              <td className="px-4 py-3 md:px-6 text-gray-500 hidden md:table-cell">{res.team}</td>
              <td className="px-4 py-3 md:px-6 text-right font-mono text-xs md:text-sm text-gray-600">{res.time}</td>
              <td className="px-4 py-3 md:px-6 text-right font-bold text-gray-900">+{res.pts}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

const StandingsTable = ({ standings }: { standings: any[] }) => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
    <div className="bg-black text-white px-4 py-3 border-b border-gray-200">
      <h3 className="font-bold text-sm md:text-base uppercase tracking-wide flex items-center gap-2">
        <FaTrophy className="text-yellow-500" /> Standings
      </h3>
    </div>
    <div className="overflow-x-auto">
      <table className="w-full text-sm text-left whitespace-nowrap">
        <thead className="text-[10px] md:text-xs text-gray-500 uppercase bg-gray-50">
          <tr>
            <th className="px-4 py-2 md:px-6 md:py-3">Pos</th>
            <th className="px-4 py-2 md:px-6 md:py-3">Driver</th>
            <th className="px-4 py-2 md:px-6 md:py-3 text-right">Total Points</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {standings.map((res: any, idx: number) => (
            <tr key={idx} className="hover:bg-blue-50/50 transition-colors">
              <td className="px-4 py-3 md:px-6 font-bold text-gray-900">{res.pos}</td>
              <td className="px-4 py-3 md:px-6 font-bold text-gray-900">
                {res.driver}
                <div className="text-[10px] text-gray-400 font-normal md:hidden">{res.team}</div>
              </td>
              <td className="px-4 py-3 md:px-6 text-right font-black text-lg md:text-xl text-gray-900">{res.points}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

// Helper for Tabs
const TabButton = ({ active, onClick, children, icon }: any) => (
  <button
    onClick={onClick}
    className={`
      flex-1 py-3 md:py-4 px-4 text-xs md:text-sm font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all whitespace-nowrap
      ${active 
        ? 'border-b-4 border-red-600 text-red-600 bg-red-50/50' 
        : 'text-gray-500 hover:text-gray-800 hover:bg-gray-50'
      }
    `}
  >
    {icon} {children}
  </button>
);