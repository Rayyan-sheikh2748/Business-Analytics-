import { motion } from "framer-motion";
import { Package, ShoppingCart, Users, TrendingUp, AlertTriangle } from "lucide-react";
import GlassCard from "@/components/GlassCard";

const EVENTS = [
  { icon: ShoppingCart, label: "New order completed", detail: "INV-10020 · Wireless Headphones", time: "12 min ago", color: "text-emerald-600", bg: "bg-emerald-50" },
  { icon: AlertTriangle, label: "Low stock warning", detail: "Phone Chargers — 28 units left", time: "2 hr ago", color: "text-amber-600", bg: "bg-amber-50" },
  { icon: Users, label: "VIP customer joined", detail: "Anjali Saxena · Mumbai", time: "5 hr ago", color: "text-[#475569]", bg: "bg-[#a0aecd]/20" },
  { icon: TrendingUp, label: "Revenue milestone", detail: "Monthly revenue crossed ₹1.8L", time: "Yesterday", color: "text-[#000000]", bg: "bg-[#f4f5f9]" },
  { icon: Package, label: "Inventory restocked", detail: "Basmati Rice +120 units", time: "2 days ago", color: "text-[#64748b]", bg: "bg-[#f4f5f9]" },
];

export default function ActivityTimeline() {
  return (
    <GlassCard className="p-4 sm:p-5" delay={0.15}>
      <h3 className="font-semibold text-[#0a0a0a] mb-4">Activity Timeline</h3>
      <div className="space-y-0">
        {EVENTS.map((event, i) => (
          <motion.div
            key={event.label}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.18 + i * 0.05 }}
            className="flex gap-3 relative pb-5 last:pb-0"
          >
            {i < EVENTS.length - 1 && (
              <span className="absolute left-[15px] top-8 bottom-0 w-px bg-[#e8eaf2]" />
            )}
            <div className={`w-8 h-8 rounded-lg ${event.bg} flex items-center justify-center flex-shrink-0 z-10 ring-1 ring-black/[0.04]`}>
              <event.icon className={`w-4 h-4 ${event.color}`} />
            </div>
            <div className="flex-1 min-w-0 pt-0.5">
              <p className="text-xs font-semibold text-[#0a0a0a]">{event.label}</p>
              <p className="text-[11px] text-[#64748b] truncate">{event.detail}</p>
              <p className="text-[10px] text-[#94a3b8] mt-0.5">{event.time}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </GlassCard>
  );
}
