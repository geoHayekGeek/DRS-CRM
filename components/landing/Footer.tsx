import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white border-t border-gray-200 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          
          <div className="space-y-4">
            <Link href="/" className="inline-block">
              <Image 
                src="/DRS-black.png"       
                alt="Brand Logo" 
                width={160}            
                height={50}            
                className="h-10 w-auto object-contain" 
              />
            </Link>
            <p className="text-gray-500 text-sm leading-relaxed max-w-xs">
              Fueling the passion for racing. The ultimate community for fans, stats, and speed.
            </p>
            
            <div className="flex space-x-4 pt-2">
              <SocialIcon platform="whatsapp" />
              <SocialIcon platform="instagram" />
              <SocialIcon platform="tiktok" />
              <SocialIcon platform="youtube" />
            </div>
          </div>

          <div>
            <h3 className="font-bold text-gray-900 mb-4 uppercase tracking-wider text-xs">Menu</h3>
            <ul className="space-y-3 text-sm text-gray-600">
              <li>
                <Link href="/landing/drivers" className="hover:text-red-600 transition font-medium">
                  Drivers
                </Link>
              </li>
              <li>
                <Link href="/landing/rounds" className="hover:text-red-600 transition font-medium">
                  Rounds
                </Link>
              </li>
              <li>
                <Link href="/landing/race" className="hover:text-red-600 transition font-medium">
                  Race
                </Link>
              </li>
              <li>
                <Link href="/landing/about" className="hover:text-red-600 transition font-medium">
                  About
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-gray-900 mb-4 uppercase tracking-wider text-xs">Support</h3>
            <ul className="space-y-3 text-sm text-gray-600">
              <li><Link href="#" className="hover:text-red-600 transition">Contact Us</Link></li>
              <li><Link href="#" className="hover:text-red-600 transition">Privacy Policy</Link></li>
              <li><Link href="#" className="hover:text-red-600 transition">Terms of Service</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-gray-900 mb-4 uppercase tracking-wider text-xs">Race Updates</h3>
            <p className="text-gray-500 text-sm mb-4">
              Get the latest qualifying results sent to your inbox.
            </p>
            <form className="flex flex-col space-y-2">
              <input 
                type="email" 
                placeholder="Enter your email" 
                className="w-full px-4 py-2 text-sm text-gray-700 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent transition"
              />
              <button 
                type="button"
                className="w-full px-4 py-2 text-sm font-bold text-white bg-red-600 rounded-lg hover:bg-red-700 transition shadow-lg hover:shadow-red-200"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>

        <div className="border-t border-gray-100 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-gray-400 text-center md:text-left">
            &copy; {currentYear} DRS Lane Inc. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};


const SocialIcon = ({ platform }: { platform: 'whatsapp' | 'instagram' | 'tiktok' | 'youtube' }) => {
  const iconPaths = {
    whatsapp: "M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487 2.982 1.288 2.982.858 3.526.802.544-.056 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z",
    instagram: "M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.44",
    tiktok: "M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.35-1.17.82-1.5 1.56-.46 1.18-.32 2.61.54 3.65.75.92 2 1.54 3.21 1.54 1.48.06 2.99-1.01 3.26-2.5.07-2.14.04-4.28.04-6.42.01-4.04-.01-8.08.02-12.12-.02-.21-.03-.42-.03-.63z",
    youtube: "M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"
  };

  return (
    <a 
      href="#" 
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