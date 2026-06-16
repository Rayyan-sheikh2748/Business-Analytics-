export function cleanDate(dateStr) {
  if (!dateStr) return null;
  const cleaned = String(dateStr).trim();
  
  // Try native date parsing first (handles ISO formats and English month names like Jun 16, 2026)
  const d = new Date(cleaned);
  if (!isNaN(d.getTime())) {
    return d.toISOString().split("T")[0];
  }
  
  // Handled common regex formats like DD/MM/YYYY, MM/DD/YYYY, YYYY-MM-DD
  const parts = cleaned.split(/[-/.]/);
  if (parts.length === 3) {
    // YYYY-MM-DD or YYYY/MM/DD
    if (parts[0].length === 4) {
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10);
      const day = parseInt(parts[2], 10);
      if (month >= 1 && month <= 12 && day >= 1 && day <= 31) {
        return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
      }
    }
    
    // DD-MM-YYYY or MM-DD-YYYY
    const p0 = parseInt(parts[0], 10);
    const p1 = parseInt(parts[1], 10);
    const p2 = parseInt(parts[2], 10);
    
    if (!isNaN(p0) && !isNaN(p1) && !isNaN(p2)) {
      const year = p2 < 100 ? (p2 < 50 ? 2000 + p2 : 1900 + p2) : p2;
      
      // If p1 > 12, then p0 must be month and p1 must be day (MM/DD/YYYY)
      if (p1 > 12) {
        if (p0 >= 1 && p0 <= 12 && p1 <= 31) {
          return `${year}-${String(p0).padStart(2, "0")}-${String(p1).padStart(2, "0")}`;
        }
      } else {
        // Assume DD/MM/YYYY by default, but validate both
        if (p1 >= 1 && p1 <= 12 && p0 <= 31) {
          return `${year}-${String(p1).padStart(2, "0")}-${String(p0).padStart(2, "0")}`;
        }
      }
    }
  }
  
  return null;
}

export function cleanProductName(name) {
  if (!name) return "";
  return String(name)
    .trim()
    .replace(/\s+/g, " "); // collapse double spaces
}

export function cleanNumeric(val, defaultVal = 0) {
  if (val === undefined || val === null || val === '') return defaultVal;
  const cleaned = String(val).replace(/[$€£₹,\s]/g, '');
  const num = Number(cleaned);
  return isNaN(num) ? defaultVal : num;
}
