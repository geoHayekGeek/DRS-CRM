"use client";

import { theme } from "@/lib/theme";

export default function AdminPage() {
  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1
            className="text-3xl font-bold mb-2"
            style={{ color: theme.colors.primary.red }}
          >
            Admin Dashboard
          </h1>
          <p className="text-gray-300">Welcome to the DRS Cup 2026 admin panel.</p>
        </div>
      </div>
    </div>
  );
}
