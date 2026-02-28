"use client";

import React from "react";
import Image from "next/image";
import { FaBolt, FaGlobeAmericas, FaUsers, FaFlagCheckered } from "react-icons/fa";
import Link from "next/link";

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-16 space-y-24 overflow-hidden">
      
      {/* 1. HEADER SECTION with Logo & Brush Stroke */}
      <div className="relative text-center space-y-6 animate-fade-in-up">
        
        {/* Decorative Red Brush Stroke Background */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] -z-10 opacity-20 pointer-events-none">
          <Image 
            src="/img1.png" // The red paint stroke
            alt="Background Effect"
            fill
            className="object-contain"
          />
        </div>

        {/* Main Logo */}
        <div className="relative w-32 h-32 mx-auto mb-8 drop-shadow-xl">
          <Image 
            src="/img2.png" // The Black/Red Logo
            alt="DRS Logo"
            fill
            className="object-contain"
          />
        </div>

        <h1 className="text-6xl md:text-8xl font-black tracking-tighter uppercase italic text-transparent bg-clip-text bg-gradient-to-r from-black via-red-600 to-black drop-shadow-sm">
          We Are DRS
        </h1>
        <p className="max-w-2xl mx-auto text-xl text-gray-600 font-medium uppercase tracking-widest border-l-4 border-red-600 pl-6 text-left bg-white/50 backdrop-blur-sm py-2">
          "Drag Reduction System enabled. We bring you closer to the apex of motorsport."
        </p>
      </div>

      {/* 2. THE MISSION (Glass Card with Karting Image) */}
      <div className="relative group">
        <div className="absolute -inset-1 bg-gradient-to-r from-red-500 to-orange-500 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-500"></div>
        
        <div className="relative bg-white/80 backdrop-blur-xl border border-white/50 rounded-2xl shadow-2xl overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2">
            
            {/* Text Content */}
            <div className="p-10 md:p-16 space-y-8 flex flex-col justify-center">
              <h2 className="text-4xl font-black uppercase italic text-gray-900 leading-none">
                The <span className="text-red-600">Speed</span> of Information
              </h2>
              <div className="space-y-4 text-gray-700 text-lg leading-relaxed">
                <p>
                  DRS isn't just a platform; it's a pit crew for fans. In a sport defined by milliseconds, we believe your connection to the race should be instant.
                </p>
                <p>
                  From real-time telemetry to paddock rumors, we bridge the gap between the grandstand and the garage.
                </p>
              </div>

              {/* Stats Row */}
              <div className="flex gap-6 pt-4">
                 <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-red-100 text-red-600 rounded-full flex items-center justify-center"><FaBolt /></div>
                    <div>
                      <div className="text-2xl font-black italic">0.02s</div>
                      <div className="text-[10px] uppercase font-bold text-gray-500">Latency</div>
                    </div>
                 </div>
                 <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-black text-white rounded-full flex items-center justify-center"><FaUsers /></div>
                    <div>
                      <div className="text-2xl font-black italic">1M+</div>
                      <div className="text-[10px] uppercase font-bold text-gray-500">Fans</div>
                    </div>
                 </div>
              </div>
            </div>

            {/* Image Side (Karting Photo) */}
            <div className="relative h-96 md:h-auto min-h-[400px]">
              <Image 
                src="/img3.png" // The Karting Image
                alt="Kart Racing Action"
                fill
                className="object-cover md:rounded-r-2xl"
              />
              {/* Overlay Gradient */}
              <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-l from-black/60 to-transparent flex items-end justify-end p-8">
                <div className="text-white text-right">
                   <div className="text-sm font-bold uppercase tracking-widest opacity-80">Born on the Track</div>
                   <div className="text-3xl font-black italic">Est. 2026</div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* 3. CORE VALUES (Grid) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
        {/* Decorative Element Behind Cards */}
        <div className="absolute -right-20 -top-20 w-64 h-64 opacity-10 -z-10 rotate-12">
           <Image src="/img4.png" alt="Detail" fill className="object-contain" />
        </div>

        <ValueCard 
          icon={<FaFlagCheckered />} 
          title="Pure Racing" 
          desc="No filler. Just pure, unadulterated motorsport content tailored for the petrolhead." 
        />
        <ValueCard 
          icon={<FaGlobeAmericas />} 
          title="Global Access" 
          desc="From Silverstone to Suzuka, we cover every corner of the calendar with local insight." 
        />
        <ValueCard 
          icon={<FaBolt />} 
          title="Innovation" 
          desc="Pushing the limits of web technology to bring you a 3D immersive experience." 
        />
      </div>

      {/* 4. FOOTER CTA */}
      <div className="relative py-20 rounded-3xl overflow-hidden text-center group">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 z-0">
           <Image 
             src="/img3.png" 
             alt="Racing Background" 
             fill 
             className="object-cover opacity-20 grayscale group-hover:grayscale-0 group-hover:opacity-40 transition-all duration-700 transform group-hover:scale-105"
           />
           <div className="absolute inset-0 bg-gradient-to-t from-white via-white/80 to-transparent"></div>
        </div>

        <div className="relative z-10">
          <h3 className="text-4xl md:text-5xl font-black uppercase italic mb-8 text-gray-900">
            Ready to hit the track?
          </h3>
          <Link href="/contact">
            <button className="relative px-12 py-5 bg-black text-white font-bold uppercase tracking-wider rounded-lg overflow-hidden group hover:scale-105 transition-transform duration-300 shadow-2xl hover:shadow-red-600/50">
              <span className="relative z-10">Join the Grid</span>
              <div className="absolute inset-0 bg-red-600 transform -skew-x-12 -translate-x-full group-hover:translate-x-0 transition-transform duration-300 origin-left"></div>
            </button>
          </Link>
        </div>
      </div>

    </div>
  );
}

const ValueCard = ({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) => (
  <div className="p-8 rounded-xl bg-white/60 backdrop-blur-md border border-white/60 hover:bg-white transition-all duration-300 hover:-translate-y-2 hover:shadow-xl group">
    <div className="text-4xl text-gray-400 group-hover:text-red-600 transition-colors mb-4 transform group-hover:scale-110 duration-300 origin-left">
      {icon}
    </div>
    <h3 className="text-xl font-black uppercase italic mb-2 text-gray-900">{title}</h3>
    <p className="text-gray-600 text-sm leading-relaxed">{desc}</p>
  </div>
);