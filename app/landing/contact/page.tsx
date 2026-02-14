"use client";

import React from "react";
import Link from "next/link";
import { FaMapMarkerAlt, FaEnvelope, FaPhone, FaInstagram, FaYoutube, FaTiktok } from "react-icons/fa";

export default function ContactPage() {
  return (
    <div className="container mx-auto px-4 py-16 space-y-16">
      
      {/* 1. HEADER */}
      <div className="text-center space-y-4 animate-fade-in-up">
        <h1 className="text-5xl md:text-7xl font-black tracking-tighter uppercase italic text-transparent bg-clip-text bg-gradient-to-r from-black to-red-600 drop-shadow-sm">
          Race Control
        </h1>
        <p className="text-gray-500 font-bold uppercase tracking-widest text-sm md:text-base">
          Get in touch with the team
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
        
        {/* 2. CONTACT FORM */}
        <div className="bg-white p-8 md:p-10 rounded-3xl shadow-2xl border border-gray-100 animate-slide-in-left">
          <h2 className="text-3xl font-black uppercase italic mb-8 text-gray-900">
            Send a <span className="text-red-600">Message</span>
          </h2>
          
          <form className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-gray-500">First Name</label>
                <input 
                  type="text" 
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 transition-all font-medium"
                  placeholder="Your Name"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Last Name</label>
                <input 
                  type="text" 
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 transition-all font-medium"
                  placeholder="Surname"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Email Address</label>
              <input 
                type="email" 
                className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 transition-all font-medium"
                placeholder="you@email.com"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Subject</label>
              <select className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 transition-all font-medium appearance-none">
                <option>General Inquiry</option>
                <option>Join the Championship</option>
                <option>Sponsorship</option>
                <option>Media/Press</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Message</label>
              <textarea 
                rows={4}
                className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 transition-all font-medium resize-none"
                placeholder="Type your message here..."
              ></textarea>
            </div>

            <button className="w-full relative px-8 py-4 bg-black text-white font-bold uppercase tracking-wider rounded-lg overflow-hidden group hover:scale-[1.02] transition-transform duration-300 shadow-xl hover:shadow-red-600/30">
              <span className="relative z-10">Transmit Data</span>
              <div className="absolute inset-0 bg-red-600 transform -skew-x-12 -translate-x-full group-hover:translate-x-0 transition-transform duration-300 origin-left"></div>
            </button>
          </form>
        </div>

        {/* 3. INFO & SOCIALS */}
        <div className="space-y-8 animate-slide-in-right">
          
          {/* Info Cards */}
          <div className="grid grid-cols-1 gap-6">
            <InfoCard 
              icon={<FaMapMarkerAlt />} 
              title="Location" 
              line1="Beirut, Lebanon" 
              line2="Middle East HQ" 
            />
            <InfoCard 
              icon={<FaPhone />} 
              title="Call / WhatsApp" 
              line1="+961 71 996 908" 
              line2="Available Mon-Sat" 
            />
            <InfoCard 
              icon={<FaEnvelope />} 
              title="Email Us" 
              line1="info@drslanelb.com" // Placeholder based on handle
              line2="support@drslanelb.com" 
            />
          </div>

          {/* Socials Card */}
          <div className="bg-black text-white p-8 rounded-3xl shadow-xl relative overflow-hidden group">
            {/* Background Glow */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-red-600 blur-[80px] opacity-20 group-hover:opacity-40 transition-opacity"></div>
            
            <h3 className="text-xl font-black uppercase italic mb-6">Follow the Action</h3>
            <div className="flex gap-4">
              <SocialBtn 
                href="https://www.instagram.com/drslanelb" 
                icon={<FaInstagram />} 
                label="Instagram"
              />
              <SocialBtn 
                href="https://www.tiktok.com/@drslanelb" 
                icon={<FaTiktok />} 
                label="TikTok"
              />
              <SocialBtn 
                href="https://youtube.com/@drslanelb" 
                icon={<FaYoutube />} 
                label="YouTube"
              />
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}

// --- SUB COMPONENTS ---

const InfoCard = ({ icon, title, line1, line2 }: { icon: React.ReactNode, title: string, line1: string, line2: string }) => (
  <div className="flex items-start gap-4 p-6 bg-white rounded-2xl border border-gray-100 hover:border-red-200 hover:shadow-lg transition-all duration-300 group">
    <div className="w-12 h-12 bg-gray-50 text-gray-400 rounded-full flex items-center justify-center text-xl group-hover:bg-red-600 group-hover:text-white transition-colors duration-300 shrink-0">
      {icon}
    </div>
    <div>
      <h3 className="text-lg font-bold uppercase italic text-gray-900 mb-1">{title}</h3>
      <p className="text-gray-600 text-sm font-medium">{line1}</p>
      <p className="text-gray-400 text-xs font-medium uppercase tracking-wide mt-1">{line2}</p>
    </div>
  </div>
);

const SocialBtn = ({ icon, href, label }: { icon: React.ReactNode, href: string, label: string }) => (
  <Link 
    href={href} 
    target="_blank" 
    rel="noopener noreferrer"
    className="w-14 h-14 rounded-xl bg-gray-800 flex items-center justify-center text-gray-400 text-2xl hover:bg-white hover:text-black transition-all duration-300 hover:scale-110 hover:shadow-[0_0_20px_rgba(255,255,255,0.3)]"
    aria-label={label}
  >
    {icon}
  </Link>
);