import { motion } from "framer-motion";

interface PageShellProps {
  children: React.ReactNode;
  className?: string;
}

export default function PageShell({ children, className = "" }: PageShellProps) {
  return (
    <div className={`relative min-h-full ${className}`}>
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-24 right-0 h-72 w-72 rounded-full bg-[#a0aecd]/20 blur-3xl" />
        <div className="absolute bottom-0 left-1/4 h-64 w-64 rounded-full bg-[#000000]/[0.03] blur-3xl" />
      </div>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="relative p-4 sm:p-6 lg:p-8 space-y-5 sm:space-y-6 max-w-[1600px] mx-auto"
      >
        {children}
      </motion.div>
    </div>
  );
}
