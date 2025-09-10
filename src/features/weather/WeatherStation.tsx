import { useAnomalyStore } from '@stores/anomalyStore';

export function WeatherStation() {
  const { dataset } = useAnomalyStore();
  const timeseries = dataset?.timeseries || [];
  const driftPins = dataset?.ui_hints?.drift_pins || [];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-4xl font-rustic text-farm-barn mb-2">Weather Station</h1>
        <p className="text-farm-soil">
          Monitor environmental changes and seasonal patterns affecting your harvest
        </p>
      </div>

      {/* Drift Seismograph */}
      <div className="farm-card mb-6">
        <h2 className="text-xl font-rustic text-farm-barn mb-4">
          📊 Climate Drift Monitor
        </h2>
        
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="text-center p-4 bg-farm-wheat rounded-lg">
            <div className="text-3xl mb-2">🌡️</div>
            <p className="text-sm font-rustic text-farm-soil-dark">Input PSI</p>
            <p className="text-2xl font-bold text-farm-barn">
              {dataset?.globals?.drift?.psi_inputs ? 
                Object.values(dataset.globals.drift.psi_inputs)[0]?.toFixed(3) || '0.000'
                : '0.000'}
            </p>
          </div>
          
          <div className="text-center p-4 bg-farm-wheat rounded-lg">
            <div className="text-3xl mb-2">🌊</div>
            <p className="text-sm font-rustic text-farm-soil-dark">Label Shift</p>
            <p className="text-2xl font-bold text-farm-barn">0.000</p>
          </div>
          
          <div className="text-center p-4 bg-farm-wheat rounded-lg">
            <div className="text-3xl mb-2">🌪️</div>
            <p className="text-sm font-rustic text-farm-soil-dark">Concept Drift</p>
            <p className="text-2xl font-bold text-farm-barn">0.000</p>
          </div>
        </div>

        {/* Drift Pins */}
        {driftPins.length > 0 && (
          <div>
            <h3 className="font-rustic text-farm-soil-dark mb-3">
              📍 Seasonal Markers:
            </h3>
            <div className="space-y-2">
              {driftPins.map((pin, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">📍</span>
                    <div>
                      <p className="font-semibold text-farm-soil-dark">{pin.metric}</p>
                      <p className="text-xs text-farm-soil">
                        {new Date(pin.t).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-farm-barn">{pin.value.toFixed(3)}</p>
                    {pin.note && <p className="text-xs text-farm-soil">{pin.note}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Time Series */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {timeseries.slice(0, 4).map((ts, idx) => (
          <div key={idx} className="farm-card">
            <h3 className="font-rustic text-lg text-farm-soil-dark mb-3">
              {ts.metric} ({ts.bucket})
            </h3>
            
            <div className="h-48 bg-gradient-to-b from-farm-sky to-farm-sky-light rounded-lg p-4">
              <div className="h-full flex items-end justify-around">
                {ts.points.slice(-10).map((point, pIdx) => {
                  const height = Math.max(10, (point.y / Math.max(...ts.points.map(p => p.y))) * 100);
                  return (
                    <div key={pIdx} className="flex-1 flex flex-col items-center justify-end">
                      <div
                        className="w-full bg-farm-barn rounded-t"
                        style={{ height: `${height}%` }}
                      />
                      <p className="text-xs text-white mt-1">
                        {new Date(point.t).getDate()}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
            
            {ts.entity_scope && (
              <p className="text-xs text-farm-soil mt-2">
                Scope: {ts.entity_scope}
              </p>
            )}
          </div>
        ))}
      </div>

      {timeseries.length === 0 && (
        <div className="farm-card">
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🌤️</div>
            <p className="text-xl font-rustic text-farm-soil">
              No time series data available for weather monitoring
            </p>
          </div>
        </div>
      )}
    </div>
  );
}