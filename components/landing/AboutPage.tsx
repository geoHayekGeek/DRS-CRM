"use client";

import React from "react";
import { FaBolt, FaGlobeAmericas, FaUsers, FaFlagCheckered } from "react-icons/fa";

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-16 space-y-20">
      
      <div className="text-center space-y-6 animate-fade-in-up">
        <h1 className="text-6xl md:text-8xl font-black tracking-tighter uppercase italic text-transparent bg-clip-text bg-gradient-to-r from-black via-red-600 to-black drop-shadow-sm">
          We Are DRS
        </h1>
        <p className="max-w-2xl mx-auto text-xl text-gray-600 font-medium uppercase tracking-widest border-l-4 border-red-600 pl-6 text-left">
          "Drag Reduction System enabled. We bring you closer to the apex of motorsport."
        </p>
      </div>

      <div className="relative group">
        <div className="absolute -inset-1 bg-gradient-to-r from-red-500 to-orange-500 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-500"></div>
        
        <div className="relative bg-white/70 backdrop-blur-xl border border-white/50 p-10 md:p-16 rounded-2xl shadow-2xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h2 className="text-4xl font-black uppercase italic text-gray-900">
                The <span className="text-red-600">Speed</span> of Information
              </h2>
              <p className="text-gray-700 text-lg leading-relaxed">
                DRS isn't just a platform; it's a pit crew for fans. In a sport defined by milliseconds, we believe your connection to the race should be instant.
              </p>
              <p className="text-gray-700 text-lg leading-relaxed">
                From real-time telemetry to paddock rumors, we bridge the gap between the grandstand and the garage.
              </p>
            </div>
            
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-4 p-4 bg-white/50 rounded-xl border border-red-100">
                <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center text-white text-xl">
                  <FaBolt />
                </div>
                <div>
                  <div className="text-3xl font-black italic">0.02s</div>
                  <div className="text-xs uppercase font-bold text-gray-500">Latency</div>
                </div>
              </div>
              <div className="flex items-center gap-4 p-4 bg-white/50 rounded-xl border border-red-100 ml-8">
                <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center text-white text-xl">
                  <FaUsers />
                </div>
                <div>
                  <div className="text-3xl font-black italic">1M+</div>
                  <div className="text-xs uppercase font-bold text-gray-500">Community</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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

      <div className="text-center py-10">
        <h3 className="text-3xl font-black uppercase italic mb-6 text-gray-800">
          Ready to hit the track?
        </h3>
        <button className="relative px-10 py-4 bg-black text-white font-bold uppercase tracking-wider rounded-lg overflow-hidden group hover:scale-105 transition-transform duration-300 shadow-xl hover:shadow-red-600/50">
          <span className="relative z-10">Join the Grid</span>
          <div className="absolute inset-0 bg-red-600 transform -skew-x-12 -translate-x-full group-hover:translate-x-0 transition-transform duration-300 origin-left"></div>
        </button>
      </div>

    </div>
  );
}

const ValueCard = ({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) => (
  <div className="p-8 rounded-xl bg-white/40 backdrop-blur-md border border-white/60 hover:bg-white/80 transition-all duration-300 hover:-translate-y-2 hover:shadow-lg group">
    <div className="text-4xl text-gray-400 group-hover:text-red-600 transition-colors mb-4">
      {icon}
    </div>
    <h3 className="text-xl font-black uppercase italic mb-2 text-gray-900">{title}</h3>
    <p className="text-gray-600 text-sm leading-relaxed">{desc}</p>
  </div>
);