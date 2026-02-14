import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white/90 backdrop-blur-md border-t border-gray-100 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 md:gap-0">
          
          {/* Logo */}
          <Link href="/landing" className="flex-shrink-0">
            <Image 
              src="/DRS-black.png"       
              alt="Brand Logo" 
              width={120}            
              height={40}  
              style={{ width: 'auto', height: 'auto' }}          
              className="h-8 w-auto object-contain hover:opacity-80 transition-opacity" 
            />
          </Link>

          {/* Navigation */}
          <nav className="flex flex-wrap justify-center gap-8">
            <FooterLink href="/drivers">Drivers</FooterLink>
            <FooterLink href="/championships">Championship</FooterLink>
            <FooterLink href="/landing/about">About</FooterLink>
            <FooterLink href="/landing/contact">Contact</FooterLink>
          </nav>

          {/* Social Icons */}
          <div className="flex space-x-5">
            <SocialIcon platform="instagram" href="https://www.instagram.com/drslanelb" />
            <SocialIcon platform="tiktok" href="https://www.tiktok.com/@drslanelb" />
            <SocialIcon platform="youtube" href="https://youtube.com/@drslanelb" />
          </div>
        </div>

        <div className="w-full h-px bg-gray-100 my-6"></div>

        {/* Copyright Section */}
        <div className="flex flex-col md:flex-row justify-between items-center text-xs text-gray-400">
          <p>
            &copy; {currentYear} <Link href="https://ctrly.agency" target="_blank" className="text-yellow-500 hover:text-yellow-600 font-bold transition-colors">CTRLY Agency</Link>. All rights reserved.
          </p>
          <div className="flex space-x-6 mt-2 md:mt-0">
            <Link href="#" className="hover:text-gray-900 transition">Privacy Policy</Link>
            <Link href="#" className="hover:text-gray-900 transition">Terms</Link>
          </div>
        </div>

      </div>
    </footer>
  );
};

// Helper for Footer Links
const FooterLink = ({ href, children }: { href: string, children: React.ReactNode }) => (
  <Link 
    href={href} 
    className="text-sm font-medium text-gray-500 hover:text-red-600 transition-colors uppercase tracking-wider"
  >
    {children}
  </Link>
);

// Social Icon Component with Fixed Paths
const SocialIcon = ({ platform, href }: { platform: 'whatsapp' | 'instagram' | 'tiktok' | 'youtube', href?: string }) => {
  const iconPaths = {
    // Verified standard paths
    whatsapp: "M13.601 2.326A7.854 7.854 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.9 7.9 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.898 7.898 0 0 0 13.6 2.326zM7.994 14.521a6.573 6.573 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.557 6.557 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592z",
    
    instagram: "M7.8,2H16.2C19.4,2 22,4.6 22,7.8V16.2A5.8,5.8 0 0,1 16.2,22H7.8C4.6,22 2,19.4 2,16.2V7.8A5.8,5.8 0 0,1 7.8,2M7.6,4A3.6,3.6 0 0,0 4,7.6V16.4C4,18.39 5.61,20 7.6,20H16.4A3.6,3.6 0 0,0 20,16.4V7.6C20,5.61 18.39,4 16.4,4H7.6M17.25,5.5A1.25,1.25 0 0,1 18.5,6.75A1.25,1.25 0 0,1 17.25,8A1.25,1.25 0 0,1 16,6.75A1.25,1.25 0 0,1 17.25,5.5M12,7A5,5 0 0,1 17,12A5,5 0 0,1 12,17A5,5 0 0,1 7,12A5,5 0 0,1 12,7M12,9A3,3 0 0,0 9,12A3,3 0 0,0 12,15A3,3 0 0,0 15,12A3,3 0 0,0 12,9Z",
    
    tiktok: "M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.35-1.17.82-1.5 1.56-.46 1.18-.32 2.61.54 3.65.75.92 2 1.54 3.21 1.54 1.48.06 2.99-1.01 3.26-2.5.07-2.14.04-4.28.04-6.42.01-4.04-.01-8.08.02-12.12-.02-.21-.03-.42-.03-.63z",
    
    youtube: "M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"
  };

  return (
    <a 
      href={href || "#"} 
      target="_blank"
      rel="noopener noreferrer"
      className="text-gray-400 hover:text-red-600 transition transform hover:scale-110 block" 
      aria-label={platform}
    >
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
        <path d={iconPaths[platform]} />
      </svg>
    </a>
  );
};

export default Footer;