import { useState } from "react";
import { Download, Upload, Plus, Pencil, Trash2, RefreshCw, X, Save } from "lucide-react";
import { LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import Layout from "@/components/Layout";
import PageShell from "@/components/PageShell";
import PageHero from "@/components/PageHero";
import StatCard from "@/components/StatCard";
import GlassCard from "@/components/GlassCard";
import PremiumModal from "@/components/PremiumModal";
import FilterBar from "@/components/ui-premium/FilterBar";
import DataTable from "@/components/ui-premium/DataTable";
import DeleteConfirmModal from "@/components/ui-premium/DeleteConfirmModal";
import PremiumToast from "@/components/ui-premium/PremiumToast";
import EmptyState from "@/components/ui-premium/EmptyState";
import { IndianRupee, ShoppingCart, Users, Receipt } from "lucide-react";
import { CHART_COLORS, CHART_PRIMARY, chartTooltipStyle, chartGridStroke, chartTickFill } from "@/components/ui-premium/chartStyles";
import { formatINR } from "@/lib/format";
import {
  useGetSalesStats, useGetSalesTrend, useGetSalesByCategory,
  useGetSalesTopProducts, useGetSales, useDeleteSale, useCreateSale, useUpdateSale,
  getGetSalesQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";

const COLORS = CHART_COLORS;
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
    <PremiumModal open onClose={onClose} className="max-w-lg">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#eef0f6]">
          <h2 className="text-lg font-semibold text-[#0a0a0a]">{sale ? "Edit Sale" : "Add New Sale"}</h2>
          <button type="button" onClick={onClose} className="p-1.5 text-[#94a3b8] hover:text-[#0a0a0a] rounded-lg hover:bg-[#f4f5f9]"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: "Customer Name", key: "customer" as keyof SaleForm, placeholder: "e.g. Rahul Sharma" },
              { label: "Product", key: "product" as keyof SaleForm, placeholder: "e.g. Wireless Headphones" },
            ].map(({ label, key, placeholder }) => (
              <div key={key}>
                <label className="block text-xs font-medium text-[#475569] mb-1">{label}</label>
                <input value={form[key]} onChange={set(key)} placeholder={placeholder}
                  className={`input-premium w-full ${errors[key] ? "border-red-400" : ""}`} />
                {errors[key] && <p className="text-red-500 text-[11px] mt-0.5">{errors[key]}</p>}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-[#475569] mb-1">Category</label>
              <select value={form.category} onChange={set("category")} className="select-premium w-full">
                {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-[#475569] mb-1">Channel</label>
              <select value={form.channel} onChange={set("channel")} className="select-premium w-full">
                {CHANNELS.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-[#475569] mb-1">Quantity</label>
              <input type="number" min="1" value={form.qty} onChange={set("qty")}
                className={`input-premium w-full ${errors.qty ? "border-red-400" : ""}`} />
              {errors.qty && <p className="text-red-500 text-[11px] mt-0.5">{errors.qty}</p>}
            </div>
            <div>
              <label className="block text-xs font-medium text-[#475569] mb-1">Unit Price (₹)</label>
              <input type="number" min="0" value={form.unitPrice} onChange={set("unitPrice")} placeholder="e.g. 2499"
                className={`input-premium w-full ${errors.unitPrice ? "border-red-400" : ""}`} />
              {errors.unitPrice && <p className="text-red-500 text-[11px] mt-0.5">{errors.unitPrice}</p>}
            </div>
            <div>
              <label className="block text-xs font-medium text-[#475569] mb-1">Date</label>
              <input type="date" value={form.date} onChange={set("date")} className="input-premium w-full" />
            </div>
          </div>
          {form.unitPrice && form.qty && (
            <div className="bg-[#a0aecd]/15 border border-[#a0aecd]/30 rounded-xl px-4 py-2 text-sm text-[#0a0a0a] font-medium">
              Total Revenue: {formatINR(Number(form.unitPrice) * Number(form.qty))}
            </div>
          )}
        </div>
        <div className="flex gap-3 px-6 pb-6">
          <button type="button" onClick={onClose} className="flex-1 btn-secondary">Cancel</button>
          <button type="button" onClick={submit} className="flex-1 btn-primary flex items-center justify-center gap-2">
            <Save className="w-4 h-4" />{sale ? "Save Changes" : "Add Sale"}
          </button>
        </div>
    </PremiumModal>
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
      channel: form.channel, date: form.date,
    }});
  }

  function handleEdit(form: SaleForm) {
    if (!editSale) return;
    updateMutation.mutate({ id: editSale.id, data: {
      customer: form.customer, product: form.product, category: form.category,
      qty: Number(form.qty), unitPrice: Number(form.unitPrice),
      channel: form.channel,
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

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    
    showToast("Uploading CSV...");
    const formData = new FormData();
    formData.append("file", file);

    try {
      const token = localStorage.getItem("token");
      const apiUrl = import.meta.env.VITE_API_URL || "";
      const res = await fetch(`${apiUrl}/api/sales/upload`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");
      
      if (data.stats) {
        showToast(`Processed ${data.stats.totalRows} rows: ${data.stats.insertedRows} inserted, ${data.stats.updatedRows} updated, ${data.stats.skippedRows} skipped, ${data.stats.failedRows} failed.`);
      } else {
        showToast(`Imported ${data.insertedCount ?? 0} records successfully!`);
      }
      queryClient.invalidateQueries();
    } catch (err: any) {
      showToast(`Error: ${err.message}`);
    }
    
    e.target.value = "";
  }

  const totalPages = Math.ceil((sales?.total ?? 0) / 10);

  return (
    <Layout>
      {addOpen && <SaleModal onClose={() => setAddOpen(false)} onSave={handleAdd} />}
      {editSale && <SaleModal sale={editSale} onClose={() => setEditSale(null)} onSave={handleEdit} />}
      <DeleteConfirmModal
        open={!!deleteTarget}
        title="Delete Sale?"
        description={<>Are you sure you want to delete <span className="font-medium text-[#0a0a0a]">{deleteTarget?.label}</span>? This cannot be undone.</>}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => deleteTarget && deleteMutation.mutate({ id: deleteTarget.id })}
      />
      {toast && <PremiumToast message={toast} onClose={() => setToast("")} />}

      <PageShell>
        <PageHero
          badge="Revenue"
          title="Sales Overview"
          subtitle="Track and analyze your sales performance with live trends and transaction records."
          actions={
            <>
              <button type="button" onClick={exportCSV} className="btn-secondary flex items-center gap-2">
                <Download className="w-4 h-4" /> Export
              </button>
              <label className="btn-secondary flex items-center gap-2 cursor-pointer">
                <Upload className="w-4 h-4" /> Upload CSV
                <input type="file" accept=".csv" className="hidden" onChange={handleFileUpload} />
              </label>
              <button type="button" onClick={() => setAddOpen(true)} className="btn-primary flex items-center gap-2">
                <Plus className="w-4 h-4" /> Add New Sale
              </button>
            </>
          }
        />

        <FilterBar>
            <input type="search" placeholder="Search Product / Invoice / Customer" value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 min-w-48 input-premium" />
            <select value={category} onChange={(e) => setCategory(e.target.value)} className="select-premium">
              <option value="">All Categories</option>
              {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
            </select>
            <select value={channel} onChange={(e) => setChannel(e.target.value)} className="select-premium">
              <option value="">All Channels</option>
              {CHANNELS.map((c) => <option key={c}>{c}</option>)}
            </select>
            <button type="button" onClick={() => { setPage(1); refetchSales(); }} className="btn-primary">Apply Filters</button>
        </FilterBar>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <StatCard title="Total Revenue" value={formatINR(statsData?.totalRevenue ?? 0)} change={statsData?.revenueChange ?? 0} index={0}
            icon={<IndianRupee className="w-5 h-5 text-[#000000]" />} iconBg="bg-[#a0aecd]/30" />
          <StatCard title="Total Units Sold" value={(statsData?.totalUnitsSold ?? 0).toLocaleString("en-IN")} change={statsData?.unitsSoldChange ?? 0} index={1}
            icon={<ShoppingCart className="w-5 h-5 text-[#475569]" />} iconBg="bg-[#f1f3f8]" />
          <StatCard title="Total Transactions" value={(statsData?.totalTransactions ?? 0).toLocaleString("en-IN")} change={statsData?.transactionsChange ?? 0} index={2}
            icon={<Receipt className="w-5 h-5 text-[#000000]" />} iconBg="bg-[#a0aecd]/20" />
          <StatCard title="New Customers" value={(statsData?.newCustomers ?? 0).toLocaleString("en-IN")} change={statsData?.newCustomersChange ?? 0} index={3}
            icon={<Users className="w-5 h-5 text-[#64748b]" />} iconBg="bg-[#f1f3f8]" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <GlassCard className="p-4 sm:p-5" delay={0.08}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-[#0a0a0a]">Sales Trend</h3>
              <select className="select-premium text-xs py-1.5"><option>Daily</option></select>
            </div>
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={trend ?? []}>
                <CartesianGrid strokeDasharray="3 3" stroke={chartGridStroke} />
                <XAxis dataKey="label" tick={{ fontSize: 9, fill: chartTickFill }} tickFormatter={(v) => v.slice(4)} />
                <YAxis tick={{ fontSize: 9, fill: chartTickFill }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                <Tooltip formatter={(v: number) => formatINR(v)} contentStyle={chartTooltipStyle} />
                <Line type="monotone" dataKey="value" stroke={CHART_PRIMARY} strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </GlassCard>

          <GlassCard className="p-4 sm:p-5" delay={0.1}>
            <h3 className="font-semibold text-[#0a0a0a] mb-3">Sales by Product Category</h3>
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
                      <span className="text-[#64748b]">{cat.name}</span>
                    </div>
                    <span className="text-[#94a3b8]">{cat.percentage}%</span>
                  </div>
                ))}
              </div>
            </div>
          </GlassCard>

          <GlassCard className="p-4 sm:p-5" delay={0.12}>
            <h3 className="font-semibold text-[#0a0a0a] mb-3">Top Selling Products</h3>
            <div className="space-y-2.5">
              {(topProducts ?? []).map((p, i) => (
                <div key={p.id} className="flex items-center gap-2 text-xs p-2 rounded-xl hover:bg-[#f4f5f9]/80 transition-colors">
                  <span className="w-5 h-5 bg-[#f4f5f9] rounded-full flex items-center justify-center text-[#64748b] font-bold text-[10px]">{i + 1}</span>
                  <div className="flex-1">
                    <p className="font-medium text-[#0a0a0a]">{p.name}</p>
                    <p className="text-[#94a3b8]">{p.unitsSold} units</p>
                  </div>
                  <span className="font-semibold text-[#0a0a0a]">{formatINR(p.revenue)}</span>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>

        <DataTable
          title="Sales Records"
          onRefresh={() => refetchSales()}
          headers={["Invoice ID", "Date", "Customer", "Product", "Category", "Qty", "Unit Price", "Revenue", "Channel", "Actions"]}
          delay={0.14}
          footer={
            <div className="flex items-center justify-between px-4 py-3">
              <span className="text-xs text-[#64748b]">Showing {(page - 1) * 10 + 1}–{Math.min(page * 10, sales?.total ?? 0)} of {sales?.total ?? 0} entries</span>
              <div className="flex gap-1">
                <button type="button" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
                  className="w-7 h-7 text-xs rounded-xl text-[#64748b] hover:bg-[#f4f5f9] disabled:opacity-40">&#8249;</button>
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map((p) => (
                  <button key={p} type="button" onClick={() => setPage(p)}
                    className={`w-7 h-7 text-xs rounded-xl ${page === p ? "bg-[#000000] text-white" : "text-[#64748b] hover:bg-[#f4f5f9]"}`}>{p}</button>
                ))}
                <button type="button" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page >= totalPages}
                  className="w-7 h-7 text-xs rounded-xl text-[#64748b] hover:bg-[#f4f5f9] disabled:opacity-40">&#8250;</button>
              </div>
            </div>
          }
        >
                {(sales?.data ?? []).map((s) => (
                  <tr key={s.id} className="table-row-hover">
                    <td className="px-4 py-3 text-[#0a0a0a] font-medium">{s.invoiceId}</td>
                    <td className="px-4 py-3 text-[#64748b]">{s.date}</td>
                    <td className="px-4 py-3 text-[#475569]">{s.customer}</td>
                    <td className="px-4 py-3 text-[#475569]">{s.product}</td>
                    <td className="px-4 py-3"><CategoryBadge cat={s.category} /></td>
                    <td className="px-4 py-3 text-[#64748b]">{s.qty}</td>
                    <td className="px-4 py-3 text-[#64748b]">{formatINR(s.unitPrice)}</td>
                    <td className="px-4 py-3 font-semibold text-[#0a0a0a]">{formatINR(s.revenue)}</td>
                    <td className="px-4 py-3 text-[#64748b]">{s.channel}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1.5">
                        <button type="button" onClick={() => setEditSale({ id: s.id, customer: s.customer, product: s.product, category: s.category, qty: s.qty, unitPrice: s.unitPrice, channel: s.channel, date: s.date })}
                          className="p-1.5 text-[#94a3b8] hover:text-[#0a0a0a] hover:bg-[#f4f5f9] rounded-lg transition-colors" title="Edit">
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button type="button" onClick={() => setDeleteTarget({ id: s.id, label: s.invoiceId })}
                          className="p-1.5 text-[#94a3b8] hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Delete">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {(sales?.data ?? []).length === 0 && (
                  <tr><td colSpan={10}><EmptyState title="No sales found" /></td></tr>
                )}
        </DataTable>
      </PageShell>
    </Layout>
  );
}
