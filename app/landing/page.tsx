import Championship from '@/components/landing/Championship';
import DriversSpotlight from '@/components/landing/DriversSpotlight';
import Footer from '@/components/landing/Footer';
import Hero from '@/components/landing/Hero';
import Navbar from '@/components/landing/Navbar';
import React from 'react';


const LandingPage = () => {
  return (
    <div className="min-h-screen flex flex-col bg-white">

      
      <main className="flex-grow">
        
        <section id="hero">
           <Hero />
        </section>

        <section id="driversspotlight">
           <DriversSpotlight />
        </section>

        <section id="championship">
           <Championship />
        </section>

      </main>

    </div>
  );
};

export default LandingPage;