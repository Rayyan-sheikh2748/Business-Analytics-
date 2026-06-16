import { useState } from "react";
import { Download, Plus, Pencil, Trash2, Search, X, Save, AlertTriangle } from "lucide-react";
import { LineChart, Line, PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import Layout from "@/components/Layout";
import PageShell from "@/components/PageShell";
import PageHero from "@/components/PageHero";
import StatCard from "@/components/StatCard";
import { formatINR } from "@/lib/format";
import {
  useGetCustomerStats, useGetCustomers, useGetCustomersBySegment,
  useGetCustomersTopByRevenue, useGetCustomersTrend, useGetCustomersByLocation,
  useDeleteCustomer, useCreateCustomer, useUpdateCustomer,
  getGetCustomersQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";

const COLORS = ["#a0aecd", "#000000", "#64748b", "#94a3b8"];
const SEGMENTS = ["Premium", "VIP", "Regular", "New"];

function SegmentBadge({ segment }: { segment: string }) {
  const map: Record<string, string> = {
    Premium: "bg-purple-100 text-purple-700",
    VIP: "bg-amber-100 text-amber-700",
    Regular: "bg-blue-100 text-blue-700",
    New: "bg-emerald-100 text-emerald-700",
  };
  return <span className={`px-2 py-0.5 rounded-full text-[11px] font-medium ${map[segment] ?? "bg-gray-100 text-gray-600"}`}>{segment}</span>;
}

type CustomerForm = { name: string; email: string; phone: string; segment: string; location: string };
const EMPTY_FORM: CustomerForm = { name: "", email: "", phone: "", segment: "Regular", location: "Mumbai" };

function CustomerModal({ customer, onClose, onSave }: {
  customer?: { id: number; name: string; email: string; phone: string; segment: string; location?: string } | null;
  onClose: () => void;
  onSave: (data: CustomerForm) => void;
}) {
  const [form, setForm] = useState<CustomerForm>(customer ? {
    name: customer.name, email: customer.email, phone: customer.phone, segment: customer.segment, location: customer.location ?? "Mumbai",
  } : EMPTY_FORM);
  const [errors, setErrors] = useState<Partial<CustomerForm>>({});

  function validate() {
    const e: Partial<CustomerForm> = {};
    if (!form.name.trim()) e.name = "Required";
    if (!form.email.trim() || !form.email.includes("@")) e.email = "Enter valid email";
    if (!form.phone.trim()) e.phone = "Required";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  const set = (k: keyof CustomerForm) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((p) => ({ ...p, [k]: e.target.value }));

  const LOCATIONS = ["Mumbai", "Delhi", "Bengaluru", "Hyderabad", "Chennai", "Pune", "Kolkata", "Ahmedabad"];

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900">{customer ? "Edit Customer" : "Add New Customer"}</h2>
          <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Full Name</label>
            <input value={form.name} onChange={set("name")} placeholder="e.g. Rahul Sharma"
              className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.name ? "border-red-400" : "border-gray-200"}`} />
            {errors.name && <p className="text-red-500 text-[11px] mt-0.5">{errors.name}</p>}
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Email</label>
            <input type="email" value={form.email} onChange={set("email")} placeholder="rahul@example.com"
              className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.email ? "border-red-400" : "border-gray-200"}`} />
            {errors.email && <p className="text-red-500 text-[11px] mt-0.5">{errors.email}</p>}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Phone</label>
              <input value={form.phone} onChange={set("phone")} placeholder="+91 98765 43210"
                className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.phone ? "border-red-400" : "border-gray-200"}`} />
              {errors.phone && <p className="text-red-500 text-[11px] mt-0.5">{errors.phone}</p>}
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Segment</label>
              <select value={form.segment} onChange={set("segment")} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                {SEGMENTS.map((s) => <option key={s}>{s}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">City / Location</label>
            <select value={form.location} onChange={set("location")} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
              {LOCATIONS.map((l) => <option key={l}>{l}</option>)}
            </select>
          </div>
        </div>
        <div className="flex gap-3 px-6 pb-6">
          <button onClick={onClose} className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 hover:bg-gray-50">Cancel</button>
          <button onClick={() => { if (validate()) onSave(form); }}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">
            <Save className="w-4 h-4" />{customer ? "Save Changes" : "Add Customer"}
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
        <h3 className="text-base font-bold text-gray-900 mb-1">Remove Customer?</h3>
        <p className="text-sm text-gray-500 mb-5">Remove <span className="font-medium text-gray-700">{label}</span> from your customer list? This cannot be undone.</p>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 hover:bg-gray-50">Cancel</button>
          <button onClick={onConfirm} className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700">Remove</button>
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

export default function Customers() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [segment, setSegment] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const [editCustomer, setEditCustomer] = useState<null | { id: number; name: string; email: string; phone: string; segment: string; location?: string }>(null);
  const [deleteTarget, setDeleteTarget] = useState<null | { id: number; label: string }>(null);
  const [toast, setToast] = useState("");
  const queryClient = useQueryClient();

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(""), 3000); };
  const refetch = () => queryClient.invalidateQueries({ queryKey: getGetCustomersQueryKey() });

  const { data: stats } = useGetCustomerStats();
  const { data: customers, refetch: refetchCustomers } = useGetCustomers({ page, limit: 10, search: search || undefined, segment: segment || undefined });
  const { data: bySegment } = useGetCustomersBySegment();
  const { data: topByRevenue } = useGetCustomersTopByRevenue();
  const { data: trend } = useGetCustomersTrend();
  const { data: byLocation } = useGetCustomersByLocation();

  const createMutation = useCreateCustomer({ mutation: { onSuccess: () => { refetch(); setAddOpen(false); showToast("Customer added successfully!"); } } });
  const updateMutation = useUpdateCustomer({ mutation: { onSuccess: () => { refetch(); setEditCustomer(null); showToast("Customer updated!"); } } });
  const deleteMutation = useDeleteCustomer({ mutation: { onSuccess: () => { refetch(); setDeleteTarget(null); showToast("Customer removed."); } } });

  function handleAdd(form: CustomerForm) {
    createMutation.mutate({ data: { name: form.name, email: form.email, phone: form.phone, segment: form.segment, location: form.location } });
  }

  function handleEdit(form: CustomerForm) {
    if (!editCustomer) return;
    updateMutation.mutate({ id: editCustomer.id, data: { name: form.name, email: form.email, phone: form.phone, segment: form.segment, location: form.location } });
  }

  function exportCSV() {
    const rows = [["Name", "Email", "Phone", "Segment", "Total Orders", "Total Spent", "Join Date"]];
    (customers?.data ?? []).forEach((c) => rows.push([c.name, c.email, c.phone, c.segment, String(c.totalOrders), String(c.totalSpent), c.joinDate]));
    const csv = rows.map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "customers-export.csv"; a.click();
    URL.revokeObjectURL(url);
    showToast("Customers exported!");
  }

  const totalPages = Math.ceil((customers?.total ?? 0) / 10);

  return (
    <Layout>
      {addOpen && <CustomerModal onClose={() => setAddOpen(false)} onSave={handleAdd} />}
      {editCustomer && <CustomerModal customer={editCustomer} onClose={() => setEditCustomer(null)} onSave={handleEdit} />}
      {deleteTarget && <DeleteConfirm label={deleteTarget.label} onClose={() => setDeleteTarget(null)} onConfirm={() => deleteMutation.mutate({ id: deleteTarget.id })} />}
      {toast && <Toast message={toast} onClose={() => setToast("")} />}

      <PageShell>
        <PageHero
          badge="CRM"
          title="Customers"
          subtitle="Manage and analyze your customer base with segmentation and revenue insights."
          actions={
            <>
              <button type="button" onClick={exportCSV} className="btn-secondary flex items-center gap-2"><Download className="w-4 h-4" /> Export</button>
              <button type="button" onClick={() => setAddOpen(true)} className="btn-primary flex items-center gap-2"><Plus className="w-4 h-4" /> Add Customer</button>
            </>
          }
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4">
          <StatCard title="Total Customers" value={(stats?.totalCustomers ?? 0).toLocaleString("en-IN")} change={stats?.totalCustomersChange ?? 0}
            icon={<span className="text-blue-600 font-bold text-sm">C</span>} iconBg="bg-blue-100" />
          <StatCard title="New Customers" value={(stats?.newCustomers ?? 0).toLocaleString("en-IN")} change={stats?.newCustomersChange ?? 0}
            icon={<span className="text-emerald-600 font-bold text-sm">N</span>} iconBg="bg-emerald-100" />
          <StatCard title="Total Orders" value={(stats?.totalOrders ?? 0).toLocaleString("en-IN")} change={stats?.totalOrdersChange ?? 0}
            icon={<span className="text-purple-600 font-bold text-sm">O</span>} iconBg="bg-purple-100" />
          <StatCard title="Total Revenue" value={formatINR(stats?.totalRevenue ?? 0)} change={stats?.totalRevenueChange ?? 0}
            icon={<span className="text-orange-600 font-bold text-sm">₹</span>} iconBg="bg-orange-100" />
          <StatCard title="Avg Customer Value" value={formatINR(stats?.avgCustomerValue ?? 0)}
            icon={<span className="text-teal-600 font-bold text-sm">A</span>} iconBg="bg-teal-100" />
        </div>

        <div className="glass-panel rounded-2xl p-4 shadow-sm">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="relative flex-1 min-w-48">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input type="search" placeholder="Search by name, email or phone" value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <select value={segment} onChange={(e) => setSegment(e.target.value)}
              className="px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">All Segments</option>
              {SEGMENTS.map((s) => <option key={s}>{s}</option>)}
            </select>
            <button onClick={() => { setPage(1); refetchCustomers(); }} className="bg-blue-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-blue-700">Apply Filters</button>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-8 glass-panel rounded-2xl shadow-sm">
            <div className="p-4 border-b border-gray-100">
              <h3 className="font-semibold text-gray-800">Customer List</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    {["Customer", "Email", "Phone", "Segment", "Total Orders", "Total Spent", "Join Date", "Actions"].map((h) => (
                      <th key={h} className="text-left px-4 py-3 font-medium text-gray-500">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {(customers?.data ?? []).map((c) => (
                    <tr key={c.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-[10px]">{c.name.charAt(0)}</div>
                          <span className="font-medium text-gray-800">{c.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-600">{c.email}</td>
                      <td className="px-4 py-3 text-gray-600">{c.phone}</td>
                      <td className="px-4 py-3"><SegmentBadge segment={c.segment} /></td>
                      <td className="px-4 py-3 text-gray-600">{c.totalOrders}</td>
                      <td className="px-4 py-3 font-semibold text-gray-800">{formatINR(c.totalSpent)}</td>
                      <td className="px-4 py-3 text-gray-500">{c.joinDate}</td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1.5">
                          <button onClick={() => setEditCustomer({ id: c.id, name: c.name, email: c.email, phone: c.phone, segment: c.segment })}
                            className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded" title="Edit"><Pencil className="w-3.5 h-3.5" /></button>
                          <button onClick={() => setDeleteTarget({ id: c.id, label: c.name })}
                            className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded" title="Delete"><Trash2 className="w-3.5 h-3.5" /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {(customers?.data ?? []).length === 0 && (
                    <tr><td colSpan={8} className="px-4 py-10 text-center text-gray-400">No customers found</td></tr>
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
            <div className="glass-panel rounded-2xl p-4 shadow-sm">
              <h3 className="font-semibold text-gray-800 mb-3 text-sm">Customer by Segment</h3>
              <div className="flex items-center gap-3">
                <ResponsiveContainer width={100} height={100}>
                  <PieChart>
                    <Pie data={bySegment ?? []} dataKey="value" cx="50%" cy="50%" innerRadius={25} outerRadius={45}>
                      {(bySegment ?? []).map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex-1 space-y-1.5">
                  {(bySegment ?? []).map((s, i) => (
                    <div key={s.name} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full" style={{ background: COLORS[i % COLORS.length] }}></div>
                        <span className="text-gray-600">{s.name}</span>
                      </div>
                      <span className="text-gray-500">{s.percentage}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="glass-panel rounded-2xl p-4 shadow-sm">
              <h3 className="font-semibold text-gray-800 mb-3 text-sm">Top Customers by Revenue</h3>
              <div className="space-y-2.5">
                {(topByRevenue ?? []).map((c, i) => (
                  <div key={c.id} className="flex items-center gap-2 text-xs">
                    <span className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-bold">{i + 1}</span>
                    <div className="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center text-purple-700 font-bold text-[10px]">{c.name.charAt(0)}</div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-800 truncate">{c.name}</p>
                      <SegmentBadge segment={c.segment} />
                    </div>
                    <span className="font-semibold text-gray-800 flex-shrink-0">{formatINR(c.revenue)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="glass-panel rounded-2xl p-4 shadow-sm">
            <h3 className="font-semibold text-gray-800 mb-3">New Customers Trend</h3>
            <ResponsiveContainer width="100%" height={160}>
              <LineChart data={trend ?? []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="label" tick={{ fontSize: 9 }} />
                <YAxis tick={{ fontSize: 9 }} />
                <Tooltip />
                <Line type="monotone" dataKey="value" stroke="#4F46E5" strokeWidth={2} dot={false} name="New Customers" />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="glass-panel rounded-2xl p-4 shadow-sm">
            <h3 className="font-semibold text-gray-800 mb-3">Customers by Location</h3>
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={byLocation ?? []} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis type="number" tick={{ fontSize: 9 }} />
                <YAxis type="category" dataKey="location" tick={{ fontSize: 9 }} width={80} />
                <Tooltip />
                <Bar dataKey="count" fill="#000000" radius={[0, 3, 3, 0]} name="Customers" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </PageShell>
    </Layout>
  );
}
