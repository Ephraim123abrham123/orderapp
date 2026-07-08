import React from "react";

interface CustomerItem {
  customer_name: string;
  revenue: number;
  orders_count: number;
}

interface TopCustomersWidgetProps {
  data: CustomerItem[];
}

export default function TopCustomersWidget({ data = [] }: TopCustomersWidgetProps) {
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(val);
  };

  if (!data || data.length === 0) {
    return (
      <div className="flex h-full items-center justify-center text-xs text-slate-500">
        No sales volume records found.
      </div>
    );
  }

  return (
    <div className="h-full w-full overflow-y-auto pr-1">
      <table className="w-full text-left border-collapse text-xs">
        <thead>
          <tr className="border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider pb-2">
            <th className="pb-2">Customer</th>
            <th className="pb-2 text-center">Orders</th>
            <th className="pb-2 text-right">Total Revenue</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800/60 text-slate-300">
          {data.map((item, idx) => (
            <tr key={item.customer_name} className="hover:bg-slate-900/10 transition">
              <td className="py-2.5 font-medium text-slate-200">
                <span className="inline-flex h-5 w-5 items-center justify-center rounded bg-slate-800 text-[10px] font-bold text-slate-400 mr-2">
                  {idx + 1}
                </span>
                {item.customer_name}
              </td>
              <td className="py-2.5 text-center font-semibold text-slate-400">
                {item.orders_count}
              </td>
              <td className="py-2.5 text-right font-semibold text-indigo-400">
                {formatCurrency(item.revenue)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
