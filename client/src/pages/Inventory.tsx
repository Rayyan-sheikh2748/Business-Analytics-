import { useState } from "react";
import { Download, Upload, Plus, Pencil, Trash2, RefreshCw, AlertTriangle, Package, X, Save } from "lucide-react";
import { LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import Layout from "@/components/Layout";
import PageShell from "@/components/PageShell";
import PageHero from "@/components/PageHero";
import StatCard from "@/components/StatCard";
import { formatINR } from "@/lib/format";
import {
  useGetInventoryStats, useGetInventory, useGetInventoryStockStatus,
  useGetInventoryLowStockAlerts, useGetInventoryRecentMovements,
  useGetInventoryTrend, useGetInventoryByCategory,
  useDeleteInventoryItem, useCreateInventoryItem, useUpdateInventoryItem,
  getGetInventoryQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";

const COLORS = ["#a0aecd", "#000000", "#64748b", "#94a3b8"];
const CATEGORIES = ["Electronics", "Accessories", "Wearables", "Home Appliances"];
const WAREHOUSES = ["Main Warehouse", "East Warehouse", "West Warehouse"];

function StockBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    "In Stock": "bg-emerald-100 text-emerald-700",
    "Low Stock": "bg-amber-100 text-amber-700",
    "Out of Stock": "bg-red-100 text-red-700",
  };
  return <span className={`px-2 py-0.5 rounded-full text-[11px] font-medium ${map[status] ?? "bg-gray-100 text-gray-600"}`}>{status}</span>;
}

function CategoryBadge({ cat }: { cat: string }) {
  const map: Record<string, string> = {
    Electronics: "bg-blue-100 text-blue-700",
    Accessories: "bg-amber-100 text-amber-700",
    Wearables: "bg-purple-100 text-purple-700",
    "Home Appliances": "bg-orange-100 text-orange-700",
  };
  return <span className={`px-2 py-0.5 rounded-full text-[11px] font-medium ${map[cat] ?? "bg-gray-100 text-gray-600"}`}>{cat}</span>;
}

type ProductForm = { product: string; sku: string; category: string; warehouse: string; stock: string; threshold: string; unitPrice: string };
const EMPTY_FORM: ProductForm = { product: "", sku: "", category: "Electronics", warehouse: "Main Warehouse", stock: "0", threshold: "10", unitPrice: "0" };

function ProductModal({ item, onClose, onSave }: {
  item?: { id: number; product: string; sku: string; category: string; warehouse: string; stock: number; threshold: number; unitCost: number } | null;
  onClose: () => void;
  onSave: (data: ProductForm) => void;
}) {
  const [form, setForm] = useState<ProductForm>(item ? {
    product: item.product, sku: item.sku, category: item.category,
    warehouse: item.warehouse, stock: String(item.stock), threshold: String(item.threshold), unitPrice: String(item.unitCost ?? 0),
  } : EMPTY_FORM);
  const [errors, setErrors] = useState<Partial<ProductForm>>({});

  function validate() {
    const e: Partial<ProductForm> = {};
    if (!form.product.trim()) e.product = "Required";
    if (!form.sku.trim()) e.sku = "Required";
    if (!form.unitPrice || isNaN(Number(form.unitPrice))) e.unitPrice = "Enter valid price";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  const set = (k: keyof ProductForm) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((p) => ({ ...p, [k]: e.target.value }));

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900">{item ? "Edit Product" : "Add New Product"}</h2>
          <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Product Name</label>
              <input value={form.product} onChange={set("product")} placeholder="e.g. Wireless Headphones"
                className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.product ? "border-red-400" : "border-gray-200"}`} />
              {errors.product && <p className="text-red-500 text-[11px] mt-0.5">{errors.product}</p>}
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">SKU</label>
              <input value={form.sku} onChange={set("sku")} placeholder="e.g. WH-1001"
                className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.sku ? "border-red-400" : "border-gray-200"}`} />
              {errors.sku && <p className="text-red-500 text-[11px] mt-0.5">{errors.sku}</p>}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Category</label>
              <select value={form.category} onChange={set("category")} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Warehouse</label>
              <select value={form.warehouse} onChange={set("warehouse")} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                {WAREHOUSES.map((w) => <option key={w}>{w}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Stock Units</label>
              <input type="number" min="0" value={form.stock} onChange={set("stock")}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Low Stock Threshold</label>
              <input type="number" min="0" value={form.threshold} onChange={set("threshold")}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Unit Price (₹)</label>
              <input type="number" min="0" value={form.unitPrice} onChange={set("unitPrice")} placeholder="e.g. 2499"
                className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.unitPrice ? "border-red-400" : "border-gray-200"}`} />
              {errors.unitPrice && <p className="text-red-500 text-[11px] mt-0.5">{errors.unitPrice}</p>}
            </div>
          </div>
          {form.stock && form.unitPrice && (
            <div className="bg-blue-50 rounded-lg px-4 py-2 text-sm text-blue-700 font-medium">
              Stock Value: {formatINR(Number(form.stock) * Number(form.unitPrice))}
            </div>
          )}
        </div>
        <div className="flex gap-3 px-6 pb-6">
          <button onClick={onClose} className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 hover:bg-gray-50">Cancel</button>
          <button onClick={() => { if (validate()) onSave(form); }}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-[#000000] text-white rounded-xl text-sm font-medium hover:bg-[#1a1a1a]">
            <Save className="w-4 h-4" />{item ? "Save Changes" : "Add Product"}
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
        <h3 className="text-base font-bold text-gray-900 mb-1">Delete Product?</h3>
        <p className="text-sm text-gray-500 mb-5">Delete <span className="font-medium text-gray-700">{label}</span>? This cannot be undone.</p>
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
    <div className="fixed bottom-6 right-6 bg-gray-900 text-white text-sm px-4 py-3 rounded-xl shadow-xl flex items-center gap-3 z-50">
      <span className="text-emerald-400">&#10003;</span> {message}
      <button onClick={onClose} className="ml-2 text-gray-400 hover:text-white"><X className="w-3.5 h-3.5" /></button>
    </div>
  );
}

export default function Inventory() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [warehouse, setWarehouse] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const [editItem, setEditItem] = useState<null | { id: number; product: string; sku: string; category: string; warehouse: string; stock: number; threshold: number; unitCost: number }>(null);
  const [deleteTarget, setDeleteTarget] = useState<null | { id: number; label: string }>(null);
  const [toast, setToast] = useState("");
  const queryClient = useQueryClient();

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(""), 3000); };
  const refetch = () => queryClient.invalidateQueries({ queryKey: getGetInventoryQueryKey() });

  const { data: stats } = useGetInventoryStats();
  const { data: inventory, refetch: refetchInv } = useGetInventory({ page, limit: 10, search: search || undefined, category: category || undefined, warehouse: warehouse || undefined });
  const { data: stockStatus } = useGetInventoryStockStatus();
  const { data: lowStock } = useGetInventoryLowStockAlerts();
  const { data: movements } = useGetInventoryRecentMovements();
  const { data: trend } = useGetInventoryTrend();
  const { data: byCategory } = useGetInventoryByCategory();

  const createMutation = useCreateInventoryItem({ mutation: { onSuccess: () => { refetch(); setAddOpen(false); showToast("Product added successfully!"); } } });
  const updateMutation = useUpdateInventoryItem({ mutation: { onSuccess: () => { refetch(); setEditItem(null); showToast("Product updated successfully!"); } } });
  const deleteMutation = useDeleteInventoryItem({ mutation: { onSuccess: () => { refetch(); setDeleteTarget(null); showToast("Product deleted."); } } });

  function handleAdd(form: ProductForm) {
    createMutation.mutate({ data: {
      product: form.product, sku: form.sku, category: form.category,
      warehouse: form.warehouse, stock: Number(form.stock), threshold: Number(form.threshold), unitCost: Number(form.unitPrice),
    }});
  }

  function handleEdit(form: ProductForm) {
    if (!editItem) return;
    updateMutation.mutate({ id: editItem.id, data: {
      product: form.product, category: form.category,
      warehouse: form.warehouse, stock: Number(form.stock), threshold: Number(form.threshold), unitCost: Number(form.unitPrice),
    }});
  }

  function exportCSV() {
    const rows = [["Product", "SKU", "Category", "Warehouse", "Stock", "Threshold", "Status", "Stock Value"]];
    (inventory?.data ?? []).forEach((i) => rows.push([i.product, i.sku, i.category, i.warehouse, String(i.stock), String(i.threshold), i.status, String(i.stockValue)]));
    const csv = rows.map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "inventory-export.csv"; a.click();
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
      const res = await fetch("http://localhost:5000/api/inventory/upload", {
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

  const totalPages = Math.ceil((inventory?.total ?? 0) / 10);

  return (
    <Layout>
      {addOpen && <ProductModal onClose={() => setAddOpen(false)} onSave={handleAdd} />}
      {editItem && <ProductModal item={editItem} onClose={() => setEditItem(null)} onSave={handleEdit} />}
      {deleteTarget && <DeleteConfirm label={deleteTarget.label} onClose={() => setDeleteTarget(null)} onConfirm={() => deleteMutation.mutate({ id: deleteTarget.id })} />}
      {toast && <Toast message={toast} onClose={() => setToast("")} />}

      <PageShell>
        <PageHero
          badge="Stock"
          title="Inventory Overview"
          subtitle="Track stock levels, manage products, and respond to low-stock alerts in real time."
          actions={
            <>
              <button type="button" onClick={exportCSV} className="btn-secondary flex items-center gap-2"><Download className="w-4 h-4" /> Export</button>
              <label className="btn-secondary flex items-center gap-2 cursor-pointer">
                <Upload className="w-4 h-4" /> Import CSV
                <input type="file" accept=".csv" className="hidden" onChange={handleFileUpload} />
              </label>
              <button type="button" onClick={() => setAddOpen(true)} className="btn-primary flex items-center gap-2"><Plus className="w-4 h-4" /> Add Product</button>
            </>
          }
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4">
          <StatCard title="Total Products" value={(stats?.totalProducts ?? 0).toLocaleString("en-IN")}
            icon={<Package className="w-5 h-5 text-blue-600" />} iconBg="bg-blue-100" />
          <StatCard title="Total Stock (Units)" value={(stats?.totalStock ?? 0).toLocaleString("en-IN")}
            icon={<span className="text-emerald-600 font-bold text-sm">S</span>} iconBg="bg-emerald-100" />
          <StatCard title="Low Stock Items" value={(stats?.lowStockItems ?? 0).toString()}
            icon={<AlertTriangle className="w-5 h-5 text-amber-500" />} iconBg="bg-amber-100" />
          <StatCard title="Out of Stock" value={(stats?.outOfStockItems ?? 0).toString()}
            icon={<span className="text-red-500 font-bold text-sm">!</span>} iconBg="bg-red-100" />
          <StatCard title="Inventory Value" value={formatINR(stats?.inventoryValue ?? 0)}
            icon={<span className="text-purple-600 font-bold text-sm">₹</span>} iconBg="bg-purple-100" />
        </div>

        <div className="glass-panel rounded-2xl p-4 shadow-sm">
          <div className="flex items-center gap-3 flex-wrap">
            <input type="search" placeholder="Search Product / SKU" value={search} onChange={(e) => setSearch(e.target.value)}
              className="flex-1 min-w-48 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <select value={category} onChange={(e) => setCategory(e.target.value)}
              className="px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">All Categories</option>
              {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
            </select>
            <select value={warehouse} onChange={(e) => setWarehouse(e.target.value)}
              className="px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">All Warehouses</option>
              {WAREHOUSES.map((w) => <option key={w}>{w}</option>)}
            </select>
            <button type="button" onClick={() => { setPage(1); refetchInv(); }} className="btn-primary">Apply Filters</button>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-8 glass-panel rounded-2xl shadow-sm">
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <h3 className="font-semibold text-gray-800">Inventory List</h3>
              <button onClick={() => refetchInv()} className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded" title="Refresh"><RefreshCw className="w-4 h-4" /></button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    {["Product", "SKU", "Category", "Warehouse", "Stock", "Threshold", "Status", "Stock Value", "Actions"].map((h) => (
                      <th key={h} className="text-left px-4 py-3 font-medium text-gray-500">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {(inventory?.data ?? []).map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-gray-800">{item.product}</td>
                      <td className="px-4 py-3 text-gray-500">{item.sku}</td>
                      <td className="px-4 py-3"><CategoryBadge cat={item.category} /></td>
                      <td className="px-4 py-3 text-gray-600">{item.warehouse}</td>
                      <td className={`px-4 py-3 font-semibold ${item.stock === 0 ? "text-red-500" : item.stock <= item.threshold ? "text-amber-500" : "text-emerald-600"}`}>{item.stock}</td>
                      <td className="px-4 py-3 text-gray-500">{item.threshold}</td>
                      <td className="px-4 py-3"><StockBadge status={item.status} /></td>
                      <td className="px-4 py-3 font-medium text-gray-800">{formatINR(item.stockValue)}</td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1.5">
                          <button onClick={() => setEditItem({ id: item.id, product: item.product, sku: item.sku, category: item.category, warehouse: item.warehouse, stock: item.stock, threshold: item.threshold, unitCost: (item as unknown as { unitCost: number }).unitCost ?? 0 })}
                            className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded" title="Edit"><Pencil className="w-3.5 h-3.5" /></button>
                          <button onClick={() => setDeleteTarget({ id: item.id, label: item.product })}
                            className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded" title="Delete"><Trash2 className="w-3.5 h-3.5" /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {(inventory?.data ?? []).length === 0 && (
                    <tr><td colSpan={9} className="px-4 py-10 text-center text-gray-400">No products found</td></tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
              <span className="text-xs text-gray-500">Showing {(page - 1) * 10 + 1}–{Math.min(page * 10, inventory?.total ?? 0)} of {inventory?.total ?? 0} entries</span>
              <div className="flex gap-1">
                <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="w-7 h-7 text-xs rounded text-gray-500 hover:bg-gray-100 disabled:opacity-40">&#8249;</button>
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map((p) => (
                  <button key={p} onClick={() => setPage(p)} className={`w-7 h-7 text-xs rounded-xl ${page === p ? "bg-[#000000] text-white" : "text-[#64748b] hover:bg-[#f4f5f9]"}`}>{p}</button>
                ))}
                <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page >= totalPages} className="w-7 h-7 text-xs rounded text-gray-500 hover:bg-gray-100 disabled:opacity-40">&#8250;</button>
              </div>
            </div>
          </div>

          <div className="col-span-4 space-y-4">
            <div className="glass-panel rounded-2xl p-4 shadow-sm">
              <h3 className="font-semibold text-gray-800 mb-3">Stock Status Summary</h3>
              <div className="flex items-center gap-3">
                <ResponsiveContainer width={100} height={100}>
                  <PieChart>
                    <Pie data={stockStatus ?? []} dataKey="count" cx="50%" cy="50%" innerRadius={25} outerRadius={45}>
                      {(stockStatus ?? []).map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex-1 space-y-1.5">
                  {(stockStatus ?? []).map((s, i) => (
                    <div key={s.status} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full" style={{ background: COLORS[i % COLORS.length] }}></div>
                        <span className="text-gray-600">{s.status}</span>
                      </div>
                      <span className="text-gray-500">{s.count} ({s.percentage}%)</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="glass-panel rounded-2xl p-4 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-gray-800">Low Stock Alerts</h3>
                <button className="text-blue-600 text-xs hover:underline" onClick={() => setCategory("")}>View All</button>
              </div>
              <div className="space-y-2">
                {(lowStock ?? []).map((item) => (
                  <div key={item.id} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-amber-100 rounded flex items-center justify-center">
                        <AlertTriangle className="w-3 h-3 text-amber-600" />
                      </div>
                      <span className="text-gray-700">{item.product}</span>
                    </div>
                    <span className={`font-medium ${item.stock === 0 ? "text-red-500" : "text-amber-600"}`}>{item.stock} units left</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="glass-panel rounded-2xl p-4 shadow-sm">
              <h3 className="font-semibold text-gray-800 mb-3">Recent Stock Movements</h3>
              <div className="space-y-2">
                {(movements ?? []).map((m) => (
                  <div key={m.id} className="flex items-center justify-between text-xs">
                    <div>
                      <p className="font-medium text-gray-800">{m.product}</p>
                      <p className="text-gray-400">{m.warehouse} · {m.date}</p>
                    </div>
                    <span className={`font-semibold ${m.change > 0 ? "text-emerald-600" : "text-red-500"}`}>
                      {m.change > 0 ? "+" : ""}{m.change}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="glass-panel rounded-2xl p-4 shadow-sm">
            <h3 className="font-semibold text-gray-800 mb-3">Stock Trend</h3>
            <ResponsiveContainer width="100%" height={160}>
              <LineChart data={trend ?? []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="label" tick={{ fontSize: 9 }} />
                <YAxis tick={{ fontSize: 9 }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                <Tooltip />
                <Line type="monotone" dataKey="value" stroke="#4F46E5" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="glass-panel rounded-2xl p-4 shadow-sm">
            <h3 className="font-semibold text-gray-800 mb-3">Top Categories by Stock Value</h3>
            <div className="space-y-3 mt-2">
              {(byCategory ?? []).map((cat, i) => (
                <div key={cat.name} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-700">{cat.name}</span>
                    <span className="font-semibold text-gray-800">{formatINR(cat.value)}</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${cat.percentage}%`, background: COLORS[i % COLORS.length] }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </PageShell>
    </Layout>
  );
}
