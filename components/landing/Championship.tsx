import React from 'react';

const Championship = () => {

    const standings = [
    { rank: 1, name: "Oracle Red Bull Racing", points: 406, trend: "same" },
    { rank: 2, name: "McLaren Formula 1 Team", points: 366, trend: "up" },
    { rank: 3, name: "Scuderia Ferrari", points: 345, trend: "down" },
    { rank: 4, name: "Mercedes-AMG PETRONAS", points: 266, trend: "same" },
    { rank: 5, name: "Aston Martin Aramco", points: 73, trend: "same" },
    { rank: 6, name: "Visa Cash App RB", points: 34, trend: "up" },
    { rank: 7, name: "Haas F1 Team", points: 27, trend: "same" },
    { rank: 8, name: "BWT Alpine F1 Team", points: 11, trend: "down" },
    { rank: 9, name: "Williams Racing", points: 4, trend: "same" },
    { rank: 10, name: "Kick Sauber", points: 0, trend: "same" },
  ];

  return (
    <section className="py-20  border-t border-gray-200" id="championship">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="mb-12 text-center md:text-left flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Championship Center</h2>
            <p className="mt-2 text-red-600">Season 2026 / Round 14 Update</p>
          </div>
          <button className="text-sm font-semibold text-red-600 hover:text-red-800 transition flex items-center gap-1">
            View Full Leaderboard 
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path></svg>
          </button>
        </div>

        <div className="grid lg:grid-cols-12 gap-8 lg:gap-12">
          
          <div className="lg:col-span-7">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                <h3 className="font-semibold text-gray-900">Constructor Standings</h3>
                <span className="text-xs font-medium px-2 py-1 bg-green-100 text-green-700 rounded-full">Live Updated</span>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-gray-600">
                  <thead className="bg-gray-50 text-xs uppercase font-semibold text-gray-500">
                    <tr>
                      <th className="px-6 py-3">Pos</th>
                      <th className="px-6 py-3">Team / Driver</th>
                      <th className="px-6 py-3 text-right">Pts</th>
                      <th className="px-6 py-3 text-center">Trend</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {standings.map((team) => (
                      <tr key={team.rank} className="hover:bg-gray-50 transition-colors group">
                        <td className="px-6 py-4 font-medium text-gray-900">
                          {team.rank === 1 ? '🥇' : team.rank === 2 ? '🥈' : team.rank === 3 ? '🥉' : team.rank}
                        </td>
                        <td className="px-6 py-4 font-medium text-gray-900 group-hover:text-red-600 transition-colors">
                          {team.name}
                        </td>
                        <td className="px-6 py-4 text-right font-bold text-black">
                          {team.points}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <TrendIcon type={team.trend} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 flex flex-col gap-6">
            
            <div className="bg-black text-white rounded-2xl shadow-xl overflow-hidden relative group cursor-pointer">
              <div className="aspect-video bg-gray-900 relative opacity-90 group-hover:opacity-100 transition duration-500">
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent z-10"></div>
                <div className="w-full h-full flex items-center justify-center">
                   <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center group-hover:scale-110 transition duration-300 z-20">
                     <svg className="w-6 h-6 text-white ml-1" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                   </div>
                </div>
              </div>

              <div className="absolute bottom-0 left-0 right-0 p-6 z-20">
                <div className="flex items-center gap-2 mb-2">
                   <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-600 text-white uppercase tracking-wider">Highlights</span>
                   <span className="text-xs text-gray-300">Monza GP &bull; 2 Days ago</span>
                </div>
                <h3 className="text-xl font-bold leading-tight mb-1 group-hover:text-red-400 transition">
                  Drama at Turn 1: Full Race Recap and Analysis
                </h3>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                Fastest Lap
              </h4>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-sm font-bold">L.H</div>
                  <div>
                    <p className="text-sm font-bold text-gray-900">Lewis Hamilton</p>
                    <p className="text-xs text-gray-500">Mercedes-AMG</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xl font-mono font-bold text-gray-900">1:21.334</p>
                  <p className="text-xs text-gray-500">Lap 53</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
};

const TrendIcon = ({ type }: { type: string }) => {
  if (type === 'up') return <span className="text-green-500 text-xs">▲</span>;
  if (type === 'down') return <span className="text-red-500 text-xs">▼</span>;
  return <span className="text-gray-300 text-lg leading-3">-</span>;
};

export default Championship;