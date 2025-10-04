export interface ParsedCSVRow {
  id: string;
  category: string;
  severity: 'high' | 'medium' | 'low';
  anomaly_score: number;
  detection_method: string;
  ai_explanation: string;
  [key: string]: any; // Custom fields
}

// React automatically escapes values in JSX, so we don't need manual sanitization
// that would cause double-encoding issues with special characters like &
function sanitizeValue(value: string): string {
  return value;
}

export function parseCSV(csvContent: string): ParsedCSVRow[] {
  const lines = csvContent.trim().split('\n');
  if (lines.length < 2) {
    throw new Error('CSV file must contain headers and at least one data row');
  }

  // Parse headers
  const firstLine = lines[0];
  if (!firstLine) {
    throw new Error('CSV file is empty');
  }
  const headers = parseCSVLine(firstLine).map(h => h.trim());

  // Validate required headers
  const requiredHeaders = ['id', 'category', 'severity', 'anomaly_score', 'detection_method', 'ai_explanation'];
  const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));
  if (missingHeaders.length > 0) {
    throw new Error(`Missing required columns: ${missingHeaders.join(', ')}`);
  }

  // Parse data rows
  const rows: ParsedCSVRow[] = [];
  for (let i = 1; i < lines.length; i++) {
    const lineRaw = lines[i];
    if (!lineRaw) continue; // Skip undefined lines
    const line = lineRaw.trim();
    if (!line) continue; // Skip empty lines

    const values = parseCSVLine(line);
    if (values.length !== headers.length) {
      throw new Error(`Row ${i + 1} has ${values.length} columns but expected ${headers.length}`);
    }

    const row: any = {};
    headers.forEach((header, index) => {
      const value = values[index]?.trim() || '';

      // Parse specific columns
      if (header === 'anomaly_score') {
        row[header] = parseFloat(value) || 0;
      } else if (header === 'severity') {
        const severity = value.toLowerCase();
        if (!['high', 'medium', 'low'].includes(severity)) {
          throw new Error(`Invalid severity value "${value}" in row ${i + 1}`);
        }
        row[header] = severity;
      } else if (header === 'timestamp') {
        // Don't sanitize timestamps as they need to remain valid ISO strings
        row[header] = value;
      } else {
        // Sanitize string values to prevent XSS
        row[header] = sanitizeValue(value);
      }
    });

    // Validate required fields
    if (!row.id) {
      throw new Error(`Missing ID in row ${i + 1}`);
    }

    rows.push(row as ParsedCSVRow);
  }

  return rows;
}

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        // Escaped quote
        current += '"';
        i++; // Skip next quote
      } else {
        // Toggle quote mode
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      // End of field
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }

  // Add last field
  result.push(current);

  return result;
}