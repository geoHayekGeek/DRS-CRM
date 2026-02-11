"use client";

import "@/app/globals.css";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import dynamic from "next/dynamic";

const ThreeBackground = dynamic(
  () => import("@/components/landing/ThreeBackground"),
  { ssr: false }
);

export default function LandingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="landing-page relative min-h-screen selection:bg-red-500 selection:text-white">
      
      <div className="fixed inset-0 w-full h-full -z-50 overflow-hidden pointer-events-none">
        
        <div className="absolute inset-0 bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200" />
        
        <div className="absolute inset-0 z-0 opacity-80">
          <ThreeBackground />
        </div>

        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ff00001a_1px,transparent_1px),linear-gradient(to_bottom,#ff00001a_1px,transparent_1px)] bg-[size:32px_32px]" />
      </div>
      <div className="relative z-10">
        <Navbar />
    
        <main className="flex flex-col min-h-[calc(100vh-64px)] bg-transparent">
          {children}
        </main>
        
        <Footer />
      </div>
      
    </div>
  );
}