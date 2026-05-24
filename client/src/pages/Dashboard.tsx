import { IndianRupee, ShoppingCart, TrendingUp, Package, Users, ArrowUpRight } from "lucide-react";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import Layout from "@/components/Layout";
import StatCard from "@/components/StatCard";
import { formatINR } from "@/lib/format";
import {
  useGetDashboardStats, useGetDashboardRevenueOverview, useGetDashboardSalesByCategory,
  useGetDashboardRecentOrders, useGetDashboardInventoryStatus, useGetDashboardRevenueVsProfit,
  useGetDashboardTopSellingProducts, useGetDashboardAiInsights,
} from "@workspace/api-client-react";

const COLORS = ["#a0aecd", "#000000", "#64748b", "#94a3b8", "#cbd5e1"];

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    "In Stock": "bg-emerald-100 text-emerald-700",
    "Low Stock": "bg-amber-100 text-amber-700",
    "Out of Stock": "bg-red-100 text-red-700",
    "Completed": "bg-emerald-100 text-emerald-700",
    "Processing": "bg-blue-100 text-blue-700",
  };
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${colors[status] ?? "bg-gray-100 text-gray-600"}`}>
      {status}
    </span>
  );
}

export default function Dashboard() {
  const { data: stats } = useGetDashboardStats();
  const { data: revenue } = useGetDashboardRevenueOverview({ period: "daily" });
  const { data: byCategory } = useGetDashboardSalesByCategory();
  const { data: recentOrders } = useGetDashboardRecentOrders();
  const { data: inventoryStatus } = useGetDashboardInventoryStatus();
  const { data: revVsProfit } = useGetDashboardRevenueVsProfit({ period: "monthly" });
  const { data: topProducts } = useGetDashboardTopSellingProducts();
  const { data: aiInsights } = useGetDashboardAiInsights();

  return (
    <Layout>
      <div className="p-6 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Welcome back, Admin!</h1>
            <p className="text-gray-500 text-sm mt-0.5">Here's what's happening with your business today.</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-500 bg-white border border-gray-200 px-3 py-2 rounded-lg">
              Apr 01, 2024 - Apr 30, 2024
            </span>
            <button className="bg-[#000000] text-white text-sm px-4 py-2.5 rounded-xl hover:bg-[#1a1a1a] transition-all font-medium shadow-sm hover:shadow-md active:scale-[0.98]">
              + Quick Action
            </button>
          </div>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-5 gap-4">
          <StatCard title="Total Revenue" value={formatINR(stats?.totalRevenue ?? 1245000)} change={stats?.revenueChange ?? 18.6} index={0}
            icon={<IndianRupee className="w-5 h-5 text-[#000000]" />} iconBg="bg-[#a0aecd]/30" />
          <StatCard title="Total Orders" value={(stats?.totalOrders ?? 1250).toLocaleString("en-IN")} change={stats?.ordersChange ?? 12.6} index={1}
            icon={<ShoppingCart className="w-5 h-5 text-[#475569]" />} iconBg="bg-[#f1f3f8]" />
          <StatCard title="Total Profit" value={formatINR(stats?.totalProfit ?? 245000)} change={stats?.profitChange ?? 16.3} index={2}
            icon={<TrendingUp className="w-5 h-5 text-[#000000]" />} iconBg="bg-[#a0aecd]/20" />
          <StatCard title="Total Products" value={(stats?.totalProducts ?? 560).toLocaleString("en-IN")} change={stats?.productsChange ?? 2.4} index={3}
            icon={<Package className="w-5 h-5 text-[#64748b]" />} iconBg="bg-[#f1f3f8]" />
          <StatCard title="New Customers" value={(stats?.newCustomers ?? 86).toLocaleString("en-IN")} change={stats?.customersChange ?? 15.8} index={4}
            icon={<Users className="w-5 h-5 text-[#000000]" />} iconBg="bg-[#a0aecd]/30" />
        </div>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-12 gap-4">
          {/* Revenue Overview */}
          <div className="col-span-5 bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-800">Revenue Overview</h3>
              <select className="text-xs border border-gray-200 rounded px-2 py-1 text-gray-600">
                <option>Daily</option><option>Weekly</option><option>Monthly</option>
              </select>
            </div>
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={revenue ?? []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="label" tick={{ fontSize: 10 }} tickFormatter={(v) => v.slice(4)} />
                <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                <Tooltip formatter={(v: number) => formatINR(v)} />
                <Line type="monotone" dataKey="value" stroke="#2563EB" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
            <div className="grid grid-cols-4 gap-2 mt-3 pt-3 border-t border-gray-100">
              {[
                { label: "Total Revenue", val: formatINR(stats?.totalRevenue ?? 1245000) },
                { label: "Total Cost", val: formatINR((stats?.totalRevenue ?? 1245000) * 0.83) },
                { label: "Total Profit", val: formatINR(stats?.totalProfit ?? 245000) },
                { label: "Profit Margin", val: "19.6%" },
              ].map(({ label, val }) => (
                <div key={label} className="text-center">
                  <p className="text-xs font-semibold text-gray-800">{val}</p>
                  <p className="text-[10px] text-gray-500">{label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Sales by Category */}
          <div className="col-span-4 bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
            <h3 className="font-semibold text-gray-800 mb-4">Sales by Category</h3>
            <div className="flex items-center gap-4">
              <ResponsiveContainer width={130} height={130}>
                <PieChart>
                  <Pie
  data={Array.isArray(byCategory) ? byCategory : []} dataKey="value" cx="50%" cy="50%" innerRadius={35} outerRadius={60}>
                   {Array.isArray(byCategory) &&
  byCategory.map((_, i) => (
    <Cell key={i} fill={COLORS[i % COLORS.length]} />
  ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="flex-1 space-y-1.5">
                {Array.isArray(byCategory) &&
  byCategory.map((cat, i) => (
                  <div key={cat.name} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full" style={{ background: COLORS[i % COLORS.length] }}></div>
                      <span className="text-gray-600">{cat.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-400">{cat.percentage}%</span>
                      <span className="font-medium text-gray-800">{formatINR(cat.value)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-gray-100 flex justify-between text-xs">
              <div>
                <p className="text-gray-500">Total Sales</p>
                <p className="font-bold text-gray-800">{formatINR(stats?.totalRevenue ?? 1245000)}</p>
              </div>
              <div className="text-right">
                <p className="text-gray-500">Top Category</p>
                <p className="font-bold text-gray-800">Electronics (45%)</p>
              </div>
            </div>
          </div>

          {/* Recent Orders */}
          <div className="col-span-3 bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-800">Recent Orders</h3>
              <button className="text-blue-600 text-xs hover:underline">View All</button>
            </div>
            <div className="space-y-2.5">
              {(Array.isArray(recentOrders) ? recentOrders : []).map((order) => (
                <div key={order.id} className="flex items-center gap-2" data-testid={`order-${order.id}`}>
                  <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Package className="w-4 h-4 text-gray-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-800 truncate">{order.product}</p>
                    <p className="text-[10px] text-gray-400">#{order.orderId} · {order.date}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-xs font-semibold text-gray-800">{formatINR(order.amount)}</p>
                    <StatusBadge status={order.status} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Charts Row 2 */}
        <div className="grid grid-cols-12 gap-4">
          {/* Inventory Status */}
          <div className="col-span-4 bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-800">Inventory Status</h3>
              <button className="text-blue-600 text-xs hover:underline">View All</button>
            </div>
            <table className="w-full text-xs">
              <thead>
                <tr className="text-gray-400 border-b border-gray-100">
                  <th className="text-left pb-2 font-medium">Product</th>
                  <th className="text-right pb-2 font-medium">Stock</th>
                  <th className="text-right pb-2 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {(Array.isArray(inventoryStatus) ? inventoryStatus : []).map((item) => (
                  <tr key={item.id} data-testid={`inv-${item.id}`}>
                    <td className="py-2 text-gray-700 truncate max-w-[100px]">{item.product}</td>
                    <td className="py-2 text-right text-gray-600">{item.stock}</td>
                    <td className="py-2 text-right"><StatusBadge status={item.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Revenue vs Profit */}
          <div className="col-span-5 bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-800">Revenue vs Profit</h3>
              <select className="text-xs border border-gray-200 rounded px-2 py-1 text-gray-600">
                <option>Monthly</option>
              </select>
            </div>
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={revVsProfit ?? []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="label" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                <Tooltip formatter={(v: number) => formatINR(v)} />
                <Legend wrapperStyle={{ fontSize: 10 }} />
                <Bar dataKey="revenue" fill="#2563EB" radius={[3, 3, 0, 0]} name="Revenue" />
                <Bar dataKey="profit" fill="#10B981" radius={[3, 3, 0, 0]} name="Profit" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Top Selling Products */}
          <div className="col-span-3 bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-800">Top Selling Products</h3>
              <button className="text-blue-600 text-xs hover:underline">View All</button>
            </div>
            <table className="w-full text-xs">
              <thead>
                <tr className="text-gray-400 border-b border-gray-100">
                  <th className="text-left pb-2 font-medium">Product</th>
                  <th className="text-right pb-2 font-medium">Units</th>
                  <th className="text-right pb-2 font-medium">Revenue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {(Array.isArray(topProducts) ? topProducts : []).map((p) => (
                  <tr key={p.id}>
                    <td className="py-2 text-gray-700 truncate max-w-[90px]">{p.name}</td>
                    <td className="py-2 text-right text-gray-600">{p.unitsSold}</td>
                    <td className="py-2 text-right font-medium text-gray-800">{formatINR(p.revenue)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* AI Insights */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-6 h-6 bg-indigo-100 rounded-full flex items-center justify-center">
              <TrendingUp className="w-3.5 h-3.5 text-indigo-600" />
            </div>
            <h3 className="font-semibold text-gray-800">AI Insights & Recommendations</h3>
            <span className="bg-indigo-100 text-indigo-700 text-[10px] px-2 py-0.5 rounded-full font-medium">Beta</span>
          </div>
          <div className="grid grid-cols-4 gap-3">
            {(Array.isArray(aiInsights) ? aiInsights :  []).map((insight, i) => {
              const colors = [
                { bg: "bg-emerald-50 border-emerald-200", icon: "text-emerald-600", dot: "bg-emerald-500" },
                { bg: "bg-amber-50 border-amber-200", icon: "text-amber-600", dot: "bg-amber-500" },
                { bg: "bg-blue-50 border-blue-200", icon: "text-blue-600", dot: "bg-blue-500" },
                { bg: "bg-purple-50 border-purple-200", icon: "text-purple-600", dot: "bg-purple-500" },
              ];
              const c = colors[i % colors.length];
              return (
                <div key={i} className={`${c.bg} border rounded-lg p-3`}>
                  <div className={`w-2 h-2 ${c.dot} rounded-full mb-2`}></div>
                  <p className="text-xs font-semibold text-gray-800 mb-1">{insight.title}</p>
                  <p className="text-[11px] text-gray-600">{insight.message}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </Layout>
  );
}
