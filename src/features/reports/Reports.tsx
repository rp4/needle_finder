import { FileText, Download, Calendar, TrendingUp } from 'lucide-react';
import { useAnomalyStore } from '@stores/anomalyStore';

export function Reports() {
  const { getFilteredAnomalies, dataset } = useAnomalyStore();
  const anomalies = getFilteredAnomalies();

  const exportReport = (format: 'json' | 'csv') => {
    const reportData = {
      exportDate: new Date().toISOString(),
      summary: {
        totalRecords: dataset?.dataset_profile?.rows || 0,
        totalAnomalies: anomalies.length,
        highSeverity: anomalies.filter(a => a.severity > 0.7).length,
        mediumSeverity: anomalies.filter(a => a.severity > 0.4 && a.severity <= 0.7).length,
        lowSeverity: anomalies.filter(a => a.severity <= 0.4).length,
      },
      anomalies: anomalies,
    };

    if (format === 'json') {
      const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `anomaly_report_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  const reportTypes = [
    {
      title: 'Executive Summary',
      description: 'High-level overview of anomaly detection results',
      icon: FileText,
      color: 'from-blue-500 to-cyan-500',
    },
    {
      title: 'Detailed Analysis',
      description: 'Comprehensive breakdown of all detected anomalies',
      icon: TrendingUp,
      color: 'from-purple-500 to-pink-500',
    },
    {
      title: 'Monthly Report',
      description: 'Time-based analysis of anomaly patterns',
      icon: Calendar,
      color: 'from-green-500 to-emerald-500',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-100">Reports & Export</h2>
      </div>

      {/* Report Templates */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {reportTypes.map((report) => {
          const Icon = report.icon;
          return (
            <div
              key={report.title}
              className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6 hover:bg-gray-800/70 transition-all"
            >
              <div className={`w-12 h-12 bg-gradient-to-br ${report.color} rounded-lg flex items-center justify-center mb-4`}>
                <Icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-200 mb-2">{report.title}</h3>
              <p className="text-sm text-gray-400 mb-4">{report.description}</p>
              <button className="text-indigo-400 hover:text-indigo-300 text-sm font-medium transition-colors">
                Generate Report →
              </button>
            </div>
          );
        })}
      </div>

      {/* Quick Export */}
      <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gray-200 mb-4">Quick Export</h3>
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={() => exportReport('json')}
            className="flex-1 px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg hover:from-indigo-600 hover:to-purple-700 transition-all flex items-center justify-center gap-2"
          >
            <Download className="w-5 h-5" />
            Export as JSON
          </button>
          <button
            onClick={() => exportReport('csv')}
            className="flex-1 px-6 py-3 bg-gray-700 text-gray-200 rounded-lg hover:bg-gray-600 transition-all flex items-center justify-center gap-2"
          >
            <Download className="w-5 h-5" />
            Export as CSV
          </button>
        </div>
      </div>

      {/* Summary Statistics */}
      <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gray-200 mb-4">Current Analysis Summary</h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <p className="text-sm text-gray-400 mb-1">Total Records</p>
            <p className="text-2xl font-bold text-gray-100">{dataset?.dataset_profile?.rows || 0}</p>
          </div>
          <div>
            <p className="text-sm text-gray-400 mb-1">Anomalies Found</p>
            <p className="text-2xl font-bold text-gray-100">{anomalies.length}</p>
          </div>
          <div>
            <p className="text-sm text-gray-400 mb-1">Detection Rate</p>
            <p className="text-2xl font-bold text-gray-100">
              {dataset?.dataset_profile?.rows ? ((anomalies.length / dataset.dataset_profile.rows) * 100).toFixed(1) : 0}%
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-400 mb-1">High Severity</p>
            <p className="text-2xl font-bold text-red-400">
              {anomalies.filter(a => a.severity > 0.7).length}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}