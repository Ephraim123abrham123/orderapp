"use client";

import React from "react";
import { ORDER_STATUSES } from "@/lib/constants";
import { Search, Filter, Plus } from "lucide-react";

interface OrderFiltersProps {
  search: string;
  setSearch: (val: string) => void;
  status: string;
  setStatus: (val: string) => void;
  onCreateClick: () => void;
}

export default function OrderFilters({
  search,
  setSearch,
  status,
  setStatus,
  onCreateClick,
}: OrderFiltersProps) {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
      {/* Search & Filters */}
      <div className="flex flex-1 flex-col sm:flex-row gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <span className="absolute inset-y-0 left-3 flex items-center text-slate-500">
            <Search className="h-4 w-4" />
          </span>
          <input
            type="text"
            placeholder="Search by customer name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-slate-800 bg-slate-900/60 py-2.5 pl-10 pr-4 text-sm text-slate-100 placeholder-slate-500 outline-none transition duration-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        {/* Status Dropdown */}
        <div className="relative">
          <span className="absolute inset-y-0 left-3 flex items-center text-slate-500">
            <Filter className="h-4 w-4" />
          </span>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full sm:w-48 rounded-xl border border-slate-800 bg-slate-900/60 py-2.5 pl-10 pr-8 text-sm text-slate-200 outline-none transition duration-200 focus:border-indigo-500 appearance-none cursor-pointer"
          >
            <option value="">All Statuses</option>
            {ORDER_STATUSES.map((stat) => (
              <option key={stat} value={stat}>
                {stat}
              </option>
            ))}
          </select>
          {/* Custom chevron indicator */}
          <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-slate-500">
            <svg className="h-4 w-4 fill-current" viewBox="0 0 20 20">
              <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Action Button */}
      <button
        onClick={onCreateClick}
        className="flex items-center justify-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:scale-[0.98] px-4 py-2.5 text-sm font-semibold text-slate-100 shadow-lg shadow-indigo-600/20 hover:shadow-indigo-600/30 transition cursor-pointer"
      >
        <Plus className="h-4.5 w-4.5" />
        <span>Create Order</span>
      </button>
    </div>
  );
}
