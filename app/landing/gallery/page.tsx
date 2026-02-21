"use client";

import React, { useState } from "react";
import Link from "next/link";
import { FaArrowLeft } from "react-icons/fa";

// --- EXTENDED MOCK DATA FOR FULL PAGE ---
const CATEGORIES = ["All", "Track Action", "Behind the Scenes", "Podium", "Fans"];

const FULL_MOCK_IMAGES = [
  { id: "1", title: "Lights Out", category: "Track Action", gridSpan: "md:col-span-2 md:row-span-2", src: "/api/placeholder/800/800" },
  { id: "2", title: "Garage Prep", category: "Behind the Scenes", gridSpan: "col-span-1 row-span-1", src: "/api/placeholder/400/400" },
  { id: "3", title: "Apex Cornering", category: "Track Action", gridSpan: "col-span-1 row-span-1", src: "/api/placeholder/400/400" },
  { id: "4", title: "Trophy Lift", category: "Podium", gridSpan: "md:col-span-2 row-span-1", src: "/api/placeholder/800/400" },
  { id: "5", title: "Debrief", category: "Behind the Scenes", gridSpan: "col-span-1 row-span-1", src: "/api/placeholder/400/400" },
  { id: "6", title: "Checkered Flag", category: "Track Action", gridSpan: "col-span-1 row-span-1", src: "/api/placeholder/400/400" },
  { id: "7", title: "Grandstand Roar", category: "Fans", gridSpan: "md:col-span-2 row-span-1", src: "/api/placeholder/800/400" },
  { id: "8", title: "Pit Stop Magic", category: "Track Action", gridSpan: "col-span-1 row-span-1", src: "/api/placeholder/400/400" },
  { id: "9", title: "Champagne Shower", category: "Podium", gridSpan: "md:col-span-2 md:row-span-2", src: "/api/placeholder/800/800" },
  { id: "10", title: "Telemetry Check", category: "Behind the Scenes", gridSpan: "col-span-1 row-span-1", src: "/api/placeholder/400/400" },
];

export default function FullGalleryPage() {
  const [activeCategory, setActiveCategory] = useState("All");

  const filteredImages =
    activeCategory === "All"
      ? FULL_MOCK_IMAGES
      : FULL_MOCK_IMAGES.filter((img) => img.category === activeCategory);

  return (
    <div className="min-h-screen bg-white pb-24">
      
      {/* --- HEADER --- */}
      <div className="bg-gray-900 text-white pt-12 pb-20 px-4">
        <div className="max-w-7xl mx-auto space-y-8">
          
          <Link href="/landing" className="inline-flex items-center gap-2 text-gray-400 font-bold uppercase tracking-widest text-xs hover:text-white transition-colors">
            <FaArrowLeft /> Back to Home
          </Link>

          <div className="text-center md:text-left">
            <h1 className="text-5xl md:text-8xl font-black uppercase italic tracking-tighter">
              The Full <span className="text-red-600">Vault</span>
            </h1>
            <p className="mt-4 text-gray-400 font-bold uppercase tracking-widest text-sm max-w-2xl">
              Immerse yourself in the complete collection of high-octane moments, from the garage to the checkered flag.
            </p>
          </div>
        </div>
      </div>

      {/* --- GALLERY SECTION --- */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-10">
        
        {/* --- FILTER BUTTONS --- */}
        <div className="bg-white p-4 rounded-2xl shadow-xl flex flex-wrap justify-center md:justify-start gap-2 mb-12 border border-gray-100">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-300 ${
                activeCategory === cat
                  ? "bg-red-600 text-white shadow-lg shadow-red-600/30 scale-105"
                  : "bg-gray-50 text-gray-600 hover:bg-gray-100 hover:text-gray-900"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* --- GRID --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 auto-rows-[250px]">
          {filteredImages.length > 0 ? (
            filteredImages.map((image) => (
              <div
                key={image.id}
                className={`relative group rounded-2xl overflow-hidden bg-gray-100 cursor-pointer shadow-sm hover:shadow-2xl transition-all duration-300 ${image.gridSpan}`}
              >
                <img
                  src={image.src}
                  alt={image.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 flex flex-col justify-end p-6">
                  <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                    <span className="inline-block px-3 py-1 bg-red-600 text-white text-[10px] font-bold uppercase tracking-wider rounded-sm mb-2 shadow-sm">
                      {image.category}
                    </span>
                    <h3 className="text-2xl font-black italic uppercase text-white drop-shadow-lg">
                      {image.title}
                    </h3>
                  </div>

                  {/* Zoom Icon */}
                  <div className="absolute top-6 right-6 w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity delay-100">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                    </svg>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full py-32 flex flex-col items-center justify-center text-gray-400 border-2 border-dashed border-gray-200 rounded-3xl bg-gray-50">
              <svg className="w-16 h-16 mb-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="font-bold uppercase tracking-widest text-sm text-gray-500">No media found for this category.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}