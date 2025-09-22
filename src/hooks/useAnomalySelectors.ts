import { useAnomalyStore } from '@stores/anomalyStore';
import { shallow } from 'zustand/shallow';

// Optimized selectors to prevent unnecessary re-renders
export const useAnomalyData = () =>
  useAnomalyStore(
    state => ({
      dataset: state.dataset,
      hasData: state.hasData,
      anomalies: state.getFilteredAnomalies()
    }),
    shallow
  );

export const useAnomalyFilters = () =>
  useAnomalyStore(
    state => ({
      filters: state.filters,
      setFilters: state.setFilters,
      clearFilters: state.clearFilters
    }),
    shallow
  );

export const useAnomalyReview = () =>
  useAnomalyStore(
    state => ({
      reviewedAnomalies: state.reviewedAnomalies,
      anomalyNotes: state.anomalyNotes,
      setAnomalyReview: state.setAnomalyReview,
      setAnomalyNote: state.setAnomalyNote
    }),
    shallow
  );

export const useSelectedAnomaly = () =>
  useAnomalyStore(state => ({
    selectedAnomalyId: state.selectedAnomalyId,
    selectAnomaly: state.selectAnomaly,
    getAnomalyById: state.getAnomalyById
  }));