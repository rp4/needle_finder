import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { MainLayout } from '@components/layout/MainLayout';
import { Dashboard } from '@features/dashboard/Dashboard';
import { PrivacyGuard } from '@components/common/PrivacyGuard';

function App() {
  useEffect(() => {
    // Ensure no network connections after load
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js');
    }
  }, []);

  return (
    <Router>
      <PrivacyGuard>
        <MainLayout>
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </MainLayout>
      </PrivacyGuard>
    </Router>
  );
}

export default App;