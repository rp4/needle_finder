import { useAnomalyStore } from '@stores/anomalyStore';
import { useState } from 'react';

export function Barn() {
  const { getFilteredAnomalies, selectedAnomalyId, selectAnomaly, getAnomalyById } = useAnomalyStore();
  const anomalies = getFilteredAnomalies();
  const selectedAnomaly = selectedAnomalyId ? getAnomalyById(selectedAnomalyId) : null;
  const [activeTab, setActiveTab] = useState<'reasons' | 'shap' | 'sequence' | 'peers'>('reasons');

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-4xl font-rustic text-farm-barn mb-2">The Barn</h1>
        <p className="text-farm-soil">
          Detailed inspection area - examine each anomaly carefully
        </p>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Investigation Queue */}
        <div className="col-span-4">
          <div className="farm-card">
            <h2 className="text-xl font-rustic text-farm-barn mb-4">
              📦 Grain Bins (Investigation Queue)
            </h2>
            <div className="space-y-2 max-h-[600px] overflow-y-auto">
              {anomalies.slice(0, 20).map((anomaly) => (
                <div
                  key={anomaly.id}
                  onClick={() => selectAnomaly(anomaly.id)}
                  className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                    selectedAnomalyId === anomaly.id
                      ? 'bg-farm-hay border-farm-barn'
                      : 'bg-white border-farm-fence hover:bg-farm-wheat-light'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold text-farm-soil-dark">
                        {anomaly.subject_id}
                      </p>
                      <p className="text-xs text-farm-soil mt-1">
                        {anomaly.anomaly_types.join(', ')}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold text-farm-barn">
                        {(anomaly.unified_score * 100).toFixed(1)}%
                      </div>
                      <div className="text-xs text-farm-soil">
                        Severity: {(anomaly.severity * 100).toFixed(0)}%
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Case Canvas */}
        <div className="col-span-8">
          {selectedAnomaly ? (
            <div className="farm-card">
              <h2 className="text-xl font-rustic text-farm-barn mb-4">
                🔍 Case Canvas
              </h2>
              
              {/* Tabs */}
              <div className="flex space-x-2 mb-4 border-b-2 border-farm-fence">
                {[
                  { id: 'reasons', label: "Farmer's Notes", icon: '📝' },
                  { id: 'shap', label: 'Harvest Grid', icon: '🌾' },
                  { id: 'sequence', label: 'Growth Stages', icon: '🌱' },
                  { id: 'peers', label: 'Neighboring Fields', icon: '🏞️' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`px-4 py-2 font-rustic transition-colors ${
                      activeTab === tab.id
                        ? 'text-farm-barn border-b-2 border-farm-barn -mb-0.5'
                        : 'text-farm-soil hover:text-farm-barn'
                    }`}
                  >
                    <span className="mr-2">{tab.icon}</span>
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Tab Content */}
              <div className="min-h-[400px]">
                {activeTab === 'reasons' && (
                  <div className="space-y-3">
                    <h3 className="font-rustic text-lg text-farm-soil-dark">
                      Why this anomaly was flagged:
                    </h3>
                    {selectedAnomaly.reason_codes?.map((reason, idx) => (
                      <div key={idx} className="p-4 bg-farm-wheat rounded-lg">
                        <p className="font-semibold text-farm-barn">{reason.code}</p>
                        <p className="text-sm text-farm-soil mt-1">{reason.text}</p>
                      </div>
                    ))}
                    {(!selectedAnomaly.reason_codes || selectedAnomaly.reason_codes.length === 0) && (
                      <p className="text-farm-soil">No specific reasons provided</p>
                    )}
                  </div>
                )}

                {activeTab === 'shap' && (
                  <div>
                    <h3 className="font-rustic text-lg text-farm-soil-dark mb-3">
                      Feature Contributions (SHAP Values):
                    </h3>
                    <div className="grid grid-cols-3 gap-2">
                      {selectedAnomaly.explanations?.shap_local?.slice(0, 9).map((shap, idx) => (
                        <div key={idx} className="p-3 bg-gradient-to-b from-farm-grass to-farm-grass-dark rounded text-white text-center">
                          <p className="text-xs font-semibold">{shap.feature}</p>
                          <p className="text-lg font-bold">{shap.shap.toFixed(3)}</p>
                        </div>
                      ))}
                    </div>
                    {(!selectedAnomaly.explanations?.shap_local || 
                      selectedAnomaly.explanations.shap_local.length === 0) && (
                      <p className="text-farm-soil">No SHAP values available</p>
                    )}
                  </div>
                )}

                {activeTab === 'sequence' && (
                  <div>
                    <h3 className="font-rustic text-lg text-farm-soil-dark mb-3">
                      Event Timeline:
                    </h3>
                    <div className="flex items-center space-x-4">
                      {['Seed', 'Sprout', 'Growth', 'Bloom', 'Harvest'].map((stage, idx) => (
                        <div key={idx} className="flex-1 text-center">
                          <div className={`h-16 w-16 mx-auto rounded-full flex items-center justify-center text-2xl ${
                            idx <= 2 ? 'bg-farm-grass' : 'bg-gray-200'
                          }`}>
                            {['🌰', '🌱', '🌿', '🌻', '🌾'][idx]}
                          </div>
                          <p className="text-xs mt-2 text-farm-soil">{stage}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === 'peers' && (
                  <div>
                    <h3 className="font-rustic text-lg text-farm-soil-dark mb-3">
                      Comparison with Peer Group:
                    </h3>
                    <div className="space-y-3">
                      {selectedAnomaly.explanations?.feature_deltas?.slice(0, 5).map((delta, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3 bg-white rounded-lg border border-farm-fence">
                          <span className="font-semibold text-farm-soil-dark">{delta.feature}</span>
                          <div className="flex items-center space-x-4">
                            <span className="text-sm">Subject: {delta.subject.toFixed(2)}</span>
                            <span className="text-sm text-farm-soil">Peer: {delta.peer_p50.toFixed(2)}</span>
                            <span className={`text-sm font-bold ${
                              Math.abs(delta.z_robust) > 2 ? 'text-red-600' : 'text-green-600'
                            }`}>
                              Z: {delta.z_robust.toFixed(2)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="farm-card h-full flex items-center justify-center">
              <div className="text-center">
                <div className="text-6xl mb-4">🏚️</div>
                <p className="text-xl font-rustic text-farm-soil">
                  Select an anomaly from the grain bins to inspect
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}