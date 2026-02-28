"use client";

import React from "react";
import Image from "next/image";
import type { MediaVaultImage } from "@/hooks/useMediaVault";

function formatDateDefault(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return "";
  }
}

interface MediaVaultLightboxProps {
  image: MediaVaultImage | null;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
  formatDate?: (iso: string) => string;
}

export function MediaVaultLightbox({
  image,
  onClose,
  onPrev,
  onNext,
  formatDate = formatDateDefault,
}: MediaVaultLightboxProps) {
  if (!image) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 transition-opacity duration-200"
      role="dialog"
      aria-modal="true"
      aria-label="Image lightbox"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <button
        type="button"
        onClick={onClose}
        className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
        aria-label="Close"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      <button
        type="button"
        onClick={onPrev}
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
            src={image.imageUrl}
            alt=""
            width={1200}
            height={800}
            className="max-w-full max-h-[70vh] w-auto h-auto object-contain rounded-lg"
            unoptimized={false}
          />
        </div>
        <div className="mt-4 text-center text-white">
          <p className="font-semibold">{image.roundName}</p>
          <p className="text-white/80 text-sm">{image.championshipName}</p>
          <p className="text-white/60 text-xs mt-1">{formatDate(image.createdAt)}</p>
        </div>
      </div>

      <button
        type="button"
        onClick={onNext}
        className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-10 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
        aria-label="Next image"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  );
}
