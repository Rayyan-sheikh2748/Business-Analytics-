import { useState } from "react";
import { TrendingUp, Brain } from "lucide-react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend,
} from "recharts";
import Layout from "@/components/Layout";
import PageShell from "@/components/PageShell";
import PageHero from "@/components/PageHero";
import GlassCard from "@/components/GlassCard";
import StatCard from "@/components/StatCard";
import FilterBar from "@/components/ui-premium/FilterBar";
import { formatINR } from "@/lib/format";
import { Sparkles } from "lucide-react";
import { chartTooltipStyle, chartGridStroke, chartTickFill } from "@/components/ui-premium/chartStyles";
import {
  useGetForecast, useGetForecastBreakdown, useGetForecastHeatmap,
  useGetForecastModelComparison, useGetInventory,
} from "@workspace/api-client-react";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const DAY_KEYS = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"] as const;

function heatColor(intensity: number): string {
  if (intensity > 80) return "#000000";
  if (intensity > 60) return "#1a1a1a";
  if (intensity > 40) return "#64748b";
  if (intensity > 20) return "#a0aecd";
  return "#f4f5f9";
}

export default function Forecasting() {
  const [selectedProduct, setSelectedProduct] = useState("All Products");
  const [selectedModel, setSelectedModel] = useState("ARIMA");
  const [selectedHorizon, setSelectedHorizon] = useState(90);

  const [appliedParams, setAppliedParams] = useState({
    productName: "All Products",
    model: "ARIMA",
    horizon: 90,
  });

  const { data: inventoryData } = useGetInventory({ limit: 1000 });
  const productNames = (inventoryData?.data ?? []).map((p) => p.product);

  const queryParams = {
    model: appliedParams.model,
    productName: appliedParams.productName !== "All Products" ? appliedParams.productName : undefined,
    horizon: appliedParams.horizon,
  };

  const { data: forecast } = useGetForecast(queryParams);
  const { data: breakdown } = useGetForecastBreakdown(queryParams);
  const { data: heatmap } = useGetForecastHeatmap({
    productName: queryParams.productName,
    model: queryParams.model,
  });
  const { data: modelComparison } = useGetForecastModelComparison({
    productName: queryParams.productName,
    model: queryParams.model,
  });

  const handleGenerateForecast = () => {
    setAppliedParams({
      productName: selectedProduct,
      model: selectedModel,
      horizon: selectedHorizon,
    });
  };

  const chartData = forecast?.chartData ?? [];

  return (
    <Layout>
      <PageShell>
        <PageHero
          badge="Predictive"
          title="Demand Forecasting"
          subtitle="AI-powered demand predictions to optimize inventory and revenue planning."
        />

        <FilterBar>
            <select
              value={selectedProduct}
              onChange={(e) => setSelectedProduct(e.target.value)}
              className="select-premium"
            >
              <option>All Products</option>
              {productNames.map((p) => <option key={p}>{p}</option>)}
            </select>
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              className="select-premium"
            >
              {["ARIMA", "Prophet", "Linear Regression", "Exponential Smoothing"].map((m) => <option key={m}>{m}</option>)}
            </select>
            <select className="select-premium">
              <option>Monthly</option><option>Quarterly</option><option>Yearly</option>
            </select>
            <input type="date" className="input-premium" />
            <select
              value={selectedHorizon}
              onChange={(e) => setSelectedHorizon(Number(e.target.value))}
              className="select-premium"
            >
              <option value={90}>3 Months</option>
              <option value={180}>6 Months</option>
              <option value={365}>12 Months</option>
            </select>
            <button type="button" onClick={handleGenerateForecast} className="btn-primary">Generate Forecast</button>
        </FilterBar>

        <GlassCard className="p-4 sm:p-5 border-[#a0aecd]/40 bg-gradient-to-br from-[#a0aecd]/10 to-white/80" delay={0.05}>
          <div className="flex items-center gap-2 mb-4">
            <Brain className="w-4 h-4 text-[#000000]" />
            <h3 className="font-semibold text-[#0a0a0a] text-sm">Model Performance Metrics ({appliedParams.model})</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { label: "MAPE", value: `${(forecast?.mape ?? 8.4).toFixed(1)}%`, good: (forecast?.mape ?? 8.4) < 15, desc: "Lower is better" },
              { label: "RMSE", value: formatINR(forecast?.rmse ?? 1250), good: true, desc: "Lower is better" },
              { label: "Accuracy", value: `${(forecast?.accuracy ?? 91.6).toFixed(1)}%`, good: (forecast?.accuracy ?? 91.6) > 85, desc: "Higher is better" },
            ].map(({ label, value, good, desc }) => (
              <div key={label} className="bg-white/90 rounded-xl p-3 border border-[#e8eaf2]">
                <p className="text-xs text-[#64748b] mb-1">{label}</p>
                <p className={`text-xl font-semibold ${good ? "text-emerald-600" : "text-amber-600"}`}>{value}</p>
                <p className="text-[10px] text-[#94a3b8]">{desc}</p>
              </div>
            ))}
          </div>
        </GlassCard>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4">
          <StatCard title="Forecasted Sales" value={formatINR(forecast?.forecastedSales ?? 0)} index={0}
            icon={<TrendingUp className="w-5 h-5 text-[#000000]" />} iconBg="bg-[#a0aecd]/30" changeLabel="Next 3 months" />
          <StatCard title="Avg Daily Demand" value={`${forecast?.avgDailyDemand ?? 0} units`} index={1}
            icon={<Brain className="w-5 h-5 text-[#475569]" />} iconBg="bg-[#f1f3f8]" changeLabel="Per day" />
          <StatCard title="Peak Demand Day" value={forecast?.peakDemandDay ?? "—"} index={2}
            icon={<Sparkles className="w-5 h-5 text-[#000000]" />} iconBg="bg-[#a0aecd]/20" changeLabel="Highest day" />
          <StatCard title="Revenue Forecast" value={formatINR(forecast?.totalRevenueForecast ?? 0)} index={3}
            icon={<TrendingUp className="w-5 h-5 text-[#64748b]" />} iconBg="bg-[#f1f3f8]" changeLabel="Projected" />
          <StatCard title="Recommended Stock" value={`${forecast?.recommendedStock ?? 0} units`} index={4}
            icon={<Brain className="w-5 h-5 text-[#000000]" />} iconBg="bg-[#a0aecd]/30" changeLabel="Safety buffer" />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
          <GlassCard className="xl:col-span-8 p-4 sm:p-5" delay={0.1}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-[#0a0a0a]">Demand Forecast</h3>
              <div className="flex items-center gap-3 text-xs">
                <div className="flex items-center gap-1.5"><div className="w-3 h-0.5 bg-[#000000]" /><span className="text-[#64748b]">Historical</span></div>
                <div className="flex items-center gap-1.5"><div className="w-3 h-0.5 bg-[#a0aecd]" /><span className="text-[#64748b]">Forecast</span></div>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke={chartGridStroke} />
                <XAxis dataKey="label" tick={{ fontSize: 10, fill: chartTickFill }} />
                <YAxis tick={{ fontSize: 10, fill: chartTickFill }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                <Tooltip formatter={(v: number, name: string) => [formatINR(v), name]} contentStyle={chartTooltipStyle} />
                <Legend wrapperStyle={{ fontSize: 10 }} />
                <Line type="monotone" dataKey="historical" stroke="#000000" strokeWidth={2} dot={false} name="Historical" connectNulls />
                <Line type="monotone" dataKey="forecasted" stroke="#a0aecd" strokeWidth={2} dot={false} name="Forecast" strokeDasharray="5 5" connectNulls />
                <Line type="monotone" dataKey="upperBound" stroke="#cbd5e1" strokeWidth={1} dot={false} name="Upper Bound" connectNulls />
                <Line type="monotone" dataKey="lowerBound" stroke="#cbd5e1" strokeWidth={1} dot={false} name="Lower Bound" connectNulls />
              </LineChart>
            </ResponsiveContainer>
          </GlassCard>

          <GlassCard className="xl:col-span-4 p-4 sm:p-5" delay={0.12}>
            <h3 className="font-semibold text-[#0a0a0a] mb-3">Forecast Summary</h3>
            <div className="space-y-2">
              {(breakdown ?? []).map((row) => (
                <div key={row.period} className="flex items-center justify-between py-2 border-b border-[#f4f5f9] text-xs">
                  <div>
                    <p className="font-medium text-[#0a0a0a]">{row.period}</p>
                    <p className="text-[#94a3b8]">{row.forecastedDemand} units forecast</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-[#0a0a0a]">{formatINR(row.revenueForecast)}</p>
                    <p className="text-[10px] text-[#94a3b8]">
                      {formatINR(row.lowerBound)} - {formatINR(row.upperBound)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <GlassCard className="p-4 sm:p-5" delay={0.14}>
            <h3 className="font-semibold text-[#0a0a0a] mb-3">Model Comparison</h3>
            <div className="space-y-3">
              {(modelComparison ?? []).map((m) => {
                const accuracy = Math.max(0, 100 - m.mape);
                return (
                  <div key={m.model} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-700">
                        {m.model}
                        {m.isRecommended && <span className="ml-1.5 text-emerald-600 font-medium">(Recommended)</span>}
                      </span>
                      <span className="font-semibold text-gray-800">{accuracy.toFixed(1)}% accuracy</span>
                    </div>
                    <div className="h-2 bg-[#f4f5f9] rounded-full overflow-hidden">
                      <div className="h-full bg-[#000000] rounded-full transition-all" style={{ width: `${accuracy}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </GlassCard>

          <GlassCard className="p-4 sm:p-5" delay={0.16}>
            <h3 className="font-semibold text-[#0a0a0a] mb-3">Weekly Forecast Breakdown</h3>
            <table className="w-full text-xs">
              <thead className="border-b border-[#eef0f6]">
                <tr>
                  {["Period", "Units", "Revenue", "Bounds"].map((h) => (
                    <th key={h} className="text-left pb-2 font-medium text-[#94a3b8]">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f4f5f9]">
                {(breakdown ?? []).slice(0, 6).map((row) => (
                  <tr key={row.period} className="table-row-hover">
                    <td className="py-2 text-[#475569]">{row.period}</td>
                    <td className="py-2 text-[#64748b]">{row.forecastedDemand}</td>
                    <td className="py-2 font-medium text-[#0a0a0a]">{formatINR(row.revenueForecast)}</td>
                    <td className="py-2 text-[#94a3b8]">{formatINR(row.lowerBound)}-{formatINR(row.upperBound)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </GlassCard>

          <GlassCard className="p-4 sm:p-5" delay={0.18}>
            <h3 className="font-semibold text-[#0a0a0a] mb-3">Daily Demand Heatmap</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-[10px]">
                <thead>
                  <tr>
                    <th className="text-left pr-2 text-[#94a3b8] font-medium">Week</th>
                    {DAYS.map((d) => <th key={d} className="text-center text-[#94a3b8] font-medium pb-1">{d}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {(heatmap ?? []).map((row) => (
                    <tr key={row.week}>
                      <td className="pr-2 text-[#64748b] py-0.5">W{row.week}</td>
                      {DAY_KEYS.map((key, di) => {
                        const val = row[key];
                        return (
                          <td key={di} className="px-0.5 py-0.5">
                            <div className="w-full h-6 rounded text-center flex items-center justify-center text-[9px] font-medium"
                              style={{ background: heatColor(val), color: val > 40 ? "white" : "#374151" }}>
                              {val}
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex items-center gap-2 mt-2 text-[9px] text-[#94a3b8]">
              <span>Low</span>
              {["#f4f5f9", "#a0aecd", "#64748b", "#1a1a1a", "#000000"].map((c) => (
                <div key={c} className="w-4 h-3 rounded" style={{ background: c }} />
              ))}
              <span>High</span>
            </div>
          </GlassCard>
        </div>

        <GlassCard className="p-4 sm:p-5" delay={0.2}>
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-4 h-4 text-[#000000]" />
            <h3 className="font-semibold text-[#0a0a0a]">AI Forecast Insights</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {(forecast && forecast.avgDailyDemand > 0 ? [
              { title: "Demand Outlook", msg: `Average daily demand is ${forecast.avgDailyDemand} units. Plan procurement to meet ${forecast.forecastedSales?.toLocaleString()} forecasted units over the next period.`, color: "bg-amber-50/90 border-amber-200/80" },
              { title: "Stock Recommendation", msg: `Recommended safety stock: ${forecast.recommendedStock?.toLocaleString()} units (includes 20% buffer). Peak demand expected on ${forecast.peakDemandDay} at ~${forecast.peakDemandUnits} units.`, color: "bg-[#a0aecd]/15 border-[#a0aecd]/40" },
              { title: "Revenue Projection", msg: `Projected revenue: ${formatINR(forecast.totalRevenueForecast ?? 0)} based on current trends. Model accuracy: ${forecast.accuracy?.toFixed(1)}% (${appliedParams.model}).`, color: "bg-emerald-50/90 border-emerald-200/80" },
            ] : [
              { title: "No Forecast Data", msg: "Upload a sales CSV file to generate AI-powered demand forecasts and stock recommendations.", color: "bg-[#a0aecd]/15 border-[#a0aecd]/40" },
            ]).map((insight) => (
              <div key={insight.title} className={`${insight.color} border rounded-xl p-3 hover:shadow-md transition-shadow`}>
                <p className="text-xs font-semibold text-[#0a0a0a] mb-1">{insight.title}</p>
                <p className="text-[11px] text-[#64748b]">{insight.msg}</p>
              </div>
            ))}
          </div>
        </GlassCard>
      </PageShell>
    </Layout>
  );
}
