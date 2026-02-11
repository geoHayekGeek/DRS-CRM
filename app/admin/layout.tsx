"use client";

import { useState, useEffect } from "react";
import { Menu } from "lucide-react";
import Sidebar from "@/components/admin/Sidebar";
import { theme } from "@/lib/theme";

const SIDEBAR_STORAGE_KEY = "admin-sidebar-collapsed";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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

  return (
    <div className="flex min-h-screen overflow-x-hidden" style={{ backgroundColor: "#181818" }}>
      {/* Backdrop: visible only when mobile menu is open, < lg */}
      <button
        type="button"
        aria-label="Close menu"
        onClick={() => setMobileMenuOpen(false)}
        className={`fixed inset-0 z-30 bg-black/50 transition-opacity duration-300 lg:hidden ${
          mobileMenuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      />

      <Sidebar
        collapsed={collapsed}
        onToggle={handleToggle}
        mobileOpen={mobileMenuOpen}
        onMobileClose={() => setMobileMenuOpen(false)}
      />

      {/* Top bar: hamburger + title, visible only on < lg */}
      <header
        className="fixed top-0 left-0 right-0 z-20 flex items-center gap-3 h-14 px-4 border-b border-gray-700 lg:hidden"
        style={{ backgroundColor: theme.colors.primary.dark }}
      >
        <button
          type="button"
          onClick={() => setMobileMenuOpen(true)}
          className="p-2 -ml-2 text-gray-300 hover:text-white rounded-lg hover:bg-gray-700 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
          aria-label="Open menu"
        >
          <Menu className="w-6 h-6" />
        </button>
        <span className="text-white font-semibold text-lg truncate">DRS Admin</span>
      </header>

      <main
        className={`flex-1 w-full min-w-0 transition-all duration-300 ease-in-out pt-14 lg:pt-0 ${
          collapsed ? "lg:ml-16" : "lg:ml-64"
        }`}
        style={{
          backgroundColor: "#181818",
          minHeight: "100vh",
        }}
      >
        {children}
      </main>
    </div>
  );
}
