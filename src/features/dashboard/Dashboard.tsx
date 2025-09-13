import { useState } from 'react';
import { Upload, TrendingUp, AlertTriangle, CheckCircle, BarChart2, Sparkles, Check, X } from 'lucide-react';
import { useAnomalyStore } from '@stores/anomalyStore';
import { processDataFile } from '@services/data/fileProcessor';
import { generateMockData } from '@services/data/generateMockData';

export function Dashboard() {
  const { dataset, hasData, loadDataset, getFilteredAnomalies } = useAnomalyStore();
  const [isDragging, setIsDragging] = useState(false);
  const [selectedAnomaly, setSelectedAnomaly] = useState<any>(null);
  const [reviewedAnomalies, setReviewedAnomalies] = useState<{[key: string]: 'confirmed' | 'rejected'}>({});

  const anomalies = getFilteredAnomalies();

  // Sort anomalies: unreviewed and confirmed first, then false positives
  const sortedAnomalies = [...anomalies].sort((a, b) => {
    const aStatus = reviewedAnomalies[a.id];
    const bStatus = reviewedAnomalies[b.id];

    // False positives go to the bottom
    if (aStatus === 'rejected' && bStatus !== 'rejected') return 1;
    if (aStatus !== 'rejected' && bStatus === 'rejected') return -1;

    // Otherwise maintain original order
    return 0;
  });

  // Filter out false positives for statistics
  const activeAnomalies = anomalies.filter(a => reviewedAnomalies[a.id] !== 'rejected');

  const handleFileUpload = async (file: File) => {
    try {
      const result = await processDataFile(file);
      loadDataset(result);
    } catch (err) {
      console.error('Error processing file:', err);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files[0]) {
      handleFileUpload(files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const loadMockData = () => {
    const mockData = generateMockData();
    loadDataset(mockData);
  };

  const handleReviewAnomaly = (anomalyId: string, status: 'confirmed' | 'rejected') => {
    setReviewedAnomalies(prev => ({
      ...prev,
      [anomalyId]: status
    }));
    setSelectedAnomaly(null);
  };

  if (!hasData) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div
          className={`w-full max-w-2xl p-12 border-2 border-dashed rounded-xl transition-all ${
            isDragging
              ? 'border-indigo-500 bg-indigo-500/10'
              : 'border-gray-300 bg-white/70 backdrop-blur-sm hover:border-indigo-400 shadow-lg'
          }`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          <div className="text-center">
            <Upload className="w-16 h-16 text-gray-500 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-gray-800 mb-2">
              Import Anomaly Data
            </h2>
            <p className="text-gray-600 mb-6">
              Drop your JSON file here or click to browse
            </p>
            <input
              type="file"
              accept=".json"
              onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
              className="hidden"
              id="file-input"
            />
            <div className="flex items-center justify-center gap-4">
              <label
                htmlFor="file-input"
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg cursor-pointer hover:from-indigo-600 hover:to-purple-700 transition-all"
              >
                Choose File
              </label>
              <button
                onClick={loadMockData}
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-lg hover:from-emerald-600 hover:to-teal-700 transition-all"
              >
                <Sparkles className="w-5 h-5" />
                Load Sample Data
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const stats = [
    {
      title: 'Total Records',
      value: dataset?.dataset_profile?.rows || 0,
      icon: BarChart2,
      color: 'from-blue-500 to-cyan-500',
    },
    {
      title: 'Anomalies Detected',
      value: activeAnomalies.length,
      icon: AlertTriangle,
      color: 'from-orange-500 to-red-500',
    },
    {
      title: 'High Severity',
      value: activeAnomalies.filter(a => a.severity > 0.7).length,
      icon: TrendingUp,
      color: 'from-red-500 to-pink-500',
    },
    {
      title: 'Critical Score',
      value: activeAnomalies.filter(a => a.unified_score > 0.8).length,
      icon: CheckCircle,
      color: 'from-green-500 to-emerald-500',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.title}
              className="bg-white/70 backdrop-blur-xs border border-gray-200 rounded-xl p-6 hover:bg-white/80 transition-all shadow-lg"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 bg-gradient-to-br ${stat.color} rounded-lg flex items-center justify-center`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
              <p className="text-gray-600 text-sm mb-1">{stat.title}</p>
              <p className="text-3xl font-bold text-gray-800">
                {stat.value.toLocaleString()}
              </p>
            </div>
          );
        })}
      </div>

      {/* Anomaly Table and Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Anomaly Table */}
        <div className="bg-white/70 backdrop-blur-xs border border-gray-200 rounded-xl overflow-hidden shadow-lg">
          <div className="p-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800">Anomalies</h3>
          </div>
          <div className="overflow-x-auto max-h-96">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-100/60 border-b border-gray-200">
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    ID
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Severity
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Score
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Reviewed
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {sortedAnomalies.slice(0, 10).map((anomaly) => (
                  <tr
                    key={anomaly.id}
                    className={`hover:bg-gray-100/60 transition-colors cursor-pointer ${
                      selectedAnomaly?.id === anomaly.id ? 'bg-indigo-50' : ''
                    } ${reviewedAnomalies[anomaly.id] === 'rejected' ? 'opacity-50' : ''}`}
                    onClick={() => setSelectedAnomaly(anomaly)}
                  >
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                      {anomaly.id.slice(0, 8)}...
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                      {anomaly.anomaly_types?.[0] || 'Unknown'}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${
                          anomaly.severity > 0.7
                            ? 'bg-red-500/20 text-red-400 border border-red-500/50'
                            : anomaly.severity > 0.4
                            ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/50'
                            : 'bg-green-500/20 text-green-400 border border-green-500/50'
                        }`}
                      >
                        {anomaly.severity > 0.7 ? 'HIGH' : anomaly.severity > 0.4 ? 'MED' : 'LOW'}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                      {anomaly.unified_score.toFixed(3)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {reviewedAnomalies[anomaly.id] === 'confirmed' ? (
                        <span className="inline-flex items-center px-2 py-1 text-xs rounded-full bg-green-500/20 text-green-400 border border-green-500/50">
                          <Check className="w-3 h-3 mr-1" />
                          True
                        </span>
                      ) : reviewedAnomalies[anomaly.id] === 'rejected' ? (
                        <span className="inline-flex items-center px-2 py-1 text-xs rounded-full bg-red-500/20 text-red-400 border border-red-500/50">
                          <X className="w-3 h-3 mr-1" />
                          False
                        </span>
                      ) : (
                        <span className="text-xs text-gray-500">-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {sortedAnomalies.length === 0 && (
              <div className="p-8 text-center text-gray-600">
                No anomalies detected
              </div>
            )}
          </div>
        </div>

        {/* Distribution Overview / Anomaly Details */}
        <div className="bg-white/70 backdrop-blur-xs border border-gray-200 rounded-xl p-6 shadow-lg">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            {selectedAnomaly ? 'Anomaly Details' : 'Distribution Overview'}
          </h3>

          {selectedAnomaly ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                  <p className="text-xs text-gray-600 mb-1">Anomaly ID</p>
                  <p className="text-sm font-medium text-gray-800 truncate" title={selectedAnomaly.id}>
                    {selectedAnomaly.id}
                  </p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                  <p className="text-xs text-gray-600 mb-1">Timestamp</p>
                  <p className="text-sm font-medium text-gray-800">
                    {new Date(selectedAnomaly.timestamp).toLocaleDateString()}
                  </p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                  <p className="text-xs text-gray-600 mb-1">Category</p>
                  <p className="text-sm font-medium text-gray-800">
                    {selectedAnomaly.anomaly_types?.[0] || 'Unknown'}
                  </p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                  <p className="text-xs text-gray-600 mb-1">Detection Method</p>
                  <p className="text-sm font-medium text-gray-800">
                    {selectedAnomaly.model_votes?.[0]?.model || 'Multiple'}
                  </p>
                </div>
              </div>

              <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                <p className="text-xs text-gray-600 mb-2">Severity & Score</p>
                <div className="flex items-center justify-between">
                  <span
                    className={`px-3 py-1 text-sm rounded-full ${
                      selectedAnomaly.severity > 0.7
                        ? 'bg-red-500/20 text-red-400 border border-red-500/50'
                        : selectedAnomaly.severity > 0.4
                        ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/50'
                        : 'bg-green-500/20 text-green-400 border border-green-500/50'
                    }`}
                  >
                    {selectedAnomaly.severity > 0.7 ? 'HIGH' : selectedAnomaly.severity > 0.4 ? 'MEDIUM' : 'LOW'}
                  </span>
                  <span className="text-sm font-bold text-indigo-400">
                    Score: {selectedAnomaly.unified_score.toFixed(3)}
                  </span>
                </div>
              </div>

              <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                <p className="text-xs text-gray-600 mb-2">AI Analysis</p>
                <p className="text-sm text-gray-700 leading-relaxed">
                  {selectedAnomaly.description ||
                   'AI-generated description will appear here once the anomaly has been analyzed by the AI agent.'}
                </p>
              </div>

              {selectedAnomaly.features && (
                <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                  <p className="text-xs text-gray-600 mb-2">Feature Importance</p>
                  <div className="space-y-1">
                    {Object.entries(selectedAnomaly.features)
                      .slice(0, 5)
                      .map(([key, value]: [string, any]) => (
                        <div key={key} className="flex justify-between items-center">
                          <span className="text-xs text-gray-600">{key}</span>
                          <span className="text-xs font-medium text-indigo-400">
                            {(value * 100).toFixed(1)}%
                          </span>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              <div className="flex gap-2 mt-2">
                <button
                  onClick={() => handleReviewAnomaly(selectedAnomaly.id, 'confirmed')}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors text-sm font-medium"
                  title="Mark as true anomaly"
                >
                  <Check className="w-4 h-4" />
                  Confirm Anomaly
                </button>
                <button
                  onClick={() => handleReviewAnomaly(selectedAnomaly.id, 'rejected')}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors text-sm font-medium"
                  title="Mark as false positive"
                >
                  <X className="w-4 h-4" />
                  False Positive
                </button>
              </div>
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-500">
              <div className="text-center">
                <p className="mb-2 text-gray-700">Select an anomaly from the table to view details</p>
                <p className="text-sm text-gray-500">Click on any row to see more information</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}