import { useCallback } from 'react';

export const useCSVExport = () => {
  const exportWithWorker = useCallback((anomalies: any[], reviewedAnomalies: Record<string, string>, anomalyNotes: Record<string, string>) => {
    // Create worker
    const worker = new Worker(
      new URL('../workers/csvExport.worker.ts', import.meta.url),
      { type: 'module' }
    );

    // Handle worker response
    worker.addEventListener('message', (event) => {
      if (event.data.type === 'CSV_READY') {
        const blob = new Blob([event.data.csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `anomalies_export_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        // Cleanup worker
        worker.terminate();
      }
    });

    // Send data to worker
    worker.postMessage({
      type: 'EXPORT_CSV',
      data: { anomalies, reviewedAnomalies, anomalyNotes }
    });
  }, []);

  return exportWithWorker;
};