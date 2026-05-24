import { motion } from "framer-motion";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string;
  change?: number;
  changeLabel?: string;
  icon: React.ReactNode;
  iconBg: string;
  index?: number;
}

export default function StatCard({
  title,
  value,
  change,
  changeLabel = "vs last period",
  icon,
  iconBg,
  index = 0,
}: StatCardProps) {
  const positive = (change ?? 0) >= 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.06, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -3, transition: { duration: 0.2 } }}
      className="group bg-white rounded-2xl border border-[#e8eaf2] p-5 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_24px_rgba(160,174,205,0.12)] hover:shadow-[0_4px_20px_rgba(160,174,205,0.22)] transition-shadow"
      data-testid="stat-card"
    >
      <div className="flex items-start gap-4">
        <motion.div
          whileTap={{ scale: 0.94 }}
          className={`w-11 h-11 ${iconBg} rounded-xl flex items-center justify-center flex-shrink-0 ring-1 ring-black/[0.04]`}
        >
          {icon}
        </motion.div>
        <div className="flex-1 min-w-0">
          <p className="text-[#64748b] text-xs font-medium tracking-wide uppercase mb-1">{title}</p>
          <p className="text-2xl font-semibold text-[#0a0a0a] tracking-tight truncate" data-testid="stat-value">
            {value}
          </p>
          {change !== undefined && (
            <div className={`flex items-center gap-1 mt-2 text-xs font-medium ${positive ? "text-emerald-600" : "text-red-500"}`}>
              {positive ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
              <span>{Math.abs(change).toFixed(1)}%</span>
              <span className="text-[#94a3b8] font-normal text-[10px] ml-0.5">{changeLabel}</span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
