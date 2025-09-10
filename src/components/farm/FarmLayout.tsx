import { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAnomalyStore } from '@stores/anomalyStore';
import clsx from 'clsx';

interface FarmLayoutProps {
  children: ReactNode;
}

export function FarmLayout({ children }: FarmLayoutProps) {
  const location = useLocation();
  const { hasData, dataset, piiMasked, togglePiiMasking } = useAnomalyStore();

  const navItems = [
    { path: '/fields', label: 'The Fields', icon: '🌾', description: 'Explore overview' },
    { path: '/barn', label: 'The Barn', icon: '🏚️', description: 'Investigate details' },
    { path: '/silo', label: 'The Silo', icon: '🌽', description: 'Group analysis' },
    { path: '/weather', label: 'Weather Station', icon: '🌤️', description: 'Drift monitoring' },
    { path: '/market', label: 'The Market', icon: '🧺', description: 'Reports & export' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-farm-sky-light to-farm-wheat-light">
      {/* Farm Header */}
      <header className="bg-farm-barn text-white shadow-lg">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="text-3xl">🌾</div>
              <div>
                <h1 className="text-2xl font-rustic">NeedleFinder</h1>
                <p className="text-farm-wheat text-sm">Finding needles in the haystack</p>
              </div>
            </div>
            
            {hasData && (
              <div className="flex items-center space-x-6">
                <div className="text-sm">
                  <span className="text-farm-wheat">Dataset:</span>
                  <span className="ml-2 font-semibold">
                    {dataset?.dataset_profile.rows.toLocaleString()} records
                  </span>
                </div>
                
                <button
                  onClick={togglePiiMasking}
                  className={clsx(
                    'px-3 py-1 rounded-full text-sm transition-colors',
                    piiMasked 
                      ? 'bg-green-600 hover:bg-green-700' 
                      : 'bg-yellow-600 hover:bg-yellow-700'
                  )}
                >
                  {piiMasked ? '🔒 PII Hidden' : '👁️ PII Visible'}
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Navigation Bar */}
      {hasData && (
        <nav className="bg-white border-b-4 border-farm-fence shadow-md">
          <div className="container mx-auto px-4">
            <div className="flex space-x-1">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={clsx(
                    'flex items-center space-x-2 px-4 py-3 border-b-4 transition-all',
                    location.pathname === item.path
                      ? 'border-farm-barn bg-farm-wheat text-farm-barn font-semibold'
                      : 'border-transparent hover:bg-farm-wheat-light hover:border-farm-hay'
                  )}
                >
                  <span className="text-xl">{item.icon}</span>
                  <div>
                    <div className="text-sm font-rustic">{item.label}</div>
                    <div className="text-xs text-farm-soil opacity-75">{item.description}</div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </nav>
      )}

      {/* Main Content Area */}
      <main className="container mx-auto px-4 py-6">
        <div className="min-h-[calc(100vh-200px)]">
          {children}
        </div>
      </main>

      {/* Farm Footer */}
      <footer className="bg-farm-soil text-farm-wheat mt-12">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-2">
              <span>🔒</span>
              <span>All data processed locally - No network connections</span>
            </div>
            <div className="flex items-center space-x-4">
              <span>© 2025 NeedleFinder</span>
              <span className="text-farm-hay">•</span>
              <span>Farm-fresh anomaly detection</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}