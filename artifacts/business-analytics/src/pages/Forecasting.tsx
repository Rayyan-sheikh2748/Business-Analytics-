import { useState } from "react";
import { TrendingUp, Brain } from "lucide-react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend,
} from "recharts";
import Layout from "@/components/Layout";
import { formatINR } from "@/lib/format";
import {
  useGetForecast, useGetForecastBreakdown, useGetForecastHeatmap,
  useGetForecastModelComparison,
} from "@workspace/api-client-react";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const DAY_KEYS = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"] as const;

function heatColor(intensity: number): string {
  if (intensity > 80) return "#1E3A5F";
  if (intensity > 60) return "#1E40AF";
  if (intensity > 40) return "#3B82F6";
  if (intensity > 20) return "#93C5FD";
  return "#EFF6FF";
}

export default function Forecasting() {
  const [model, setModel] = useState("ARIMA");

  const { data: forecast } = useGetForecast({ model });
  const { data: breakdown } = useGetForecastBreakdown({ model });
  const { data: heatmap } = useGetForecastHeatmap();
  const { data: modelComparison } = useGetForecastModelComparison();

  const chartData = forecast?.chartData ?? [];

  return (
    <Layout>
      <div className="p-6 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Demand Forecasting</h1>
            <p className="text-gray-500 text-sm">AI-powered demand predictions to optimize your inventory</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
          <div className="flex items-center gap-3 flex-wrap">
            <select className="px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option>All Products</option>
              {["Basmati Rice (5kg)", "Brooke Bond Tea (250g)", "Parle-G Biscuits (800g)", "Nescafe Coffee (100g)", "Maggi Noodles (70g)"].map((p) => <option key={p}>{p}</option>)}
            </select>
            <select value={model} onChange={(e) => setModel(e.target.value)}
              className="px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
              {["ARIMA", "Prophet", "Linear Regression", "Exponential Smoothing"].map((m) => <option key={m}>{m}</option>)}
            </select>
            <select className="px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option>Monthly</option><option>Quarterly</option><option>Yearly</option>
            </select>
            <input type="date" className="px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <select className="px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option>3 Months</option><option>6 Months</option><option>12 Months</option>
            </select>
            <button className="bg-blue-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-blue-700 font-medium">Generate Forecast</button>
          </div>
        </div>

        {/* Model Performance */}
        <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <Brain className="w-4 h-4 text-indigo-600" />
            <h3 className="font-semibold text-indigo-800 text-sm">Model Performance Metrics ({model})</h3>
          </div>
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: "MAPE (Mean Absolute % Error)", value: `${(forecast?.mape ?? 8.4).toFixed(1)}%`, good: (forecast?.mape ?? 8.4) < 15, desc: "Lower is better" },
              { label: "RMSE (Root Mean Square Error)", value: formatINR(forecast?.rmse ?? 1250), good: true, desc: "Lower is better" },
              { label: "Forecast Accuracy", value: `${(forecast?.accuracy ?? 91.6).toFixed(1)}%`, good: (forecast?.accuracy ?? 91.6) > 85, desc: "Higher is better" },
            ].map(({ label, value, good, desc }) => (
              <div key={label} className="bg-white rounded-lg p-3 border border-indigo-100">
                <p className="text-xs text-gray-500 mb-1">{label}</p>
                <p className={`text-xl font-bold ${good ? "text-emerald-600" : "text-amber-600"}`}>{value}</p>
                <p className="text-[10px] text-gray-400">{desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-5 gap-4">
          {[
            { label: "Forecasted Sales", val: formatINR(forecast?.forecastedSales ?? 1850000), sub: "Next 3 months", color: "text-blue-600" },
            { label: "Avg Daily Demand", val: `${forecast?.avgDailyDemand ?? 62} units`, sub: "Per day average", color: "text-emerald-600" },
            { label: "Peak Demand Day", val: forecast?.peakDemandDay ?? "Saturday", sub: "Highest sales day", color: "text-amber-600" },
            { label: "Revenue Forecast", val: formatINR(forecast?.totalRevenueForecast ?? 1850000), sub: "Total projected", color: "text-purple-600" },
            { label: "Recommended Stock", val: `${forecast?.recommendedStock ?? 450} units`, sub: "Safety buffer", color: "text-teal-600" },
          ].map(({ label, val, sub, color }) => (
            <div key={label} className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
              <p className="text-xs text-gray-500 mb-1">{label}</p>
              <p className={`text-lg font-bold ${color}`}>{val}</p>
              <p className="text-[10px] text-gray-400 mt-0.5">{sub}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-12 gap-4">
          {/* Forecast Chart */}
          <div className="col-span-8 bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-800">Demand Forecast</h3>
              <div className="flex items-center gap-3 text-xs">
                <div className="flex items-center gap-1.5"><div className="w-3 h-0.5 bg-blue-600"></div><span className="text-gray-500">Historical</span></div>
                <div className="flex items-center gap-1.5"><div className="w-3 h-0.5 bg-emerald-600"></div><span className="text-gray-500">Forecast</span></div>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="label" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                <Tooltip formatter={(v: number, name: string) => [formatINR(v), name]} />
                <Legend wrapperStyle={{ fontSize: 10 }} />
                <Line type="monotone" dataKey="historical" stroke="#2563EB" strokeWidth={2} dot={false} name="Historical" connectNulls />
                <Line type="monotone" dataKey="forecasted" stroke="#10B981" strokeWidth={2} dot={false} name="Forecast" strokeDasharray="5 5" connectNulls />
                <Line type="monotone" dataKey="upperBound" stroke="#CBD5E1" strokeWidth={1} dot={false} name="Upper Bound" connectNulls />
                <Line type="monotone" dataKey="lowerBound" stroke="#CBD5E1" strokeWidth={1} dot={false} name="Lower Bound" connectNulls />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Forecast Summary Table */}
          <div className="col-span-4 bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
            <h3 className="font-semibold text-gray-800 mb-3">Forecast Summary</h3>
            <div className="space-y-2">
              {(breakdown ?? []).map((row) => (
                <div key={row.period} className="flex items-center justify-between py-2 border-b border-gray-50 text-xs">
                  <div>
                    <p className="font-medium text-gray-800">{row.period}</p>
                    <p className="text-gray-400">{row.forecastedDemand} units forecast</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-800">{formatINR(row.revenueForecast)}</p>
                    <p className="text-[10px] text-gray-400">
                      {formatINR(row.lowerBound)} - {formatINR(row.upperBound)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-4">
          {/* Model Comparison */}
          <div className="col-span-4 bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
            <h3 className="font-semibold text-gray-800 mb-3">Model Comparison</h3>
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
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500 rounded-full transition-all" style={{ width: `${accuracy}%` }}></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Weekly Breakdown Table */}
          <div className="col-span-4 bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
            <h3 className="font-semibold text-gray-800 mb-3">Weekly Forecast Breakdown</h3>
            <table className="w-full text-xs">
              <thead className="border-b border-gray-100">
                <tr>
                  {["Period", "Units", "Revenue", "Bounds"].map((h) => (
                    <th key={h} className="text-left pb-2 font-medium text-gray-500">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {(breakdown ?? []).slice(0, 6).map((row) => (
                  <tr key={row.period}>
                    <td className="py-2 text-gray-700">{row.period}</td>
                    <td className="py-2 text-gray-600">{row.forecastedDemand}</td>
                    <td className="py-2 font-medium text-gray-800">{formatINR(row.revenueForecast)}</td>
                    <td className="py-2 text-gray-400">{formatINR(row.lowerBound)}-{formatINR(row.upperBound)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Heatmap */}
          <div className="col-span-4 bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
            <h3 className="font-semibold text-gray-800 mb-3">Daily Demand Heatmap</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-[10px]">
                <thead>
                  <tr>
                    <th className="text-left pr-2 text-gray-400 font-medium">Week</th>
                    {DAYS.map((d) => <th key={d} className="text-center text-gray-400 font-medium pb-1">{d}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {(heatmap ?? []).map((row) => (
                    <tr key={row.week}>
                      <td className="pr-2 text-gray-500 py-0.5">W{row.week}</td>
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
            <div className="flex items-center gap-2 mt-2 text-[9px] text-gray-400">
              <span>Low</span>
              {["#EFF6FF", "#93C5FD", "#3B82F6", "#1E40AF", "#1E3A5F"].map((c) => (
                <div key={c} className="w-4 h-3 rounded" style={{ background: c }}></div>
              ))}
              <span>High</span>
            </div>
          </div>
        </div>

        {/* AI Insights */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="w-4 h-4 text-indigo-600" />
            <h3 className="font-semibold text-gray-800">AI Forecast Insights</h3>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {[
              { title: "Festival Season Alert", msg: "Diwali season demand for dry fruits, snacks and beverages is forecast to spike 2.8x in October. Restock by Sept 20.", color: "bg-amber-50 border-amber-200" },
              { title: "Reorder Recommendation", msg: "Toor Dal and Amul Butter are out of stock. Recommend placing reorder for 200 units of Dal and 50 units of Butter.", color: "bg-blue-50 border-blue-200" },
              { title: "Monsoon Demand Shift", msg: "Tea and instant noodles (Maggi) demand is projected to rise 40% in June-August monsoon season.", color: "bg-emerald-50 border-emerald-200" },
            ].map((insight) => (
              <div key={insight.title} className={`${insight.color} border rounded-lg p-3`}>
                <p className="text-xs font-semibold text-gray-800 mb-1">{insight.title}</p>
                <p className="text-[11px] text-gray-600">{insight.msg}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
}
