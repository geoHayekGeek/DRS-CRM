"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { theme } from "@/lib/theme";

interface SidebarLinkProps {
  href: string;
  children: React.ReactNode;
  collapsed: boolean;
  onNavigate?: () => void;
}

export default function SidebarLink({ href, children, collapsed, onNavigate }: SidebarLinkProps) {
  const pathname = usePathname();
  const isActive = pathname === href || (href !== "/admin" && pathname.startsWith(href));

  return (
    <Link
      href={href}
      onClick={onNavigate}
      className={`
        block px-4 py-3 min-h-[44px] flex items-center text-sm font-medium transition-all duration-200
        ${isActive ? "text-white" : "text-gray-300 hover:text-white"}
        ${collapsed ? "lg:opacity-0 lg:pointer-events-none" : "opacity-100"}
      `}
      style={{
        backgroundColor: isActive ? theme.colors.primary.red : "transparent",
      }}
      onMouseEnter={(e) => {
        if (!isActive) {
          e.currentTarget.style.backgroundColor = "rgba(186, 23, 24, 0.1)";
        }
      }}
      onMouseLeave={(e) => {
        if (!isActive) {
          e.currentTarget.style.backgroundColor = "transparent";
        }
      }}
    >
      {children}
    </Link>
  );
}
