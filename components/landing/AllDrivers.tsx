"use client"; 

import React, { useState } from 'react';
import Link from 'next/link';

const ALL_DRIVERS = [
  { id: 'max-verstappen', name: 'Max Verstappen', team: 'Red Bull Racing', number: '1', points: 406, color: 'bg-red-600', accent: 'border-red-500' },
  { id: 'lewis-hamilton', name: 'Lewis Hamilton', team: 'Mercedes-AMG', number: '44', points: 190, color: 'bg-red-600', accent: 'border-red-500' },
  { id: 'charles-leclerc', name: 'Charles Leclerc', team: 'Ferrari', number: '16', points: 275, color: 'bg-red-600', accent: 'border-red-500' },
  { id: 'lando-norris', name: 'Lando Norris', team: 'McLaren', number: '4', points: 280, color: 'bg-red-600', accent: 'border-red-500' },
  { id: 'carlos-sainz', name: 'Carlos Sainz', team: 'Ferrari', number: '55', points: 190, color: 'bg-red-600', accent: 'border-red-500' },
  { id: 'george-russell', name: 'George Russell', team: 'Mercedes-AMG', number: '63', points: 115, color: 'bg-red-600', accent: 'border-red-500' },
];

const AllDrivers = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredDrivers = ALL_DRIVERS.filter(driver => 
    driver.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    driver.team.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="landing-page min-h-screen py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="mb-12">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-4">2026 Driver Grid</h1>
          
          <div className="relative max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
              </svg>
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 sm:text-sm transition duration-150 ease-in-out shadow-sm"
              placeholder="Search driver or team..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredDrivers.map((driver) => (
           <Link key={driver.id} href={`/landing/drivers/${driver.id}`} className="group block h-full">
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
          
          {filteredDrivers.length === 0 && (
             <div className="col-span-full text-center py-12">
                <p className="text-gray-500 text-lg">No drivers found matching "{searchTerm}"</p>
             </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default AllDrivers;