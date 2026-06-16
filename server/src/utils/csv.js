export function parseCSV(csvContent) {
  const lines = [];
  let currentLine = [];
  let currentField = '';
  let inQuotes = false;

  for (let i = 0; i < csvContent.length; i++) {
    const char = csvContent[i];
    const nextChar = csvContent[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        currentField += '"';
        i++; // Skip the escaped quote
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      currentLine.push(currentField.trim());
      currentField = '';
    } else if ((char === '\r' && nextChar === '\n') || char === '\n' || char === '\r') {
      if (!inQuotes) {
        currentLine.push(currentField.trim());
        // Only push non-empty lines
        if (currentLine.some(f => f !== '')) {
          lines.push(currentLine);
        }
        currentLine = [];
        currentField = '';
        if (char === '\r' && nextChar === '\n') i++; // Skip \n
      } else {
        currentField += char; // newline inside quotes
      }
    } else {
      currentField += char;
    }
  }

  // Push the last field/line if exists
  if (currentField !== '' || currentLine.length > 0) {
    currentLine.push(currentField.trim());
    if (currentLine.some(f => f !== '')) {
      lines.push(currentLine);
    }
  }

  return lines;
}

export function csvToJson(csvContent) {
  const lines = parseCSV(csvContent);
  if (lines.length < 2) return []; // No data or only header

  const headers = lines[0].map(h => h.trim().replace(/^[\uFEFF]/, '')); // Remove BOM if present
  const result = [];

  for (let i = 1; i < lines.length; i++) {
    const obj = {};
    const currentLine = lines[i];
    for (let j = 0; j < headers.length; j++) {
      obj[headers[j]] = currentLine[j] || '';
    }
    result.push(obj);
  }

  return result;
}
