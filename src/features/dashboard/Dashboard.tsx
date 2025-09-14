import { useState } from 'react';
import { Upload, TrendingUp, AlertTriangle, CheckCircle, BarChart2, Sparkles, Check, X, Search } from 'lucide-react';
import { useAnomalyStore } from '@stores/anomalyStore';
import { processDataFile } from '@services/data/fileProcessor';
import { generateMockData } from '@services/data/generateMockData';
import type { Anomaly } from '@/types/anomaly.types';
import { logger } from '@services/logger';

export function Dashboard() {
  const { dataset, hasData, loadDataset, getFilteredAnomalies } = useAnomalyStore();
  const [isDragging, setIsDragging] = useState(false);
  const [selectedAnomaly, setSelectedAnomaly] = useState<Anomaly | null>(null);
  const [reviewedAnomalies, setReviewedAnomalies] = useState<{[key: string]: 'confirmed' | 'rejected'}>({});
  const [filterMode, setFilterMode] = useState<'all' | 'confirmed' | 'high-severity' | 'unreviewed'>('all');
  const [distributionView, setDistributionView] = useState<'severity' | 'confirmed'>('severity');
  const [categoryFilter, setCategoryFilter] = useState<{
    category: string | null;
    severity?: 'high' | 'medium' | 'low' | null;
    status?: 'confirmed' | 'rejected' | 'unreviewed' | null;
  }>({ category: null });

  const anomalies = getFilteredAnomalies();

  // Filter anomalies based on filter mode
  let filteredAnomalies = filterMode === 'confirmed'
    ? anomalies.filter(a => reviewedAnomalies[a.id] === 'confirmed')
    : filterMode === 'high-severity'
    ? anomalies.filter(a => a.severity > 0.7)
    : filterMode === 'unreviewed'
    ? anomalies.filter(a => !reviewedAnomalies[a.id])
    : anomalies;

  // Apply category filter
  if (categoryFilter.category) {
    filteredAnomalies = filteredAnomalies.filter(a => {
      const category = a.anomaly_types?.[0] || 'Unknown';
      if (category !== categoryFilter.category) return false;

      // Apply severity filter if in severity view
      if (categoryFilter.severity) {
        if (categoryFilter.severity === 'high' && a.severity <= 0.7) return false;
        if (categoryFilter.severity === 'medium' && (a.severity <= 0.4 || a.severity > 0.7)) return false;
        if (categoryFilter.severity === 'low' && a.severity > 0.4) return false;
      }

      // Apply status filter if in confirmed view
      if (categoryFilter.status) {
        const status = reviewedAnomalies[a.id];
        if (categoryFilter.status === 'confirmed' && status !== 'confirmed') return false;
        if (categoryFilter.status === 'rejected' && status !== 'rejected') return false;
        if (categoryFilter.status === 'unreviewed' && status) return false;
      }

      return true;
    });
  }

  // Sort anomalies: unreviewed and confirmed first, then false positives
  const sortedAnomalies = [...filteredAnomalies].sort((a, b) => {
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
      logger.error('Error processing file', err as Error);
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

  const handleConfirmedAnomaliesClick = () => {
    setFilterMode(prev => prev === 'confirmed' ? 'all' : 'confirmed');
    setSelectedAnomaly(null);
  };

  const handleHighSeverityClick = () => {
    setFilterMode(prev => prev === 'high-severity' ? 'all' : 'high-severity');
    setSelectedAnomaly(null);
  };

  const handleTotalRecordsClick = () => {
    setFilterMode('all');
    setSelectedAnomaly(null);
  };

  const handleAnomaliesDetectedClick = () => {
    setFilterMode(prev => prev === 'unreviewed' ? 'all' : 'unreviewed');
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
                className="inline-flex items-center px-6 py-3 bg-indigo-500 text-white rounded-lg cursor-pointer hover:bg-indigo-600 transition-all"
              >
                Choose File
              </label>
              <button
                onClick={loadMockData}
                className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-all"
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

  const confirmedAnomaliesCount = Object.values(reviewedAnomalies).filter(status => status === 'confirmed').length;

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
      icon: Search,
      color: 'from-orange-500 to-red-500',
    },
    {
      title: 'High Severity',
      value: activeAnomalies.filter(a => a.severity > 0.7).length,
      icon: AlertTriangle,
      color: 'from-red-500 to-pink-500',
    },
    {
      title: 'Confirmed Anomalies',
      value: confirmedAnomaliesCount,
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
          const isTotalRecordsCard = stat.title === 'Total Records';
          const isAnomaliesDetectedCard = stat.title === 'Anomalies Detected';
          const isConfirmedCard = stat.title === 'Confirmed Anomalies';
          const isHighSeverityCard = stat.title === 'High Severity';

          const isActive = (isTotalRecordsCard && filterMode === 'all') ||
                          (isAnomaliesDetectedCard && filterMode === 'unreviewed') ||
                          (isConfirmedCard && filterMode === 'confirmed') ||
                          (isHighSeverityCard && filterMode === 'high-severity');

          let borderColor = 'border-gray-200';
          if (isActive) {
            if (isTotalRecordsCard) borderColor = 'border-blue-500';
            else if (isAnomaliesDetectedCard) borderColor = 'border-orange-500';
            else if (isConfirmedCard) borderColor = 'border-green-500';
            else if (isHighSeverityCard) borderColor = 'border-red-500';
          }

          return (
            <div
              key={stat.title}
              className={`backdrop-blur-xs border rounded-xl p-4 transition-all shadow-lg cursor-pointer ${
                isActive
                  ? `${borderColor} border-2 bg-white/95 hover:bg-white`
                  : 'border-gray-200 bg-white/70 hover:bg-white/85'
              }`}
              onClick={isTotalRecordsCard ? handleTotalRecordsClick :
                      isAnomaliesDetectedCard ? handleAnomaliesDetectedClick :
                      isConfirmedCard ? handleConfirmedAnomaliesClick :
                      isHighSeverityCard ? handleHighSeverityClick : undefined}
            >
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 bg-gradient-to-br ${stat.color} rounded-lg flex items-center justify-center flex-shrink-0`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-gray-600 text-sm">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-800">
                    {stat.value.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Anomaly Table and Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Anomaly Table */}
        <div className="bg-white/90 backdrop-blur-xs border border-gray-200 rounded-xl overflow-hidden shadow-lg">
          <div className="p-4 border-b border-gray-200 flex items-center justify-between">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-lg font-semibold text-gray-800">Anomalies</h3>
              {filterMode === 'confirmed' && (
                <span className="px-2 py-1 text-xs bg-green-500 text-white rounded-full">
                  Showing Confirmed Only
                </span>
              )}
              {filterMode === 'high-severity' && (
                <span className="px-2 py-1 text-xs bg-red-500 text-white rounded-full">
                  Showing High Severity Only
                </span>
              )}
              {filterMode === 'unreviewed' && (
                <span className="px-2 py-1 text-xs bg-orange-500 text-white rounded-full">
                  Showing Unreviewed Only
                </span>
              )}
              {categoryFilter.category && (
                <span
                  className="px-2 py-1 text-xs bg-indigo-500 text-white rounded-full cursor-pointer hover:bg-indigo-600 flex items-center gap-1"
                  onClick={() => setCategoryFilter({ category: null })}
                  title="Click to clear category filter"
                >
                  {categoryFilter.category}
                  {categoryFilter.severity && ` - ${categoryFilter.severity}`}
                  {categoryFilter.status && ` - ${categoryFilter.status}`}
                  <span className="ml-1">×</span>
                </span>
              )}
            </div>
            <span className="text-sm text-gray-600">
              Showing {sortedAnomalies.length} {
                filterMode === 'confirmed' ? 'confirmed' :
                filterMode === 'high-severity' ? 'high severity' :
                filterMode === 'unreviewed' ? 'unreviewed' : ''
              } of {anomalies.length} total
            </span>
          </div>
          <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
            <table className="w-full">
              <thead className="sticky top-0 z-10">
                <tr className="bg-gray-50/95 border-b border-gray-200">
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
                {sortedAnomalies.map((anomaly) => (
                  <tr
                    key={anomaly.id}
                    className={`hover:bg-gray-50/90 transition-colors cursor-pointer ${
                      selectedAnomaly?.id === anomaly.id ? 'bg-indigo-50/90' : 'bg-white/80'
                    } ${reviewedAnomalies[anomaly.id] === 'rejected' ? 'opacity-50' : ''}`}
                    onClick={() => setSelectedAnomaly(anomaly)}
                  >
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-800 font-medium">
                      {anomaly.id.slice(0, 8)}...
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-800">
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
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-800 font-semibold">
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
                <p className="text-xs text-gray-600 mb-2">Reason Codes</p>
                <div className="text-sm text-gray-700 leading-relaxed">
                  {selectedAnomaly.reason_codes && selectedAnomaly.reason_codes.length > 0 ? (
                    <ul className="space-y-1">
                      {selectedAnomaly.reason_codes.map((reason, idx) => (
                        <li key={idx} className="flex gap-2">
                          <span className="text-xs font-medium text-indigo-600">{reason.code}:</span>
                          <span className="text-xs">{reason.text}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-xs text-gray-500">No reason codes available for this anomaly.</p>
                  )}
                </div>
              </div>

              {selectedAnomaly.features && (
                <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                  <p className="text-xs text-gray-600 mb-2">Features</p>
                  <div className="space-y-1">
                    {Object.entries(selectedAnomaly.features)
                      .slice(0, 5)
                      .map(([key, value]) => (
                        <div key={key} className="flex justify-between items-center">
                          <span className="text-xs text-gray-600">{key}</span>
                          <span className="text-xs font-medium text-indigo-400">
                            {typeof value === 'number' ? value.toFixed(2) : String(value)}
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
            <div className="space-y-4">
              {/* View Toggle Buttons */}
              <div className="flex gap-2">
                <button
                  onClick={() => setDistributionView('severity')}
                  className={`flex-1 px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                    distributionView === 'severity'
                      ? 'bg-indigo-500 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Severity
                </button>
                <button
                  onClick={() => setDistributionView('confirmed')}
                  className={`flex-1 px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                    distributionView === 'confirmed'
                      ? 'bg-indigo-500 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Confirmed
                </button>
              </div>

              {/* Anomaly Category Distribution */}
              <div>
                <p className="text-sm text-gray-600 mb-3">
                  {distributionView === 'severity' ? 'Category Distribution by Severity' :
                   'Category Distribution by Status'}
                </p>
                {(() => {
                  // Count anomalies by category
                  const categoryData: Record<string, any> = {};

                  if (distributionView === 'severity') {
                    // Group by category and severity
                    anomalies.forEach(anomaly => {
                      const category = anomaly.anomaly_types?.[0] || 'Unknown';
                      if (!categoryData[category]) {
                        categoryData[category] = { high: 0, medium: 0, low: 0, total: 0 };
                      }
                      categoryData[category].total++;
                      if (anomaly.severity > 0.7) {
                        categoryData[category].high++;
                      } else if (anomaly.severity > 0.4) {
                        categoryData[category].medium++;
                      } else {
                        categoryData[category].low++;
                      }
                    });
                  } else {
                    // Group by category and confirmation status
                    anomalies.forEach(anomaly => {
                      const category = anomaly.anomaly_types?.[0] || 'Unknown';
                      if (!categoryData[category]) {
                        categoryData[category] = { confirmed: 0, rejected: 0, unreviewed: 0, total: 0 };
                      }
                      categoryData[category].total++;
                      const status = reviewedAnomalies[anomaly.id];
                      if (status === 'confirmed') {
                        categoryData[category].confirmed++;
                      } else if (status === 'rejected') {
                        categoryData[category].rejected++;
                      } else {
                        categoryData[category].unreviewed++;
                      }
                    });
                  }

                  // Convert to sorted array
                  const categories = Object.entries(categoryData)
                    .sort((a, b) => b[1].total - a[1].total)
                    .slice(0, 8); // Show top 8 categories

                  const maxCount = Math.max(...categories.map(([, data]) => data.total));

                  return categories.length > 0 ? (
                    <div className="space-y-2">
                      {categories.map(([category, data]) => {
                        const count = data.total;

                        const isActive = categoryFilter.category === category;

                        return (
                          <div
                            key={category}
                            className={`flex items-center gap-3 p-1 rounded-lg transition-all cursor-pointer ${
                              isActive ? 'bg-indigo-50 border border-indigo-300' : 'hover:bg-gray-50'
                            }`}
                          >
                            <div
                              className={`w-24 text-xs truncate cursor-pointer ${
                                isActive ? 'text-indigo-700 font-semibold' : 'text-gray-600'
                              }`}
                              title={category}
                              onClick={() => {
                                if (categoryFilter.category === category) {
                                  setCategoryFilter({ category: null });
                                } else {
                                  setCategoryFilter({ category });
                                }
                              }}
                            >
                              {category}
                            </div>
                            <div className="flex-1 flex items-center gap-2">
                              <div className="flex-1 bg-gray-100 rounded-full h-6 relative overflow-hidden">
                                {distributionView === 'severity' ? (
                                  <div className="flex h-full">
                                    <div
                                      className="bg-red-500 hover:bg-red-600 transition-all duration-500 cursor-pointer"
                                      style={{ width: `${(data.high / maxCount) * 100}%` }}
                                      onClick={() => setCategoryFilter({
                                        category,
                                        severity: categoryFilter.category === category && categoryFilter.severity === 'high' ? null : 'high'
                                      })}
                                      title={`High severity: ${data.high}`}
                                    />
                                    <div
                                      className="bg-yellow-500 hover:bg-yellow-600 transition-all duration-500 cursor-pointer"
                                      style={{ width: `${(data.medium / maxCount) * 100}%` }}
                                      onClick={() => setCategoryFilter({
                                        category,
                                        severity: categoryFilter.category === category && categoryFilter.severity === 'medium' ? null : 'medium'
                                      })}
                                      title={`Medium severity: ${data.medium}`}
                                    />
                                    <div
                                      className="bg-green-500 hover:bg-green-600 transition-all duration-500 cursor-pointer"
                                      style={{ width: `${(data.low / maxCount) * 100}%` }}
                                      onClick={() => setCategoryFilter({
                                        category,
                                        severity: categoryFilter.category === category && categoryFilter.severity === 'low' ? null : 'low'
                                      })}
                                      title={`Low severity: ${data.low}`}
                                    />
                                  </div>
                                ) : (
                                  <div className="flex h-full">
                                    <div
                                      className="bg-green-500 hover:bg-green-600 transition-all duration-500 cursor-pointer"
                                      style={{ width: `${(data.confirmed / maxCount) * 100}%` }}
                                      onClick={() => setCategoryFilter({
                                        category,
                                        status: categoryFilter.category === category && categoryFilter.status === 'confirmed' ? null : 'confirmed'
                                      })}
                                      title={`Confirmed: ${data.confirmed}`}
                                    />
                                    <div
                                      className="bg-gray-400 hover:bg-gray-500 transition-all duration-500 cursor-pointer"
                                      style={{ width: `${(data.unreviewed / maxCount) * 100}%` }}
                                      onClick={() => setCategoryFilter({
                                        category,
                                        status: categoryFilter.category === category && categoryFilter.status === 'unreviewed' ? null : 'unreviewed'
                                      })}
                                      title={`Unreviewed: ${data.unreviewed}`}
                                    />
                                    <div
                                      className="bg-red-400 hover:bg-red-500 transition-all duration-500 cursor-pointer"
                                      style={{ width: `${(data.rejected / maxCount) * 100}%` }}
                                      onClick={() => setCategoryFilter({
                                        category,
                                        status: categoryFilter.category === category && categoryFilter.status === 'rejected' ? null : 'rejected'
                                      })}
                                      title={`False Positive: ${data.rejected}`}
                                    />
                                  </div>
                                )}
                              </div>
                              <span className="text-xs font-medium text-gray-700 w-8 text-right">
                                {count}
                              </span>
                            </div>
                          </div>
                        );
                      })}

                      {/* Legend for stacked views */}
                      {distributionView === 'severity' && (
                        <div className="flex gap-4 justify-center pt-2 border-t border-gray-200">
                          <div className="flex items-center gap-1">
                            <div className="w-3 h-3 bg-red-500 rounded"></div>
                            <span className="text-xs text-gray-600">High</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <div className="w-3 h-3 bg-yellow-500 rounded"></div>
                            <span className="text-xs text-gray-600">Medium</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <div className="w-3 h-3 bg-green-500 rounded"></div>
                            <span className="text-xs text-gray-600">Low</span>
                          </div>
                        </div>
                      )}

                      {distributionView === 'confirmed' && (
                        <div className="flex gap-4 justify-center pt-2 border-t border-gray-200">
                          <div className="flex items-center gap-1">
                            <div className="w-3 h-3 bg-green-500 rounded"></div>
                            <span className="text-xs text-gray-600">Confirmed</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <div className="w-3 h-3 bg-gray-400 rounded"></div>
                            <span className="text-xs text-gray-600">Unreviewed</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <div className="w-3 h-3 bg-red-400 rounded"></div>
                            <span className="text-xs text-gray-600">False Positive</span>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="h-48 flex items-center justify-center text-gray-500">
                      <p className="text-sm">No anomaly data available</p>
                    </div>
                  );
                })()}
              </div>

            </div>
          )}
        </div>
      </div>
    </div>
  );
}