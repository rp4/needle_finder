// Web Worker for CSV export processing
// This offloads heavy CSV generation from the main thread

interface ExportMessage {
  type: 'EXPORT_CSV';
  data: {
    anomalies: any[];
    reviewedAnomalies: Record<string, string>;
    anomalyNotes: Record<string, string>;
  };
}

// Helper function to escape CSV values
const escapeCSV = (value: any): string => {
  if (value === null || value === undefined) return '';
  const str = String(value);
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
};

self.addEventListener('message', (event: MessageEvent<ExportMessage>) => {
  if (event.data.type === 'EXPORT_CSV') {
    const { anomalies, reviewedAnomalies, anomalyNotes } = event.data.data;

    const rows: string[] = [];

    // Header row
    const headers = [
      'id', 'category', 'severity', 'anomaly_score',
      'detection_method', 'ai_explanation', 'review_status', 'anomaly_notes'
    ];

    // Add custom fields from first anomaly
    const firstAnomaly = anomalies[0];
    if (firstAnomaly?.customFields) {
      headers.push(...Object.keys(firstAnomaly.customFields));
    }

    rows.push(headers.join(','));

    // Process data rows
    anomalies.forEach(anomaly => {
      const reviewStatus = reviewedAnomalies[anomaly.id] || 'unreviewed';
      const notes = anomalyNotes[anomaly.id] || '';

      const row = [
        escapeCSV(anomaly.id),
        escapeCSV(anomaly.reason_codes?.[0]?.code?.replace(/_/g, ' ').toLowerCase()
          .replace(/\b\w/g, (l: string) => l.toUpperCase()) || 'Unknown Anomaly'),
        escapeCSV(anomaly.severity > 0.8 ? 'high' : anomaly.severity > 0.5 ? 'medium' : 'low'),
        escapeCSV(anomaly.unified_score.toFixed(3)),
        escapeCSV(anomaly.case?.tags?.find((tag: string) =>
          ['Isolation Forest', 'Local Outlier Factor', 'One-Class SVM', 'DBSCAN',
           'Autoencoder', 'Statistical Z-Score', 'Time Series Decomposition', 'Ensemble Method']
          .includes(tag)
        ) || 'Ensemble Method'),
        escapeCSV(anomaly.reason_codes?.[0]?.text || 'Anomaly detected based on statistical analysis'),
        escapeCSV(reviewStatus),
        escapeCSV(notes)
      ];

      // Add custom field values
      if (anomaly.customFields) {
        headers.slice(8).forEach(header => {
          row.push(escapeCSV(anomaly.customFields?.[header]));
        });
      }

      rows.push(row.join(','));
    });

    // Send back the CSV content
    self.postMessage({
      type: 'CSV_READY',
      csvContent: rows.join('\n')
    });
  }
});

export {}; // Make this a module