"use client";

import { useState, useEffect } from "react";
import Sidebar from "@/components/admin/Sidebar";

const SIDEBAR_STORAGE_KEY = "admin-sidebar-collapsed";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem(SIDEBAR_STORAGE_KEY);
    if (saved !== null) {
      setCollapsed(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    if (mounted) {
      localStorage.setItem(SIDEBAR_STORAGE_KEY, JSON.stringify(collapsed));
    }
  }, [collapsed, mounted]);

  const handleToggle = () => {
    setCollapsed(!collapsed);
  };

  const sidebarWidth = collapsed ? 64 : 256;

  return (
    <div className="flex min-h-screen">
      <Sidebar collapsed={collapsed} onToggle={handleToggle} />
      <main
        className="flex-1 transition-all duration-300 ease-in-out"
        style={{
          marginLeft: `${sidebarWidth}px`,
          backgroundColor: "#181818",
          minHeight: "100vh",
        }}
      >
        {children}
      </main>
    </div>
  );
}
