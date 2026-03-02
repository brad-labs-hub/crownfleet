"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Car, Receipt, FileDown,
  Upload, Users, ClipboardList, MapPin,
} from "lucide-react";

const NAV_ITEMS = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/locations", label: "Locations", icon: MapPin },
  { href: "/admin/vehicles", label: "Vehicles", icon: Car },
  { href: "/admin/receipts", label: "Receipts", icon: Receipt },
  { href: "/admin/exports", label: "Exports", icon: FileDown },
  { href: "/admin/requests", label: "Requests", icon: ClipboardList },
  { href: "/admin/imports", label: "Imports", icon: Upload },
];

type Props = { role: string };

export function AdminNav({ role }: Props) {
  const pathname = usePathname();

  return (
    <nav className="bg-card border-b border-border px-4">
      <div className="max-w-6xl mx-auto flex gap-1 py-1 overflow-x-auto">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || (href !== "/admin/dashboard" && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium whitespace-nowrap transition-colors ${
                active
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {label}
            </Link>
          );
        })}
        {role === "controller" && (
          <Link
            href="/admin/users"
            className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium whitespace-nowrap transition-colors ${
              pathname === "/admin/users"
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            }`}
          >
            <Users className="h-4 w-4 shrink-0" />
            Users
          </Link>
        )}
      </div>
    </nav>
  );
}
