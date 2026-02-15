"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { ChevronLeft, X } from "lucide-react";
import { theme } from "@/lib/theme";
import SidebarLink from "./SidebarLink";

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

export default function Sidebar({ collapsed, onToggle, mobileOpen = false, onMobileClose }: SidebarProps) {
  const router = useRouter();
  const [logoutLoading, setLogoutLoading] = useState(false);
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => data && setRole(data.role ?? "ADMIN"))
      .catch(() => {});
  }, []);

  const handleLogout = async () => {
    setLogoutLoading(true);
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
      });
      router.push("/login");
    } catch (error) {
      setLogoutLoading(false);
    }
  };

  // On mobile (< lg): overlay drawer, always full width when open. On desktop: collapsed or w-64.
  const isMobileOpen = mobileOpen;
  const onNavigate = isMobileOpen ? onMobileClose : undefined;

  return (
    <div
      className={`
        fixed left-0 top-0 h-screen flex flex-col overflow-hidden z-40
        transition-transform duration-300 ease-in-out
        w-64
        lg:transition-[width] lg:duration-300 lg:ease-in-out
        ${collapsed ? "lg:w-16" : "lg:w-64"}
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
      `}
      style={{ backgroundColor: theme.colors.primary.dark }}
    >
      <div className={`flex items-center border-b border-gray-700 flex-shrink-0 justify-between p-4 lg:justify-between ${collapsed ? "lg:flex-col lg:justify-center lg:p-3" : ""}`}>
        <div className={`flex items-center gap-2 flex-1 min-w-0 ${collapsed ? "lg:flex-col lg:mb-2 lg:flex-none" : ""}`}>
          <Image
            src="/DRS.png"
            alt="DRS Cup 2026"
            width={140}
            height={35}
            className={`h-8 w-auto max-w-[140px] object-contain lg:transition-all lg:duration-300 ${collapsed ? "lg:w-8 lg:h-8 lg:max-w-8" : "lg:w-[140px] lg:h-[35px] lg:max-w-[140px]"}`}
            priority
          />
          {/* Mobile: close button */}
          <button
            type="button"
            onClick={onMobileClose}
            className="p-2 text-gray-300 hover:text-white transition-all duration-200 rounded hover:bg-gray-700 min-h-[44px] min-w-[44px] flex items-center justify-center lg:hidden"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        {/* Desktop: collapse toggle */}
        <button
          onClick={onToggle}
          className="hidden lg:flex p-2 text-gray-300 hover:text-white transition-all duration-200 rounded hover:bg-gray-700 items-center justify-center"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <ChevronLeft
            className={`w-5 h-5 transition-transform duration-300 ${collapsed ? "rotate-180" : "rotate-0"}`}
          />
        </button>
      </div>

      <nav className="flex-1 py-4 sidebar-nav overflow-y-auto overflow-x-hidden">
        <SidebarLink href="/admin/drivers" collapsed={collapsed} onNavigate={onNavigate}>
          Drivers
        </SidebarLink>
        <SidebarLink href="/admin/tracks" collapsed={collapsed} onNavigate={onNavigate}>
          Tracks
        </SidebarLink>
        <SidebarLink href="/admin/championships" collapsed={collapsed} onNavigate={onNavigate}>
          Championships
        </SidebarLink>
        <SidebarLink href="/admin/rounds" collapsed={collapsed} onNavigate={onNavigate}>
          Rounds
        </SidebarLink>
        <SidebarLink href="/admin/events" collapsed={collapsed} onNavigate={onNavigate}>
          Events
        </SidebarLink>
        <SidebarLink href="/admin/standings" collapsed={collapsed} onNavigate={onNavigate}>
          Standings
        </SidebarLink>
        {role === "SUPER_ADMIN" && (
          <SidebarLink href="/admin/users" collapsed={collapsed} onNavigate={onNavigate}>
            Users
          </SidebarLink>
        )}
      </nav>

      <div className="p-4 border-t border-gray-700 flex-shrink-0">
        <button
          onClick={handleLogout}
          disabled={logoutLoading}
          className={`
            w-full px-4 py-3 min-h-[44px] text-sm font-semibold rounded-lg transition-all duration-200 flex items-center justify-center
            disabled:opacity-50 disabled:cursor-not-allowed
            ${collapsed ? "lg:opacity-0 lg:pointer-events-none" : "opacity-100"}
          `}
          style={{ backgroundColor: theme.colors.primary.red, color: "white" }}
          onMouseEnter={(e) => {
            if (!logoutLoading) {
              e.currentTarget.style.backgroundColor = "#A01516";
            }
          }}
          onMouseLeave={(e) => {
            if (!logoutLoading) {
              e.currentTarget.style.backgroundColor = theme.colors.primary.red;
            }
          }}
        >
          {logoutLoading ? "Logging out..." : "Logout"}
        </button>
      </div>
    </div>
  );
}
