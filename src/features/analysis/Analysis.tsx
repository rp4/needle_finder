import { useState } from 'react';
import { Search, Download, Eye } from 'lucide-react';
import { useAnomalyStore } from '@stores/anomalyStore';

export function Analysis() {
  const { getFilteredAnomalies } = useAnomalyStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('all');
  const [selectedAnomaly, setSelectedAnomaly] = useState<any>(null);

  const anomalies = getFilteredAnomalies();

  const filteredAnomalies = anomalies.filter((anomaly) => {
    const matchesSearch = 
      anomaly.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      anomaly.anomaly_types?.some(t => t.toLowerCase().includes(searchTerm.toLowerCase())) ||
      anomaly.subject_type?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesSeverity = 
      selectedSeverity === 'all' || 
      (selectedSeverity === 'high' && anomaly.severity > 0.7) ||
      (selectedSeverity === 'medium' && anomaly.severity > 0.4 && anomaly.severity <= 0.7) ||
      (selectedSeverity === 'low' && anomaly.severity <= 0.4);
    
    return matchesSearch && matchesSeverity;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <h2 className="text-2xl font-bold text-gray-100">Anomaly Analysis</h2>
        
        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
          {/* Search */}
          <div className="relative flex-1 lg:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search anomalies..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-200 placeholder-gray-500 focus:outline-none focus:border-indigo-500"
            />
          </div>
          
          {/* Filter */}
          <select
            value={selectedSeverity}
            onChange={(e) => setSelectedSeverity(e.target.value)}
            className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-200 focus:outline-none focus:border-indigo-500"
          >
            <option value="all">All Severities</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
          
          {/* Export */}
          <button className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all flex items-center gap-2">
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-900/50 border-b border-gray-700">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Timestamp
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Severity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Score
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Method
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {filteredAnomalies.map((anomaly) => (
                <tr
                  key={anomaly.id}
                  className="hover:bg-gray-800/50 transition-colors"
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    {anomaly.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    {new Date(anomaly.timestamp).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    {anomaly.anomaly_types?.[0] || 'Unknown'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        anomaly.severity > 0.7
                          ? 'bg-red-500/20 text-red-400 border border-red-500/50'
                          : anomaly.severity > 0.4
                          ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/50'
                          : 'bg-green-500/20 text-green-400 border border-green-500/50'
                      }`}
                    >
                      {anomaly.severity > 0.7 ? 'HIGH' : anomaly.severity > 0.4 ? 'MEDIUM' : 'LOW'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    {anomaly.unified_score.toFixed(3)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    {anomaly.model_votes?.[0]?.model || 'Multiple'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => setSelectedAnomaly(anomaly)}
                      className="text-indigo-400 hover:text-indigo-300 transition-colors"
                    >
                      <Eye className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredAnomalies.length === 0 && (
          <div className="p-8 text-center text-gray-500">
            No anomalies found matching your criteria
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selectedAnomaly && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedAnomaly(null)}
        >
          <div
            className="bg-gray-900 border border-gray-700 rounded-xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-start mb-6">
              <h3 className="text-xl font-semibold text-gray-100">Anomaly Details</h3>
              <button
                onClick={() => setSelectedAnomaly(null)}
                className="text-gray-400 hover:text-gray-200"
              >
                ×
              </button>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-gray-800/50 p-4 rounded-lg">
                <p className="text-xs text-gray-400 mb-1">Anomaly ID</p>
                <p className="text-sm font-medium text-gray-200">{selectedAnomaly.id}</p>
              </div>
              <div className="bg-gray-800/50 p-4 rounded-lg">
                <p className="text-xs text-gray-400 mb-1">Detection Time</p>
                <p className="text-sm font-medium text-gray-200">
                  {new Date(selectedAnomaly.timestamp).toLocaleString()}
                </p>
              </div>
              <div className="bg-gray-800/50 p-4 rounded-lg">
                <p className="text-xs text-gray-400 mb-1">Severity</p>
                <span
                  className={`px-2 py-1 text-xs rounded-full ${
                    selectedAnomaly.severity > 0.7
                      ? 'bg-red-500/20 text-red-400 border border-red-500/50'
                      : selectedAnomaly.severity > 0.4
                      ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/50'
                      : 'bg-green-500/20 text-green-400 border border-green-500/50'
                  }`}
                >
                  {selectedAnomaly.severity > 0.7 ? 'HIGH' : selectedAnomaly.severity > 0.4 ? 'MEDIUM' : 'LOW'}
                </span>
              </div>
              <div className="bg-gray-800/50 p-4 rounded-lg">
                <p className="text-xs text-gray-400 mb-1">Anomaly Score</p>
                <p className="text-sm font-medium text-gray-200">{selectedAnomaly.unified_score.toFixed(3)}</p>
              </div>
            </div>
            
            {selectedAnomaly.features && (
              <div className="bg-gray-800/50 p-4 rounded-lg">
                <p className="text-sm font-medium text-gray-200 mb-3">Feature Importance</p>
                <div className="space-y-2">
                  {Object.entries(selectedAnomaly.features).map(([key, value]: [string, any]) => (
                    <div key={key} className="flex justify-between items-center">
                      <span className="text-sm text-gray-400">{key}</span>
                      <span className="text-sm font-medium text-indigo-400">
                        {(value * 100).toFixed(1)}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}