"use client";

import { useState, useEffect } from "react";
import type { MediaVaultYear } from "@/app/api/public/media-vault/route";

export type { MediaVaultImage, MediaVaultYear } from "@/app/api/public/media-vault/route";

export function useMediaVault() {
  const [data, setData] = useState<MediaVaultYear[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/public/media-vault")
      .then((res) => res.json())
      .then((list: MediaVaultYear[]) => {
        if (!cancelled && Array.isArray(list)) {
          setData(list);
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

  const hasAnyMedia = data.some((d) => d.images.length > 0);

  return { data, loading, hasAnyMedia };
}
