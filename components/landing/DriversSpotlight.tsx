import React from 'react';
import Link from 'next/link';

const DriversSpotlight = () => {
  const drivers = [
    { 
      id: 'max-verstappen', 
      name: 'Max Verstappen', 
      team: 'Red Bull Racing', 
      number: '1', 
      points: 406, 
      color: 'bg-red-600',
      accent: 'border-red-500'
    },
    { 
      id: 'lewis-hamilton', 
      name: 'Lewis Hamilton', 
      team: 'Mercedes-AMG', 
      number: '44', 
      points: 190, 
      color: 'bg-red-600',
      accent: 'border-red-500'
    },
    { 
      id: 'charles-leclerc', 
      name: 'Charles Leclerc', 
      team: 'Ferrari', 
      number: '16', 
      points: 275, 
      color: 'bg-red-600',
      accent: 'border-red-500'
    },
    { 
      id: 'lando-norris', 
      name: 'Lando Norris', 
      team: 'McLaren', 
      number: '4', 
      points: 280, 
      color: 'bg-red-600',
      accent: 'border-red-500'
    }
  ];

  return (
    <section className="py-24 ">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="flex justify-between items-end mb-12 border-b border-gray-100 pb-6">
          <div>
            <span className="text-red-600 font-bold tracking-widest text-xs uppercase mb-2 block">Season 2026</span>
            <h2 className="text-4xl font-extrabold text-gray-900 tracking-tight">Driver Standings</h2>
          </div>
          <Link 
            href="/drivers" 
            className="hidden md:flex items-center gap-2 text-sm font-bold text-gray-900 hover:text-red-600 transition group"
          >
            View Full Grid 
            <span className="group-hover:translate-x-1 transition-transform">&rarr;</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {drivers.map((driver) => (
            <Link key={driver.id} href={`/drivers/${driver.id}`} className="group block h-full">
              <div className={`
                relative h-full flex flex-col 
                bg-gray-50 rounded-2xl overflow-hidden 
                transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl
                border-b-4 ${driver.accent}
              `}>
                
                <div className={`h-48 w-full ${driver.color} relative overflow-hidden flex items-end justify-center`}>
                  <span className="absolute top-2 right-4 text-8xl font-black text-white opacity-10 leading-none select-none">
                    {driver.number}
                  </span>
                  
                  <div className="w-32 h-32 bg-gray-800/20 backdrop-blur-sm rounded-t-full border-4 border-white/10 relative z-10 translate-y-4 group-hover:scale-105 transition-transform duration-500"></div>
                </div>

                <div className="p-6 flex flex-col flex-grow bg-white">
                  <div className="mb-4">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">{driver.team}</p>
                    <h3 className="text-xl font-bold text-gray-900 leading-tight group-hover:text-red-600 transition-colors">
                      {driver.name}
                    </h3>
                  </div>

                  <div className="mt-auto pt-4 border-t border-gray-100 flex justify-between items-center">
                    <div>
                      <span className="text-[10px] uppercase text-gray-400 font-bold">Points</span>
                      <p className="text-xl font-mono font-bold text-gray-900">{driver.points}</p>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center group-hover:bg-black group-hover:text-white transition-colors">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/></svg>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-8 md:hidden">
          <Link href="/drivers" className="block w-full py-4 bg-black text-white text-center rounded-xl font-bold hover:bg-gray-800 transition">
            View All Drivers
          </Link>
        </div>
        
      </div>
    </section>
  );
};

export default DriversSpotlight;