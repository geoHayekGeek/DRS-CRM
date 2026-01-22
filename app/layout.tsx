import type { Metadata } from "next";
import { Toaster } from "react-hot-toast";
import "./globals.css";

export const metadata: Metadata = {
  title: "DRS Cup 2026 - Admin",
  description: "Karting Championship Management System",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        {children}
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
      </body>
    </html>
  );
}
