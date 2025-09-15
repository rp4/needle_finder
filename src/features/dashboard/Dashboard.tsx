import { useState } from 'react';
import { AlertTriangle, CheckCircle, BarChart2, Check, X, Search } from 'lucide-react';
import { useAnomalyStore } from '@stores/anomalyStore';
import { processDataFile } from '@services/data/fileProcessor';
import { generateMockData } from '@services/data/generateMockData';
import type { Anomaly } from '@/types/anomaly.types';
import { logger } from '@services/logger';
import { LandingPage } from '@/components/LandingPage';

export function Dashboard() {
  const { dataset, hasData, loadDataset, getFilteredAnomalies } = useAnomalyStore();
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
      <LandingPage
        icon="🪡"
        title="Needle Finder"
        subtitle="Visualize and review your anomalies, completely private"
        showInfoButton={true}
        infoPopup={{
          title: "Privacy & Data Storage Notice",
          icon: (
            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          ),
          sections: [
            {
              icon: (
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
                </svg>
              ),
              title: "Browser-Based Storage",
              content: "This application stores all schedule data locally in your browser's localStorage. No data is ever sent to any server."
            },
            {
              icon: (
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              ),
              title: "What This Means",
              bullets: [
                "Your data stays on this device only",
                "Clearing browser data will delete your schedules",
                "Different browsers/devices won't share data",
                "We cannot recover lost data"
              ]
            }
          ]
        }}
        fileUpload={{
          accept: ".json,.csv",
          onFileSelect: handleFileUpload,
          dragDropEnabled: true
        }}
        actions={[
          {
            label: "Choose File",
            variant: "primary",
            tooltip: "Work with your own anomalies"
          },
          {
            label: "Try with Sample Data",
            variant: "secondary",
            tooltip: "Instantly load sample data to explore all the features",
            onClick: loadMockData
          }
        ]}
        footerLinks={[
          {
            icon: (
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
              </svg>
            ),
            href: "https://github.com/rp4/NeedleFinder",
            title: "GitHub Repository"
          },
          {
            icon: (
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                <path d="M22.282 9.821a5.985 5.985 0 0 0-.516-4.91 6.046 6.046 0 0 0-6.51-2.9A6.065 6.065 0 0 0 4.981 4.18a5.985 5.985 0 0 0-3.998 2.9 6.046 6.046 0 0 0 .743 7.097 5.98 5.98 0 0 0 .51 4.911 6.051 6.051 0 0 0 6.515 2.9A5.985 5.985 0 0 0 13.26 24a6.056 6.056 0 0 0 5.772-4.206 5.99 5.99 0 0 0 3.997-2.9 6.056 6.056 0 0 0-.747-7.073zM13.26 22.43a4.476 4.476 0 0 1-2.876-1.04l.141-.081 4.779-2.758a.795.795 0 0 0 .392-.681v-6.737l2.02 1.168a.071.071 0 0 1 .038.052v5.583a4.504 4.504 0 0 1-4.494 4.494zM3.6 18.304a4.47 4.47 0 0 1-.535-3.014l.142.085 4.783 2.759a.771.771 0 0 0 .78 0l5.843-3.369v2.332a.08.08 0 0 1-.033.062L9.74 19.95a4.5 4.5 0 0 1-6.14-1.646zM2.34 7.896a4.485 4.485 0 0 1 2.366-1.973V11.6a.766.766 0 0 0 .388.676l5.815 3.355-2.02 1.168a.076.076 0 0 1-.071 0l-4.83-2.786A4.504 4.504 0 0 1 2.34 7.872zm16.597 3.855l-5.833-3.387L15.119 7.2a.076.076 0 0 1 .071 0l4.83 2.791a4.494 4.494 0 0 1-.676 8.105v-5.678a.79.79 0 0 0-.407-.667zm2.01-3.023l-.141-.085-4.774-2.782a.776.776 0 0 0-.785 0L9.409 9.23V6.897a.066.066 0 0 1 .028-.061l4.83-2.787a4.5 4.5 0 0 1 6.68 4.66zm-12.64 4.135l-2.02-1.164a.08.08 0 0 1-.038-.057V6.075a4.5 4.5 0 0 1 7.375-3.453l-.142.08L8.704 5.46a.795.795 0 0 0-.393.681v6.737zm1.097-2.365l2.602-1.5 2.607 1.5v2.999l-2.597 1.5-2.607-1.5z"/>
              </svg>
            ),
            href: "https://chatgpt.com",
            title: "Run the custom GPT to create your inputs here"
          },
          {
            icon: <span className="text-4xl">🏆</span>,
            href: "https://scoreboard.audittoolbox.com",
            title: "See the prompt to create your inputs here"
          },
          {
            icon: <span className="text-4xl">🧰</span>,
            href: "https://audittoolbox.com",
            title: "Find other audit tools here"
          }
        ]}
      />
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
                      {anomaly.reason_codes?.[0]?.code?.replace(/_/g, ' ').toLowerCase()
                        .replace(/\b\w/g, l => l.toUpperCase()) ||
                       anomaly.anomaly_types?.[0] || 'Unknown'}
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
                    {selectedAnomaly.reason_codes?.[0]?.code?.replace(/_/g, ' ').toLowerCase()
                      .replace(/\b\w/g, l => l.toUpperCase()) ||
                     selectedAnomaly.anomaly_types?.[0] || 'Unknown'}
                  </p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                  <p className="text-xs text-gray-600 mb-1">Detection Method</p>
                  <p className="text-sm font-medium text-gray-800">
                    {selectedAnomaly.case?.tags?.find(tag =>
                      ['Isolation Forest', 'Local Outlier Factor', 'One-Class SVM', 'DBSCAN',
                       'Autoencoder', 'Statistical Z-Score', 'Time Series Decomposition', 'Ensemble Method']
                      .includes(tag)
                    ) || selectedAnomaly.model_votes?.[0]?.model || 'Multiple'}
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

              {/* Custom Fields from CSV */}
              {selectedAnomaly.customFields && Object.keys(selectedAnomaly.customFields).length > 0 && (
                <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                  <p className="text-xs text-gray-600 mb-2">Additional Data</p>
                  <div className="space-y-1">
                    {Object.entries(selectedAnomaly.customFields).map(([key, value]) => (
                      <div key={key} className="flex justify-between items-center">
                        <span className="text-xs text-gray-600">
                          {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </span>
                        <span className="text-xs font-medium text-indigo-400">
                          {typeof value === 'number'
                            ? value.toFixed(2)
                            : value === null || value === undefined
                            ? '-'
                            : String(value)}
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
                      const category = anomaly.reason_codes?.[0]?.code?.replace(/_/g, ' ').toLowerCase()
                        .replace(/\b\w/g, l => l.toUpperCase()) ||
                        anomaly.anomaly_types?.[0] || 'Unknown';
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
                      const category = anomaly.reason_codes?.[0]?.code?.replace(/_/g, ' ').toLowerCase()
                        .replace(/\b\w/g, l => l.toUpperCase()) ||
                        anomaly.anomaly_types?.[0] || 'Unknown';
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