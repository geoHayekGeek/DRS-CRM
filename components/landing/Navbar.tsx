"use client";
import React, { useState } from 'react';
import Image from 'next/image';

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <nav className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-md border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="h-16 relative flex items-center justify-between md:grid md:grid-cols-3">
          
          <div className="hidden md:flex justify-start space-x-6">
            <NavItem href="/landing/drivers">Drivers</NavItem>
            <NavItem href="/landing/rounds">Rounds</NavItem>
          </div>

         <div className="flex justify-start md:justify-center items-center">
            <a href="/" className="flex items-center">
              <Image 
                src="/DRS-black.png" 
                alt="DRS Logo" 
                width={120} 
                height={40}
                className="object-contain" 
                priority
              />
            </a>
          </div>

          <div className="hidden md:flex justify-end space-x-4 items-center">
            <NavItem href="/landing/race">Race</NavItem>
            <NavItem href="/landing/about">About</NavItem>
          </div>

          <div className="flex md:hidden justify-end">
            <button
              onClick={toggleMenu}
              type="button"
              className="p-2 text-gray-600 rounded-md hover:text-black focus:outline-none"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? (
                <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-16 left-0 w-full bg-white border-b border-gray-100 shadow-lg animate-fade-in-down">
          <div className="px-4 pt-2 pb-6 space-y-2 flex flex-col items-center">
            <MobileNavItem href="#shop">Shop</MobileNavItem>
            <MobileNavItem href="#about">About</MobileNavItem>
            <hr className="w-full border-gray-100 my-2" />
            <MobileNavItem href="#login">Log in</MobileNavItem>
            <button className="w-full px-4 py-3 mt-2 text-sm font-bold text-white bg-black rounded-lg">
              Get Started
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

const NavItem = ({ href, children }: { href: string; children: React.ReactNode }) => (
  <a href={href} className="text-sm font-medium text-gray-600 hover:text-black transition-colors">
    {children}
  </a>
);

const MobileNavItem = ({ href, children }: { href: string; children: React.ReactNode }) => (
  <a href={href} className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-black hover:bg-gray-50 rounded-md w-full text-center">
    {children}
  </a>
);

export default Navbar;