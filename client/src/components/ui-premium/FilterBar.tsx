import { motion } from "framer-motion";

interface FilterBarProps {
  children: React.ReactNode;
  className?: string;
}

export default function FilterBar({ children, className = "" }: FilterBarProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={`glass-panel rounded-2xl p-4 ${className}`}
    >
      <div className="flex items-center gap-3 flex-wrap">{children}</div>
    </motion.div>
  );
}
