import { motion } from "framer-motion";
import { Link } from "wouter";
import { useState } from "react";
import { IndianRupee, ShoppingCart, TrendingUp, Package, Users, ArrowUpRight, Sparkles } from "lucide-react";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import Layout from "@/components/Layout";
import PageShell from "@/components/PageShell";
import PageHero from "@/components/PageHero";
import GlassCard from "@/components/GlassCard";
import StatCard from "@/components/StatCard";
import { formatINR } from "@/lib/format";
import ActivityTimeline from "@/components/ui-premium/ActivityTimeline";
import { CHART_COLORS, CHART_PRIMARY, CHART_ACCENT, chartTooltipStyle, chartGridStroke, chartTickFill } from "@/components/ui-premium/chartStyles";
import {
  useGetDashboardStats, useGetDashboardRevenueOverview, useGetDashboardSalesByCategory,
  useGetDashboardRecentOrders, useGetDashboardInventoryStatus, useGetDashboardRevenueVsProfit,
  useGetDashboardTopSellingProducts, useGetDashboardAiInsights,
} from "@workspace/api-client-react";

const COLORS = CHART_COLORS;

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    "In Stock": "bg-emerald-100/90 text-emerald-700",
    "Low Stock": "bg-amber-100/90 text-amber-700",
    "Out of Stock": "bg-red-100/90 text-red-700",
    "Completed": "bg-emerald-100/90 text-emerald-700",
    "Processing": "bg-[#a0aecd]/25 text-[#0a0a0a]",
  };
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${colors[status] ?? "bg-[#f4f5f9] text-[#64748b]"}`}>
      {status}
    </span>
  );
}

export default function Dashboard() {
  const [revPeriod, setRevPeriod] = useState<"daily" | "weekly" | "monthly">("daily");
  const { data: stats } = useGetDashboardStats();
  const { data: revenue } = useGetDashboardRevenueOverview({ period: revPeriod });
  const { data: byCategory } = useGetDashboardSalesByCategory();
  const { data: recentOrders } = useGetDashboardRecentOrders();
  const { data: inventoryStatus } = useGetDashboardInventoryStatus();
  const { data: revVsProfit } = useGetDashboardRevenueVsProfit({ period: "monthly" });
  const { data: topProducts } = useGetDashboardTopSellingProducts();
  const { data: aiInsights } = useGetDashboardAiInsights();

  return (
    <Layout>
      <PageShell>
        <PageHero
          badge="Overview"
          title="Welcome back, Admin"
          subtitle="Here's what's happening with your business today — revenue, inventory, and AI-driven signals at a glance."
          actions={
            <>
              <span className="text-sm text-[#64748b] glass-panel px-3 py-2 rounded-xl">Apr 01 – Apr 30, 2024</span>
              <Link href="/sales">
                <button type="button" className="btn-primary">+ Quick Action</button>
              </Link>
            </>
          }
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4">
          <StatCard title="Total Revenue" value={formatINR(stats?.totalRevenue ?? 0)} change={stats?.revenueChange ?? 0} index={0}
            icon={<IndianRupee className="w-5 h-5 text-[#000000]" />} iconBg="bg-[#a0aecd]/30" />
          <StatCard title="Total Orders" value={(stats?.totalOrders ?? 0).toLocaleString("en-IN")} change={stats?.ordersChange ?? 0} index={1}
            icon={<ShoppingCart className="w-5 h-5 text-[#475569]" />} iconBg="bg-[#f1f3f8]" />
          <StatCard title="Total Profit" value={formatINR(stats?.totalProfit ?? 0)} change={stats?.profitChange ?? 0} index={2}
            icon={<TrendingUp className="w-5 h-5 text-[#000000]" />} iconBg="bg-[#a0aecd]/20" />
          <StatCard title="Total Products" value={(stats?.totalProducts ?? 0).toLocaleString("en-IN")} change={stats?.productsChange ?? 0} index={3}
            icon={<Package className="w-5 h-5 text-[#64748b]" />} iconBg="bg-[#f1f3f8]" />
          <StatCard title="New Customers" value={(stats?.newCustomers ?? 0).toLocaleString("en-IN")} change={stats?.customersChange ?? 0} index={4}
            icon={<Users className="w-5 h-5 text-[#000000]" />} iconBg="bg-[#a0aecd]/30" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4 mt-4">
          <StatCard title="Monthly Revenue" value={formatINR(stats?.monthlyRevenue ?? 0)} index={0}
            icon={<IndianRupee className="w-5 h-5 text-[#475569]" />} iconBg="bg-[#f1f3f8]" changeLabel="Last 30 days" />
          <StatCard title="Forecasted Revenue" value={formatINR(stats?.forecastedRevenue ?? 0)} index={1}
            icon={<TrendingUp className="w-5 h-5 text-[#000000]" />} iconBg="bg-[#a0aecd]/30" changeLabel="Next 30 days" />
          <StatCard title="Top Selling Product" value={stats?.topSellingProduct ?? "—"} index={2}
            icon={<Package className="w-5 h-5 text-[#64748b]" />} iconBg="bg-[#f1f3f8]" changeLabel="By revenue" />
          <StatCard title="Fastest Growing Product" value={stats?.fastestGrowingProduct ?? "—"} index={3}
            icon={<TrendingUp className="w-5 h-5 text-[#000000]" />} iconBg="bg-[#a0aecd]/20" changeLabel="By growth velocity" />
          <StatCard title="Forecast Confidence" value={stats?.forecastConfidenceScore !== undefined ? `${stats.forecastConfidenceScore.toFixed(1)}%` : "—"} index={4}
            icon={<Users className="w-5 h-5 text-[#475569]" />} iconBg="bg-[#f1f3f8]" changeLabel="Model accuracy score" />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
          <GlassCard className="xl:col-span-5 p-4 sm:p-5" delay={0.08}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-[#0a0a0a]">Revenue Overview</h3>
              <select
                className="input-premium text-xs py-1.5"
                value={revPeriod}
                onChange={(e) => setRevPeriod(e.target.value as "daily" | "weekly" | "monthly")}
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={revenue ?? []}>
                <CartesianGrid strokeDasharray="3 3" stroke={chartGridStroke} />
                <XAxis dataKey="label" tick={{ fontSize: 10, fill: chartTickFill }} />
                <YAxis tick={{ fontSize: 10, fill: chartTickFill }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                <Tooltip formatter={(v: number) => formatINR(v)} contentStyle={chartTooltipStyle} />
                <Line type="monotone" dataKey="value" stroke={CHART_PRIMARY} strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-3 pt-3 border-t border-[#eef0f6]">
              {[
                { label: "Total Revenue", val: formatINR(stats?.totalRevenue ?? 0) },
                { label: "Total Profit", val: formatINR(stats?.totalProfit ?? 0) },
                { label: "Forecasted", val: formatINR(stats?.forecastedRevenue ?? 0) },
                { label: "Monthly Revenue", val: formatINR(stats?.monthlyRevenue ?? 0) },
              ].map(({ label, val }) => (
                <div key={label} className="text-center">
                  <p className="text-xs font-semibold text-[#0a0a0a]">{val}</p>
                  <p className="text-[10px] text-[#64748b]">{label}</p>
                </div>
              ))}
            </div>
          </GlassCard>

          <GlassCard className="xl:col-span-4 p-4 sm:p-5" delay={0.1}>
            <h3 className="font-semibold text-[#0a0a0a] mb-4">Sales by Category</h3>
            <div className="flex items-center gap-4">
              <ResponsiveContainer width={130} height={130}>
                <PieChart>
                  <Pie data={Array.isArray(byCategory) ? byCategory : []} dataKey="value" cx="50%" cy="50%" innerRadius={35} outerRadius={60}>
                    {Array.isArray(byCategory) && byCategory.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="flex-1 space-y-1.5">
                {Array.isArray(byCategory) && byCategory.map((cat, i) => (
                  <div key={cat.name} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                      <span className="text-[#64748b]">{cat.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[#94a3b8]">{cat.percentage}%</span>
                      <span className="font-medium text-[#0a0a0a]">{formatINR(cat.value)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-[#eef0f6] flex justify-between text-xs">
              <div>
                <p className="text-[#64748b]">Total Sales</p>
                <p className="font-bold text-[#0a0a0a]">{formatINR(stats?.totalRevenue ?? 0)}</p>
              </div>
              <div className="text-right">
                <p className="text-[#64748b]">Top Category</p>
                <p className="font-bold text-[#0a0a0a]">{Array.isArray(byCategory) && byCategory.length > 0 ? `${byCategory[0].name} (${byCategory[0].percentage}%)` : "N/A"}</p>
              </div>
            </div>
          </GlassCard>

          <GlassCard className="xl:col-span-3 p-4 sm:p-5" delay={0.12}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-[#0a0a0a]">Recent Orders</h3>
              <Link href="/sales"><span className="text-[#475569] text-xs hover:text-[#0a0a0a] flex items-center gap-0.5 cursor-pointer">View All <ArrowUpRight className="w-3 h-3" /></span></Link>
            </div>
            <div className="space-y-2.5">
              {(Array.isArray(recentOrders) ? recentOrders : []).map((order) => (
                <div key={order.id} className="flex items-center gap-2 p-2 rounded-xl hover:bg-[#f4f5f9]/80 transition-colors" data-testid={`order-${order.id}`}>
                  <div className="w-8 h-8 bg-[#f4f5f9] rounded-lg flex items-center justify-center flex-shrink-0">
                    <Package className="w-4 h-4 text-[#64748b]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-[#0a0a0a] truncate">{order.product}</p>
                    <p className="text-[10px] text-[#94a3b8]">#{order.orderId} · {order.date}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-xs font-semibold text-[#0a0a0a]">{formatINR(order.amount)}</p>
                    <StatusBadge status={order.status} />
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
          <GlassCard className="xl:col-span-4 p-4 sm:p-5" delay={0.14}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-[#0a0a0a]">Inventory Status</h3>
              <Link href="/inventory"><span className="text-[#475569] text-xs hover:text-[#0a0a0a] cursor-pointer">View All</span></Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="text-[#94a3b8] border-b border-[#eef0f6]">
                    <th className="text-left pb-2 font-medium">Product</th>
                    <th className="text-right pb-2 font-medium">Stock</th>
                    <th className="text-right pb-2 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f4f5f9]">
                  {(Array.isArray(inventoryStatus) ? inventoryStatus : []).map((item) => (
                    <tr key={item.id} className="hover:bg-[#fafbfc]/80 transition-colors" data-testid={`inv-${item.id}`}>
                      <td className="py-2 text-[#475569] truncate max-w-[100px]">{item.product}</td>
                      <td className="py-2 text-right text-[#64748b]">{item.stock}</td>
                      <td className="py-2 text-right"><StatusBadge status={item.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </GlassCard>

          <GlassCard className="xl:col-span-5 p-4 sm:p-5" delay={0.16}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-[#0a0a0a]">Revenue vs Profit</h3>
              <select className="input-premium text-xs py-1.5"><option>Monthly</option></select>
            </div>
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={revVsProfit ?? []}>
                <CartesianGrid strokeDasharray="3 3" stroke={chartGridStroke} />
                <XAxis dataKey="label" tick={{ fontSize: 10, fill: chartTickFill }} />
                <YAxis tick={{ fontSize: 10, fill: chartTickFill }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                <Tooltip formatter={(v: number) => formatINR(v)} contentStyle={chartTooltipStyle} />
                <Legend wrapperStyle={{ fontSize: 10 }} />
                <Bar dataKey="revenue" fill={CHART_PRIMARY} radius={[4, 4, 0, 0]} name="Revenue" />
                <Bar dataKey="profit" fill={CHART_ACCENT} radius={[4, 4, 0, 0]} name="Profit" />
              </BarChart>
            </ResponsiveContainer>
          </GlassCard>

          <div className="xl:col-span-3">
            <ActivityTimeline />
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
          <GlassCard className="xl:col-span-12 p-4 sm:p-5" delay={0.17}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-[#0a0a0a]">Top Products</h3>
              <Link href="/sales"><span className="text-[#475569] text-xs hover:text-[#0a0a0a] cursor-pointer">View All</span></Link>
            </div>
            <table className="w-full text-xs">
              <thead>
                <tr className="text-[#94a3b8] border-b border-[#eef0f6]">
                  <th className="text-left pb-2 font-medium">Product</th>
                  <th className="text-right pb-2 font-medium">Units</th>
                  <th className="text-right pb-2 font-medium">Revenue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f4f5f9]">
                {(Array.isArray(topProducts) ? topProducts : []).map((p) => (
                  <tr key={p.id} className="hover:bg-[#fafbfc]/80">
                    <td className="py-2 text-[#475569] truncate max-w-[90px]">{p.name}</td>
                    <td className="py-2 text-right text-[#64748b]">{p.unitsSold}</td>
                    <td className="py-2 text-right font-medium text-[#0a0a0a]">{formatINR(p.revenue)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </GlassCard>
        </div>

        <GlassCard className="p-4 sm:p-5" delay={0.2}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-[#000000] rounded-xl flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-[#a0aecd]" />
              </div>
              <h3 className="font-semibold text-[#0a0a0a]">AI Insights & Recommendations</h3>
              <span className="bg-[#a0aecd]/25 text-[#0a0a0a] text-[10px] px-2 py-0.5 rounded-full font-medium border border-[#a0aecd]/40">Beta</span>
            </div>
            <Link href="/ai-insights"><button type="button" className="text-xs text-[#475569] hover:text-[#0a0a0a] font-medium">View all →</button></Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
            {(Array.isArray(aiInsights) ? aiInsights : []).map((insight, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.22 + i * 0.04 }}
                className="rounded-xl border border-[#e8eaf2] bg-[#fafbfc]/80 p-3 hover:border-[#a0aecd]/50 hover:shadow-[0_8px_24px_rgba(160,174,205,0.15)] transition-all"
              >
                <div className="w-2 h-2 bg-[#000000] rounded-full mb-2" />
                <p className="text-xs font-semibold text-[#0a0a0a] mb-1">{insight.title}</p>
                <p className="text-[11px] text-[#64748b] leading-relaxed">{insight.message}</p>
              </motion.div>
            ))}
          </div>
        </GlassCard>
      </PageShell>
    </Layout>
  );
}
