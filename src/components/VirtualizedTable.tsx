import { useRef, memo } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import type { Anomaly } from '@/types/anomaly.types';
import { SeverityBadge } from '@components/common/SeverityBadge';
import { formatAnomalyId, getAnomalyCategory } from '@/utils/anomalyUtils';
import { CheckCircle, X, AlertTriangle } from 'lucide-react';

interface VirtualizedTableProps {
  anomalies: Anomaly[];
  reviewedAnomalies: Record<string, 'confirmed' | 'rejected'>;
  anomalyNotes: Record<string, string>;
  onReview: (id: string, status: 'confirmed' | 'rejected') => void;
  onRowClick: (anomaly: Anomaly) => void;
}

export const VirtualizedTable = memo(function VirtualizedTable({
  anomalies,
  reviewedAnomalies,
  anomalyNotes,
  onReview,
  onRowClick
}: VirtualizedTableProps) {
  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: anomalies.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 60, // Estimated row height
    overscan: 5, // Number of items to render outside of the visible area
  });

  const items = virtualizer.getVirtualItems();

  return (
    <div className="overflow-hidden rounded-lg shadow">
      {/* Table Header */}
      <div className="bg-gray-50 px-6 py-3 grid grid-cols-12 gap-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
        <div className="col-span-2">ID</div>
        <div className="col-span-2">Category</div>
        <div className="col-span-1">Severity</div>
        <div className="col-span-1">Score</div>
        <div className="col-span-3">Explanation</div>
        <div className="col-span-2">Status</div>
        <div className="col-span-1">Actions</div>
      </div>

      {/* Virtual Scrolling Container */}
      <div
        ref={parentRef}
        className="bg-white overflow-auto"
        style={{ height: '500px' }}
      >
        <div
          style={{
            height: `${virtualizer.getTotalSize()}px`,
            width: '100%',
            position: 'relative',
          }}
        >
          {items.map((virtualRow) => {
            const anomaly = anomalies[virtualRow.index];
            if (!anomaly) return null;

            const status = reviewedAnomalies[anomaly.id];
            const note = anomalyNotes[anomaly.id];
            const isRejected = status === 'rejected';

            return (
              <div
                key={anomaly.id}
                data-index={virtualRow.index}
                ref={virtualizer.measureElement}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  transform: `translateY(${virtualRow.start}px)`,
                }}
                className={`px-6 py-4 grid grid-cols-12 gap-4 items-center border-b border-gray-200 hover:bg-gray-50 cursor-pointer ${
                  isRejected ? 'opacity-50' : ''
                }`}
                onClick={() => onRowClick(anomaly)}
              >
                <div className="col-span-2">
                  <span className="text-sm font-medium text-gray-900">
                    {formatAnomalyId(anomaly.id)}
                  </span>
                </div>

                <div className="col-span-2">
                  <span className="text-sm text-gray-900">
                    {getAnomalyCategory(anomaly)}
                  </span>
                </div>

                <div className="col-span-1">
                  <SeverityBadge severity={anomaly.severity} />
                </div>

                <div className="col-span-1">
                  <span className="text-sm text-gray-900">
                    {(anomaly.unified_score * 100).toFixed(1)}%
                  </span>
                </div>

                <div className="col-span-3">
                  <p className="text-sm text-gray-600 truncate">
                    {anomaly.reason_codes?.[0]?.text || 'No explanation'}
                  </p>
                  {note && (
                    <p className="text-xs text-blue-600 mt-1">Note: {note}</p>
                  )}
                </div>

                <div className="col-span-2">
                  {status === 'confirmed' && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Confirmed
                    </span>
                  )}
                  {status === 'rejected' && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                      <X className="w-3 h-3 mr-1" />
                      False Positive
                    </span>
                  )}
                  {!status && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                      <AlertTriangle className="w-3 h-3 mr-1" />
                      Unreviewed
                    </span>
                  )}
                </div>

                <div className="col-span-1">
                  <div className="flex space-x-1" onClick={(e) => e.stopPropagation()}>
                    {!status && (
                      <>
                        <button
                          onClick={() => onReview(anomaly.id, 'confirmed')}
                          className="p-1 text-green-600 hover:bg-green-50 rounded"
                          title="Confirm"
                        >
                          <CheckCircle className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onReview(anomaly.id, 'rejected')}
                          className="p-1 text-red-600 hover:bg-red-50 rounded"
                          title="Mark as False Positive"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
});