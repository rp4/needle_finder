import { useAnomalyStore } from '@stores/anomalyStore';

export function Fields() {
  const { dataset, getFilteredAnomalies } = useAnomalyStore();
  const anomalies = getFilteredAnomalies();

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-4xl font-rustic text-farm-barn mb-2">The Fields</h1>
        <p className="text-farm-soil">
          Survey your entire farm - {anomalies.length} anomalies detected across the landscape
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Crop Circle Map (Risk Radar) */}
        <div className="farm-card">
          <h2 className="text-xl font-rustic text-farm-barn mb-4">
            🌾 Crop Circle Map
          </h2>
          <div className="h-96 bg-gradient-to-b from-farm-grass-dark to-farm-grass rounded-lg flex items-center justify-center">
            <p className="text-white text-center">
              Risk constellation visualization will be displayed here
            </p>
          </div>
        </div>

        {/* Planting Rows (Swimlanes) */}
        <div className="farm-card">
          <h2 className="text-xl font-rustic text-farm-barn mb-4">
            🚜 Planting Rows Timeline
          </h2>
          <div className="h-96 field-row rounded-lg p-4">
            <p className="text-farm-soil-dark">
              Time-based anomaly intensity visualization
            </p>
          </div>
        </div>

        {/* Seed Packets (Influencer Pods) */}
        <div className="farm-card">
          <h2 className="text-xl font-rustic text-farm-barn mb-4">
            🌱 Top Seed Varieties
          </h2>
          <div className="space-y-2">
            {anomalies.slice(0, 5).map((anomaly) => (
              <div key={anomaly.id} className="p-3 bg-farm-wheat rounded-lg border border-farm-fence">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-farm-soil-dark">
                    {anomaly.subject_id}
                  </span>
                  <span className="text-sm bg-farm-tomato text-white px-2 py-1 rounded">
                    Score: {(anomaly.unified_score * 100).toFixed(1)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Scarecrow Alert System */}
        <div className="farm-card">
          <h2 className="text-xl font-rustic text-farm-barn mb-4">
            🎃 Scarecrow Alerts
          </h2>
          <div className="space-y-2">
            {dataset?.data_quality?.slice(0, 3).map((issue, idx) => (
              <div key={idx} className="p-3 bg-yellow-50 border-2 border-yellow-200 rounded-lg">
                <div className="flex items-start space-x-2">
                  <span>⚠️</span>
                  <div>
                    <p className="text-sm font-semibold text-yellow-800">
                      {issue.issue.replace('_', ' ').toUpperCase()}
                    </p>
                    <p className="text-xs text-yellow-700">{issue.detail}</p>
                  </div>
                </div>
              </div>
            ))}
            {(!dataset?.data_quality || dataset.data_quality.length === 0) && (
              <p className="text-farm-soil text-center py-8">
                No data quality issues detected 
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}