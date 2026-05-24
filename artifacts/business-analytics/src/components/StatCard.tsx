import { ArrowUpRight, ArrowDownRight } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string;
  change?: number;
  changeLabel?: string;
  icon: React.ReactNode;
  iconBg: string;
}

export default function StatCard({ title, value, change, changeLabel = "vs Mar 01 - Mar 31, 2024", icon, iconBg }: StatCardProps) {
  const positive = (change ?? 0) >= 0;
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm" data-testid="stat-card">
      <div className="flex items-start gap-3">
        <div className={`w-10 h-10 ${iconBg} rounded-full flex items-center justify-center flex-shrink-0`}>
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-gray-500 text-xs font-medium mb-0.5">{title}</p>
          <p className="text-xl font-bold text-gray-900 truncate" data-testid="stat-value">{value}</p>
          {change !== undefined && (
            <div className={`flex items-center gap-1 mt-1 text-xs ${positive ? "text-emerald-600" : "text-red-500"}`}>
              {positive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
              <span>{Math.abs(change).toFixed(1)}%</span>
              <span className="text-gray-400 text-[10px]">{changeLabel}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
