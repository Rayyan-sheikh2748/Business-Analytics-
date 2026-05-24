export function formatINR(amount: number): string {
  return "\u20B9" + Math.round(amount).toLocaleString("en-IN");
}

export function formatNumber(num: number): string {
  return num.toLocaleString("en-IN");
}

export function formatChange(change: number): { text: string; positive: boolean } {
  const abs = Math.abs(change).toFixed(1);
  return { text: `${abs}%`, positive: change >= 0 };
}
