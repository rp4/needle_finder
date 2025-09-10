import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import type { AnomalyDataset, Anomaly } from '@/types/anomaly.types';

interface Filters {
  timeRange?: [Date, Date];
  severity?: [number, number];
  materiality?: [number, number];
  anomalyTypes?: string[];
  entities?: string[];
  groups?: string[];
  tags?: string[];
}

interface AnomalyState {
  // Data
  dataset: AnomalyDataset | null;
  hasData: boolean;
  
  // Filters
  filters: Filters;
  
  // UI State
  selectedAnomalyId: string | null;
  viewMode: 'explore' | 'investigate' | 'report';
  piiMasked: boolean;
  
  // Actions
  loadDataset: (data: AnomalyDataset) => void;
  clearDataset: () => void;
  setFilters: (filters: Partial<Filters>) => void;
  clearFilters: () => void;
  selectAnomaly: (id: string | null) => void;
  setViewMode: (mode: 'explore' | 'investigate' | 'report') => void;
  togglePiiMasking: () => void;
  
  // Computed
  getFilteredAnomalies: () => Anomaly[];
  getAnomalyById: (id: string) => Anomaly | undefined;
}

export const useAnomalyStore = create<AnomalyState>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        dataset: null,
        hasData: false,
        filters: {},
        selectedAnomalyId: null,
        viewMode: 'explore',
        piiMasked: true,
        
        // Actions
        loadDataset: (data) => {
          set({ 
            dataset: data, 
            hasData: true,
            filters: {},
            selectedAnomalyId: null
          });
        },
        
        clearDataset: () => {
          set({ 
            dataset: null, 
            hasData: false,
            filters: {},
            selectedAnomalyId: null
          });
        },
        
        setFilters: (newFilters) => {
          set((state) => ({
            filters: { ...state.filters, ...newFilters }
          }));
        },
        
        clearFilters: () => {
          set({ filters: {} });
        },
        
        selectAnomaly: (id) => {
          set({ selectedAnomalyId: id });
        },
        
        setViewMode: (mode) => {
          set({ viewMode: mode });
        },
        
        togglePiiMasking: () => {
          set((state) => ({ piiMasked: !state.piiMasked }));
        },
        
        // Computed
        getFilteredAnomalies: () => {
          const state = get();
          if (!state.dataset) return [];
          
          let anomalies = [...state.dataset.anomalies];
          const { filters } = state;
          
          // Apply time range filter
          if (filters.timeRange) {
            const [start, end] = filters.timeRange;
            anomalies = anomalies.filter(a => {
              const date = new Date(a.timestamp);
              return date >= start && date <= end;
            });
          }
          
          // Apply severity filter
          if (filters.severity) {
            const [min, max] = filters.severity;
            anomalies = anomalies.filter(a => 
              a.severity >= min && a.severity <= max
            );
          }
          
          // Apply materiality filter
          if (filters.materiality) {
            const [min, max] = filters.materiality;
            anomalies = anomalies.filter(a => 
              a.materiality >= min && a.materiality <= max
            );
          }
          
          // Apply anomaly types filter
          if (filters.anomalyTypes && filters.anomalyTypes.length > 0) {
            anomalies = anomalies.filter(a => 
              a.anomaly_types.some(type => 
                filters.anomalyTypes!.includes(type)
              )
            );
          }
          
          // Apply entity filter
          if (filters.entities && filters.entities.length > 0) {
            anomalies = anomalies.filter(a => 
              filters.entities!.includes(a.subject_id)
            );
          }
          
          // Apply tags filter
          if (filters.tags && filters.tags.length > 0) {
            anomalies = anomalies.filter(a => 
              a.case?.tags?.some(tag => 
                filters.tags!.includes(tag)
              )
            );
          }
          
          return anomalies;
        },
        
        getAnomalyById: (id) => {
          const state = get();
          return state.dataset?.anomalies.find(a => a.id === id);
        }
      }),
      {
        name: 'needlefinder-storage',
        partialize: (state) => ({
          filters: state.filters,
          viewMode: state.viewMode,
          piiMasked: state.piiMasked
        })
      }
    )
  )
);