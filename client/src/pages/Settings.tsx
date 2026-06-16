import { useState } from "react";
import { Save, Shield, Bell, Globe, User, CreditCard, List, Trash2, RefreshCw, Database, X, Eye, EyeOff, Check } from "lucide-react";
import Layout from "@/components/Layout";
import PageShell from "@/components/PageShell";
import PageHero from "@/components/PageHero";
import PremiumToast from "@/components/ui-premium/PremiumToast";
import DeleteConfirmModal from "@/components/ui-premium/DeleteConfirmModal";
import GlassCard from "@/components/GlassCard";
import { useGetSettings, useUpdateSettings, getGetSettingsQueryKey, useClearData } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";

const TABS = [
  { id: "general",       label: "General",       icon: Globe },
  { id: "profile",       label: "Profile",        icon: User },
  { id: "notifications", label: "Notifications",  icon: Bell },
  { id: "security",      label: "Security",       icon: Shield },
  { id: "billing",       label: "Billing",        icon: CreditCard },
  { id: "audit",         label: "Audit Logs",     icon: List },
];

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button onClick={() => onChange(!checked)}
      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${checked ? "bg-[#000000]" : "bg-[#e8eaf2]"}`}>
      <span className={`inline-block h-4 w-4 rounded-full bg-white shadow transform transition-transform ${checked ? "translate-x-4" : "translate-x-0.5"}`} />
    </button>
  );
}

const AUDIT_LOGS = [
  { action: "Settings Updated",   user: "Admin",          time: "Today, 10:42 AM",     type: "info" },
  { action: "New Sale Added",      user: "Admin",          time: "Today, 10:15 AM",     type: "success" },
  { action: "Product Deleted",     user: "Admin",          time: "Yesterday, 3:28 PM",  type: "warning" },
  { action: "Customer Updated",    user: "Admin",          time: "Yesterday, 1:50 PM",  type: "info" },
  { action: "Login Successful",    user: "Admin",          time: "Yesterday, 9:00 AM",  type: "success" },
  { action: "Low Stock Alert",     user: "System",         time: "2 days ago, 8:30 AM", type: "warning" },
  { action: "Report Generated",    user: "Admin",          time: "3 days ago, 4:00 PM", type: "info" },
  { action: "New Customer Added",  user: "Admin",          time: "3 days ago, 2:15 PM", type: "success" },
  { action: "Inventory Updated",   user: "Admin",          time: "4 days ago, 11:00 AM",type: "info" },
  { action: "Password Changed",    user: "Admin",          time: "1 week ago, 9:30 AM", type: "warning" },
];

export default function Settings() {
  const [activeTab, setActiveTab] = useState("general");
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [toast, setToast] = useState("");
  const [showCurrentPwd, setShowCurrentPwd] = useState(false);
  const [showNewPwd, setShowNewPwd] = useState(false);
  const [pwdForm, setPwdForm] = useState({ current: "", next: "", confirm: "" });
  const [pwdError, setPwdError] = useState("");
  const [profileForm, setProfileForm] = useState({ name: "Admin User", phone: "+91 98765 43210", designation: "Store Manager", address: "123, MG Road, Mumbai - 400001" });
  const [notifSettings, setNotifSettings] = useState({
    lowStockEmail: true, newOrderEmail: true, dailySummary: true,
    weeklySummary: false, pushLowStock: true, pushNewOrder: false,
    pushReports: true, pushMarketing: false,
  });

  const queryClient = useQueryClient();
  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(""), 3000); };

  const { data: settings } = useGetSettings();
  const updateMutation = useUpdateSettings({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetSettingsQueryKey() });
        showToast("Settings saved successfully!");
      },
    },
  });

  const [form, setForm] = useState({
    businessName: "", businessEmail: "", defaultTheme: "light", language: "en",
    timezone: "Asia/Kolkata", currency: "INR", dateFormat: "DD/MM/YYYY", timeFormat: "12h",
    enableAnalytics: true, autoRefresh: true, emailNotifications: true, darkMode: false, compactView: false,
    profitMargin: 20,
  });

  const effectiveForm = settings ? {
    businessName: settings.businessName ?? form.businessName,
    businessEmail: settings.businessEmail ?? form.businessEmail,
    defaultTheme: settings.defaultTheme ?? form.defaultTheme,
    language: settings.language ?? form.language,
    timezone: settings.timezone ?? form.timezone,
    currency: settings.currency ?? form.currency,
    dateFormat: settings.dateFormat ?? form.dateFormat,
    timeFormat: settings.timeFormat ?? form.timeFormat,
    enableAnalytics: settings.enableAnalytics ?? form.enableAnalytics,
    autoRefresh: settings.autoRefresh ?? form.autoRefresh,
    emailNotifications: settings.emailNotifications ?? form.emailNotifications,
    darkMode: settings.darkMode ?? form.darkMode,
    compactView: settings.compactView ?? form.compactView,
    profitMargin: settings.profitMargin !== undefined ? settings.profitMargin : form.profitMargin,
  } : form;

  function update(key: string, value: string | boolean | number) {
    setForm((prev) => ({ ...prev, [key]: value }));
    updateMutation.mutate({ data: { [key]: value } });
  }

  function changePassword() {
    if (!pwdForm.current) { setPwdError("Enter your current password."); return; }
    if (pwdForm.next.length < 8) { setPwdError("New password must be at least 8 characters."); return; }
    if (pwdForm.next !== pwdForm.confirm) { setPwdError("Passwords do not match."); return; }
    setPwdError("");
    setPwdForm({ current: "", next: "", confirm: "" });
    showToast("Password changed successfully!");
  }

  const clearDataMutation = useClearData({
    mutation: {
      onSuccess: (res) => {
        showToast(res.message || "All uploaded data deleted successfully!");
        queryClient.invalidateQueries();
      },
      onError: (err: any) => {
        showToast(`Error: ${err?.response?.data?.error || err.message || "Failed to clear database"}`);
      },
    },
  });

  function handleClearData() {
    setShowClearConfirm(false);
    showToast("Clearing uploaded database...");
    clearDataMutation.mutate();
  }

  return (
    <Layout>
      {toast && <PremiumToast message={toast} onClose={() => setToast("")} />}
      <DeleteConfirmModal
        open={showClearConfirm}
        title="Delete All Uploaded Data?"
        description="Are you sure you want to delete all uploaded analytics data (products, sales, customers, stock movements, dataset metadata)? This action cannot be undone."
        onClose={() => setShowClearConfirm(false)}
        onConfirm={handleClearData}
      />

      <PageShell>
        <PageHero
          badge="Configuration"
          title="Settings"
          subtitle="Manage your account, security, notifications, and application preferences."
        />

        <div className="flex gap-1 glass-panel p-1 rounded-xl w-fit flex-wrap">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button key={id} type="button" onClick={() => setActiveTab(id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-all ${activeTab === id ? "bg-[#a0aecd]/30 text-[#0a0a0a] font-medium shadow-sm border border-[#a0aecd]/40" : "text-[#64748b] hover:text-[#0a0a0a]"}`}>
              <Icon className="w-3.5 h-3.5" />{label}
            </button>
          ))}
        </div>

        {activeTab === "general" && (
          <div className="grid grid-cols-12 gap-4">
            <div className="col-span-8 space-y-4">
              <GlassCard className="p-5" hover={false}>
                <h3 className="font-semibold text-[#0a0a0a] mb-4">Business Settings</h3>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { key: "businessName", label: "Business Name", placeholder: "Your Business Name" },
                    { key: "businessEmail", label: "Business Email", placeholder: "email@business.com" },
                    { key: "defaultTheme", label: "Default Theme", type: "select", options: ["light", "dark", "system"] },
                    { key: "language", label: "Language", type: "select", options: ["en", "hi", "mr", "ta"] },
                    { key: "timezone", label: "Timezone", type: "select", options: ["Asia/Kolkata", "Asia/Mumbai", "Asia/Chennai"] },
                    { key: "currency", label: "Currency", type: "select", options: ["INR", "USD", "EUR"] },
                    { key: "dateFormat", label: "Date Format", type: "select", options: ["DD/MM/YYYY", "MM/DD/YYYY", "YYYY-MM-DD"] },
                    { key: "timeFormat", label: "Time Format", type: "select", options: ["12h", "24h"] },
                    { key: "profitMargin", label: "Default Profit Margin (%)", placeholder: "20", type: "number" },
                  ].map(({ key, label, placeholder, type, options }) => (
                    <div key={key}>
                      <label className="block text-xs font-medium text-gray-700 mb-1">{label}</label>
                      {type === "select" ? (
                        <select value={(effectiveForm as Record<string, string | boolean | number>)[key] as string}
                          onChange={(e) => update(key, e.target.value)}
                          className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                          {options!.map((o) => <option key={o}>{o}</option>)}
                        </select>
                      ) : type === "number" ? (
                        <input type="number" placeholder={placeholder}
                          value={(effectiveForm as Record<string, string | boolean | number>)[key] as number}
                          onChange={(e) => update(key, Number(e.target.value))}
                          className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                      ) : (
                        <input type="text" placeholder={placeholder}
                          value={(effectiveForm as Record<string, string | boolean | number>)[key] as string}
                          onChange={(e) => update(key, e.target.value)}
                          className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                      )}
                    </div>
                  ))}
                </div>
                <button type="button" onClick={() => updateMutation.mutate({ data: effectiveForm })} className="mt-5 btn-primary flex items-center gap-2">
                  <Save className="w-4 h-4" /> Save Business Settings
                </button>
              </GlassCard>

              <div className="glass-panel rounded-2xl p-5 shadow-sm">
                <h3 className="font-semibold text-gray-800 mb-4">System Preferences</h3>
                <div className="space-y-4">
                  {[
                    { key: "enableAnalytics", label: "Enable Analytics", desc: "Track usage and performance metrics" },
                    { key: "autoRefresh", label: "Auto Refresh Dashboard", desc: "Automatically refresh data every 5 minutes" },
                    { key: "emailNotifications", label: "Email Notifications", desc: "Receive email alerts for important events" },
                    { key: "darkMode", label: "Dark Mode", desc: "Enable dark theme for the application" },
                    { key: "compactView", label: "Compact View", desc: "Show more data in a denser layout" },
                  ].map(({ key, label, desc }) => (
                    <div key={key} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                      <div>
                        <p className="text-sm font-medium text-gray-800">{label}</p>
                        <p className="text-xs text-gray-500">{desc}</p>
                      </div>
                      <Toggle checked={(effectiveForm as Record<string, string | boolean>)[key] as boolean} onChange={(v) => update(key, v)} />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="col-span-4 space-y-4">
              <div className="glass-panel rounded-2xl p-4 shadow-sm">
                <h3 className="font-semibold text-gray-800 mb-3 text-sm">Account Summary</h3>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-lg">S</div>
                  <div>
                    <p className="font-semibold text-gray-800">{effectiveForm.businessName || "Sharma General Store"}</p>
                    <p className="text-xs text-gray-500">{effectiveForm.businessEmail || "sharma.store@gmail.com"}</p>
                  </div>
                </div>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between py-1 border-b border-gray-50"><span className="text-gray-500">Plan</span><span className="font-medium text-emerald-600">Professional</span></div>
                  <div className="flex justify-between py-1 border-b border-gray-50"><span className="text-gray-500">Currency</span><span className="font-medium text-gray-700">{effectiveForm.currency}</span></div>
                  <div className="flex justify-between py-1 border-b border-gray-50"><span className="text-gray-500">Timezone</span><span className="font-medium text-gray-700">{effectiveForm.timezone}</span></div>
                  <div className="flex justify-between py-1"><span className="text-gray-500">Language</span><span className="font-medium text-gray-700">{effectiveForm.language.toUpperCase()}</span></div>
                </div>
              </div>
              <div className="glass-panel rounded-2xl p-4 shadow-sm">
                <div className="flex items-center gap-2 mb-3"><Database className="w-4 h-4 text-blue-600" /><h3 className="font-semibold text-gray-800 text-sm">Data & Backup</h3></div>
                <div className="space-y-2">
                  {["Export All Data (CSV)", "Export All Data (JSON)", "Create Backup"].map((action) => (
                    <button key={action} onClick={() => showToast(`${action} started — file will download shortly.`)}
                      className="w-full text-left text-xs text-gray-700 px-3 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">{action}</button>
                  ))}
                </div>
              </div>
              <div className="bg-white rounded-xl border border-red-100 p-4 shadow-sm">
                <h3 className="font-semibold text-red-700 text-sm mb-3">Danger Zone</h3>
                <div className="space-y-2">
                  <button onClick={() => setShowClearConfirm(true)} className="w-full flex items-center gap-2 text-xs text-red-600 px-3 py-2 border border-red-200 rounded-lg hover:bg-red-50">
                    <Trash2 className="w-3.5 h-3.5" /> Delete All Uploaded Data
                  </button>
                  <button onClick={() => showToast("Cache cleared successfully.")} className="w-full flex items-center gap-2 text-xs text-red-600 px-3 py-2 border border-red-200 rounded-lg hover:bg-red-50">
                    <RefreshCw className="w-3.5 h-3.5" /> Clear Cache
                  </button>
                  <button onClick={() => showToast("Settings reset to defaults.")} className="w-full flex items-center gap-2 text-xs text-red-600 px-3 py-2 border border-red-200 rounded-lg hover:bg-red-50">
                    <RefreshCw className="w-3.5 h-3.5" /> Reset All Settings
                  </button>
                  <button onClick={() => showToast("Account deletion requires email confirmation. Check your inbox.")}
                    className="w-full flex items-center gap-2 text-xs text-white px-3 py-2 bg-red-600 rounded-lg hover:bg-red-700">
                    <Trash2 className="w-3.5 h-3.5" /> Delete Account
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "profile" && (
          <div className="grid grid-cols-12 gap-4">
            <div className="col-span-8 space-y-4">
              <div className="glass-panel rounded-2xl p-5 shadow-sm">
                <h3 className="font-semibold text-gray-800 mb-4">Personal Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Full Name</label>
                    <input value={profileForm.name} onChange={(e) => setProfileForm((p) => ({ ...p, name: e.target.value }))}
                      className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Phone Number</label>
                    <input value={profileForm.phone} onChange={(e) => setProfileForm((p) => ({ ...p, phone: e.target.value }))}
                      className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Designation</label>
                    <input value={profileForm.designation} onChange={(e) => setProfileForm((p) => ({ ...p, designation: e.target.value }))}
                      className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Business Name</label>
                    <input value={effectiveForm.businessName} onChange={(e) => update("businessName", e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs font-medium text-gray-700 mb-1">Business Address</label>
                    <input value={profileForm.address} onChange={(e) => setProfileForm((p) => ({ ...p, address: e.target.value }))}
                      className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs font-medium text-gray-700 mb-1">Business Email</label>
                    <input type="email" value={effectiveForm.businessEmail} onChange={(e) => update("businessEmail", e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                </div>
                <button onClick={() => { updateMutation.mutate({ data: { businessName: effectiveForm.businessName, businessEmail: effectiveForm.businessEmail } }); showToast("Profile updated successfully!"); }}
                  className="mt-5 flex items-center gap-2 bg-blue-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-blue-700 font-medium">
                  <Save className="w-4 h-4" /> Save Profile
                </button>
              </div>
            </div>
            <div className="col-span-4 space-y-4">
              <div className="glass-panel rounded-2xl p-4 shadow-sm text-center">
                <div className="w-20 h-20 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-3xl mx-auto mb-3">S</div>
                <p className="font-semibold text-gray-800">{profileForm.name}</p>
                <p className="text-xs text-gray-500 mt-0.5">{profileForm.designation}</p>
                <p className="text-xs text-gray-400 mt-0.5">{effectiveForm.businessEmail}</p>
                <button onClick={() => showToast("Photo upload coming soon.")}
                  className="mt-3 text-xs text-blue-600 border border-blue-200 px-3 py-1.5 rounded-lg hover:bg-blue-50">Change Photo</button>
              </div>
              <div className="glass-panel rounded-2xl p-4 shadow-sm">
                <h3 className="font-semibold text-gray-800 text-sm mb-3">Account Status</h3>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between"><span className="text-gray-500">Account Type</span><span className="text-emerald-600 font-medium">Professional</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Member Since</span><span className="text-gray-700">Jan 2024</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Last Login</span><span className="text-gray-700">Today, 9:00 AM</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Status</span><span className="text-emerald-600 font-medium">Active</span></div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "notifications" && (
          <div className="grid grid-cols-12 gap-4">
            <div className="col-span-8 space-y-4">
              <div className="glass-panel rounded-2xl p-5 shadow-sm">
                <h3 className="font-semibold text-gray-800 mb-4">Email Notifications</h3>
                <div className="space-y-4">
                  {[
                    { key: "lowStockEmail",   label: "Low Stock Alerts",     desc: "Get notified when products go below threshold" },
                    { key: "newOrderEmail",    label: "New Order Alerts",     desc: "Email when a new sale is recorded" },
                    { key: "dailySummary",     label: "Daily Summary Report", desc: "Receive end-of-day sales summary at 8 PM" },
                    { key: "weeklySummary",    label: "Weekly Report",        desc: "Receive weekly performance report every Monday" },
                  ].map(({ key, label, desc }) => (
                    <div key={key} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                      <div>
                        <p className="text-sm font-medium text-gray-800">{label}</p>
                        <p className="text-xs text-gray-500">{desc}</p>
                      </div>
                      <Toggle checked={notifSettings[key as keyof typeof notifSettings]}
                        onChange={(v) => { setNotifSettings((p) => ({ ...p, [key]: v })); showToast("Notification preference saved."); }} />
                    </div>
                  ))}
                </div>
              </div>
              <div className="glass-panel rounded-2xl p-5 shadow-sm">
                <h3 className="font-semibold text-gray-800 mb-4">In-App Notifications</h3>
                <div className="space-y-4">
                  {[
                    { key: "pushLowStock",  label: "Low Stock Popup",     desc: "Show alerts inside the dashboard" },
                    { key: "pushNewOrder",  label: "New Order Toast",      desc: "Show a toast message for each new sale" },
                    { key: "pushReports",   label: "Report Ready Alert",   desc: "Notify when a scheduled report is ready" },
                    { key: "pushMarketing", label: "Product Updates",      desc: "Notifications about platform updates" },
                  ].map(({ key, label, desc }) => (
                    <div key={key} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                      <div>
                        <p className="text-sm font-medium text-gray-800">{label}</p>
                        <p className="text-xs text-gray-500">{desc}</p>
                      </div>
                      <Toggle checked={notifSettings[key as keyof typeof notifSettings]}
                        onChange={(v) => { setNotifSettings((p) => ({ ...p, [key]: v })); showToast("Notification preference saved."); }} />
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="col-span-4 space-y-4">
              <div className="glass-panel rounded-2xl p-4 shadow-sm">
                <h3 className="font-semibold text-gray-800 text-sm mb-3">Notification Summary</h3>
                <div className="space-y-2 text-xs">
                  {[
                    { label: "Active Email Alerts", value: Object.values(notifSettings).filter(Boolean).length },
                    { label: "Delivery Email",      value: effectiveForm.businessEmail || "Not set" },
                    { label: "Daily Report Time",   value: "8:00 PM IST" },
                    { label: "Weekly Report Day",   value: "Every Monday" },
                  ].map((item) => (
                    <div key={item.label} className="flex justify-between py-1 border-b border-gray-50">
                      <span className="text-gray-500">{item.label}</span>
                      <span className="font-medium text-gray-700">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "security" && (
          <div className="grid grid-cols-12 gap-4">
            <div className="col-span-8 space-y-4">
              <div className="glass-panel rounded-2xl p-5 shadow-sm">
                <h3 className="font-semibold text-gray-800 mb-4">Change Password</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Current Password</label>
                    <div className="relative">
                      <input type={showCurrentPwd ? "text" : "password"} value={pwdForm.current}
                        onChange={(e) => setPwdForm((p) => ({ ...p, current: e.target.value }))} placeholder="Enter current password"
                        className="w-full px-3 py-2 pr-9 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                      <button type="button" onClick={() => setShowCurrentPwd((v) => !v)} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400">
                        {showCurrentPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">New Password</label>
                    <div className="relative">
                      <input type={showNewPwd ? "text" : "password"} value={pwdForm.next}
                        onChange={(e) => setPwdForm((p) => ({ ...p, next: e.target.value }))} placeholder="At least 8 characters"
                        className="w-full px-3 py-2 pr-9 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                      <button type="button" onClick={() => setShowNewPwd((v) => !v)} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400">
                        {showNewPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {pwdForm.next && (
                      <div className="mt-1 flex gap-1">
                        {[1,2,3,4].map((i) => (
                          <div key={i} className={`h-1 flex-1 rounded-full ${pwdForm.next.length >= i * 2 ? (pwdForm.next.length >= 8 ? "bg-emerald-400" : "bg-amber-400") : "bg-gray-100"}`} />
                        ))}
                        <span className="text-[10px] text-gray-400 ml-1">{pwdForm.next.length < 4 ? "Weak" : pwdForm.next.length < 8 ? "Fair" : "Strong"}</span>
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Confirm New Password</label>
                    <input type="password" value={pwdForm.confirm}
                      onChange={(e) => setPwdForm((p) => ({ ...p, confirm: e.target.value }))} placeholder="Re-enter new password"
                      className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  {pwdError && <p className="text-red-500 text-xs">{pwdError}</p>}
                  <button onClick={changePassword} className="flex items-center gap-2 bg-blue-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-blue-700 font-medium">
                    <Shield className="w-4 h-4" /> Update Password
                  </button>
                </div>
              </div>

              <div className="glass-panel rounded-2xl p-5 shadow-sm">
                <h3 className="font-semibold text-gray-800 mb-4">Active Login Sessions</h3>
                <div className="space-y-3">
                  {[
                    { device: "Chrome on Windows", location: "Mumbai, India", time: "Now (current session)", current: true },
                    { device: "Safari on iPhone",  location: "Mumbai, India", time: "Yesterday, 9:45 PM", current: false },
                    { device: "Chrome on MacBook", location: "Pune, India",   time: "3 days ago",          current: false },
                  ].map((s) => (
                    <div key={s.device} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                      <div>
                        <p className="text-sm font-medium text-gray-800">{s.device}</p>
                        <p className="text-xs text-gray-500">{s.location} · {s.time}</p>
                      </div>
                      {s.current ? (
                        <span className="text-xs text-emerald-600 font-medium bg-emerald-50 px-2 py-0.5 rounded-full">Active</span>
                      ) : (
                        <button onClick={() => showToast("Session terminated.")} className="text-xs text-red-500 hover:text-red-700">Revoke</button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="col-span-4 space-y-4">
              <div className="glass-panel rounded-2xl p-4 shadow-sm">
                <h3 className="font-semibold text-gray-800 text-sm mb-3">Two-Factor Authentication</h3>
                <p className="text-xs text-gray-500 mb-3">Add an extra layer of security to your account.</p>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-gray-700">2FA Status</span>
                  <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">Not Enabled</span>
                </div>
                <button onClick={() => showToast("2FA setup email sent! Check your inbox.")}
                  className="w-full bg-blue-600 text-white text-sm py-2 rounded-lg hover:bg-blue-700">Enable 2FA</button>
              </div>
              <div className="glass-panel rounded-2xl p-4 shadow-sm">
                <h3 className="font-semibold text-gray-800 text-sm mb-3">Security Tips</h3>
                <ul className="space-y-2 text-xs text-gray-600">
                  <li className="flex items-start gap-2"><Check className="w-3 h-3 text-emerald-500 mt-0.5 flex-shrink-0" />Use a strong password with letters, numbers and symbols</li>
                  <li className="flex items-start gap-2"><Check className="w-3 h-3 text-emerald-500 mt-0.5 flex-shrink-0" />Never share your login credentials with anyone</li>
                  <li className="flex items-start gap-2"><Check className="w-3 h-3 text-emerald-500 mt-0.5 flex-shrink-0" />Enable 2FA for maximum account protection</li>
                  <li className="flex items-start gap-2"><Check className="w-3 h-3 text-emerald-500 mt-0.5 flex-shrink-0" />Regularly review and revoke unused sessions</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {activeTab === "billing" && (
          <div className="grid grid-cols-12 gap-4">
            <div className="col-span-8 space-y-4">
              <div className="glass-panel rounded-2xl p-5 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-800">Current Plan</h3>
                  <span className="bg-blue-100 text-blue-700 text-xs font-medium px-3 py-1 rounded-full">Professional</span>
                </div>
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-4 text-white mb-4">
                  <p className="text-xs opacity-80 mb-1">Current Billing Period</p>
                  <p className="text-2xl font-bold">₹2,499<span className="text-sm font-normal opacity-80">/month</span></p>
                  <p className="text-xs opacity-70 mt-1">Next billing date: June 10, 2026</p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: "Products Limit",   used: "20",   limit: "Unlimited" },
                    { label: "Sales Records",     used: "60",   limit: "Unlimited" },
                    { label: "Team Members",      used: "1",    limit: "5" },
                    { label: "API Requests/day",  used: "1.2k", limit: "50k" },
                  ].map((item) => (
                    <div key={item.label} className="bg-gray-50 rounded-lg p-3">
                      <p className="text-xs text-gray-500">{item.label}</p>
                      <p className="text-sm font-semibold text-gray-800">{item.used} <span className="text-gray-400 font-normal">/ {item.limit}</span></p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="glass-panel rounded-2xl p-5 shadow-sm">
                <h3 className="font-semibold text-gray-800 mb-4">Payment History</h3>
                <table className="w-full text-xs">
                  <thead className="bg-gray-50">
                    <tr>
                      {["Date", "Description", "Amount", "Status"].map((h) => (
                        <th key={h} className="text-left px-3 py-2 text-gray-500 font-medium">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {[
                      { date: "May 10, 2026",  desc: "Professional Plan - Monthly", amount: "₹2,499", status: "Paid" },
                      { date: "Apr 10, 2026",  desc: "Professional Plan - Monthly", amount: "₹2,499", status: "Paid" },
                      { date: "Mar 10, 2026",  desc: "Professional Plan - Monthly", amount: "₹2,499", status: "Paid" },
                      { date: "Feb 10, 2026",  desc: "Professional Plan - Monthly", amount: "₹2,499", status: "Paid" },
                    ].map((row, i) => (
                      <tr key={i} className="hover:bg-gray-50">
                        <td className="px-3 py-2 text-gray-600">{row.date}</td>
                        <td className="px-3 py-2 text-gray-700">{row.desc}</td>
                        <td className="px-3 py-2 font-semibold text-gray-800">{row.amount}</td>
                        <td className="px-3 py-2"><span className="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">{row.status}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="col-span-4 space-y-4">
              <div className="glass-panel rounded-2xl p-4 shadow-sm">
                <h3 className="font-semibold text-gray-800 text-sm mb-3">Upgrade Plan</h3>
                <div className="space-y-2">
                  {[{ plan: "Starter", price: "Free", desc: "5 products, 30 days history" },
                    { plan: "Professional", price: "₹2,499/mo", desc: "Unlimited, full features", current: true },
                    { plan: "Enterprise", price: "₹7,999/mo", desc: "Custom, dedicated support" }].map((p) => (
                    <div key={p.plan} className={`border rounded-lg p-3 ${p.current ? "border-blue-400 bg-blue-50" : "border-gray-200"}`}>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-800">{p.plan}</span>
                        {p.current && <span className="text-[10px] bg-blue-600 text-white px-2 py-0.5 rounded-full">Current</span>}
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">{p.desc}</p>
                      <p className="text-sm font-bold text-gray-800 mt-1">{p.price}</p>
                    </div>
                  ))}
                </div>
                <button onClick={() => showToast("Upgrade request sent! Our team will contact you.")}
                  className="w-full mt-3 bg-blue-600 text-white text-sm py-2 rounded-lg hover:bg-blue-700">Upgrade to Enterprise</button>
              </div>
            </div>
          </div>
        )}

        {activeTab === "audit" && (
          <div className="glass-panel rounded-2xl shadow-sm">
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <h3 className="font-semibold text-gray-800">Audit Logs</h3>
              <button onClick={() => showToast("Audit logs exported!")}
                className="flex items-center gap-2 text-sm text-blue-600 border border-blue-200 px-3 py-1.5 rounded-lg hover:bg-blue-50">
                Export Logs
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    {["#", "Action", "Performed By", "Timestamp", "Type"].map((h) => (
                      <th key={h} className="text-left px-4 py-3 font-medium text-gray-500">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {AUDIT_LOGS.map((log, i) => (
                    <tr key={i} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-gray-400">{i + 1}</td>
                      <td className="px-4 py-3 font-medium text-gray-800">{log.action}</td>
                      <td className="px-4 py-3 text-gray-600">{log.user}</td>
                      <td className="px-4 py-3 text-gray-500">{log.time}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full font-medium ${
                          log.type === "success" ? "bg-emerald-100 text-emerald-700" :
                          log.type === "warning" ? "bg-amber-100 text-amber-700" : "bg-blue-100 text-blue-700"
                        }`}>{log.type}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </PageShell>
    </Layout>
  );
}
