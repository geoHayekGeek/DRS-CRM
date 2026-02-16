"use client";
import React, { useState } from 'react';
import Image from 'next/image';

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <nav className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-md border-b border-gray-200/50 supports-[backdrop-filter]:bg-white/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="h-16 flex items-center justify-between">
          
          {/* Logo Section - Aligned Left */}
          <div className="flex-shrink-0 flex items-center">
            <a href="/landing" className="flex items-center group">
              <Image 
                src="/DRS-black.png" 
                alt="DRS Logo" 
                width={120} 
                height={40}
                className="object-contain transition-transform duration-300 group-hover:scale-105" 
                priority
              />
            </a>
          </div>

          <div className="hidden md:flex items-center space-x-8">
            <NavItem href="/landing">Home</NavItem>
            <NavItem href="/drivers">Drivers</NavItem>
            <NavItem href="/championships">Championship</NavItem>
            <NavItem href="/landing/about">About</NavItem>
            <NavItem href="/landing/gallery">Gallery</NavItem>
            <NavItem href="/landing/contact">Contact</NavItem>
          </div>

          <div className="flex md:hidden">
            <button
              onClick={toggleMenu}
              type="button"
              className="group relative z-50 w-10 h-10 flex flex-col justify-center items-center focus:outline-none"
              aria-label="Toggle menu"
            >
              <span 
                className={`h-0.5 w-6 bg-gray-800 rounded-full transition-all duration-300 ease-out 
                ${isMobileMenuOpen ? 'rotate-45 translate-y-1.5' : '-translate-y-1'}`} 
              />
              <span 
                className={`h-0.5 bg-gray-800 rounded-full transition-all duration-300 ease-out my-0.5
                ${isMobileMenuOpen ? 'w-0 opacity-0' : 'w-6 opacity-100'}`} 
              />
              <span 
                className={`h-0.5 w-6 bg-gray-800 rounded-full transition-all duration-300 ease-out 
                ${isMobileMenuOpen ? '-rotate-45 -translate-y-1.5' : 'translate-y-1'}`} 
              />
            </button>
          </div>
        </div>
      </div>

      <div 
        className={`md:hidden absolute top-16 left-0 w-full overflow-hidden transition-all duration-300 ease-in-out origin-top
        ${isMobileMenuOpen ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'}`}
      >
        <div className="bg-white/90 backdrop-blur-xl border-b border-gray-200 shadow-2xl p-6 flex flex-col items-center space-y-6">
          <MobileNavItem href="/landing" delay="0ms">Home</MobileNavItem>
          <MobileNavItem href="/drivers" delay="100ms">Drivers</MobileNavItem>
          <MobileNavItem href="/championships" delay="200ms">Championship</MobileNavItem>
          <MobileNavItem href="/landing/about" delay="300ms">About</MobileNavItem>
          <MobileNavItem href="/landing/gallery" delay="350ms">Gallery</MobileNavItem>
          <MobileNavItem href="/landing/contact" delay="400ms">Contact</MobileNavItem>
        </div>
      </div>
    </nav>
  );
};

const NavItem = ({ href, children }: { href: string; children: React.ReactNode }) => (
  <a href={href} className="text-sm font-medium text-gray-500 hover:text-black hover:tracking-wide transition-all duration-300">
    {children}
  </a>
);

const MobileNavItem = ({ href, children, delay }: { href: string; children: React.ReactNode; delay?: string }) => (
  <a 
    href={href} 
    style={{ transitionDelay: delay }}
    className="block text-lg font-medium text-gray-600 hover:text-black hover:scale-110 transition-all duration-300"
  >
    {children}
  </a>
);

export default Navbar;