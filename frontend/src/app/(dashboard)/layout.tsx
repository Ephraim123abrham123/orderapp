"use client";

import React, { ReactNode } from "react";
import Sidebar from "@/components/layout/Sidebar";
import Topbar from "@/components/layout/Topbar";
import ProtectedRoute from "@/components/layout/ProtectedRoute";
import { useUiStore } from "@/store/uiStore";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const { sidebarCollapsed } = useUiStore();

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-slate-950 text-slate-100 flex">
        {/* Left collapsible sidebar */}
        <Sidebar />

        {/* Right page content panel */}
        <div
          className={`flex-1 flex flex-col transition-all duration-300 min-h-screen ${
            sidebarCollapsed ? "pl-16" : "pl-64"
          }`}
        >
          <Topbar />

          {/* Main workspace */}
          <main className="flex-1 p-4 md:p-6 overflow-x-hidden">
            {children}
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
