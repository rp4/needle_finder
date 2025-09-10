import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { FarmLayout } from '@components/farm/FarmLayout';
import { Farmstead } from '@features/farmstead/Farmstead';
import { Fields } from '@features/fields/Fields';
import { Barn } from '@features/barn/Barn';
import { Silo } from '@features/silo/Silo';
import { WeatherStation } from '@features/weather/WeatherStation';
import { Market } from '@features/market/Market';
import { useAnomalyStore } from '@stores/anomalyStore';
import { PrivacyGuard } from '@components/common/PrivacyGuard';

function App() {
  const { hasData } = useAnomalyStore();

  useEffect(() => {
    // Ensure no network connections after load
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js');
    }
  }, []);

  return (
    <Router>
      <PrivacyGuard>
        <FarmLayout>
          <Routes>
            {!hasData ? (
              <>
                <Route path="/" element={<Farmstead onDataLoad={() => {}} />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </>
            ) : (
              <>
                <Route path="/" element={<Navigate to="/fields" replace />} />
                <Route path="/fields" element={<Fields />} />
                <Route path="/barn" element={<Barn />} />
                <Route path="/silo" element={<Silo />} />
                <Route path="/weather" element={<WeatherStation />} />
                <Route path="/market" element={<Market />} />
                <Route path="*" element={<Navigate to="/fields" replace />} />
              </>
            )}
          </Routes>
        </FarmLayout>
      </PrivacyGuard>
    </Router>
  );
}

export default App;