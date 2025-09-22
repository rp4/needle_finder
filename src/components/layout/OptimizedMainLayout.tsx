import { ReactNode, useEffect, useState } from 'react';
import { Download } from 'lucide-react';
import { useAnomalyStore } from '@stores/anomalyStore';

interface MainLayoutProps {
  children: ReactNode;
}

// Lazy load background image with progressive enhancement
const useProgressiveImage = (src: string) => {
  const [sourceLoaded, setSourceLoaded] = useState<string | null>(null);

  useEffect(() => {
    const img = new Image();
    img.src = src;
    img.onload = () => setSourceLoaded(src);
  }, [src]);

  return sourceLoaded;
};

export function MainLayout({ children }: MainLayoutProps) {
  const { hasData, getFilteredAnomalies, reviewedAnomalies, anomalyNotes } = useAnomalyStore();
  const loadedBackground = useProgressiveImage('/Haystack.png');

  const handleExport = () => {
    const anomalies = getFilteredAnomalies();

    // Helper function to escape CSV values
    const escapeCSV = (value: any): string => {
      if (value === null || value === undefined) return '';
      const str = String(value);
      // Quote the value if it contains comma, quote, or newline
      if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };

    // Build CSV rows
    const rows: string[] = [];

    // Header row - include both required and custom fields
    const headers = ['id', 'category', 'severity', 'anomaly_score', 'detection_method', 'ai_explanation', 'review_status', 'anomaly_notes'];

    // Add any custom fields from the first anomaly (if exists)
    const firstAnomaly = anomalies[0];
    if (firstAnomaly && firstAnomaly.customFields) {
      headers.push(...Object.keys(firstAnomaly.customFields));
    }

    rows.push(headers.join(','));

    // Data rows
    anomalies.forEach(anomaly => {
      const reviewStatus = reviewedAnomalies[anomaly.id] || 'unreviewed';
      const notes = anomalyNotes[anomaly.id] || '';

      const row = [
        escapeCSV(anomaly.id),
        escapeCSV(anomaly.reason_codes?.[0]?.code?.replace(/_/g, ' ').toLowerCase()
          .replace(/\b\w/g, l => l.toUpperCase()) || 'Unknown Anomaly'),
        escapeCSV(anomaly.severity > 0.8 ? 'high' : anomaly.severity > 0.5 ? 'medium' : 'low'),
        escapeCSV(anomaly.unified_score.toFixed(3)),
        escapeCSV(anomaly.case?.tags?.find(tag =>
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

    // Create CSV content
    const csvContent = rows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });

    // Create download link and trigger download
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `anomalies_export_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();

    // Cleanup
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div
      className="min-h-screen relative"
      style={{
        // Use CSS gradient as placeholder while image loads
        background: loadedBackground
          ? `url(${loadedBackground})`
          : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
        transition: 'background 0.3s ease-in-out'
      }}
    >
      {/* Background overlay for better readability - light mode */}
      <div className="absolute inset-0 bg-white/30" />

      {/* Content wrapper */}
      <div className="relative z-10">
        {/* Export Button - Fixed position when data is loaded */}
        {hasData && (
          <div className="fixed top-4 right-4 z-20">
            <button
              onClick={handleExport}
              className="flex items-center space-x-2 px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-all shadow-lg"
            >
              <Download className="w-4 h-4" />
              <span className="text-sm font-medium">Export</span>
            </button>
          </div>
        )}

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>
      </div>
    </div>
  );
}