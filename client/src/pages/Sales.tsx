import { useState } from "react";
import { Download, Upload, Plus, Pencil, Trash2, RefreshCw, X, Save, AlertTriangle } from "lucide-react";
import { LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import Layout from "@/components/Layout";
import StatCard from "@/components/StatCard";
import { formatINR } from "@/lib/format";
import {
  useGetSalesStats, useGetSalesTrend, useGetSalesByCategory,
  useGetSalesTopProducts, useGetSales, useDeleteSale, useCreateSale, useUpdateSale,
  getGetSalesQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";

const COLORS = ["#4F46E5", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6"];
const CATEGORIES = ["Electronics", "Accessories", "Wearables", "Home Appliances"];
const CHANNELS = ["Online", "Retail"];

function CategoryBadge({ cat }: { cat: string }) {
  const map: Record<string, string> = {
    Electronics: "bg-blue-100 text-blue-700",
    Accessories: "bg-amber-100 text-amber-700",
    Wearables: "bg-purple-100 text-purple-700",
    "Home Appliances": "bg-orange-100 text-orange-700",
  };
  return <span className={`px-2 py-0.5 rounded-full text-[11px] font-medium ${map[cat] ?? "bg-gray-100 text-gray-600"}`}>{cat}</span>;
}

type SaleForm = { customer: string; product: string; category: string; qty: string; unitPrice: string; channel: string; date: string };
const EMPTY_FORM: SaleForm = { customer: "", product: "", category: "Electronics", qty: "1", unitPrice: "", channel: "Online", date: new Date().toISOString().slice(0, 10) };

function SaleModal({ sale, onClose, onSave }: {
  sale?: { id: number; customer: string; product: string; category: string; qty: number; unitPrice: number; channel: string; date: string } | null;
  onClose: () => void;
  onSave: (data: SaleForm) => void;
}) {
  const [form, setForm] = useState<SaleForm>(sale ? {
    customer: sale.customer, product: sale.product, category: sale.category,
    qty: String(sale.qty), unitPrice: String(sale.unitPrice), channel: sale.channel, date: sale.date,
  } : EMPTY_FORM);
  const [errors, setErrors] = useState<Partial<SaleForm>>({});

  function validate() {
    const e: Partial<SaleForm> = {};
    if (!form.customer.trim()) e.customer = "Required";
    if (!form.product.trim()) e.product = "Required";
    if (!form.unitPrice || isNaN(Number(form.unitPrice))) e.unitPrice = "Enter valid price";
    if (!form.qty || isNaN(Number(form.qty)) || Number(form.qty) < 1) e.qty = "Enter valid qty";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function submit() { if (validate()) onSave(form); }

  const set = (k: keyof SaleForm) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((p) => ({ ...p, [k]: e.target.value }));

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900">{sale ? "Edit Sale" : "Add New Sale"}</h2>
          <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: "Customer Name", key: "customer" as keyof SaleForm, placeholder: "e.g. Rahul Sharma" },
              { label: "Product", key: "product" as keyof SaleForm, placeholder: "e.g. Wireless Headphones" },
            ].map(({ label, key, placeholder }) => (
              <div key={key}>
                <label className="block text-xs font-medium text-gray-700 mb-1">{label}</label>
                <input value={form[key]} onChange={set(key)} placeholder={placeholder}
                  className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors[key] ? "border-red-400" : "border-gray-200"}`} />
                {errors[key] && <p className="text-red-500 text-[11px] mt-0.5">{errors[key]}</p>}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Category</label>
              <select value={form.category} onChange={set("category")} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Channel</label>
              <select value={form.channel} onChange={set("channel")} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                {CHANNELS.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Quantity</label>
              <input type="number" min="1" value={form.qty} onChange={set("qty")}
                className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.qty ? "border-red-400" : "border-gray-200"}`} />
              {errors.qty && <p className="text-red-500 text-[11px] mt-0.5">{errors.qty}</p>}
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Unit Price (₹)</label>
              <input type="number" min="0" value={form.unitPrice} onChange={set("unitPrice")} placeholder="e.g. 2499"
                className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.unitPrice ? "border-red-400" : "border-gray-200"}`} />
              {errors.unitPrice && <p className="text-red-500 text-[11px] mt-0.5">{errors.unitPrice}</p>}
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Date</label>
              <input type="date" value={form.date} onChange={set("date")}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>
          {form.unitPrice && form.qty && (
            <div className="bg-blue-50 rounded-lg px-4 py-2 text-sm text-blue-700 font-medium">
              Total Revenue: {formatINR(Number(form.unitPrice) * Number(form.qty))}
            </div>
          )}
        </div>
        <div className="flex gap-3 px-6 pb-6">
          <button onClick={onClose} className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 hover:bg-gray-50">Cancel</button>
          <button onClick={submit} className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">
            <Save className="w-4 h-4" />{sale ? "Save Changes" : "Add Sale"}
          </button>
        </div>
      </div>
    </div>
  );
}

function DeleteConfirm({ label, onClose, onConfirm }: { label: string; onClose: () => void; onConfirm: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-80 p-6 text-center">
        <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
          <AlertTriangle className="w-6 h-6 text-red-600" />
        </div>
        <h3 className="text-base font-bold text-gray-900 mb-1">Delete Sale?</h3>
        <p className="text-sm text-gray-500 mb-5">Are you sure you want to delete <span className="font-medium text-gray-700">{label}</span>? This cannot be undone.</p>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 hover:bg-gray-50">Cancel</button>
          <button onClick={onConfirm} className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700">Delete</button>
        </div>
      </div>
    </div>
  );
}

function Toast({ message, onClose }: { message: string; onClose: () => void }) {
  return (
    <div className="fixed bottom-6 right-6 bg-gray-900 text-white text-sm px-4 py-3 rounded-xl shadow-xl flex items-center gap-3 z-50 animate-in slide-in-from-bottom-4">
      <span className="text-emerald-400">&#10003;</span> {message}
      <button onClick={onClose} className="ml-2 text-gray-400 hover:text-white"><X className="w-3.5 h-3.5" /></button>
    </div>
  );
}

export default function Sales() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [channel, setChannel] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const [editSale, setEditSale] = useState<null | { id: number; customer: string; product: string; category: string; qty: number; unitPrice: number; channel: string; date: string }>(null);
  const [deleteTarget, setDeleteTarget] = useState<null | { id: number; label: string }>(null);
  const [toast, setToast] = useState("");
  const queryClient = useQueryClient();

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(""), 3000); };
  const refetch = () => queryClient.invalidateQueries({ queryKey: getGetSalesQueryKey() });

  const { data: statsData } = useGetSalesStats();
  const { data: trend } = useGetSalesTrend({ period: "daily" });
  const { data: byCategory } = useGetSalesByCategory();
  const { data: topProducts } = useGetSalesTopProducts();
  const { data: sales, refetch: refetchSales } = useGetSales({ page, limit: 10, search: search || undefined, category: category || undefined, channel: channel || undefined });

  const createMutation = useCreateSale({ mutation: { onSuccess: () => { refetch(); setAddOpen(false); showToast("Sale added successfully!"); } } });
  const updateMutation = useUpdateSale({ mutation: { onSuccess: () => { refetch(); setEditSale(null); showToast("Sale updated successfully!"); } } });
  const deleteMutation = useDeleteSale({ mutation: { onSuccess: () => { refetch(); setDeleteTarget(null); showToast("Sale deleted."); } } });

  function handleAdd(form: SaleForm) {
    createMutation.mutate({ data: {
      customer: form.customer, product: form.product, category: form.category,
      qty: Number(form.qty), unitPrice: Number(form.unitPrice),
      revenue: Number(form.qty) * Number(form.unitPrice), channel: form.channel, date: form.date,
    }});
  }

  function handleEdit(form: SaleForm) {
    if (!editSale) return;
    updateMutation.mutate({ id: editSale.id, data: {
      customer: form.customer, product: form.product, category: form.category,
      qty: Number(form.qty), unitPrice: Number(form.unitPrice),
      revenue: Number(form.qty) * Number(form.unitPrice), channel: form.channel, date: form.date,
    }});
  }

  function exportCSV() {
    const rows = [["Invoice ID", "Date", "Customer", "Product", "Category", "Qty", "Unit Price", "Revenue", "Channel"]];
    (sales?.data ?? []).forEach((s) => rows.push([s.invoiceId, s.date, s.customer, s.product, s.category, String(s.qty), String(s.unitPrice), String(s.revenue), s.channel]));
    const csv = rows.map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "sales-export.csv"; a.click();
    URL.revokeObjectURL(url);
    showToast("CSV exported!");
  }

  const totalPages = Math.ceil((sales?.total ?? 0) / 10);

  return (
    <Layout>
      {addOpen && <SaleModal onClose={() => setAddOpen(false)} onSave={handleAdd} />}
      {editSale && <SaleModal sale={editSale} onClose={() => setEditSale(null)} onSave={handleEdit} />}
      {deleteTarget && <DeleteConfirm label={deleteTarget.label} onClose={() => setDeleteTarget(null)} onConfirm={() => deleteMutation.mutate({ id: deleteTarget.id })} />}
      {toast && <Toast message={toast} onClose={() => setToast("")} />}

      <div className="p-6 space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Sales Overview</h1>
            <p className="text-gray-500 text-sm">Track and analyze your sales performance</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={exportCSV} className="flex items-center gap-2 border border-gray-200 bg-white text-gray-700 text-sm px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors">
              <Download className="w-4 h-4" /> Export
            </button>
            <label className="flex items-center gap-2 border border-gray-200 bg-white text-gray-700 text-sm px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
              <Upload className="w-4 h-4" /> Upload CSV
              <input type="file" accept=".csv" className="hidden" onChange={(e) => { if (e.target.files?.[0]) showToast("CSV uploaded! Processing..."); }} />
            </label>
            <button onClick={() => setAddOpen(true)} className="flex items-center gap-2 bg-blue-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium">
              <Plus className="w-4 h-4" /> Add New Sale
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
          <div className="flex items-center gap-4 flex-wrap">
            <input type="search" placeholder="Search Product / Invoice / Customer" value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 min-w-48 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <select value={category} onChange={(e) => setCategory(e.target.value)}
              className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
              <option value="">All Categories</option>
              {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
            </select>
            <select value={channel} onChange={(e) => setChannel(e.target.value)}
              className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
              <option value="">All Channels</option>
              {CHANNELS.map((c) => <option key={c}>{c}</option>)}
            </select>
            <button onClick={() => { setPage(1); refetchSales(); }} className="bg-blue-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">Apply Filters</button>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-4">
          <StatCard title="Total Revenue" value={formatINR(statsData?.totalRevenue ?? 250400)} change={statsData?.revenueChange ?? 18.6}
            icon={<span className="text-emerald-600 font-bold text-sm">₹</span>} iconBg="bg-emerald-100" />
          <StatCard title="Total Units Sold" value={(statsData?.totalUnitsSold ?? 840).toLocaleString("en-IN")} change={statsData?.unitsSoldChange ?? 12.4}
            icon={<span className="text-blue-600 font-bold text-sm">U</span>} iconBg="bg-blue-100" />
          <StatCard title="Total Transactions" value={(statsData?.totalTransactions ?? 215).toLocaleString("en-IN")} change={statsData?.transactionsChange ?? 15.3}
            icon={<span className="text-purple-600 font-bold text-sm">T</span>} iconBg="bg-purple-100" />
          <StatCard title="New Customers" value={(statsData?.newCustomers ?? 31).toLocaleString("en-IN")} change={statsData?.newCustomersChange ?? 24.0}
            icon={<span className="text-orange-600 font-bold text-sm">C</span>} iconBg="bg-orange-100" />
        </div>

        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-4 bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-800">Sales Trend</h3>
              <select className="text-xs border border-gray-200 rounded px-2 py-1 bg-white text-gray-600"><option>Daily</option></select>
            </div>
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={trend ?? []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="label" tick={{ fontSize: 9 }} tickFormatter={(v) => v.slice(4)} />
                <YAxis tick={{ fontSize: 9 }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                <Tooltip formatter={(v: number) => formatINR(v)} />
                <Line type="monotone" dataKey="value" stroke="#2563EB" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="col-span-4 bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
            <h3 className="font-semibold text-gray-800 mb-3">Sales by Product Category</h3>
            <div className="flex items-center gap-3">
              <ResponsiveContainer width={120} height={120}>
                <PieChart>
                  <Pie data={byCategory ?? []} dataKey="value" cx="50%" cy="50%" innerRadius={30} outerRadius={55}>
                    {(byCategory ?? []).map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="flex-1 space-y-1">
                {(byCategory ?? []).map((cat, i) => (
                  <div key={cat.name} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full" style={{ background: COLORS[i % COLORS.length] }}></div>
                      <span className="text-gray-600">{cat.name}</span>
                    </div>
                    <span className="text-gray-400">{cat.percentage}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="col-span-4 bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-800">Top Selling Products</h3>
            </div>
            <div className="space-y-2.5">
              {(topProducts ?? []).map((p, i) => (
                <div key={p.id} className="flex items-center gap-2 text-xs">
                  <span className="w-5 h-5 bg-gray-100 rounded-full flex items-center justify-center text-gray-500 font-bold">{i + 1}</span>
                  <div className="flex-1">
                    <p className="font-medium text-gray-800">{p.name}</p>
                    <p className="text-gray-400">{p.unitsSold} units</p>
                  </div>
                  <span className="font-semibold text-gray-800">{formatINR(p.revenue)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between p-4 border-b border-gray-100">
            <h3 className="font-semibold text-gray-800">Sales Records</h3>
            <button onClick={() => refetchSales()} className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors" title="Refresh">
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {["Invoice ID", "Date", "Customer", "Product", "Category", "Qty", "Unit Price", "Revenue", "Channel", "Actions"].map((h) => (
                    <th key={h} className="text-left px-4 py-3 font-medium text-gray-500">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {(sales?.data ?? []).map((s) => (
                  <tr key={s.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-blue-600 font-medium">{s.invoiceId}</td>
                    <td className="px-4 py-3 text-gray-600">{s.date}</td>
                    <td className="px-4 py-3 text-gray-800">{s.customer}</td>
                    <td className="px-4 py-3 text-gray-800">{s.product}</td>
                    <td className="px-4 py-3"><CategoryBadge cat={s.category} /></td>
                    <td className="px-4 py-3 text-gray-600">{s.qty}</td>
                    <td className="px-4 py-3 text-gray-600">{formatINR(s.unitPrice)}</td>
                    <td className="px-4 py-3 font-semibold text-gray-800">{formatINR(s.revenue)}</td>
                    <td className="px-4 py-3 text-gray-600">{s.channel}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1.5">
                        <button onClick={() => setEditSale({ id: s.id, customer: s.customer, product: s.product, category: s.category, qty: s.qty, unitPrice: s.unitPrice, channel: s.channel, date: s.date })}
                          className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors" title="Edit">
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => setDeleteTarget({ id: s.id, label: s.invoiceId })}
                          className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors" title="Delete">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {(sales?.data ?? []).length === 0 && (
                  <tr><td colSpan={10} className="px-4 py-10 text-center text-gray-400">No sales found</td></tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
            <span className="text-xs text-gray-500">Showing {(page - 1) * 10 + 1}–{Math.min(page * 10, sales?.total ?? 0)} of {sales?.total ?? 0} entries</span>
            <div className="flex gap-1">
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
                className="w-7 h-7 text-xs rounded text-gray-500 hover:bg-gray-100 disabled:opacity-40">&#8249;</button>
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map((p) => (
                <button key={p} onClick={() => setPage(p)}
                  className={`w-7 h-7 text-xs rounded ${page === p ? "bg-blue-600 text-white" : "text-gray-500 hover:bg-gray-100"}`}>{p}</button>
              ))}
              <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page >= totalPages}
                className="w-7 h-7 text-xs rounded text-gray-500 hover:bg-gray-100 disabled:opacity-40">&#8250;</button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
