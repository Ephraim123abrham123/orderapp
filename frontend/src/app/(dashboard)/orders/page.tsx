"use client";

import React, { useState } from "react";
import { useOrders } from "@/hooks/useOrders";
import OrderFilters from "@/components/orders/OrderFilters";
import OrderTable from "@/components/orders/OrderTable";
import OrderForm from "@/components/orders/OrderForm";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function OrdersPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);

  const pageSize = 10;
  const { data, isLoading } = useOrders(page, pageSize, search, status);

  const totalItems = data?.total || 0;
  const totalPages = Math.ceil(totalItems / pageSize) || 1;

  const handleSearchChange = (val: string) => {
    setSearch(val);
    setPage(1); // reset to first page on search
  };

  const handleStatusChange = (val: string) => {
    setStatus(val);
    setPage(1); // reset to first page on filter
  };

  return (
    <div className="space-y-6">
      <OrderFilters
        search={search}
        setSearch={handleSearchChange}
        status={status}
        setStatus={handleStatusChange}
        onCreateClick={() => setShowCreateModal(true)}
      />

      <OrderTable orders={data?.items || []} isLoading={isLoading} />

      {/* Pagination Footer */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-slate-800 pt-4 text-sm text-slate-400">
          <div>
            Showing <span className="font-semibold text-slate-200">{(page - 1) * pageSize + 1}</span> to{" "}
            <span className="font-semibold text-slate-200">
              {Math.min(page * pageSize, totalItems)}
            </span>{" "}
            of <span className="font-semibold text-slate-200">{totalItems}</span> orders
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
              disabled={page === 1}
              className="rounded-xl border border-slate-800 p-2 hover:bg-slate-800 hover:text-slate-200 transition disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="text-slate-300 font-medium">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
              disabled={page === totalPages}
              className="rounded-xl border border-slate-800 p-2 hover:bg-slate-800 hover:text-slate-200 transition disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Order Creation Modal Overlay */}
      {showCreateModal && (
        <OrderForm onClose={() => setShowCreateModal(false)} />
      )}
    </div>
  );
}
