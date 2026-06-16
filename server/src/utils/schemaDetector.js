export function detectSchema(jsonRows, moduleType) {
  if (!jsonRows || jsonRows.length === 0) {
    return { numericFields: [], dateFields: [], categoryFields: [], mappings: {} };
  }

  const firstRow = jsonRows[0];
  const keys = Object.keys(firstRow);

  const numericFields = [];
  const dateFields = [];
  const categoryFields = [];

  // Type Detection by sampling first 50 rows
  const sampleSize = Math.min(jsonRows.length, 50);

  for (const key of keys) {
    let numericCount = 0;
    let dateCount = 0;
    let totalNonEmpty = 0;

    for (let i = 0; i < sampleSize; i++) {
      const val = jsonRows[i][key];
      if (val === undefined || val === null || val === '') continue;
      totalNonEmpty++;

      const strVal = String(val).trim();

      // Test Numeric — strip currency symbols, commas, and whitespace first
      const cleaned = strVal.replace(/[$€£₹,\s]/g, '');
      if (cleaned !== '' && !isNaN(Number(cleaned))) {
        numericCount++;
        continue; // If it's numeric, skip date test
      }

      // Test Date (ISO or common date formats like MM/DD/YYYY)
      if (!isNaN(Date.parse(strVal)) && strVal.length >= 6) {
        dateCount++;
      }
    }

    // A field is numeric if >80% of non-empty values parse as numbers
    // A field is date if >80% of non-empty values parse as dates
    const threshold = Math.max(1, totalNonEmpty * 0.8);

    if (numericCount >= threshold) {
      numericFields.push(key);
    } else if (dateCount >= threshold) {
      dateFields.push(key);
    } else {
      categoryFields.push(key);
    }
  }

  // Define regex matchers for logical concepts.
  // Order matters: more specific patterns first to avoid false positives.
  // "product" should NOT match a column called "Product ID" when we also need "invoice".
  const matchers = {
    sales: {
      // Match in priority order: specific first
      invoice:   /invoice|order.?id|receipt|transaction.?id/i,
      date:      /date|created|time|timestamp|ordered/i,
      revenue:   /revenue|total|sales|amount|income|spent|gross/i,
      quantity:  /qty|quantity|units|count|number/i,
      category:  /category|type|group|department|segment/i,
      customer:  /customer|client|buyer|purchaser/i,
      product:   /product|item|article|description|good/i,
      unitPrice: /price|cost|rate|unit.?price|unit.?cost/i,
      channel:   /channel|source|platform|origin|medium|method/i,
      profit:    /profit|margin|gain|earnings/i,
      region:    /region|location|country|city|state|zone/i,
      paymentMethod: /payment|method|type|card|cash/i
    },
    inventory: {
      product:   /product|item|article|name|description/i,
      sku:       /sku|code|barcode|upc/i,
      stock:     /stock|quantity|qty|units|inventory|available|on.?hand/i,
      threshold: /threshold|min|reorder|low|safety/i,
      unitPrice: /price|cost|value|rate|unit.?cost/i,
      warehouse: /warehouse|location|store|site|branch/i,
      category:  /category|type|group|class/i
    }
  };

  const currentMatchers = matchers[moduleType] || {};
  const mappings = {};
  const usedFields = new Set(); // Track assigned fields so no field maps to two concepts

  // Best-effort mapping — assign each concept to the first matching key
  for (const [concept, regex] of Object.entries(currentMatchers)) {
    const candidate = keys.find(k => regex.test(k) && !usedFields.has(k));
    if (candidate) {
      mappings[concept] = candidate;
      usedFields.add(candidate);
    }
  }

  // Fallbacks for sales — try to ensure at least revenue, date, and category
  if (moduleType === 'sales') {
    if (!mappings.revenue && numericFields.length > 0) {
      const unused = numericFields.find(f => !usedFields.has(f));
      if (unused) { mappings.revenue = unused; usedFields.add(unused); }
    }
    if (!mappings.date && dateFields.length > 0) {
      const unused = dateFields.find(f => !usedFields.has(f));
      if (unused) { mappings.date = unused; usedFields.add(unused); }
    }
    if (!mappings.category && categoryFields.length > 0) {
      const unused = categoryFields.find(f => !usedFields.has(f));
      if (unused) { mappings.category = unused; usedFields.add(unused); }
    }
    if (!mappings.customer && categoryFields.length > 1) {
      const unused = categoryFields.find(f => !usedFields.has(f));
      if (unused) { mappings.customer = unused; usedFields.add(unused); }
    }
    if (!mappings.product && categoryFields.length > 0) {
      const unused = categoryFields.find(f => !usedFields.has(f));
      if (unused) { mappings.product = unused; usedFields.add(unused); }
    }
  } else if (moduleType === 'inventory') {
    if (!mappings.stock && numericFields.length > 0) {
      const unused = numericFields.find(f => !usedFields.has(f));
      if (unused) { mappings.stock = unused; usedFields.add(unused); }
    }
    if (!mappings.product && categoryFields.length > 0) {
      const unused = categoryFields.find(f => !usedFields.has(f));
      if (unused) { mappings.product = unused; usedFields.add(unused); }
    }
  }

  return {
    numericFields,
    dateFields,
    categoryFields,
    mappings
  };
}
