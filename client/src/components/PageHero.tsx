import { motion } from "framer-motion";

interface PageHeroProps {
  title: string;
  subtitle?: string;
  badge?: string;
  actions?: React.ReactNode;
}

export default function PageHero({ title, subtitle, badge, actions }: PageHeroProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"
    >
      <div>
        {badge && (
          <span className="inline-flex items-center gap-1.5 mb-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#64748b]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#a0aecd] animate-pulse" />
            {badge}
          </span>
        )}
        <h1 className="text-2xl sm:text-3xl font-semibold text-[#0a0a0a] tracking-tight">{title}</h1>
        {subtitle && <p className="text-[#64748b] text-sm mt-1.5 max-w-xl leading-relaxed">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2 sm:gap-3">{actions}</div>}
    </motion.div>
  );
}
