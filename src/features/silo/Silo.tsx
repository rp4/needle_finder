import { useAnomalyStore } from '@stores/anomalyStore';

export function Silo() {
  const { dataset } = useAnomalyStore();
  const groups = dataset?.groups || [];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-4xl font-rustic text-farm-barn mb-2">The Silo</h1>
        <p className="text-farm-soil">
          Store and compare different batches - {groups.length} cohort groups analyzed
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
        {groups.map((group, idx) => (
          <div key={idx} className="farm-card">
            <div className="flex items-start justify-between mb-3">
              <div className="text-2xl">🌽</div>
              <div className="text-right">
                <div className="text-sm font-bold text-farm-barn">
                  Divergence: {(group.divergence?.score || 0).toFixed(3)}
                </div>
                <div className="text-xs text-farm-soil">
                  {group.divergence?.metric || 'unknown'}
                </div>
              </div>
            </div>
            
            <h3 className="font-rustic text-lg text-farm-soil-dark mb-2">
              Batch #{idx + 1}
            </h3>
            
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-farm-soil">Population:</span>
                <span className="font-semibold">{group.population.toLocaleString()}</span>
              </div>
              
              {Object.entries(group.group_key).map(([key, value]) => (
                <div key={key} className="flex justify-between">
                  <span className="text-farm-soil">{key}:</span>
                  <span className="font-semibold">{value}</span>
                </div>
              ))}
            </div>

            {group.top_drivers && group.top_drivers.length > 0 && (
              <div className="mt-3 pt-3 border-t border-farm-fence">
                <p className="text-xs font-rustic text-farm-soil-dark mb-2">Top Drivers:</p>
                {group.top_drivers.slice(0, 3).map((driver, dIdx) => (
                  <div key={dIdx} className="flex justify-between text-xs">
                    <span className="text-farm-soil">{driver.feature}</span>
                    <span className="font-semibold text-farm-barn">
                      {driver.delta_pp > 0 ? '+' : ''}{(driver.delta_pp * 100).toFixed(1)}%
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
        
        {groups.length === 0 && (
          <div className="col-span-full farm-card">
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🌾</div>
              <p className="text-xl font-rustic text-farm-soil">
                No group cohorts available in this dataset
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Emerging Clusters */}
      {dataset?.clusters && (
        <div className="mt-8">
          <h2 className="text-2xl font-rustic text-farm-barn mb-4">
            🌻 Emerging Hybrid Varieties
          </h2>
          <div className="farm-card">
            <p className="text-farm-soil mb-3">
              Clustering algorithm: <span className="font-semibold">{dataset.clusters.algo}</span>
            </p>
            <div className="grid grid-cols-4 gap-2">
              {Array.from(new Set(dataset.clusters.members.map(m => m.cluster_id))).slice(0, 8).map((clusterId) => {
                const members = dataset.clusters!.members.filter(m => m.cluster_id === clusterId);
                return (
                  <div key={clusterId} className="p-3 bg-farm-wheat rounded-lg text-center">
                    <div className="text-2xl mb-1">🌻</div>
                    <p className="text-xs font-rustic text-farm-soil-dark">
                      Cluster {clusterId.replace('c_', '#')}
                    </p>
                    <p className="text-sm font-bold text-farm-barn">
                      {members.length} members
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}