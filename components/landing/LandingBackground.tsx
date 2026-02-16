"use client";

import dynamic from "next/dynamic";

const ThreeBackground = dynamic(
  () => import("@/components/landing/ThreeBackground"),
  { ssr: false }
);

export default function LandingBackground() {
  return (
    <div className="absolute inset-0 z-0 opacity-80">
      <ThreeBackground />
    </div>
  );
}
