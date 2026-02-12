"use client";
import React from "react";
import Link from "next/link";
import { CHAMPIONSHIP_DATA } from "@/app/lib/data"; 
import { FaChevronRight } from "react-icons/fa";

export default function HubPage() {
  return (
    <div className="container mx-auto px-4 py-12 min-h-screen pb-24">
      <h1 className="text-5xl font-black text-center mb-12 italic uppercase text-gray-900">
        Championship Hub
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {Object.values(CHAMPIONSHIP_DATA).map((season) => (
          <Link 
            // FIX: "championship" (singular) to match your folder
            href={`/landing/championship/${season.id}`} 
            key={season.id} 
            className="group relative h-96 rounded-3xl overflow-hidden block shadow-2xl hover:-translate-y-2 transition-transform duration-300"
          >
            <img src={season.cover} className="w-full h-full object-cover transition duration-700 group-hover:scale-110" />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent p-8 flex flex-col justify-end">
              <h2 className="text-4xl font-black text-white italic">{season.name}</h2>
              <span className="text-red-500 font-bold uppercase tracking-widest flex items-center gap-2 mt-2">
                Enter Hub <FaChevronRight />
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}