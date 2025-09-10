import { useState } from 'react';
import { useAnomalyStore } from '@stores/anomalyStore';
import JSZip from 'jszip';

export function Market() {
  const { dataset, getFilteredAnomalies, piiMasked } = useAnomalyStore();
  const [isExporting, setIsExporting] = useState(false);
  const [selectedAnomalies, setSelectedAnomalies] = useState<Set<string>>(new Set());
  
  const anomalies = getFilteredAnomalies();

  const handleExportBinder = async () => {
    setIsExporting(true);
    
    try {
      const zip = new JSZip();
      
      // Add summary JSON
      const summary = {
        export_date: new Date().toISOString(),
        total_anomalies: selectedAnomalies.size || anomalies.length,
        pii_masked: piiMasked,
        dataset_info: dataset?.dataset_profile
      };
      zip.file('summary.json', JSON.stringify(summary, null, 2));
      
      // Add selected anomalies
      const exportAnomalies = selectedAnomalies.size > 0 
        ? anomalies.filter(a => selectedAnomalies.has(a.id))
        : anomalies;
      
      zip.file('anomalies.json', JSON.stringify(exportAnomalies, null, 2));
      
      // Generate and download ZIP
      const blob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `needlefinder-binder-${Date.now()}.zip`;
      a.click();
      URL.revokeObjectURL(url);
      
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportSample = () => {
    // Generate risk-weighted sample
    const sampleSize = Math.min(100, anomalies.length);
    const sample = anomalies
      .sort((a, b) => b.unified_score * b.materiality - a.unified_score * a.materiality)
      .slice(0, sampleSize);
    
    // Convert to CSV
    const csv = [
      ['ID', 'Subject ID', 'Type', 'Unified Score', 'Severity', 'Materiality', 'Timestamp'],
      ...sample.map(a => [
        a.id,
        a.subject_id,
        a.subject_type,
        a.unified_score,
        a.severity,
        a.materiality,
        a.timestamp
      ])
    ].map(row => row.join(',')).join('\n');
    
    // Download CSV
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `needlefinder-sample-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const toggleAnomaly = (id: string) => {
    setSelectedAnomalies(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-4xl font-rustic text-farm-barn mb-2">The Market</h1>
        <p className="text-farm-soil">
          Prepare your harvest for presentation - generate reports and evidence packs
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Binder Builder */}
        <div className="lg:col-span-2 farm-card">
          <h2 className="text-xl font-rustic text-farm-barn mb-4">
            📚 Harvest Report Builder
          </h2>
          
          <div className="mb-4">
            <p className="text-sm text-farm-soil mb-2">
              Select anomalies to include in the report ({selectedAnomalies.size} selected)
            </p>
            
            <div className="max-h-96 overflow-y-auto border-2 border-farm-fence rounded-lg p-3">
              {anomalies.slice(0, 50).map((anomaly) => (
                <label
                  key={anomaly.id}
                  className="flex items-center space-x-3 p-2 hover:bg-farm-wheat-light rounded cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={selectedAnomalies.has(anomaly.id)}
                    onChange={() => toggleAnomaly(anomaly.id)}
                    className="w-4 h-4 text-farm-barn"
                  />
                  <div className="flex-1">
                    <p className="font-semibold text-farm-soil-dark">
                      {anomaly.subject_id}
                    </p>
                    <p className="text-xs text-farm-soil">
                      Score: {(anomaly.unified_score * 100).toFixed(1)}% | 
                      Type: {anomaly.subject_type}
                    </p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div className="flex space-x-3">
            <button
              onClick={handleExportBinder}
              disabled={isExporting}
              className="flex-1 bg-farm-barn text-white px-4 py-2 rounded-lg hover:bg-farm-barn-dark transition-colors disabled:opacity-50"
            >
              {isExporting ? 'Preparing...' : '📦 Export Binder (ZIP)'}
            </button>
            
            <button
              onClick={() => setSelectedAnomalies(new Set())}
              className="px-4 py-2 border-2 border-farm-fence text-farm-soil-dark rounded-lg hover:bg-farm-wheat-light transition-colors"
            >
              Clear Selection
            </button>
          </div>
        </div>

        {/* Export Options */}
        <div className="space-y-4">
          {/* Risk-Weighted Sample */}
          <div className="farm-card">
            <h3 className="font-rustic text-lg text-farm-soil-dark mb-3">
              🎯 Premium Produce Selection
            </h3>
            <p className="text-sm text-farm-soil mb-3">
              Generate a risk-weighted sample for detailed review
            </p>
            <button
              onClick={handleExportSample}
              className="w-full bg-farm-grass text-white px-4 py-2 rounded-lg hover:bg-farm-grass-dark transition-colors"
            >
              📊 Export Sample (CSV)
            </button>
          </div>

          {/* Export Settings */}
          <div className="farm-card">
            <h3 className="font-rustic text-lg text-farm-soil-dark mb-3">
              ⚙️ Export Settings
            </h3>
            
            <div className="space-y-3">
              <label className="flex items-center justify-between">
                <span className="text-sm text-farm-soil">PII Masking</span>
                <div className={`px-3 py-1 rounded-full text-xs ${
                  piiMasked ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {piiMasked ? 'Enabled' : 'Disabled'}
                </div>
              </label>
              
              <label className="flex items-center justify-between">
                <span className="text-sm text-farm-soil">Watermark</span>
                <input type="checkbox" defaultChecked className="w-4 h-4" />
              </label>
              
              <label className="flex items-center justify-between">
                <span className="text-sm text-farm-soil">Include Charts</span>
                <input type="checkbox" defaultChecked className="w-4 h-4" />
              </label>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="farm-card">
            <h3 className="font-rustic text-lg text-farm-soil-dark mb-3">
              📈 Harvest Summary
            </h3>
            
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-farm-soil">Total Anomalies:</span>
                <span className="font-bold text-farm-barn">{anomalies.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-farm-soil">High Severity:</span>
                <span className="font-bold text-farm-tomato">
                  {anomalies.filter(a => a.severity > 0.7).length}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-farm-soil">Avg Score:</span>
                <span className="font-bold text-farm-barn">
                  {(anomalies.reduce((sum, a) => sum + a.unified_score, 0) / anomalies.length * 100).toFixed(1)}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}