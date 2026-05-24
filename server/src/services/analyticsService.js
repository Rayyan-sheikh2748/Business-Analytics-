const CHART_COLORS = ["#a0aecd", "#000000", "#64748b", "#94a3b8", "#cbd5e1"];

export function categoryStats(rows, nameKey, valueKey) {
  const total = rows.reduce((s, r) => s + Number(r[valueKey] ?? 0), 0) || 1;
  return rows.map((r, i) => ({
    name: r[nameKey],
    value: Number(r[valueKey] ?? 0),
    percentage: Math.round((Number(r[valueKey] ?? 0) / total) * 100),
    color: CHART_COLORS[i % CHART_COLORS.length],
  }));
}

export function stockStatus(stock, threshold) {
  if (stock === 0) return "Out of Stock";
  if (stock <= threshold) return "Low Stock";
  return "In Stock";
}

export function buildRegexSearch(value) {
  return { $regex: value, $options: "i" };
}

export async function aggregateByField(Model, field, sumField = null) {
  const pipeline = [
    {
      $group: {
        _id: `$${field}`,
        value: sumField ? { $sum: `$${sumField}` } : { $sum: 1 },
      },
    },
    { $sort: { value: -1 } },
  ];
  const rows = await Model.aggregate(pipeline);
  return rows.map((r) => ({ name: r._id, value: r.value }));
}
