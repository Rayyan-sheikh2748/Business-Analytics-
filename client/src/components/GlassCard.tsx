import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  delay?: number;
  onClick?: () => void;
}

export default function GlassCard({
  children,
  className,
  hover = true,
  delay = 0,
  onClick,
}: GlassCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: [0.22, 1, 0.36, 1] }}
      whileHover={hover ? { y: -2, transition: { duration: 0.2 } } : undefined}
      onClick={onClick}
      className={cn(
        "rounded-2xl border border-[#e8eaf2]/80 bg-white/75 backdrop-blur-xl",
        "shadow-[0_1px_2px_rgba(0,0,0,0.03),0_12px_40px_rgba(160,174,205,0.14)]",
        hover && "hover:shadow-[0_8px_32px_rgba(160,174,205,0.22)] hover:border-[#a0aecd]/40 transition-shadow duration-300",
        onClick && "cursor-pointer",
        className
      )}
    >
      {children}
    </motion.div>
  );
}
