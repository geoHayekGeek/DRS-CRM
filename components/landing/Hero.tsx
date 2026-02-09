import React from 'react';

const Hero = () => {
  return (
    <section className="relative pt-12 pb-20 lg:pt-24 lg:pb-32 overflow-hidden bg-white">
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-[600px] h-[600px] bg-red-50 rounded-full blur-3xl opacity-50 pointer-events-none"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          
          <div className="max-w-2xl mx-auto lg:mx-0 text-center lg:text-left">
            
            <div className="inline-flex items-center px-3 py-1 mb-6 text-xs font-bold tracking-widest text-red-600 uppercase bg-red-50 rounded-full border border-red-100">
              <span className="w-2 h-2 mr-2 bg-red-600 rounded-full animate-pulse"></span>
              Live: Monza GP Weekend
            </div>

            <h1 className="text-4xl font-black tracking-tighter text-gray-900 sm:text-6xl mb-6 italic">
              WHERE THE <br className="hidden lg:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-orange-600">
                GRID COMES ALIVE.
              </span>
            </h1>

            <p className="text-lg text-gray-600 mb-8 leading-relaxed">
              The ultimate hub for racing fanatics. Join <strong>50,000+</strong> fans discussing live timings, transfer rumors, and technical analysis. Don't just watch the race be part of the paddock.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <button className="px-8 py-4 text-base font-bold text-white bg-red-600 rounded-lg hover:bg-red-700 transition transform hover:-translate-y-0.5 shadow-lg hover:shadow-red-200">
                Join the Community
              </button>
              <button className="px-8 py-4 text-base font-bold text-gray-900 bg-gray-100 rounded-lg hover:bg-gray-200 transition border border-transparent hover:border-gray-300">
                View Latest News
              </button>
            </div>

            <div className="mt-10 flex items-center justify-center lg:justify-start gap-4">
              <div className="flex -space-x-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="w-10 h-10 rounded-full border-2 border-white bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-500 relative z-10">
                   <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
                  </div>
                ))}
              </div>
              <div className="text-sm">
                <p className="font-bold text-gray-900">120+ Fans Online</p>
                <p className="text-gray-500">Debating sector times right now</p>
              </div>
            </div>
          </div>

          <div className="relative mx-auto lg:ml-auto w-full max-w-lg lg:max-w-none">
            
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-tr from-red-200 to-orange-100 rounded-full blur-3xl opacity-40 animate-pulse"></div>

            <div className="relative rounded-2xl bg-white border border-gray-200 shadow-2xl overflow-hidden p-6 transform rotate-[-2deg] hover:rotate-0 transition duration-500 ease-out">
              
              <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-4">
                <div className="flex items-center gap-3">
                   <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse"></div>
                   <span className="font-bold text-gray-900 tracking-tight">MONZA GP</span>
                </div>
                <span className="text-xs font-mono text-gray-500 bg-gray-100 px-2 py-1 rounded">LAP 45/53</span>
              </div>
              
              <div className="space-y-3 mb-6 font-mono text-sm">
                <div className="flex items-center justify-between p-3 bg-blue-50 border-l-4 border-blue-600 rounded-r-lg">
                   <div className="flex items-center gap-3">
                      <span className="font-bold text-gray-900">1. VER</span>
                      <span className="text-xs text-gray-500">Red Bull</span>
                   </div>
                   <span className="font-bold text-green-600">-1.204s</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-white border border-gray-100 border-l-4 border-l-gray-800 rounded-r-lg shadow-sm">
                   <div className="flex items-center gap-3">
                      <span className="font-bold text-gray-900">2. NOR</span>
                      <span className="text-xs text-gray-500">McLaren</span>
                   </div>
                   <span className="font-bold text-orange-500">+0.432s</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-white border border-gray-100 border-l-4 border-l-red-600 rounded-r-lg">
                   <div className="flex items-center gap-3">
                      <span className="font-bold text-gray-900">3. LEC</span>
                      <span className="text-xs text-gray-500">Ferrari</span>
                   </div>
                   <span className="font-bold text-gray-400">+4.100s</span>
                </div>
              </div>

              <div className="bg-gray-900 rounded-xl p-4 text-white">
                <div className="flex items-center gap-2 mb-2">
                   <div className="w-2 h-2 rounded-full bg-red-500"></div>
                   <span className="text-xs font-bold uppercase text-gray-400">Live Chat</span>
                </div>
                <div className="space-y-2">
                  <div className="flex gap-2 items-center">
                     <div className="w-5 h-5 rounded-full bg-blue-500"></div>
                     <div className="h-2 w-32 bg-gray-700 rounded"></div>
                  </div>
                  <div className="flex gap-2 items-center">
                     <div className="w-5 h-5 rounded-full bg-green-500"></div>
                     <div className="h-2 w-48 bg-gray-700 rounded"></div>
                  </div>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default Hero;