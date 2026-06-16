import { motion } from "framer-motion";
import { Sparkles, TrendingUp, Zap, Target, Lightbulb } from "lucide-react";
import Layout from "@/components/Layout";
import PageShell from "@/components/PageShell";
import PageHero from "@/components/PageHero";
import GlassCard from "@/components/GlassCard";
import { useGetDashboardAiInsights } from "@workspace/api-client-react";

const ICONS = [TrendingUp, Zap, Target, Lightbulb];
const STYLES = [
  { border: "border-emerald-200/80", glow: "shadow-[0_0_24px_rgba(16,185,129,0.12)]", dot: "bg-emerald-500" },
  { border: "border-amber-200/80", glow: "shadow-[0_0_24px_rgba(245,158,11,0.12)]", dot: "bg-amber-500" },
  { border: "border-[#a0aecd]/60", glow: "shadow-[0_0_24px_rgba(160,174,205,0.25)]", dot: "bg-[#64748b]" },
  { border: "border-[#000000]/10", glow: "shadow-[0_0_24px_rgba(0,0,0,0.08)]", dot: "bg-[#000000]" },
];

export default function AiInsights() {
  const { data: aiInsights } = useGetDashboardAiInsights();
  const insights = Array.isArray(aiInsights) ? aiInsights : [];

  return (
    <Layout>
      <PageShell>
        <PageHero
          badge="Intelligence"
          title="AI Insights"
          subtitle="Predictive recommendations powered by your live business data — optimize inventory, revenue, and customer growth."
          actions={
            <span className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-[#a0aecd]/20 border border-[#a0aecd]/40 text-xs font-semibold text-[#0a0a0a]">
              <Sparkles className="w-3.5 h-3.5" />
              Live analysis
            </span>
          }
        />

        <GlassCard className="p-6" delay={0.05}>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-[#000000] flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-[#a0aecd]" />
            </div>
            <div>
              <h2 className="font-semibold text-[#0a0a0a]">Recommendation Engine</h2>
              <p className="text-xs text-[#64748b]">Updated from dashboard analytics pipeline</p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            {insights.map((insight, i) => {
              const Icon = ICONS[i % ICONS.length];
              const s = STYLES[i % STYLES.length];
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.08 + i * 0.06 }}
                  whileHover={{ scale: 1.02 }}
                  className={`rounded-2xl border p-4 bg-white/80 ${s.border} ${s.glow}`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className={`w-2 h-2 rounded-full ${s.dot}`} />
                    <Icon className="w-4 h-4 text-[#94a3b8]" />
                  </div>
                  <p className="text-sm font-semibold text-[#0a0a0a] mb-1.5">{insight.title}</p>
                  <p className="text-xs text-[#64748b] leading-relaxed">{insight.message}</p>
                </motion.div>
              );
            })}
          </div>
          {insights.length === 0 && (
            <div className="py-16 text-center text-[#94a3b8] text-sm">Loading insights from your data…</div>
          )}
        </GlassCard>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { title: "Demand signals", desc: "Cross-category velocity and seasonality patterns.", stat: "12 signals" },
            { title: "Risk alerts", desc: "Stockouts and margin compression watchlist.", stat: "3 active" },
            { title: "Growth levers", desc: "High-LTV segments and upsell opportunities.", stat: "5 actions" },
          ].map((card, i) => (
            <GlassCard key={card.title} className="p-5" delay={0.1 + i * 0.05}>
              <p className="text-[10px] uppercase tracking-wider text-[#94a3b8] font-semibold mb-1">{card.stat}</p>
              <h3 className="font-semibold text-[#0a0a0a] mb-1">{card.title}</h3>
              <p className="text-xs text-[#64748b]">{card.desc}</p>
            </GlassCard>
          ))}
        </div>
      </PageShell>
    </Layout>
  );
}
