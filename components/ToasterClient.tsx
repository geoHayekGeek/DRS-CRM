"use client";

import { Toaster } from "react-hot-toast";

export function ToasterClient() {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        style: {
          background: "#1F2937",
          color: "#F9FAFB",
          border: "1px solid #374151",
        },
        success: {
          style: {
            background: "#065F46",
            color: "#F9FAFB",
          },
        },
        error: {
          style: {
            background: "#7F1D1D",
            color: "#F9FAFB",
          },
        },
      }}
    />
  );
}
