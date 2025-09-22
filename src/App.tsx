import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, lazy, Suspense } from 'react';
import { Analytics } from '@vercel/analytics/react';
import { MainLayout } from '@components/layout/MainLayout';
import { PrivacyGuard } from '@components/common/PrivacyGuard';
import { ErrorBoundary } from '@components/common/ErrorBoundary';

// Lazy load the Dashboard for better initial load performance
const Dashboard = lazy(() => import('@features/dashboard/Dashboard').then(module => ({ default: module.Dashboard })));

function App() {
  useEffect(() => {
    // Ensure no network connections after load
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js');
    }
  }, []);

  return (
    <ErrorBoundary>
      <Router>
        <PrivacyGuard>
          <MainLayout>
            <ErrorBoundary>
              <Suspense fallback={
                <div className="flex items-center justify-center h-screen">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading...</p>
                  </div>
                </div>
              }>
                <Routes>
                  <Route path="/" element={<Navigate to="/dashboard" replace />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="*" element={<Navigate to="/dashboard" replace />} />
                </Routes>
              </Suspense>
            </ErrorBoundary>
          </MainLayout>
        </PrivacyGuard>
      </Router>
      <Analytics />
    </ErrorBoundary>
  );
}

export default App;