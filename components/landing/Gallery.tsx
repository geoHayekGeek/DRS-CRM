"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";

type MediaVaultImage = {
  id: string;
  imageUrl: string;
  roundId: string;
  roundName: string;
  championshipName: string;
  createdAt: string;
};

type MediaVaultYear = {
  year: number;
  championshipId: string;
  championshipName: string;
  images: MediaVaultImage[];
};

export default function Gallery() {
  const [data, setData] = useState<MediaVaultYear[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeYear, setActiveYear] = useState<number | null>(null);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [lightboxYear, setLightboxYear] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/public/media-vault")
      .then((res) => res.json())
      .then((list: MediaVaultYear[]) => {
        if (!cancelled && Array.isArray(list)) {
          setData(list);
          if (list.length > 0 && activeYear === null) {
            setActiveYear(list[0].year);
          }
        }
      })
      .catch(() => {
        if (!cancelled) setData([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (data.length > 0 && activeYear === null) setActiveYear(data[0].year);
  }, [data, activeYear]);

  const activeData = data.find((d) => d.year === activeYear);
  const images = activeData?.images ?? [];
  const currentYearIndex = data.findIndex((d) => d.year === activeYear);

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    setLightboxYear(activeYear);
  };

  const closeLightbox = () => {
    setLightboxIndex(null);
    setLightboxYear(null);
  };

  const goPrev = useCallback(() => {
    if (lightboxIndex === null || lightboxYear === null) return;
    const yearData = data.find((d) => d.year === lightboxYear);
    if (!yearData) return;
    if (lightboxIndex > 0) {
      setLightboxIndex(lightboxIndex - 1);
    } else {
      const prevYearIdx = data.findIndex((d) => d.year === lightboxYear) + 1;
      if (prevYearIdx < data.length) {
        const prevYear = data[prevYearIdx];
        setLightboxYear(prevYear.year);
        setLightboxIndex(prevYear.images.length - 1);
      }
    }
  }, [data, lightboxIndex, lightboxYear]);

  const goNext = useCallback(() => {
    if (lightboxIndex === null || lightboxYear === null) return;
    const yearData = data.find((d) => d.year === lightboxYear);
    if (!yearData) return;
    if (lightboxIndex < yearData.images.length - 1) {
      setLightboxIndex(lightboxIndex + 1);
    } else {
      const nextYearIdx = data.findIndex((d) => d.year === lightboxYear) - 1;
      if (nextYearIdx >= 0) {
        setLightboxYear(data[nextYearIdx].year);
        setLightboxIndex(0);
      }
    }
  }, [data, lightboxIndex, lightboxYear]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (lightboxIndex === null) return;
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === "ArrowRight") goNext();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [lightboxIndex, goPrev, goNext]);

  const lightboxImg =
    lightboxYear !== null && lightboxIndex !== null
      ? data.find((d) => d.year === lightboxYear)?.images[lightboxIndex]
      : null;

  const formatDate = (iso: string) => {
    try {
      return new Date(iso).toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return "";
    }
  };

  if (loading) {
    return (
      <section className="py-24 bg-white min-h-[400px] flex items-center justify-center">
        <div className="text-gray-400 text-sm font-medium uppercase tracking-widest">
          Loading Media Vault…
        </div>
      </section>
    );
  }

  const hasAnyMedia = data.some((d) => d.images.length > 0);

  if (!hasAnyMedia) {
    return (
      <section className="py-24 bg-white min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center md:text-left mb-12 border-b border-gray-100 pb-8">
            <h1 className="text-5xl md:text-7xl font-black uppercase italic tracking-tighter text-gray-900">
              Media <span className="text-red-600">Vault</span>
            </h1>
            <p className="mt-2 text-gray-500 font-bold uppercase tracking-widest text-sm">
              Exclusive Season Highlights
            </p>
          </div>
          <div className="flex flex-col items-center justify-center py-24 px-6 rounded-3xl border-2 border-dashed border-gray-200 bg-gray-50/50">
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-6">
              <svg
                className="w-8 h-8 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">No season highlights yet</h2>
            <p className="text-gray-500 text-sm max-w-sm">
              Media from completed rounds will appear here.
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-24 bg-white min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center md:text-left flex flex-col md:flex-row justify-between items-end mb-12 border-b border-gray-100 pb-8 gap-6">
          <div>
            <h1 className="text-5xl md:text-7xl font-black uppercase italic tracking-tighter text-gray-900">
              Media <span className="text-red-600">Vault</span>
            </h1>
            <p className="mt-2 text-gray-500 font-bold uppercase tracking-widest text-sm">
              Exclusive Season Highlights
            </p>
          </div>

          <div className="flex gap-0 overflow-x-auto min-w-0 max-w-full">
            <div className="flex border-b border-gray-200 gap-0">
              {data.map((d) => (
                <button
                  key={d.year}
                  type="button"
                  onClick={() => setActiveYear(d.year)}
                  className={`flex-shrink-0 px-5 py-3 text-sm font-semibold tracking-tight transition-colors duration-200 whitespace-nowrap border-b-2 -mb-px ${
                    activeYear === d.year
                      ? "border-red-600 text-red-600"
                      : "border-transparent text-gray-500 hover:text-gray-900 hover:border-gray-300"
                  }`}
                >
                  {d.year}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
          style={{ gridAutoRows: "minmax(200px, auto)" }}
        >
          {images.map((img, index) => (
            <div
              key={img.id}
              className="relative group rounded-2xl overflow-hidden bg-gray-100 cursor-pointer aspect-[4/3] min-h-[200px] shadow-md hover:shadow-xl transition-shadow duration-300"
              onClick={() => openLightbox(index)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") openLightbox(index);
              }}
              aria-label={`View ${img.roundName} image`}
            >
              <Image
                src={img.imageUrl}
                alt=""
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                className="object-cover transition-transform duration-500 group-hover:scale-110"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                <p className="text-white font-semibold text-sm truncate">{img.roundName}</p>
                <p className="text-white/80 text-xs truncate">{img.championshipName}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {lightboxImg && lightboxIndex !== null && lightboxYear !== null && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 transition-opacity duration-200"
          role="dialog"
          aria-modal="true"
          aria-label="Image lightbox"
          onClick={(e) => e.target === e.currentTarget && closeLightbox()}
        >
          <button
            type="button"
            onClick={closeLightbox}
            className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
            aria-label="Close"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <button
            type="button"
            onClick={goPrev}
            className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-10 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
            aria-label="Previous image"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <div className="relative max-w-4xl max-h-[85vh] w-full flex flex-col items-center">
            <div className="relative w-full flex-1 min-h-0 flex items-center justify-center">
              <Image
                src={lightboxImg.imageUrl}
                alt=""
                width={1200}
                height={800}
                className="max-w-full max-h-[70vh] w-auto h-auto object-contain rounded-lg"
                unoptimized={false}
              />
            </div>
            <div className="mt-4 text-center text-white">
              <p className="font-semibold">{lightboxImg.roundName}</p>
              <p className="text-white/80 text-sm">{lightboxImg.championshipName}</p>
              <p className="text-white/60 text-xs mt-1">{formatDate(lightboxImg.createdAt)}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={goNext}
            className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-10 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
            aria-label="Next image"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      )}
    </section>
  );
}
