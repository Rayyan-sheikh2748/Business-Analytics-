import { motion } from "framer-motion";
import { Inbox } from "lucide-react";

interface EmptyStateProps {
  title?: string;
  description?: string;
}

export default function EmptyState({
  title = "No data found",
  description = "Try adjusting your filters or add a new record.",
}: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="py-14 flex flex-col items-center text-center"
    >
      <div className="w-14 h-14 rounded-2xl bg-[#f4f5f9] flex items-center justify-center mb-3 ring-1 ring-[#e8eaf2]">
        <Inbox className="w-6 h-6 text-[#94a3b8]" />
      </div>
      <p className="text-sm font-medium text-[#475569]">{title}</p>
      <p className="text-xs text-[#94a3b8] mt-1 max-w-xs">{description}</p>
    </motion.div>
  );
}
