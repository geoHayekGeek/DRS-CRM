"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";

// --- STATIC MOCK DATA ---
const CATEGORIES = ["All", "Track Action", "Behind the Scenes", "Podium"];

const MOCK_IMAGES = [
  {
    id: "1",
    title: "Lights Out",
    category: "Track Action",
    // Use a large span for featured images
    gridSpan: "md:col-span-2 md:row-span-2",
    src: "/api/placeholder/800/800",
  },
  {
    id: "2",
    title: "Garage Prep",
    category: "Behind the Scenes",
    gridSpan: "col-span-1 row-span-1",
    src: "/api/placeholder/400/400",
  },
  {
    id: "3",
    title: "Apex Cornering",
    category: "Track Action",
    gridSpan: "col-span-1 row-span-1",
    src: "/api/placeholder/400/400",
  },
  {
    id: "4",
    title: "Trophy Lift",
    category: "Podium",
    gridSpan: "md:col-span-2 row-span-1",
    src: "/api/placeholder/800/400",
  },
  {
    id: "5",
    title: "Debrief",
    category: "Behind the Scenes",
    gridSpan: "col-span-1 row-span-1",
    src: "/api/placeholder/400/400",
  },
  {
    id: "6",
    title: "Checkered Flag",
    category: "Track Action",
    gridSpan: "col-span-1 row-span-1",
    src: "/api/placeholder/400/400",
  },
];

const Gallery = () => {
  const [activeCategory, setActiveCategory] = useState("All");

  // Filter logic
  const filteredImages =
    activeCategory === "All"
      ? MOCK_IMAGES
      : MOCK_IMAGES.filter((img) => img.category === activeCategory);

  return (
    <section className="py-24 bg-white min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* --- HEADER --- */}
        <div className="text-center md:text-left flex flex-col md:flex-row justify-between items-end mb-12 border-b border-gray-100 pb-8 gap-6">
          <div>
            <h1 className="text-5xl md:text-7xl font-black uppercase italic tracking-tighter text-gray-900">
              Media <span className="text-red-600">Vault</span>
            </h1>
            <p className="mt-2 text-gray-500 font-bold uppercase tracking-widest text-sm">
              Exclusive Season Highlights
            </p>
          </div>

          {/* --- FILTER BUTTONS --- */}
          <div className="flex flex-wrap justify-center md:justify-end gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-5 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-300 ${
                  activeCategory === cat
                    ? "bg-red-600 text-white shadow-lg shadow-red-600/30 scale-105"
                    : "bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-900"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* --- GRID GALLERY --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 auto-rows-[250px]">
          {filteredImages.length > 0 ? (
            filteredImages.map((image) => (
              <div
                key={image.id}
                className={`relative group rounded-2xl overflow-hidden bg-gray-100 cursor-pointer ${image.gridSpan}`}
              >
                {/* Image (Using standard img for mock to avoid Next.js domain config errors, replace with Next/Image when using real local assets) */}
                <img
                  src={image.src}
                  alt={image.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />

                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 flex flex-col justify-end p-6">
                  <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                    <span className="inline-block px-3 py-1 bg-red-600 text-white text-[10px] font-bold uppercase tracking-wider rounded-sm mb-2">
                      {image.category}
                    </span>
                    <h3 className="text-2xl font-black italic uppercase text-white">
                      {image.title}
                    </h3>
                  </div>

                  {/* Zoom Icon (Top Right) */}
                  <div className="absolute top-6 right-6 w-10 h-10 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity delay-100">
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"
                      />
                    </svg>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full py-20 flex flex-col items-center justify-center text-gray-400 border-2 border-dashed border-gray-200 rounded-3xl">
              <svg className="w-12 h-12 mb-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="font-medium uppercase tracking-widest text-sm">No media found for this category.</p>
            </div>
          )}
        </div>

        {/* --- LOAD MORE BUTTON (Optional UI) --- */}
        {filteredImages.length > 0 && (
          <div className="mt-12 text-center">
            <Link 
              href="/landing/gallery" 
              className="inline-block px-12 py-4 bg-black text-white font-bold uppercase tracking-widest text-sm rounded-lg hover:bg-red-600 hover:shadow-lg hover:shadow-red-600/30 hover:-translate-y-1 transition-all duration-300"
            >
              Enter Full Vault
            </Link>
          </div>
        )}

      </div>
    </section>
  );
};

export default Gallery;