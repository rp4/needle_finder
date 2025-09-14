import { ReactNode } from 'react';
import { Download } from 'lucide-react';
import { useAnomalyStore } from '@stores/anomalyStore';

interface MainLayoutProps {
  children: ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const { hasData } = useAnomalyStore();

  return (
    <div
      className="min-h-screen relative"
      style={{
        backgroundImage: 'url(/Haystack.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
      }}
    >
      {/* Background overlay for better readability - light mode */}
      <div className="absolute inset-0 bg-white/30" />

      {/* Content wrapper */}
      <div className="relative z-10">
        {/* Header - glassmorphism light mode */}
        <header className="bg-white/50 backdrop-blur-sm border-b border-gray-200/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <div className="flex items-center space-x-3">
                <span className="text-2xl">🪡</span>
                <h1 className="text-xl font-semibold text-gray-800">
                  Needle Finder
                </h1>
              </div>
            </div>

            {/* Export Button - Only show when data is loaded */}
            {hasData && (
              <button className="flex items-center space-x-2 px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-all">
                <Download className="w-4 h-4" />
                <span className="text-sm font-medium">Export</span>
              </button>
            )}
          </div>
        </div>
      </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>
      </div>
    </div>
  );
}