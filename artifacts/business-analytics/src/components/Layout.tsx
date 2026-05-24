import { useState } from "react";
import { Link, useLocation } from "wouter";
import {
  LayoutDashboard, ShoppingCart, Package, TrendingUp, FileBarChart,
  Users, Settings, Bell, HelpCircle, LogOut, BarChart3, Plus, RefreshCw,
  Download, Search, Sun, Moon, X, AlertTriangle, CheckCircle, Info,
  ChevronRight, ExternalLink, Mail, Phone, MessageSquare, User
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
  { id: 1, type: "warning", icon: AlertTriangle, color: "text-amber-500", bg: "bg-amber-50", title: "Low Stock Alert", message: "Phone Chargers: only 28 units left", time: "2 min ago" },
  { id: 2, type: "warning", icon: AlertTriangle, color: "text-amber-500", bg: "bg-amber-50", title: "Low Stock Alert", message: "Sports Watches: only 15 units left", time: "5 min ago" },
  { id: 3, type: "error", icon: AlertTriangle, color: "text-red-500", bg: "bg-red-50", title: "Out of Stock", message: "Coffee Makers: 0 units remaining", time: "12 min ago" },
  { id: 4, type: "success", icon: CheckCircle, color: "text-emerald-500", bg: "bg-emerald-50", title: "Order Completed", message: "INV-10020 marked as delivered", time: "1 hr ago" },
  { id: 5, type: "info", icon: Info, color: "text-blue-500", bg: "bg-blue-50", title: "New Customer", message: "Anjali Saxena joined as VIP member", time: "2 hr ago" },
  { id: 6, type: "warning", icon: AlertTriangle, color: "text-amber-500", bg: "bg-amber-50", title: "Low Stock Alert", message: "Laptop Stand: only 8 units left", time: "3 hr ago" },
  { id: 7, type: "success", icon: CheckCircle, color: "text-emerald-500", bg: "bg-emerald-50", title: "Revenue Milestone", message: "Monthly revenue crossed ₹1,80,000", time: "5 hr ago" },
  { id: 8, type: "info", icon: Info, color: "text-blue-500", bg: "bg-blue-50", title: "Report Ready", message: "April Sales Report generated", time: "1 day ago" },
];

function AlertsPanel({ onClose }: { onClose: () => void }) {
  const [dismissed, setDismissed] = useState<number[]>([]);
  const visible = ALERTS.filter((a) => !dismissed.includes(a.id));
  return (
    <div className="absolute right-0 top-12 w-96 bg-white rounded-xl shadow-2xl border border-gray-200 z-50">
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-gray-700" />
          <span className="font-semibold text-gray-800 text-sm">Notifications</span>
          <span className="bg-red-500 text-white text-[10px] rounded-full px-1.5 py-0.5">{visible.length}</span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setDismissed(ALERTS.map((a) => a.id))} className="text-xs text-blue-600 hover:underline">Mark all read</button>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600 rounded"><X className="w-4 h-4" /></button>
        </div>
      </div>
      <div className="max-h-80 overflow-y-auto">
        {visible.length === 0 ? (
          <div className="py-10 text-center text-gray-400 text-sm">No new notifications</div>
        ) : (
          visible.map((alert) => (
            <div key={alert.id} className={`flex items-start gap-3 px-4 py-3 hover:bg-gray-50 border-b border-gray-50 ${alert.bg}`}>
              <alert.icon className={`w-4 h-4 mt-0.5 flex-shrink-0 ${alert.color}`} />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-gray-800">{alert.title}</p>
                <p className="text-xs text-gray-500 mt-0.5">{alert.message}</p>
                <p className="text-[10px] text-gray-400 mt-1">{alert.time}</p>
              </div>
              <button onClick={() => setDismissed((prev) => [...prev, alert.id])} className="p-0.5 text-gray-300 hover:text-gray-500 flex-shrink-0">
                <X className="w-3 h-3" />
              </button>
            </div>
          ))
        )}
      </div>
      <div className="px-4 py-2.5 border-t border-gray-100 text-center">
        <Link href="/settings"><span className="text-xs text-blue-600 hover:underline cursor-pointer">Manage notification settings</span></Link>
      </div>
    </div>
  );
}

function HelpPanel({ onClose }: { onClose: () => void }) {
  const [ticket, setTicket] = useState({ subject: "", message: "" });
  const [sent, setSent] = useState(false);
  function sendTicket() {
    if (ticket.subject && ticket.message) { setSent(true); setTimeout(() => { setSent(false); setTicket({ subject: "", message: "" }); }, 2500); }
  }
  return (
    <div className="absolute right-0 top-12 w-96 bg-white rounded-xl shadow-2xl border border-gray-200 z-50">
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <HelpCircle className="w-4 h-4 text-gray-700" />
          <span className="font-semibold text-gray-800 text-sm">Help & Support</span>
        </div>
        <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600 rounded"><X className="w-4 h-4" /></button>
      </div>
      <div className="p-4 space-y-4">
        <div className="grid grid-cols-3 gap-2">
          {[
            { icon: Mail, label: "Email Us", sub: "support@biz.com", color: "bg-blue-50 text-blue-600" },
            { icon: Phone, label: "Call Us", sub: "+91-1800-000", color: "bg-emerald-50 text-emerald-600" },
            { icon: MessageSquare, label: "Live Chat", sub: "Available 9-6", color: "bg-purple-50 text-purple-600" },
          ].map(({ icon: Icon, label, sub, color }) => (
            <button key={label} className={`flex flex-col items-center gap-1 p-3 rounded-lg border border-gray-100 hover:shadow-sm transition-all text-center ${color}`}>
              <Icon className="w-5 h-5" />
              <span className="text-[11px] font-semibold">{label}</span>
              <span className="text-[10px] opacity-70">{sub}</span>
            </button>
          ))}
        </div>
        <div className="space-y-2">
          <p className="text-xs font-semibold text-gray-700">Quick Links</p>
          {["Documentation", "Video Tutorials", "API Reference", "Release Notes"].map((link) => (
            <button key={link} className="w-full flex items-center justify-between text-xs text-gray-600 hover:text-blue-600 py-1.5 border-b border-gray-50">
              <span>{link}</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          ))}
        </div>
        <div className="space-y-2">
          <p className="text-xs font-semibold text-gray-700">Submit a Ticket</p>
          {sent ? (
            <div className="bg-emerald-50 text-emerald-700 text-xs px-3 py-2.5 rounded-lg text-center font-medium">
              Ticket submitted! We'll respond within 24 hours.
            </div>
          ) : (
            <>
              <input value={ticket.subject} onChange={(e) => setTicket((p) => ({ ...p, subject: e.target.value }))}
                placeholder="Subject" className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
              <textarea value={ticket.message} onChange={(e) => setTicket((p) => ({ ...p, message: e.target.value }))}
                placeholder="Describe your issue..." rows={3}
                className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
              <button onClick={sendTicket} className="w-full bg-blue-600 text-white text-xs py-2 rounded-lg hover:bg-blue-700">Submit Ticket</button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function LogoutModal({ onClose }: { onClose: () => void }) {
  function doLogout() {
    onClose();
    setTimeout(() => {
      window.location.href = "/";
    }, 300);
  }
  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-2xl w-80 p-6 text-center">
        <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <LogOut className="w-6 h-6 text-red-600" />
        </div>
        <h2 className="text-lg font-bold text-gray-900 mb-1">Sign Out?</h2>
        <p className="text-sm text-gray-500 mb-5">You will be signed out of Business Analytics. Any unsaved changes will be lost.</p>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 hover:bg-gray-50">Cancel</button>
          <button onClick={doLogout} className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700">Sign Out</button>
        </div>
      </div>
    </div>
  );
}

function ProfilePanel({ onClose }: { onClose: () => void }) {
  const [, navigate] = useLocation();
  return (
    <div className="absolute right-0 top-12 w-72 bg-white rounded-xl shadow-2xl border border-gray-200 z-50">
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg">A</div>
          <div>
            <p className="font-semibold text-gray-800">Admin User</p>
            <p className="text-xs text-gray-500">info@businessanalytics.com</p>
            <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">Professional Plan</span>
          </div>
        </div>
      </div>
      <div className="py-1">
        {[
          { icon: User, label: "My Profile", action: () => { onClose(); navigate("/settings"); } },
          { icon: Settings, label: "Settings", action: () => { onClose(); navigate("/settings"); } },
          { icon: Bell, label: "Notifications", action: () => { onClose(); navigate("/settings"); } },
        ].map(({ icon: Icon, label, action }) => (
          <button key={label} onClick={action} className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 text-sm text-gray-700">
            <Icon className="w-4 h-4 text-gray-400" />
            {label}
            <ChevronRight className="w-3 h-3 text-gray-300 ml-auto" />
          </button>
        ))}
      </div>
      <div className="border-t border-gray-100 px-4 py-2 text-[11px] text-gray-400 text-center">
        Business Analytics v2.1.0
      </div>
    </div>
  );
}

export default function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const [darkMode, setDarkMode] = useState(false);
  const [showAlerts, setShowAlerts] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [showLogout, setShowLogout] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [alertCount, setAlertCount] = useState(8);

  function closeAll() {
    setShowAlerts(false);
    setShowHelp(false);
    setShowProfile(false);
  }

  return (
    <div className={`flex h-screen overflow-hidden ${darkMode ? "bg-gray-900" : "bg-gray-50"}`}>
      {showLogout && <LogoutModal onClose={() => setShowLogout(false)} />}

      {/* Backdrop for dropdowns */}
      {(showAlerts || showHelp || showProfile) && (
        <div className="fixed inset-0 z-40" onClick={closeAll} />
      )}

      {/* Sidebar */}
      <aside className="w-[220px] flex-shrink-0 bg-[#0F172A] flex flex-col h-full overflow-y-auto">
        <div className="flex items-center gap-2.5 px-5 py-5 border-b border-[#1E293B]">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
            <BarChart3 className="w-4 h-4 text-white" />
          </div>
          <div>
            <div className="text-white font-bold text-sm leading-tight">Business Analytics</div>
            <div className="text-gray-400 text-[10px]">Dashboard</div>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-0.5">
          {navItems.map(({ icon: Icon, label, href }) => {
            const isActive = href === "/" ? location === "/" : location.startsWith(href);
            return (
              <Link key={href} href={href}>
                <div className={`flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-colors text-sm ${
                    isActive ? "bg-blue-600 text-white font-medium" : "text-gray-400 hover:bg-[#1E293B] hover:text-white"
                  }`}>
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  {label}
                </div>
              </Link>
            );
          })}
        </nav>

        {location === "/" && (
          <div className="px-4 py-3 border-t border-[#1E293B]">
            <p className="text-gray-500 text-[10px] font-semibold uppercase tracking-wider mb-2">Quick Actions</p>
            {[
              { icon: Plus, label: "Add New Sale", href: "/sales" },
              { icon: Package, label: "Add New Product", href: "/inventory" },
              { icon: FileBarChart, label: "Generate Report", href: "/reports" },
              { icon: Download, label: "Backup Data", href: "/settings" },
            ].map(({ icon: Icon, label, href }) => (
              <Link key={label} href={href}>
                <div className="flex items-center gap-2 py-1.5 text-gray-400 hover:text-white cursor-pointer transition-colors text-xs">
                  <Icon className="w-3.5 h-3.5" />
                  {label}
                </div>
              </Link>
            ))}
          </div>
        )}

        <div className="px-3 py-3 border-t border-[#1E293B] space-y-0.5">
          <button
            onClick={() => { closeAll(); setShowAlerts((v) => !v); setAlertCount(0); }}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-400 hover:bg-[#1E293B] hover:text-white cursor-pointer transition-colors text-sm">
            <Bell className="w-4 h-4" />
            <span>Alerts</span>
            {alertCount > 0 && (
              <span className="ml-auto bg-red-500 text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center">{alertCount}</span>
            )}
          </button>
          <button
            onClick={() => { closeAll(); setShowHelp((v) => !v); }}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-400 hover:bg-[#1E293B] hover:text-white cursor-pointer transition-colors text-sm">
            <HelpCircle className="w-4 h-4" />
            <span>Help & Support</span>
          </button>
          <button
            onClick={() => setShowLogout(true)}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-400 hover:bg-red-900/30 hover:text-red-400 cursor-pointer transition-colors text-sm">
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b border-gray-200 px-6 py-3 flex items-center gap-4 flex-shrink-0 relative">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="search"
              placeholder="Search anything... Ctrl+K"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              className="w-full max-w-sm pl-9 pr-4 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <button
            onClick={() => setDarkMode((v) => !v)}
            title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
            {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          <div className="relative">
            <button
              onClick={() => { closeAll(); setShowAlerts((v) => !v); setAlertCount(0); }}
              className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
              <Bell className="w-4 h-4" />
              {alertCount > 0 && <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>}
            </button>
            {showAlerts && <AlertsPanel onClose={() => setShowAlerts(false)} />}
          </div>

          <div className="relative pl-3 border-l border-gray-200">
            <button
              onClick={() => { closeAll(); setShowProfile((v) => !v); }}
              className="flex items-center gap-2 hover:bg-gray-50 rounded-lg px-2 py-1 transition-colors cursor-pointer">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold">A</div>
              <div className="text-left">
                <div className="text-sm font-medium text-gray-800">Admin</div>
              </div>
              <ChevronRight className="w-3 h-3 text-gray-400 rotate-90" />
            </button>
            {showProfile && <ProfilePanel onClose={() => setShowProfile(false)} />}
          </div>

          {showHelp && (
            <div className="absolute right-6 top-14 z-50">
              <HelpPanel onClose={() => setShowHelp(false)} />
            </div>
          )}
        </header>

        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
