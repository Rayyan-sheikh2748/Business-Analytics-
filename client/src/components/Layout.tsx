import { useState } from "react";
import { Link, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, ShoppingCart, Package, TrendingUp, FileBarChart,
  Users, Settings, Bell, LogOut, BarChart3,
  Search, Sun, Moon, X, AlertTriangle, CheckCircle, Info,
  ChevronRight, Mail, Phone, MessageSquare, User
} from "lucide-react";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/" },
  { icon: ShoppingCart, label: "Sales", href: "/sales" },
  { icon: Package, label: "Inventory", href: "/inventory" },
  { icon: TrendingUp, label: "Forecasting", href: "/forecasting" },
  { icon: FileBarChart, label: "Reports", href: "/reports" },
  { icon: Users, label: "Customers", href: "/customers" },
  { icon: Settings, label: "Settings", href: "/settings" },
];

const ALERTS = [
  { id: 1, type: "warning", icon: AlertTriangle, color: "text-amber-600", bg: "bg-amber-50/80", title: "Low Stock Alert", message: "Phone Chargers: only 28 units left", time: "2 min ago" },
  { id: 2, type: "warning", icon: AlertTriangle, color: "text-amber-600", bg: "bg-amber-50/80", title: "Low Stock Alert", message: "Sports Watches: only 15 units left", time: "5 min ago" },
  { id: 3, type: "error", icon: AlertTriangle, color: "text-red-600", bg: "bg-red-50/80", title: "Out of Stock", message: "Coffee Makers: 0 units remaining", time: "12 min ago" },
  { id: 4, type: "success", icon: CheckCircle, color: "text-emerald-600", bg: "bg-emerald-50/80", title: "Order Completed", message: "INV-10020 marked as delivered", time: "1 hr ago" },
  { id: 5, type: "info", icon: Info, color: "text-[#64748b]", bg: "bg-[#a0aecd]/10", title: "New Customer", message: "Anjali Saxena joined as VIP member", time: "2 hr ago" },
];

function AlertsPanel({ onClose }: { onClose: () => void }) {
  const [dismissed, setDismissed] = useState<number[]>([]);
  const visible = ALERTS.filter((a) => !dismissed.includes(a.id));
  return (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 8, scale: 0.98 }}
      className="absolute right-0 top-12 w-96 bg-white rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.12)] border border-[#e8eaf2] z-50 overflow-hidden"
    >
      <motion.div className="flex items-center justify-between px-4 py-3 border-b border-[#eef0f6] bg-[#fafbfc]">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-[#0a0a0a]" />
          <span className="font-semibold text-[#0a0a0a] text-sm">Notifications</span>
          <span className="bg-[#000000] text-white text-[10px] rounded-full px-2 py-0.5">{visible.length}</span>
        </div>
        <motion.div className="flex items-center gap-2">
          <button onClick={() => setDismissed(ALERTS.map((a) => a.id))} className="text-xs text-[#64748b] hover:text-[#0a0a0a]">Mark all read</button>
          <button onClick={onClose} className="p-1 text-[#94a3b8] hover:text-[#0a0a0a] rounded-lg"><X className="w-4 h-4" /></button>
        </motion.div>
      </motion.div>
      <div className="max-h-80 overflow-y-auto">
        {visible.length === 0 ? (
          <div className="py-12 text-center text-[#94a3b8] text-sm">No new notifications</div>
        ) : (
          visible.map((alert, i) => (
            <motion.div
              key={alert.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.04 }}
              className={`flex items-start gap-3 px-4 py-3 hover:bg-[#fafbfc] border-b border-[#f4f5f9] ${alert.bg}`}
            >
              <alert.icon className={`w-4 h-4 mt-0.5 flex-shrink-0 ${alert.color}`} />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-[#0a0a0a]">{alert.title}</p>
                <p className="text-xs text-[#64748b] mt-0.5">{alert.message}</p>
                <p className="text-[10px] text-[#94a3b8] mt-1">{alert.time}</p>
              </div>
              <button onClick={() => setDismissed((prev) => [...prev, alert.id])} className="p-0.5 text-[#cbd5e1] hover:text-[#64748b]">
                <X className="w-3 h-3" />
              </button>
            </motion.div>
          ))
        )}
      </div>
    </motion.div>
  );
}

function LogoutModal({ onClose }: { onClose: () => void }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center">
        <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <LogOut className="w-6 h-6 text-red-600" />
        </div>
        <h2 className="text-lg font-bold text-[#0a0a0a] mb-1">Sign Out?</h2>
        <p className="text-sm text-[#64748b] mb-5">You will be signed out of Business Analytics.</p>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 px-4 py-2.5 border border-[#e8eaf2] rounded-xl text-sm text-[#475569] hover:bg-[#fafbfc]">Cancel</button>
          <button onClick={() => { onClose(); window.location.href = "/"; }} className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-xl text-sm font-medium hover:bg-red-700">Sign Out</button>
        </div>
      </motion.div>
    </motion.div>
  );
}

function ProfilePanel({ onClose }: { onClose: () => void }) {
  const [, navigate] = useLocation();
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }} className="absolute right-0 top-12 w-72 bg-white rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.12)] border border-[#e8eaf2] z-50 overflow-hidden">
      <div className="p-4 border-b border-[#eef0f6] bg-[#fafbfc]">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-[#a0aecd] rounded-xl flex items-center justify-center text-[#000000] font-bold text-lg">A</div>
          <div>
            <p className="font-semibold text-[#0a0a0a]">Admin User</p>
            <p className="text-xs text-[#64748b]">info@businessanalytics.com</p>
            <span className="text-[10px] bg-[#000000] text-white px-2 py-0.5 rounded-full font-medium mt-1 inline-block">Pro Plan</span>
          </div>
        </div>
      </div>
      <div className="py-1">
        {[
          { icon: User, label: "My Profile", action: () => { onClose(); navigate("/settings"); } },
          { icon: Settings, label: "Settings", action: () => { onClose(); navigate("/settings"); } },
          { icon: Bell, label: "Notifications", action: () => { onClose(); navigate("/settings"); } },
        ].map(({ icon: Icon, label, action }) => (
          <button key={label} onClick={action} className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-[#fafbfc] text-sm text-[#475569]">
            <Icon className="w-4 h-4 text-[#94a3b8]" />
            {label}
            <ChevronRight className="w-3 h-3 text-[#cbd5e1] ml-auto" />
          </button>
        ))}
      </div>
    </motion.div>
  );
}

export default function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const [darkMode, setDarkMode] = useState(false);
  const [showAlerts, setShowAlerts] = useState(false);
  const [showLogout, setShowLogout] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [alertCount, setAlertCount] = useState(5);

  function closeAll() {
    setShowAlerts(false);
    setShowProfile(false);
  }

  return (
    <div className={`flex h-screen overflow-hidden ${darkMode ? "dark bg-[#0a0a0a]" : "bg-[#f4f5f9]"}`}>
      <AnimatePresence>{showLogout && <LogoutModal onClose={() => setShowLogout(false)} />}</AnimatePresence>
      {(showAlerts || showProfile) && <div className="fixed inset-0 z-40" onClick={closeAll} />}

      <aside className="w-[240px] flex-shrink-0 bg-[#000000] flex flex-col h-full overflow-y-auto border-r border-[#1a1a1a]">
        <div className="flex items-center gap-3 px-5 py-6 border-b border-[#1a1a1a]">
          <div className="w-9 h-9 bg-[#a0aecd] rounded-xl flex items-center justify-center flex-shrink-0">
            <BarChart3 className="w-4 h-4 text-[#000000]" />
          </div>
          <div>
            <div className="text-white font-semibold text-sm tracking-tight">Business Analytics</div>
            <div className="text-[#64748b] text-[10px] tracking-wide uppercase">Enterprise</div>
          </div>
        </div>

        <nav className="flex-1 px-3 py-5 space-y-1">
          {navItems.map(({ icon: Icon, label, href }) => {
            const isActive = href === "/" ? location === "/" : location.startsWith(href);
            return (
              <Link key={href} href={href}>
                <motion.div
                  whileHover={{ x: 2 }}
                  whileTap={{ scale: 0.98 }}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer text-sm ${
                    isActive
                      ? "bg-[#a0aecd] text-[#000000] font-semibold shadow-[0_0_20px_rgba(160,174,205,0.25)]"
                      : "text-[#94a3b8] hover:bg-[#141414] hover:text-white"
                  }`}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  {label}
                </motion.div>
              </Link>
            );
          })}
        </nav>

        <div className="px-3 py-4 border-t border-[#1a1a1a] space-y-1">
          <button onClick={() => { closeAll(); setShowAlerts((v) => !v); setAlertCount(0); }}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[#94a3b8] hover:bg-[#141414] hover:text-white text-sm">
            <Bell className="w-4 h-4" />
            <span>Alerts</span>
            {alertCount > 0 && <span className="ml-auto bg-[#a0aecd] text-[#000000] text-[10px] rounded-full w-5 h-5 flex items-center justify-center font-semibold">{alertCount}</span>}
          </button>
          <button onClick={() => setShowLogout(true)}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[#94a3b8] hover:bg-red-950/40 hover:text-red-400 text-sm">
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white/80 backdrop-blur-md border-b border-[#e8eaf2] px-6 py-3.5 flex items-center gap-4 flex-shrink-0 sticky top-0 z-30">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94a3b8]" />
            <input
              type="search"
              placeholder="Search anything..."
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              className="w-full max-w-md pl-10 pr-4 py-2.5 text-sm bg-[#f4f5f9] border border-[#e8eaf2] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#a0aecd]/40"
            />
          </div>
          <button onClick={() => setDarkMode((v) => !v)} className="p-2.5 text-[#64748b] hover:bg-[#f4f5f9] rounded-xl">
            {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
          <div className="relative">
            <button onClick={() => { closeAll(); setShowAlerts((v) => !v); setAlertCount(0); }} className="relative p-2.5 text-[#64748b] hover:bg-[#f4f5f9] rounded-xl">
              <Bell className="w-4 h-4" />
              {alertCount > 0 && <span className="absolute top-2 right-2 w-2 h-2 bg-[#a0aecd] rounded-full ring-2 ring-white" />}
            </button>
            <AnimatePresence>{showAlerts && <AlertsPanel onClose={() => setShowAlerts(false)} />}</AnimatePresence>
          </div>
          <div className="relative pl-3 border-l border-[#e8eaf2]">
            <button onClick={() => { closeAll(); setShowProfile((v) => !v); }} className="flex items-center gap-2.5 hover:bg-[#f4f5f9] rounded-xl px-2 py-1.5">
              <div className="w-8 h-8 bg-[#a0aecd] rounded-lg flex items-center justify-center text-[#000000] text-xs font-bold">A</div>
              <span className="text-sm font-medium text-[#0a0a0a] hidden sm:block">Admin</span>
              <ChevronRight className="w-3 h-3 text-[#94a3b8] rotate-90" />
            </button>
            <AnimatePresence>{showProfile && <ProfilePanel onClose={() => setShowProfile(false)} />}</AnimatePresence>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto">
          <motion.div key={location} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
}
