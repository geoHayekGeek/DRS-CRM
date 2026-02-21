import AboutPage from '@/components/landing/AboutPage';
import Gallery from '@/components/landing/Gallery';
import React from 'react';

export default function About() {
  return (
   <div className="min-h-screen flex flex-col bg-white">

      
      <main className="flex-grow">
        
        <section>
           <AboutPage/>
        </section>

        <section id="gallery">
          <Gallery />
        </section>

      </main>

    </div>
  );
}