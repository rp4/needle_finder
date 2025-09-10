// Web Worker for processing large datasets
self.addEventListener('message', (event) => {
  const { action, data } = event.data;
  
  if (action === 'process') {
    try {
      const processed = processLargeDataset(data);
      self.postMessage({ result: processed });
    } catch (error) {
      self.postMessage({ 
        error: error instanceof Error ? error.message : 'Failed to process dataset' 
      });
    }
  }
});

function processLargeDataset(data: any): any {
  // Ensure all dates are properly formatted
  if (data.anomalies) {
    data.anomalies = data.anomalies.map((anomaly: any) => ({
      ...anomaly,
      timestamp: new Date(anomaly.timestamp).toISOString()
    }));
    
    // Sort anomalies by unified score (highest first)
    data.anomalies.sort((a: any, b: any) => b.unified_score - a.unified_score);
    
    // Create index for fast lookup
    data._index = new Map(
      data.anomalies.map((a: any, idx: number) => [a.id, idx])
    );
  }
  
  // Process groups if present
  if (data.groups) {
    // Sort groups by divergence score
    data.groups.sort((a: any, b: any) => 
      (b.divergence?.score || 0) - (a.divergence?.score || 0)
    );
  }
  
  // Process time series if present
  if (data.timeseries) {
    data.timeseries = data.timeseries.map((ts: any) => ({
      ...ts,
      points: ts.points.map((point: any) => ({
        ...point,
        t: new Date(point.t).toISOString()
      })).sort((a: any, b: any) => 
        new Date(a.t).getTime() - new Date(b.t).getTime()
      )
    }));
  }
  
  // Process data quality issues if present
  if (data.data_quality) {
    data.data_quality = data.data_quality.map((issue: any) => ({
      ...issue,
      t: new Date(issue.t).toISOString()
    })).sort((a: any, b: any) => 
      new Date(b.t).getTime() - new Date(a.t).getTime()
    );
  }
  
  return data;
}

export {};