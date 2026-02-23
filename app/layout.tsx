import type { Metadata } from "next";
import { ToasterClient } from "@/components/ToasterClient";
import "./globals.css";

export const metadata: Metadata = {
  title: "DRS Cup 2026",
  description: "Karting Championship Management System",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        {children}
        <ToasterClient />
      </body>
    </html>
  );
}
