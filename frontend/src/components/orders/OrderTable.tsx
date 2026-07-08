"use client";

import React from "react";
import { Order } from "@/hooks/useOrders";
import StatusBadge from "./StatusBadge";
import StatusUpdateControl from "./StatusUpdateControl";

interface OrderTableProps {
  orders: Order[];
  isLoading: boolean;
}

export default function OrderTable({ orders, isLoading }: OrderTableProps) {
  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (e) {
      return dateStr;
    }
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
    }).format(amount);
  };

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-12 text-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent"></div>
        <p className="mt-2 text-sm text-slate-400">Loading order listings...</p>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-12 text-center">
        <p className="text-slate-400 text-sm">No orders found. Try expanding your search filter or click &quot;Create Order&quot; above.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900/40 shadow-xl">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-slate-800 text-xs font-semibold uppercase tracking-wider text-slate-400 bg-slate-900/60">
            <th className="py-4 px-6">ID</th>
            <th className="py-4 px-6">Date</th>
            <th className="py-4 px-6">Customer</th>
            <th className="py-4 px-6">Amount</th>
            <th className="py-4 px-6">USD Amount (Converted)</th>
            <th className="py-4 px-6">Status</th>
            <th className="py-4 px-6 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800 text-sm text-slate-300">
          {orders.map((order) => (
            <tr key={order.id} className="hover:bg-slate-900/40 transition duration-150">
              <td className="py-4 px-6 font-semibold text-slate-100">#{order.id}</td>
              <td className="py-4 px-6 text-slate-400">{formatDate(order.created_at)}</td>
              <td className="py-4 px-6 font-medium text-slate-200">{order.customer_name}</td>
              <td className="py-4 px-6 font-semibold text-slate-200">
                {formatCurrency(order.amount, order.currency)}
              </td>
              <td className="py-4 px-6 font-semibold text-indigo-400">
                {formatCurrency(order.usd_amount, "USD")}
              </td>
              <td className="py-4 px-6">
                <StatusBadge status={order.status} />
              </td>
              <td className="py-4 px-6 text-right">
                <div className="flex justify-end">
                  <StatusUpdateControl orderId={order.id} currentStatus={order.status} />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
