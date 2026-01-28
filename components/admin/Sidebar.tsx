"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { ChevronLeft } from "lucide-react";
import { theme } from "@/lib/theme";
import SidebarLink from "./SidebarLink";

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export default function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const router = useRouter();
  const [logoutLoading, setLogoutLoading] = useState(false);

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

  const sidebarWidth = collapsed ? "w-16" : "w-64";

  return (
    <div
      className={`${sidebarWidth} fixed left-0 top-0 h-screen transition-all duration-300 ease-in-out flex flex-col overflow-hidden`}
      style={{ backgroundColor: theme.colors.primary.dark }}
    >
      <div className={`flex items-center border-b border-gray-700 ${collapsed ? "flex-col justify-center p-3" : "justify-between p-4"} flex-shrink-0`}>
        {collapsed ? (
          <>
            <div className="mb-2">
              <Image
                src="/DRS.png"
                alt="DRS Cup 2026"
                width={32}
                height={32}
                className="h-auto"
                priority
              />
            </div>
            <button
              onClick={onToggle}
              className="p-2 text-gray-300 hover:text-white transition-all duration-200 rounded hover:bg-gray-700"
              aria-label="Expand sidebar"
            >
              <ChevronLeft
                className="w-5 h-5 transition-transform duration-300 rotate-180"
              />
            </button>
          </>
        ) : (
          <>
            <div className="transition-all duration-300">
              <Image
                src="/DRS.png"
                alt="DRS Cup 2026"
                width={140}
                height={35}
                className="h-auto"
                priority
              />
            </div>
            <button
              onClick={onToggle}
              className="p-2 text-gray-300 hover:text-white transition-all duration-200 rounded hover:bg-gray-700"
              aria-label="Collapse sidebar"
            >
              <ChevronLeft
                className="w-5 h-5 transition-transform duration-300 rotate-0"
              />
            </button>
          </>
        )}
      </div>

      <nav className="flex-1 py-4 sidebar-nav overflow-y-auto overflow-x-hidden">
        <SidebarLink href="/admin" collapsed={collapsed}>
          Dashboard
        </SidebarLink>
        <SidebarLink href="/admin/drivers" collapsed={collapsed}>
          Drivers
        </SidebarLink>
        <SidebarLink href="/admin/tracks" collapsed={collapsed}>
          Tracks
        </SidebarLink>
        <SidebarLink href="/admin/championships" collapsed={collapsed}>
          Championships
        </SidebarLink>
        <SidebarLink href="/admin/rounds" collapsed={collapsed}>
          Rounds
        </SidebarLink>
        <SidebarLink href="/admin/standings" collapsed={collapsed}>
          Standings
        </SidebarLink>
      </nav>

      <div className="p-4 border-t border-gray-700 flex-shrink-0">
        <button
          onClick={handleLogout}
          disabled={logoutLoading}
          className={`
            w-full px-4 py-2 text-sm font-semibold rounded-lg transition-all duration-200
            disabled:opacity-50 disabled:cursor-not-allowed
            ${collapsed ? "opacity-0 pointer-events-none" : "opacity-100"}
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
