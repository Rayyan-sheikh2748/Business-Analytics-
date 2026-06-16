import { RefreshCw } from "lucide-react";
import GlassCard from "@/components/GlassCard";

interface DataTableProps {
  title: string;
  onRefresh?: () => void;
  headers: string[];
  children: React.ReactNode;
  footer?: React.ReactNode;
  delay?: number;
}

export default function DataTable({
  title,
  onRefresh,
  headers,
  children,
  footer,
  delay = 0,
}: DataTableProps) {
  return (
    <GlassCard className="overflow-hidden p-0" delay={delay} hover={false}>
      <div className="flex items-center justify-between px-4 sm:px-5 py-4 border-b border-[#eef0f6]">
        <h3 className="font-semibold text-[#0a0a0a]">{title}</h3>
        {onRefresh && (
          <button
            type="button"
            onClick={onRefresh}
            className="p-2 text-[#94a3b8] hover:text-[#0a0a0a] hover:bg-[#f4f5f9] rounded-xl transition-colors"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        )}
      </div>
      <div className="overflow-x-auto premium-scrollbar">
        <table className="w-full text-xs">
          <thead className="bg-[#fafbfc]/90 border-b border-[#eef0f6]">
            <tr>
              {headers.map((h) => (
                <th key={h} className="text-left px-4 py-3 font-medium text-[#94a3b8] whitespace-nowrap">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#f4f5f9]">{children}</tbody>
        </table>
      </div>
      {footer && <div className="border-t border-[#eef0f6]">{footer}</div>}
    </GlassCard>
  );
}
