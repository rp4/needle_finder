import { parseCSV } from './csvParser';
import { getSampleCSVData } from './sampleData';
import { convertToAnomaly, sortAnomaliesByScore, createDatasetProfile } from '@/utils/anomalyConverter';

// This function is kept only for backward compatibility with existing code

// Generate mock dataset from sample CSV data
export function generateMockDatasetFromCSV() {
  // Get the complete sample CSV data (50 rows for demo)
  const csvData = getSampleCSVData();

  // Parse the CSV data
  const rows = parseCSV(csvData);
  const now = new Date().toISOString();

  const firstRow = rows[0];
  if (!firstRow) {
    throw new Error('No data rows generated');
  }

  // Convert to internal format using centralized converter
  const anomalies = rows.map((row: any) => convertToAnomaly(row, now));
  const sortedAnomalies = sortAnomaliesByScore(anomalies);

  return {
    run_id: now,
    dataset_profile: createDatasetProfile(50000, Object.keys(firstRow).length),
    anomalies: sortedAnomalies,
    groups: [],
    timeseries: [],
    _index: new Map(sortedAnomalies.map((a: any, idx: number) => [a.id, idx]))
  };
}