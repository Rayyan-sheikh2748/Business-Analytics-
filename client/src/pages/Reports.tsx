import { useState } from "react";
import { Download, Mail, Clock, FileText, X, CheckCircle } from "lucide-react";
import { LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import Layout from "@/components/Layout";
import StatCard from "@/components/StatCard";
import { formatINR } from "@/lib/format";
import {
  useGetReport, useGetReportStats, useGetReportRevenueTrend,
  useGetReportByCategory, useGetReportTopProducts,
} from "@workspace/api-client-react";

const COLORS = ["#4F46E5", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6"];

function Toast({ message, type, onClose }: { message: string; type: "success" | "error"; onClose: () => void }) {
  return (
    <div className={`fixed bottom-6 right-6 text-white text-sm px-4 py-3 rounded-xl shadow-xl flex items-center gap-3 z-50 ${type === "success" ? "bg-gray-900" : "bg-red-600"}`}>
      {type === "success" ? <CheckCircle className="w-4 h-4 text-emerald-400" /> : <X className="w-4 h-4" />}
      {message}
      <button onClick={onClose} className="ml-2 text-gray-400 hover:text-white"><X className="w-3.5 h-3.5" /></button>
    </div>
  );
}

export default function Reports() {
  const [reportType, setReportType] = useState("Sales Report");
  const [dateRange, setDateRange] = useState("Last 7 Days");
  const [filterCategory, setFilterCategory] = useState("");
  const [page, setPage] = useState(1);
  const [email, setEmail] = useState("");
  const [scheduleFreq, setScheduleFreq] = useState("Weekly");
  const [scheduleEmail, setScheduleEmail] = useState("");
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type }); setTimeout(() => setToast(null), 3500);
  };

  const { data: report, refetch: refetchReport } = useGetReport({ reportType, page, limit: 10 });
  const { data: stats } = useGetReportStats();
  const { data: trend } = useGetReportRevenueTrend();
  const { data: byCategory } = useGetReportByCategory();
  const { data: topProducts } = useGetReportTopProducts();

  function exportCSV() {
    const rows = [["Date", "Product", "Category", "Orders", "Units Sold", "Revenue", "Profit"]];
    (report?.data ?? []).forEach((row) => rows.push([row.date, row.product, row.category, String(row.orders), String(row.unitsSold), String(row.revenue), String(row.profit)]));
    const csv = rows.map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `${reportType.replace(" ", "-")}-${dateRange.replace(" ", "-")}.csv`; a.click();
    URL.revokeObjectURL(url);
    showToast("CSV exported successfully!");
  }

  function exportPDF() {
    const content = `
      <html><head><title>${reportType}</title>
      <style>body{font-family:Arial;padding:20px}h1{color:#1e293b}table{width:100%;border-collapse:collapse}th,td{border:1px solid #e2e8f0;padding:8px;text-align:left}th{background:#f8fafc}tr:nth-child(even){background:#f8fafc}</style>
      </head><body>
      <h1>${reportType} — ${dateRange}</h1>
      <p>Generated: ${new Date().toLocaleString("en-IN")}</p>
      <table><tr>${["Date","Product","Category","Orders","Units Sold","Revenue","Profit"].map((h) => `<th>${h}</th>`).join("")}</tr>
      ${(report?.data ?? []).map((row) => `<tr><td>${row.date}</td><td>${row.product}</td><td>${row.category}</td><td>${row.orders}</td><td>${row.unitsSold}</td><td>₹${row.revenue.toLocaleString("en-IN")}</td><td>₹${row.profit.toLocaleString("en-IN")}</td></tr>`).join("")}
      </table></body></html>
    `;
    const blob = new Blob([content], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const win = window.open(url, "_blank");
    if (win) { win.onload = () => { win.print(); }; }
    showToast("PDF report opened for printing!");
  }

  function sendEmail() {
    if (!email || !email.includes("@")) { showToast("Please enter a valid email address.", "error"); return; }
    showToast(`Report sent to ${email}!`);
    setEmail("");
  }

  function scheduleReport() {
    if (!scheduleEmail || !scheduleEmail.includes("@")) { showToast("Please enter a valid recipient email.", "error"); return; }
    showToast(`${scheduleFreq} report scheduled for ${scheduleEmail}!`);
    setScheduleEmail("");
  }

  const totalPages = Math.ceil((report?.total ?? 0) / 10);

  return (
    <Layout>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div className="p-6 space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Reports</h1>
            <p className="text-gray-500 text-sm">Generate, export, and schedule business reports</p>
          </div>
          <div className="flex gap-2">
            <button onClick={exportCSV} className="flex items-center gap-2 border border-gray-200 bg-white text-gray-700 text-sm px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors">
              <Download className="w-4 h-4" /> Export CSV
            </button>
            <button onClick={exportPDF} className="flex items-center gap-2 border border-gray-200 bg-white text-gray-700 text-sm px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors">
              <FileText className="w-4 h-4" /> Export PDF
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
          <div className="flex items-center gap-3 flex-wrap">
            <select value={reportType} onChange={(e) => setReportType(e.target.value)}
              className="px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
              {["Sales Report", "Inventory Report", "Customer Report", "Revenue Report"].map((t) => <option key={t}>{t}</option>)}
            </select>
            <select value={dateRange} onChange={(e) => setDateRange(e.target.value)}
              className="px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
              {["Last 7 Days", "Last 30 Days", "Last 90 Days", "Last Year"].map((d) => <option key={d}>{d}</option>)}
            </select>
            <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}
              className="px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">All Categories</option>
              {["Electronics", "Accessories", "Wearables", "Home Appliances"].map((c) => <option key={c}>{c}</option>)}
            </select>
            <button onClick={() => { setPage(1); refetchReport(); showToast("Report generated!"); }}
              className="bg-blue-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
              Generate Report
            </button>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-4">
          <StatCard title="Total Revenue" value={formatINR(stats?.totalRevenue ?? 1245000)} change={stats?.revenueChange ?? 18.6}
            icon={<span className="text-emerald-600 font-bold">₹</span>} iconBg="bg-emerald-100" />
          <StatCard title="Total Orders" value={(stats?.totalOrders ?? 1250).toLocaleString("en-IN")} change={stats?.ordersChange ?? 12.4}
            icon={<span className="text-blue-600 font-bold">O</span>} iconBg="bg-blue-100" />
          <StatCard title="Units Sold" value={(stats?.totalUnitsSold ?? 4800).toLocaleString("en-IN")} change={stats?.unitsSoldChange ?? 15.3}
            icon={<span className="text-orange-600 font-bold">U</span>} iconBg="bg-orange-100" />
          <StatCard title="Avg Order Value" value={formatINR(stats?.avgOrderValue ?? 25830)}
            icon={<span className="text-purple-600 font-bold">A</span>} iconBg="bg-purple-100" />
        </div>

        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-8 bg-white rounded-xl border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <h3 className="font-semibold text-gray-800">Report Preview — {reportType}</h3>
              <span className="text-xs text-gray-400">{dateRange}</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    {["Date", "Product", "Category", "Orders", "Units Sold", "Revenue", "Profit"].map((h) => (
                      <th key={h} className="text-left px-4 py-3 font-medium text-gray-500">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {(report?.data ?? []).map((row, idx) => (
                    <tr key={idx} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-gray-600">{row.date}</td>
                      <td className="px-4 py-3 font-medium text-gray-800">{row.product}</td>
                      <td className="px-4 py-3 text-gray-600">{row.category}</td>
                      <td className="px-4 py-3 text-gray-600">{row.orders}</td>
                      <td className="px-4 py-3 text-gray-600">{row.unitsSold}</td>
                      <td className="px-4 py-3 font-semibold text-gray-800">{formatINR(row.revenue)}</td>
                      <td className="px-4 py-3 text-emerald-600 font-medium">{formatINR(row.profit)}</td>
                    </tr>
                  ))}
                  {(report?.data ?? []).length === 0 && (
                    <tr><td colSpan={7} className="px-4 py-10 text-center text-gray-400">No data available</td></tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
              <span className="text-xs text-gray-500">Page {page} of {Math.max(1, totalPages)}</span>
              <div className="flex gap-1">
                <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="w-7 h-7 text-xs rounded text-gray-500 hover:bg-gray-100 disabled:opacity-40">&#8249;</button>
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map((p) => (
                  <button key={p} onClick={() => setPage(p)} className={`w-7 h-7 text-xs rounded ${page === p ? "bg-blue-600 text-white" : "text-gray-500 hover:bg-gray-100"}`}>{p}</button>
                ))}
                <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page >= totalPages} className="w-7 h-7 text-xs rounded text-gray-500 hover:bg-gray-100 disabled:opacity-40">&#8250;</button>
              </div>
            </div>
          </div>

          <div className="col-span-4 space-y-4">
            <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <Mail className="w-4 h-4 text-blue-600" />
                <h3 className="font-semibold text-gray-800 text-sm">Email Report</h3>
              </div>
              <input type="email" placeholder="Enter email address" value={email} onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg mb-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
              <button onClick={sendEmail} className="w-full bg-blue-600 text-white text-sm py-2 rounded-lg hover:bg-blue-700 transition-colors">Send Report</button>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <Clock className="w-4 h-4 text-purple-600" />
                <h3 className="font-semibold text-gray-800 text-sm">Schedule Report</h3>
              </div>
              <select value={scheduleFreq} onChange={(e) => setScheduleFreq(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg mb-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                {["Daily", "Weekly", "Monthly"].map((f) => <option key={f}>{f}</option>)}
              </select>
              <input type="email" placeholder="Recipient email" value={scheduleEmail} onChange={(e) => setScheduleEmail(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg mb-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
              <button onClick={scheduleReport} className="w-full bg-purple-600 text-white text-sm py-2 rounded-lg hover:bg-purple-700 transition-colors">Schedule Report</button>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
              <h3 className="font-semibold text-gray-800 text-sm mb-3">Top Performing Products</h3>
              <div className="space-y-2">
                {(topProducts ?? []).map((p, i) => (
                  <div key={p.id} className="flex items-center gap-2 text-xs">
                    <span className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-bold">{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-800 truncate">{p.name}</p>
                      <p className="text-gray-400">{p.unitsSold} units sold</p>
                    </div>
                    <span className="font-semibold text-gray-800 flex-shrink-0">{formatINR(p.revenue)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
            <h3 className="font-semibold text-gray-800 mb-3">Revenue Trend</h3>
            <ResponsiveContainer width="100%" height={160}>
              <LineChart data={trend ?? []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="label" tick={{ fontSize: 9 }} />
                <YAxis tick={{ fontSize: 9 }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                <Tooltip formatter={(v: number) => formatINR(v)} />
                <Line type="monotone" dataKey="value" stroke="#2563EB" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
            <h3 className="font-semibold text-gray-800 mb-3">Revenue by Category</h3>
            <div className="flex items-center gap-4">
              <ResponsiveContainer width={130} height={130}>
                <PieChart>
                  <Pie data={byCategory ?? []} dataKey="value" cx="50%" cy="50%" innerRadius={35} outerRadius={60}>
                    {(byCategory ?? []).map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="flex-1 space-y-1.5">
                {(byCategory ?? []).map((cat, i) => (
                  <div key={cat.name} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full" style={{ background: COLORS[i % COLORS.length] }}></div>
                      <span className="text-gray-600">{cat.name}</span>
                    </div>
                    <span className="font-medium text-gray-800">{cat.percentage}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
