import { useState, useRef, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, ShoppingCart, Package, TrendingUp, FileBarChart,
  Users, Settings, Bell, LogOut, BarChart3, Plus, Download,
  Search, Sun, Moon, X, AlertTriangle, CheckCircle, Info,
  ChevronRight, Mail, Phone, MessageSquare, User, HelpCircle,
  Sparkles, Menu, ExternalLink, FileBarChart as ReportIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

import { useAuth } from "../contexts/AuthContext";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/", roles: ["admin", "user"] },
  { icon: ShoppingCart, label: "Sales", href: "/sales", roles: ["user"] },
  { icon: Package, label: "Inventory", href: "/inventory", roles: ["user"] },
  { icon: TrendingUp, label: "Forecasting", href: "/forecasting", roles: ["admin"] },
  { icon: FileBarChart, label: "Reports", href: "/reports", roles: ["admin"] },
  { icon: Users, label: "Customers", href: "/customers", roles: ["user"] },
  { icon: Settings, label: "Settings", href: "/settings", roles: ["admin"] },
];

const QUICK_ACTIONS = [
  { icon: Plus, label: "Add New Sale", href: "/sales" },
  { icon: Package, label: "Add Product", href: "/inventory" },
  { icon: ReportIcon, label: "Generate Report", href: "/reports" },
  { icon: Download, label: "Backup Data", href: "/settings" },
];

const ALERTS = [
  { id: 1, type: "warning", icon: AlertTriangle, color: "text-amber-600", bg: "bg-amber-50/90", title: "Low Stock Alert", message: "Phone Chargers: only 28 units left", time: "2 min ago" },
  { id: 2, type: "warning", icon: AlertTriangle, color: "text-amber-600", bg: "bg-amber-50/90", title: "Low Stock Alert", message: "Sports Watches: only 15 units left", time: "5 min ago" },
  { id: 3, type: "error", icon: AlertTriangle, color: "text-red-600", bg: "bg-red-50/90", title: "Out of Stock", message: "Coffee Makers: 0 units remaining", time: "12 min ago" },
  { id: 4, type: "success", icon: CheckCircle, color: "text-emerald-600", bg: "bg-emerald-50/90", title: "Order Completed", message: "INV-10020 marked as delivered", time: "1 hr ago" },
  { id: 5, type: "info", icon: Info, color: "text-[#475569]", bg: "bg-[#a0aecd]/15", title: "New Customer", message: "Anjali Saxena joined as VIP member", time: "2 hr ago" },
  { id: 6, type: "warning", icon: AlertTriangle, color: "text-amber-600", bg: "bg-amber-50/90", title: "Low Stock Alert", message: "Laptop Stand: only 8 units left", time: "3 hr ago" },
  { id: 7, type: "success", icon: CheckCircle, color: "text-emerald-600", bg: "bg-emerald-50/90", title: "Revenue Milestone", message: "Monthly revenue crossed ₹1,80,000", time: "5 hr ago" },
  { id: 8, type: "info", icon: Info, color: "text-[#475569]", bg: "bg-[#a0aecd]/15", title: "Report Ready", message: "April Sales Report generated", time: "1 day ago" },
];

function DropdownBackdrop({ active, onClose }: { active: boolean; onClose: () => void }) {
  if (!active) return null;
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-40 bg-[#0a0a0a]/25 backdrop-blur-[3px]"
      onClick={onClose}
    />
  );
}

function AlertsPanel({ onClose }: { onClose: () => void }) {
  const [dismissed, setDismissed] = useState<number[]>([]);
  const visible = ALERTS.filter((a) => !dismissed.includes(a.id));
  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 10, scale: 0.98 }}
      className="absolute right-0 top-full mt-2 w-[min(24rem,calc(100vw-2rem))] bg-white/95 backdrop-blur-xl rounded-2xl shadow-[0_24px_60px_rgba(0,0,0,0.14)] border border-[#e8eaf2] z-50 overflow-hidden"
    >
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#eef0f6] bg-[#fafbfc]/80">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-[#0a0a0a]" />
          <span className="font-semibold text-[#0a0a0a] text-sm">Notifications</span>
          <span className="bg-[#000000] text-white text-[10px] rounded-full px-2 py-0.5 font-medium">{visible.length}</span>
        </div>
        <div className="flex items-center gap-2">
          <button type="button" onClick={() => setDismissed(ALERTS.map((a) => a.id))} className="text-xs text-[#64748b] hover:text-[#0a0a0a] transition-colors">Mark all read</button>
          <button type="button" onClick={onClose} className="p-1 text-[#94a3b8] hover:text-[#0a0a0a] rounded-lg"><X className="w-4 h-4" /></button>
        </div>
      </div>
      <div className="max-h-80 overflow-y-auto premium-scrollbar">
        {visible.length === 0 ? (
          <div className="py-12 text-center text-[#94a3b8] text-sm">No new notifications</div>
        ) : (
          visible.map((alert, i) => (
            <motion.div
              key={alert.id}
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.03 }}
              className={cn("flex items-start gap-3 px-4 py-3 hover:bg-[#fafbfc] border-b border-[#f4f5f9]", alert.bg)}
            >
              <alert.icon className={cn("w-4 h-4 mt-0.5 flex-shrink-0", alert.color)} />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-[#0a0a0a]">{alert.title}</p>
                <p className="text-xs text-[#64748b] mt-0.5">{alert.message}</p>
                <p className="text-[10px] text-[#94a3b8] mt-1">{alert.time}</p>
              </div>
              <button type="button" onClick={() => setDismissed((prev) => [...prev, alert.id])} className="p-0.5 text-[#cbd5e1] hover:text-[#64748b]">
                <X className="w-3 h-3" />
              </button>
            </motion.div>
          ))
        )}
      </div>
      <div className="px-4 py-2.5 border-t border-[#eef0f6] text-center bg-[#fafbfc]/60">
        <Link href="/settings"><span className="text-xs text-[#475569] hover:text-[#0a0a0a] cursor-pointer transition-colors">Manage notification settings</span></Link>
      </div>
    </motion.div>
  );
}

function HelpPanel({ onClose }: { onClose: () => void }) {
  const [ticket, setTicket] = useState({ subject: "", message: "" });
  const [sent, setSent] = useState(false);
  const [faqQuery, setFaqQuery] = useState("");
  const faqs = [
    { q: "How do I export reports?", a: "Go to Reports → select format → Export." },
    { q: "How is forecast accuracy calculated?", a: "MAPE and RMSE from your selected model." },
    { q: "Can I add bulk inventory?", a: "Use Inventory → Import CSV from the toolbar." },
  ].filter((f) => !faqQuery || f.q.toLowerCase().includes(faqQuery.toLowerCase()));

  function sendTicket() {
    if (ticket.subject && ticket.message) {
      setSent(true);
      setTimeout(() => { setSent(false); setTicket({ subject: "", message: "" }); }, 2500);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 10, scale: 0.98 }}
      className="absolute right-0 top-full mt-2 w-[min(26rem,calc(100vw-2rem))] bg-white/95 backdrop-blur-xl rounded-2xl shadow-[0_24px_60px_rgba(0,0,0,0.14)] border border-[#e8eaf2] z-50 overflow-hidden"
    >
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#eef0f6]">
        <div className="flex items-center gap-2">
          <HelpCircle className="w-4 h-4 text-[#0a0a0a]" />
          <span className="font-semibold text-[#0a0a0a] text-sm">Help & Support</span>
        </div>
        <button type="button" onClick={onClose} className="p-1 text-[#94a3b8] hover:text-[#0a0a0a] rounded-lg"><X className="w-4 h-4" /></button>
      </div>
      <div className="p-4 space-y-4 max-h-[70vh] overflow-y-auto premium-scrollbar">
        <div className="grid grid-cols-3 gap-2">
          {[
            { icon: Mail, label: "Email", sub: "support@biz.com" },
            { icon: Phone, label: "Call", sub: "+91-1800-000" },
            { icon: MessageSquare, label: "Chat", sub: "9am–6pm IST" },
          ].map(({ icon: Icon, label, sub }) => (
            <button key={label} type="button" className="flex flex-col items-center gap-1 p-3 rounded-xl border border-[#e8eaf2] bg-[#fafbfc] hover:bg-white hover:shadow-md hover:border-[#a0aecd]/50 transition-all text-center">
              <Icon className="w-4 h-4 text-[#0a0a0a]" />
              <span className="text-[11px] font-semibold text-[#0a0a0a]">{label}</span>
              <span className="text-[10px] text-[#64748b]">{sub}</span>
            </button>
          ))}
        </div>
        <div>
          <p className="text-xs font-semibold text-[#0a0a0a] mb-2">FAQ</p>
          <div className="relative mb-2">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#94a3b8]" />
            <input
              value={faqQuery}
              onChange={(e) => setFaqQuery(e.target.value)}
              placeholder="Search help..."
              className="w-full pl-8 pr-3 py-2 text-xs border border-[#e8eaf2] rounded-lg bg-[#f4f5f9] focus:outline-none focus:ring-2 focus:ring-[#a0aecd]/50"
            />
          </div>
          <div className="space-y-2">
            {faqs.map((f) => (
              <div key={f.q} className="p-2.5 rounded-lg border border-[#eef0f6] bg-[#fafbfc]/80">
                <p className="text-xs font-medium text-[#0a0a0a]">{f.q}</p>
                <p className="text-[11px] text-[#64748b] mt-0.5">{f.a}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="space-y-2">
          <p className="text-xs font-semibold text-[#0a0a0a]">Quick Links</p>
          {["Documentation", "Video Tutorials", "API Reference", "Release Notes"].map((link) => (
            <button key={link} type="button" className="w-full flex items-center justify-between text-xs text-[#64748b] hover:text-[#0a0a0a] py-1.5 border-b border-[#f4f5f9] transition-colors">
              <span>{link}</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          ))}
        </div>
        <div className="space-y-2">
          <p className="text-xs font-semibold text-[#0a0a0a]">Submit a Ticket</p>
          {sent ? (
            <div className="bg-emerald-50 text-emerald-700 text-xs px-3 py-2.5 rounded-xl text-center font-medium border border-emerald-200">
              Ticket submitted! We&apos;ll respond within 24 hours.
            </div>
          ) : (
            <>
              <input value={ticket.subject} onChange={(e) => setTicket((p) => ({ ...p, subject: e.target.value }))}
                placeholder="Subject" className="input-premium w-full text-xs" />
              <textarea value={ticket.message} onChange={(e) => setTicket((p) => ({ ...p, message: e.target.value }))}
                placeholder="Describe your issue..." rows={3}
                className="input-premium w-full text-xs resize-none" />
              <button type="button" onClick={sendTicket} className="w-full btn-primary text-xs">Submit Ticket</button>
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
}

function QuickActionsPanel({ onClose }: { onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 10, scale: 0.98 }}
      className="absolute left-0 top-full mt-2 w-56 bg-white/95 backdrop-blur-xl rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.12)] border border-[#e8eaf2] z-50 py-2 overflow-hidden"
    >
      <p className="px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-[#94a3b8]">Quick Actions</p>
      {QUICK_ACTIONS.map(({ icon: Icon, label, href }) => (
        <Link key={label} href={href}>
          <button type="button" onClick={onClose} className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-[#475569] hover:bg-[#f4f5f9] hover:text-[#0a0a0a] transition-colors">
            <Icon className="w-4 h-4 text-[#94a3b8]" />
            {label}
          </button>
        </Link>
      ))}
    </motion.div>
  );
}

function LogoutModal({ onClose }: { onClose: () => void }) {
  const { logout } = useAuth();
  function doLogout() {
    onClose();
    logout();
  }
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 backdrop-blur-md z-[100] flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.92, opacity: 0, y: 12 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.92, opacity: 0 }}
        transition={{ type: "spring", stiffness: 400, damping: 30 }}
        className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-[0_32px_80px_rgba(0,0,0,0.2)] w-full max-w-sm p-6 text-center border border-[#e8eaf2]"
      >
        <motion.div animate={{ scale: [1, 1.05, 1] }} transition={{ duration: 0.6 }} className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-4 ring-1 ring-red-100">
          <LogOut className="w-6 h-6 text-red-600" />
        </motion.div>
        <h2 className="text-lg font-bold text-[#0a0a0a] mb-1">Sign Out?</h2>
        <p className="text-sm text-[#64748b] mb-5">You will be signed out of Business Analytics. Unsaved changes may be lost.</p>
        <div className="flex gap-3">
          <button type="button" onClick={onClose} className="flex-1 btn-secondary">Cancel</button>
          <button type="button" onClick={doLogout} className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-xl text-sm font-medium hover:bg-red-700 transition-colors">Sign Out</button>
        </div>
      </motion.div>
    </motion.div>
  );
}

function ProfilePanel({ onClose }: { onClose: () => void }) {
  const [, navigate] = useLocation();
  const { user } = useAuth();

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      className="absolute right-0 top-full mt-2 w-72 bg-white/95 backdrop-blur-xl rounded-2xl shadow-[0_24px_60px_rgba(0,0,0,0.14)] border border-[#e8eaf2] z-50 overflow-hidden"
    >
      <div className="p-4 border-b border-[#eef0f6] bg-gradient-to-br from-[#fafbfc] to-[#f4f5f9]">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-[#a0aecd] rounded-xl flex items-center justify-center text-[#000000] font-bold text-lg shadow-inner">{user?.name?.charAt(0).toUpperCase()}</div>
          <div>
            <p className="font-semibold text-[#0a0a0a]">{user?.name}</p>
            <p className="text-xs text-[#64748b]">{user?.email}</p>
            <span className="text-[10px] bg-[#000000] text-white px-2 py-0.5 rounded-full font-medium mt-1 inline-block capitalize">{user?.role}</span>
          </div>
        </div>
      </div>
      <div className="py-1">
        {[
          { icon: User, label: "My Profile", action: () => { onClose(); navigate("/settings"); } },
          { icon: Settings, label: "Settings", action: () => { onClose(); navigate("/settings"); } },
          { icon: Bell, label: "Notifications", action: () => { onClose(); navigate("/settings"); } },
        ].map(({ icon: Icon, label, action }) => (
          <button key={label} type="button" onClick={action} className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-[#fafbfc] text-sm text-[#475569] transition-colors">
            <Icon className="w-4 h-4 text-[#94a3b8]" />
            {label}
            <ChevronRight className="w-3 h-3 text-[#cbd5e1] ml-auto" />
          </button>
        ))}
      </div>
      <div className="border-t border-[#eef0f6] px-4 py-2 text-[11px] text-[#94a3b8] text-center">Business Analytics v2.2.0</div>
    </motion.div>
  );
}

function NavLink({ icon: Icon, label, href, isActive, onNavigate }: {
  icon: typeof LayoutDashboard; label: string; href: string; isActive: boolean; onNavigate?: () => void;
}) {
  return (
    <Link href={href}>
      <button
        type="button"
        onClick={onNavigate}
        className={cn(
          "relative flex items-center gap-1.5 px-2.5 xl:px-3 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap nav-glow flex-shrink-0",
          isActive ? "text-[#0a0a0a]" : "text-[#64748b] hover:text-[#0a0a0a]"
        )}
      >
        {isActive && (
          <motion.span
            layoutId="nav-indicator"
            className="absolute inset-0 rounded-xl bg-[#a0aecd]/25 border border-[#a0aecd]/40 shadow-[0_0_20px_rgba(160,174,205,0.35)]"
            transition={{ type: "spring", stiffness: 380, damping: 32 }}
          />
        )}
        <Icon className={cn("w-4 h-4 relative z-10", isActive && "text-[#000000]")} />
        <span className="relative z-10">{label}</span>
        {isActive && (
          <motion.span
            layoutId="nav-underline"
            className="absolute -bottom-0.5 left-2 right-2 h-0.5 bg-[#000000] rounded-full"
          />
        )}
      </button>
    </Link>
  );
}

export default function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const [darkMode, setDarkMode] = useState(false);
  const [showAlerts, setShowAlerts] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [showLogout, setShowLogout] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showQuick, setShowQuick] = useState(false);
  const [mobileNav, setMobileNav] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const [alertCount, setAlertCount] = useState(8);
  const navRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();

  const overlayActive = showAlerts || showHelp || showProfile || showQuick || showLogout || searchFocused;

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
  }, [darkMode]);

  function closeAll() {
    setShowAlerts(false);
    setShowHelp(false);
    setShowProfile(false);
    setShowQuick(false);
    setMobileNav(false);
  }

  const isActive = (href: string) => (href === "/" ? location === "/" : location.startsWith(href));

  return (
    <div className={cn("min-h-screen flex flex-col gradient-mesh", darkMode ? "dark bg-[#0a0a0a]" : "bg-[#f4f5f9]")}>
      <AnimatePresence>{showLogout && <LogoutModal onClose={() => setShowLogout(false)} />}</AnimatePresence>
      <DropdownBackdrop active={overlayActive && !showLogout} onClose={() => { closeAll(); setSearchFocused(false); }} />

      <header className="sticky top-0 z-50 flex-shrink-0">
        <div className="border-b border-[#e8eaf2]/60 bg-white/65 backdrop-blur-2xl backdrop-saturate-150 shadow-[0_1px_0_rgba(255,255,255,0.9)_inset,0_8px_32px_rgba(160,174,205,0.1)]">
          <div className="px-3 sm:px-5 lg:px-6 h-[3.75rem] flex items-center gap-2 sm:gap-3">
            <Link href="/">
              <div className="flex items-center gap-2 flex-shrink-0 group cursor-pointer">
                <div className="w-9 h-9 bg-[#000000] rounded-xl flex items-center justify-center ring-1 ring-[#a0aecd]/30 group-hover:shadow-[0_0_24px_rgba(160,174,205,0.45)] transition-shadow">
                  <BarChart3 className="w-4 h-4 text-[#a0aecd]" />
                </div>
                <div className="hidden md:block">
                  <div className="text-[#0a0a0a] font-semibold text-sm tracking-tight leading-none">Business Analytics</div>
                  <div className="text-[#94a3b8] text-[10px] tracking-wide uppercase mt-0.5">Enterprise</div>
                </div>
              </div>
            </Link>

            <nav ref={navRef} className="hidden lg:flex items-center gap-0.5 flex-1 justify-start xl:justify-center overflow-x-auto premium-scrollbar px-1">
              {navItems.filter(item => user && item.roles.includes(user.role)).map(({ icon, label, href }) => (
                <NavLink key={href} icon={icon} label={label} href={href} isActive={isActive(href)} />
              ))}
            </nav>

            <div className="flex-1 max-w-[11rem] sm:max-w-xs lg:max-w-[10rem] xl:max-w-xs ml-auto lg:ml-0 relative hidden sm:block">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#94a3b8]" />
              <input
                type="search"
                placeholder="Search…"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setTimeout(() => setSearchFocused(false), 150)}
                className={cn(
                  "w-full pl-8 pr-3 py-1.5 text-sm rounded-xl border transition-all duration-300",
                  searchFocused
                    ? "bg-white border-[#a0aecd]/60 ring-2 ring-[#a0aecd]/30 shadow-[0_0_24px_rgba(160,174,205,0.2)]"
                    : "bg-[#f4f5f9]/80 border-[#e8eaf2] focus:outline-none"
                )}
              />
            </div>

            <div className="flex items-center gap-0.5 sm:gap-1 flex-shrink-0">
              <div className="relative hidden md:block">
                <button
                  type="button"
                  onClick={() => { closeAll(); setShowQuick((v) => !v); }}
                  className="flex items-center gap-1 px-2.5 py-2 text-sm font-medium text-[#475569] hover:text-[#0a0a0a] hover:bg-[#f4f5f9] rounded-xl transition-all"
                >
                  <Plus className="w-4 h-4" />
                  <span className="hidden xl:inline">Quick</span>
                </button>
                <AnimatePresence>{showQuick && <QuickActionsPanel onClose={() => setShowQuick(false)} />}</AnimatePresence>
              </div>

              <Link href="/ai-insights">
                <button type="button" className={cn(
                  "hidden md:flex items-center gap-1 px-2.5 py-2 text-sm font-medium rounded-xl transition-all",
                  location === "/ai-insights"
                    ? "bg-[#a0aecd]/25 text-[#000000] shadow-[0_0_16px_rgba(160,174,205,0.3)]"
                    : "text-[#475569] hover:text-[#0a0a0a] hover:bg-[#f4f5f9]"
                )}>
                  <Sparkles className="w-4 h-4" />
                  <span className="hidden xl:inline">AI</span>
                </button>
              </Link>

              <div className="relative">
                <button type="button" onClick={() => { closeAll(); setShowHelp((v) => !v); }} className="p-2 text-[#64748b] hover:bg-[#f4f5f9] rounded-xl transition-colors" title="Help & Support">
                  <HelpCircle className="w-4 h-4" />
                </button>
                <AnimatePresence>{showHelp && <HelpPanel onClose={() => setShowHelp(false)} />}</AnimatePresence>
              </div>

              <div className="relative">
                <button type="button" onClick={() => { closeAll(); setShowAlerts((v) => !v); setAlertCount(0); }} className="relative p-2 text-[#64748b] hover:bg-[#f4f5f9] rounded-xl transition-colors">
                  <Bell className="w-4 h-4" />
                  {alertCount > 0 && <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#000000] rounded-full ring-2 ring-white" />}
                </button>
                <AnimatePresence>{showAlerts && <AlertsPanel onClose={() => setShowAlerts(false)} />}</AnimatePresence>
              </div>

              <button type="button" onClick={() => setDarkMode((v) => !v)} className="p-2 text-[#64748b] hover:bg-[#f4f5f9] rounded-xl transition-colors hidden sm:flex">
                {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>

              <div className="relative hidden sm:block pl-1 border-l border-[#e8eaf2]">
                <button type="button" onClick={() => { closeAll(); setShowProfile((v) => !v); }} className="flex items-center gap-1.5 hover:bg-[#f4f5f9] rounded-xl px-1.5 py-1 transition-colors">
                  <div className="w-8 h-8 bg-[#a0aecd] rounded-lg flex items-center justify-center text-[#000000] text-xs font-bold">A</div>
                  <ChevronRight className="w-3 h-3 text-[#94a3b8] rotate-90 hidden xl:block" />
                </button>
                <AnimatePresence>{showProfile && <ProfilePanel onClose={() => setShowProfile(false)} />}</AnimatePresence>
              </div>

              <button type="button" onClick={() => setShowLogout(true)} className="p-2 text-[#64748b] hover:bg-red-50 hover:text-red-600 rounded-xl transition-colors hidden sm:flex" title="Logout">
                <LogOut className="w-4 h-4" />
              </button>

              <button type="button" onClick={() => setMobileNav((v) => !v)} className="p-2 text-[#64748b] hover:bg-[#f4f5f9] rounded-xl lg:hidden">
                {mobileNav ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        <AnimatePresence>
          {mobileNav && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden border-b border-[#e8eaf2] bg-white/95 backdrop-blur-xl overflow-hidden"
            >
              <nav className="p-3 grid grid-cols-2 gap-1">
                {navItems.filter(item => user && item.roles.includes(user.role)).map(({ icon: Icon, label, href }) => (
                  <Link key={href} href={href}>
                    <button
                      type="button"
                      onClick={() => setMobileNav(false)}
                      className={cn(
                        "w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium",
                        isActive(href) ? "bg-[#a0aecd]/25 text-[#000000]" : "text-[#64748b] hover:bg-[#f4f5f9]"
                      )}
                    >
                      <Icon className="w-4 h-4" />
                      {label}
                    </button>
                  </Link>
                ))}
                {user?.role === "admin" && (
                  <Link href="/ai-insights">
                    <button type="button" onClick={() => setMobileNav(false)} className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm text-[#64748b]">
                      <Sparkles className="w-4 h-4" /> AI Insights
                    </button>
                  </Link>
                )}
                <button type="button" onClick={() => { setMobileNav(false); setShowLogout(true); }} className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm text-red-600">
                  <LogOut className="w-4 h-4" /> Logout
                </button>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <main className={cn("flex-1 overflow-y-auto premium-scrollbar transition-[filter,opacity] duration-300", overlayActive && "focus-backdrop-active")}>
        <motion.div key={location} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}>
          {children}
        </motion.div>
      </main>

      <Link href="/sales">
        <motion.button
          type="button"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="lg:hidden fixed bottom-6 right-6 z-40 w-12 h-12 bg-[#000000] text-white rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.25)] flex items-center justify-center ring-2 ring-[#a0aecd]/40"
          aria-label="Quick action"
        >
          <Plus className="w-5 h-5" />
        </motion.button>
      </Link>
    </div>
  );
}
