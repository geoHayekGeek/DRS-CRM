"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";

type PublicDriver = {
  id: string;
  fullName: string;
  profileImageUrl: string | null;
  age: number | null;
  height: number | null;
};

type Props = {
  drivers: PublicDriver[];
};

const AllDrivers = ({ drivers }: Props) => {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredDrivers = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return drivers;
    return drivers.filter((driver) =>
      driver.fullName.toLowerCase().includes(term)
    );
  }, [drivers, searchTerm]);

  return (
    <div className="landing-page min-h-screen py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="mb-12">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-4">Driver Grid</h1>

          <div className="relative max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
              </svg>
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 sm:text-sm transition duration-150 ease-in-out shadow-sm"
              placeholder="Search drivers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredDrivers.map((driver) => (
            <Link
              key={driver.id}
              href={`/drivers/${driver.id}`}
              className="group block h-full"
            >
              <div className="relative h-full flex flex-col bg-gray-50 rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl border border-gray-200 border-b-4 border-red-500">
                <div className="h-48 w-full bg-red-600 relative overflow-hidden flex items-end justify-center">
                  {driver.profileImageUrl ? (
                    <div className="relative w-full h-full">
                      <Image
                        src={driver.profileImageUrl}
                        alt=""
                        fill
                        className="object-cover"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      />
                    </div>
                  ) : (
                    <div className="w-32 h-32 bg-gray-800/20 backdrop-blur-sm rounded-t-full border-4 border-white/10 relative z-10 translate-y-4 group-hover:scale-105 transition-transform duration-500" />
                  )}
                </div>

                <div className="p-6 flex flex-col flex-grow bg-white">
                  <div className="mb-4">
                    <h3 className="text-xl font-bold text-gray-900 leading-tight group-hover:text-red-600 transition-colors">
                      {driver.fullName}
                    </h3>
                  </div>

                  <div className="mt-auto pt-4 border-t border-gray-100 flex justify-between items-center">
                    <div className="space-y-1">
                      {driver.age != null && (
                        <p className="text-sm text-gray-600">Age: {driver.age}</p>
                      )}
                      {driver.height != null && (
                        <p className="text-sm text-gray-600">Height: {driver.height} cm</p>
                      )}
                    </div>
                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center group-hover:bg-black group-hover:text-white transition-colors">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                      </svg>
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
