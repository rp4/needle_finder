import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { MainLayout } from '@components/layout/MainLayout';
import { Dashboard } from '@features/dashboard/Dashboard';
import { PrivacyGuard } from '@components/common/PrivacyGuard';
import { ErrorBoundary } from '@components/common/ErrorBoundary';

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
              <Routes>
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
              </Routes>
            </ErrorBoundary>
          </MainLayout>
        </PrivacyGuard>
      </Router>
    </ErrorBoundary>
  );
}

export default App;