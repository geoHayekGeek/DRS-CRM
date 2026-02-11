import React from 'react';
import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';
import AllDrivers from '@/components/landing/AllDrivers';

export default function DriversPage() {
  return (
   <div className="min-h-screen flex flex-col bg-white">

      
      <main className="flex-grow">
        
        <section id="drivers">
           <AllDrivers />
        </section>

      </main>

    </div>
  );
}