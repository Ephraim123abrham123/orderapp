"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useUiStore } from "@/store/uiStore";
import { useAuth } from "@/hooks/useAuth";
import { 
  LayoutDashboard, 
  ShoppingBag, 
  BarChart3, 
  Upload, 
  ChevronLeft, 
  ChevronRight, 
  LogOut, 
  User as UserIcon 
} from "lucide-react";

export default function Sidebar() {
  const { sidebarCollapsed, toggleSidebar } = useUiStore();
  const { user, logout } = useAuth();
  const pathname = usePathname();

  const menuItems = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Orders List", href: "/orders", icon: ShoppingBag },
    { name: "Custom Analytics", href: "/analytics", icon: BarChart3 },
    { name: "Bulk Import", href: "/import", icon: Upload },
  ];

  return (
    <aside
      className={`fixed top-0 left-0 z-20 h-screen border-r border-slate-800 bg-slate-900/60 backdrop-blur-xl transition-all duration-300 flex flex-col justify-between ${
        sidebarCollapsed ? "w-16" : "w-64"
      }`}
    >
      <div>
        {/* Brand Header */}
        <div className="flex h-16 items-center justify-between px-4 border-b border-slate-800">
          {!sidebarCollapsed && (
            <span className="text-lg font-bold tracking-wider bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
              ORDERAPP
            </span>
          )}
          <button
            onClick={toggleSidebar}
            className={`rounded-lg p-1.5 hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition ${
              sidebarCollapsed ? "mx-auto" : ""
            }`}
          >
            {sidebarCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="space-y-1 p-3">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition duration-200 ${
                  isActive
                    ? "bg-indigo-600 text-slate-100 shadow-lg shadow-indigo-600/10"
                    : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                }`}
                title={item.name}
              >
                <Icon className="h-5 w-5 shrink-0" />
                {!sidebarCollapsed && <span>{item.name}</span>}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer Profile & Logout */}
      <div className="border-t border-slate-800 p-3 space-y-1">
        <div
          className={`flex items-center gap-3 rounded-xl px-3 py-2 text-sm text-slate-300 ${
            sidebarCollapsed ? "justify-center" : ""
          }`}
        >
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-950 text-indigo-400 border border-indigo-800">
            <UserIcon className="h-4 w-4" />
          </div>
          {!sidebarCollapsed && (
            <div className="overflow-hidden min-w-0">
              <p className="truncate text-sm font-semibold text-slate-200">
                {user?.username || "Guest"}
              </p>
              <p className="truncate text-[10px] text-slate-500">Administrator</p>
            </div>
          )}
        </div>

        <button
          onClick={logout}
          className={`w-full flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-rose-400 hover:bg-rose-950/20 hover:text-rose-300 transition duration-200 ${
            sidebarCollapsed ? "justify-center" : ""
          }`}
          title="Sign Out"
        >
          <LogOut className="h-5 w-5 shrink-0" />
          {!sidebarCollapsed && <span>Sign Out</span>}
        </button>
      </div>
    </aside>
  );
}
