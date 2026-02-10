import Footer from '@/components/landing/Footer';
import Navbar from '@/components/landing/Navbar';
import React from 'react';

export default function DriverDetailsPage({ params }: { params: { id: string } }) {
  const driverId = params.id; 

  return (
    <>
    <div className="min-h-screen bg-white pt-20 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-5xl font-bold capitalize mb-4">
          {driverId.replace('-', ' ')}
        </h1>
        <p className="text-xl text-gray-600">
          This is the details page for ID: <span className="font-mono bg-gray-100 px-2 py-1 rounded">{driverId}</span>
        </p>
        
        <div className="mt-10 p-6 bg-gray-50 rounded-xl border border-gray-200">
           <h2 className="text-2xl font-bold mb-4">Driver Stats & Bio</h2>
           <p>Content loading...</p>
        </div>
      </div>
    </div>
    </>
  );
}