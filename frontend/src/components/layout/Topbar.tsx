"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { useWebSocket } from "@/hooks/useWebSocket";
import { Radio } from "lucide-react";

export default function Topbar() {
  const pathname = usePathname();
  const { status } = useWebSocket();

  // Create page title breadcrumb based on route
  const getPageTitle = () => {
    switch (pathname) {
      case "/dashboard":
        return "Dashboard Overview";
      case "/orders":
        return "Orders Management";
      case "/analytics":
        return "Customizable Analytics Grid";
      case "/import":
        return "Bulk Excel / CSV Upload";
      default:
        if (pathname.startsWith("/orders/")) {
          return "Order Details";
        }
        return "Order Management System";
    }
  };

  const getStatusBadge = () => {
    switch (status) {
      case "connected":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-400 border border-emerald-500/20">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            Live Connected
          </span>
        );
      case "connecting":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-2.5 py-0.5 text-xs font-semibold text-amber-400 border border-amber-500/20">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-bounce"></span>
            Connecting...
          </span>
        );
      case "disconnected":
      default:
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-500/10 px-2.5 py-0.5 text-xs font-semibold text-rose-400 border border-rose-500/20">
            <span className="h-1.5 w-1.5 rounded-full bg-rose-500"></span>
            Live Disconnected
          </span>
        );
    }
  };

  return (
    <header className="sticky top-0 z-10 flex h-16 w-full items-center justify-between border-b border-slate-800 bg-slate-950/80 backdrop-blur-md px-6">
      {/* Invisible placeholder matching sidebar left padding */}
      <div className="flex items-center gap-4">
        <h2 className="text-sm md:text-base font-semibold text-slate-100 pl-0 md:pl-2">
          {getPageTitle()}
        </h2>
      </div>

      <div className="flex items-center gap-4">
        {/* Real-Time WebSocket Connection Indicator */}
        <div className="flex items-center gap-2">
          <Radio className={`h-4 w-4 ${status === 'connected' ? 'text-emerald-400' : 'text-slate-500'}`} />
          {getStatusBadge()}
        </div>
      </div>
    </header>
  );
}
