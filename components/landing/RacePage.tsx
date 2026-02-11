"use client";

import React from "react";
import { FaFlagCheckered, FaStopwatch, FaCloudSun, FaTemperatureHigh, FaMapMarkerAlt } from "react-icons/fa";

const raceData = {
  name: "Melbourne Grand Prix",
  circuit: "Albert Park Circuit",
  round: 3,
  laps: 58,
  length: "5.278 km",
  record: "1:20.260 (Leclerc, 2022)",
  weather: "Sunny, 24°C",
  trackTemp: "38°C",
};

const schedule = [
  { session: "FP1", day: "Fri", time: "12:30", status: "Completed" },
  { session: "FP2", day: "Fri", time: "16:00", status: "Completed" },
  { session: "FP3", day: "Sat", time: "13:00", status: "Live" },
  { session: "Qualifying", day: "Sat", time: "16:00", status: "Upcoming" },
  { session: "Race", day: "Sun", time: "15:00", status: "Upcoming" },
];

const leaderboard = [
  { pos: 1, driver: "VER", team: "Red Bull", gap: "Leader", sector1: "22.4", sector2: "18.1", sector3: "19.2", tire: "S" },
  { pos: 2, driver: "LEC", team: "Ferrari", gap: "+0.142", sector1: "22.5", sector2: "18.0", sector3: "19.3", tire: "S" },
  { pos: 3, driver: "NOR", team: "McLaren", gap: "+0.388", sector1: "22.6", sector2: "18.2", sector3: "19.4", tire: "M" },
  { pos: 4, driver: "HAM", team: "Mercedes", gap: "+0.512", sector1: "22.7", sector2: "18.3", sector3: "19.4", tire: "S" },
  { pos: 5, driver: "ALO", team: "Aston Martin", gap: "+0.890", sector1: "22.8", sector2: "18.4", sector3: "19.6", tire: "H" },
];

export default function RacePage() {
  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      
      <div className="flex flex-col md:flex-row justify-between items-end border-b border-gray-200/50 pb-4">
        <div>
          <span className="text-red-600 font-bold uppercase tracking-widest text-sm animate-pulse">
            ● Live Session
          </span>
          <h1 className="text-4xl md:text-6xl font-black uppercase italic text-gray-900 leading-none">
            {raceData.name}
          </h1>
        </div>
        <div className="flex gap-6 text-gray-600 font-medium mt-4 md:mt-0">
          <div className="flex items-center gap-2">
            <FaCloudSun /> {raceData.weather}
          </div>
          <div className="flex items-center gap-2">
            <FaTemperatureHigh /> {raceData.trackTemp}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        <div className="lg:col-span-2 space-y-6">
          
          {/* Track Map Card */}
          <div className="relative bg-white/40 backdrop-blur-md border border-white/60 p-8 rounded-2xl shadow-xl h-96 flex items-center justify-center group overflow-hidden">
             <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:20px_20px]" />
             
             <svg viewBox="0 0 200 150" className="w-3/4 h-3/4 drop-shadow-[0_0_15px_rgba(220,38,38,0.6)] group-hover:scale-105 transition-transform duration-500">
               <path 
                 d="M20,100 Q40,120 60,100 L80,80 Q100,60 120,80 L160,120 Q180,140 180,100 L180,50 Q180,10 140,10 L60,10 Q20,10 20,50 Z" 
                 fill="none" 
                 stroke="#dc2626" 
                 strokeWidth="3"
                 strokeLinecap="round"
                 className="animate-draw-path"
               />
               <circle r="4" fill="white">
                 <animateMotion 
                   dur="6s" 
                   repeatCount="indefinite" 
                   path="M20,100 Q40,120 60,100 L80,80 Q100,60 120,80 L160,120 Q180,140 180,100 L180,50 Q180,10 140,10 L60,10 Q20,10 20,50 Z" 
                 />
               </circle>
             </svg>
             
             <div className="absolute bottom-4 left-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
               Circuit Layout v2.4
             </div>
          </div>

          <div className="bg-black/80 backdrop-blur-xl text-white p-6 rounded-2xl shadow-2xl border border-gray-700">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold uppercase italic flex items-center gap-2">
                <FaFlagCheckered className="text-red-500" /> Live Leaderboard
              </h3>
              <span className="text-xs text-gray-400">Updating...</span>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-gray-500 uppercase border-b border-gray-700">
                  <tr>
                    <th className="py-2">Pos</th>
                    <th className="py-2">Driver</th>
                    <th className="py-2">Gap</th>
                    <th className="py-2 text-center text-purple-400">S1</th>
                    <th className="py-2 text-center text-green-400">S2</th>
                    <th className="py-2 text-center text-yellow-400">S3</th>
                    <th className="py-2 text-center">Tire</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {leaderboard.map((row) => (
                    <tr key={row.pos} className="hover:bg-white/5 transition-colors">
                      <td className="py-3 font-bold text-red-500">{row.pos}</td>
                      <td className="py-3 font-bold">{row.driver} <span className="text-xs text-gray-500 font-normal ml-1">{row.team}</span></td>
                      <td className="py-3 text-gray-300 font-mono">{row.gap}</td>
                      <td className="py-3 text-center font-mono text-purple-400">{row.sector1}</td>
                      <td className="py-3 text-center font-mono text-green-400">{row.sector2}</td>
                      <td className="py-3 text-center font-mono text-yellow-400">{row.sector3}</td>
                      <td className="py-3 text-center">
                        <span className={`inline-block w-4 h-4 rounded-full border-2 ${
                          row.tire === 'S' ? 'border-red-500 text-red-500' : 
                          row.tire === 'M' ? 'border-yellow-500 text-yellow-500' : 
                          'border-white text-white'
                        } text-[8px] flex items-center justify-center font-bold`}>
                          {row.tire}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          
          <div className="bg-white/60 backdrop-blur-md p-6 rounded-2xl border border-white/50 shadow-lg">
            <h3 className="text-lg font-black uppercase italic mb-4">Track Data</h3>
            <ul className="space-y-4">
              <StatItem label="Laps" value={raceData.laps} />
              <StatItem label="Length" value={raceData.length} />
              <StatItem label="Lap Record" value={raceData.record} />
              <StatItem label="DRS Zones" value="2" />
            </ul>
          </div>

          <div className="bg-white/60 backdrop-blur-md p-6 rounded-2xl border border-white/50 shadow-lg">
            <h3 className="text-lg font-black uppercase italic mb-4 flex items-center gap-2">
              <FaStopwatch /> Weekend Schedule
            </h3>
            <div className="space-y-3">
              {schedule.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center p-3 rounded-lg bg-white/50 border border-white/40">
                  <div>
                    <div className="font-bold text-gray-800">{item.session}</div>
                    <div className="text-xs text-gray-500">{item.day} • {item.time}</div>
                  </div>
                  <span className={`px-2 py-1 text-xs font-bold rounded uppercase ${
                    item.status === 'Live' ? 'bg-red-600 text-white animate-pulse' :
                    item.status === 'Completed' ? 'bg-gray-200 text-gray-400 line-through decoration-1' :
                    'bg-blue-100 text-blue-600'
                  }`}>
                    {item.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

const StatItem = ({ label, value }: { label: string, value: string | number }) => (
  <li className="flex justify-between items-center border-b border-gray-200 pb-2 last:border-0 last:pb-0">
    <span className="text-gray-500 text-sm uppercase font-bold">{label}</span>
    <span className="text-gray-900 font-mono font-bold">{value}</span>
  </li>
);