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
        <div className="h-16 relative flex items-center justify-between md:grid md:grid-cols-3">
          
          <div className="hidden md:flex justify-start space-x-8">
            <NavItem href="/landing/drivers">Drivers</NavItem>
            <NavItem href="/landing/rounds">Rounds</NavItem>
          </div>

          <div className="flex justify-start md:justify-center items-center">
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

          <div className="hidden md:flex justify-end space-x-8 items-center">
            <NavItem href="/landing/race">Race</NavItem>
            <NavItem href="/landing/about">About</NavItem>
          </div>

          <div className="flex md:hidden justify-end">
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
        <div className="bg-white/90 backdrop-blur-xl border-b border-gray-200 shadow-2xl p-6 flex flex-col items-center space-y-4">
          <MobileNavItem href="/landing/drivers" delay="100ms">Drivers</MobileNavItem>
          <MobileNavItem href="/landing/rounds" delay="200ms">Rounds</MobileNavItem>
          {/* <div className="w-12 h-0.5 bg-gray-200 rounded-full my-2"></div>           */}
          <MobileNavItem href="/landing/race" delay="200ms">Race</MobileNavItem>
          <MobileNavItem href="/landing/about" delay="200ms">About</MobileNavItem>
          <button className="w-full max-w-xs px-6 py-3 mt-4 text-sm font-bold tracking-wider uppercase text-white bg-black rounded-lg shadow-lg hover:shadow-gray-400/50 hover:scale-[1.02] transition-all duration-300">
            Get Started
          </button>
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