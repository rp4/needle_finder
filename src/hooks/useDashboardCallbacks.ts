import { useCallback } from 'react';

export const useDashboardCallbacks = (
  setFilterMode: React.Dispatch<React.SetStateAction<'all' | 'confirmed' | 'high-severity' | 'unreviewed'>>,
  setSelectedAnomaly: React.Dispatch<React.SetStateAction<any>>
) => {
  const handleConfirmedAnomaliesClick = useCallback(() => {
    setFilterMode(prev => prev === 'confirmed' ? 'all' : 'confirmed');
    setSelectedAnomaly(null);
  }, [setFilterMode, setSelectedAnomaly]);

  const handleHighSeverityClick = useCallback(() => {
    setFilterMode(prev => prev === 'high-severity' ? 'all' : 'high-severity');
    setSelectedAnomaly(null);
  }, [setFilterMode, setSelectedAnomaly]);

  const handleTotalRecordsClick = useCallback(() => {
    setFilterMode('all');
    setSelectedAnomaly(null);
  }, [setFilterMode, setSelectedAnomaly]);

  const handleAnomaliesDetectedClick = useCallback(() => {
    setFilterMode(prev => prev === 'unreviewed' ? 'all' : 'unreviewed');
    setSelectedAnomaly(null);
  }, [setFilterMode, setSelectedAnomaly]);

  return {
    handleConfirmedAnomaliesClick,
    handleHighSeverityClick,
    handleTotalRecordsClick,
    handleAnomaliesDetectedClick
  };
};