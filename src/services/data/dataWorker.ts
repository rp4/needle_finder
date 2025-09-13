// Web Worker for processing large datasets
self.addEventListener('message', (event) => {
  const { action, data, id } = event.data;

  if (action === 'process') {
    try {
      // Send progress updates
      self.postMessage({ id, progress: 0 });

      const processed = processLargeDataset(data, (progress: number) => {
        self.postMessage({ id, progress });
      });

      self.postMessage({ id, result: processed });
    } catch (error) {
      self.postMessage({
        id,
        error: error instanceof Error ? error.message : 'Failed to process dataset'
      });
    }
  }
});

interface WorkerData {
  anomalies: any[];
  groups?: any[];
  timeseries?: any[];
  data_quality?: any[];
}

function processLargeDataset(data: WorkerData, onProgress?: (progress: number) => void): WorkerData {
  // Ensure all dates are properly formatted
  if (data.anomalies) {
    onProgress?.(10);
    data.anomalies = data.anomalies.map((anomaly) => ({
      ...anomaly,
      timestamp: new Date(anomaly.timestamp).toISOString()
    }));
    
    // Sort anomalies by unified score (highest first)
    data.anomalies.sort((a, b) => b.unified_score - a.unified_score);
    onProgress?.(30);
    
    // Create index for fast lookup
    data._index = new Map(
      data.anomalies.map((a, idx) => [a.id, idx])
    );
  }
  
  // Process groups if present
  if (data.groups) {
    onProgress?.(50);
    // Sort groups by divergence score
    data.groups.sort((a, b) =>
      (b.divergence?.score || 0) - (a.divergence?.score || 0)
    );
  }
  
  // Process time series if present
  if (data.timeseries) {
    onProgress?.(70);
    data.timeseries = data.timeseries.map((ts) => ({
      ...ts,
      points: ts.points.map((point) => ({
        ...point,
        t: new Date(point.t).toISOString()
      })).sort((a, b) =>
        new Date(a.t).getTime() - new Date(b.t).getTime()
      )
    }));
  }
  
  // Process data quality issues if present
  if (data.data_quality) {
    onProgress?.(90);
    data.data_quality = data.data_quality.map((issue) => ({
      ...issue,
      t: new Date(issue.t).toISOString()
    })).sort((a, b) => 
      new Date(b.t).getTime() - new Date(a.t).getTime()
    );
  }

  onProgress?.(100);
  return data;
}

export {};