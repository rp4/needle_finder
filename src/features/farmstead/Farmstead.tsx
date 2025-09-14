import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { useNavigate } from 'react-router-dom';
import { useAnomalyStore } from '@stores/anomalyStore';
import { validateDataset } from '@services/data/validation';
import { processDataFile } from '@services/data/fileProcessor';
import { generateMockDatasetAsAnomalyDataset } from '@services/data/mockDataGenerator';
import clsx from 'clsx';

interface FarmsteadProps {
  onDataLoad: () => void;
}

export function Farmstead({ onDataLoad }: FarmsteadProps) {
  const navigate = useNavigate();
  const { loadDataset } = useAnomalyStore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [barnDoorOpen, setBarnDoorOpen] = useState(false);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;
    
    const file = acceptedFiles[0];
    setIsLoading(true);
    setError(null);
    setValidationErrors([]);
    setBarnDoorOpen(true);

    try {
      // Process the file (handles .json and .json.gz)
      const data = await processDataFile(file);
      
      // Validate the dataset
      const validation = validateDataset(data);
      
      if (!validation.valid) {
        setValidationErrors(validation.errors);
        setBarnDoorOpen(false);
        return;
      }

      // Load into store
      loadDataset(data);
      onDataLoad();
      
      // Navigate to fields view
      setTimeout(() => {
        navigate('/fields');
      }, 500);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load file');
      setBarnDoorOpen(false);
    } finally {
      setIsLoading(false);
    }
  }, [loadDataset, onDataLoad, navigate]);

  const handleLoadMockData = () => {
    setIsLoading(true);
    setError(null);
    setValidationErrors([]);
    setBarnDoorOpen(true);

    // Simulate loading delay for better UX
    setTimeout(() => {
      try {
        const mockData = generateMockDatasetAsAnomalyDataset();
        loadDataset(mockData);
        onDataLoad();
        
        // Navigate to fields view
        setTimeout(() => {
          navigate('/fields');
        }, 500);
      } catch (err) {
        setError('Failed to generate mock data');
        setBarnDoorOpen(false);
      } finally {
        setIsLoading(false);
      }
    }, 1500);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/json': ['.json'],
      'application/gzip': ['.gz', '.json.gz']
    },
    maxFiles: 1,
    maxSize: 150 * 1024 * 1024, // 150MB
  });

  return (
    <div className="max-w-4xl mx-auto">
      {/* Welcome Header */}
      <div className="text-center mb-8">
        <h1 className="text-5xl font-rustic text-farm-barn mb-4">
          Welcome to the Farmstead
        </h1>
        <p className="text-xl text-farm-soil">
          Bring your harvest of data through the barn doors
        </p>
        <p className="text-sm text-farm-soil-dark mt-2">
          Upload your anomaly dataset to begin exploring
        </p>
      </div>

      {/* Barn Door Upload Area */}
      <div className="relative">
        <div
          {...getRootProps()}
          className={clsx(
            'relative h-96 rounded-lg border-8 cursor-pointer transition-all',
            'bg-gradient-to-b from-farm-barn to-farm-barn-dark',
            'border-farm-fence shadow-2xl overflow-hidden',
            isDragActive && 'ring-4 ring-farm-hay ring-opacity-75',
            barnDoorOpen && 'animate-barn-door'
          )}
        >
          <input {...getInputProps()} />
          
          {/* Barn Door Design */}
          <div className="absolute inset-0 flex">
            <div className="w-1/2 border-r-4 border-farm-fence bg-wood-grain opacity-90">
              <div className="h-full flex flex-col justify-center items-center">
                <div className="w-4 h-8 bg-farm-stone rounded-full mb-32"></div>
              </div>
            </div>
            <div className="w-1/2 border-l-4 border-farm-fence bg-wood-grain opacity-90">
              <div className="h-full flex flex-col justify-center items-center">
                <div className="w-4 h-8 bg-farm-stone rounded-full mb-32"></div>
              </div>
            </div>
          </div>

          {/* Upload Content */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-8">
            {isLoading ? (
              <div className="text-center">
                <div className="animate-windmill text-6xl mb-4">🌾</div>
                <p className="text-xl font-rustic">Harvesting your data...</p>
                <div className="mt-4 w-64 h-2 bg-farm-soil rounded-full overflow-hidden">
                  <div className="h-full bg-farm-hay grain-loader"></div>
                </div>
              </div>
            ) : isDragActive ? (
              <div className="text-center">
                <div className="text-6xl mb-4 animate-bounce">📦</div>
                <p className="text-xl font-rustic">Drop your harvest here!</p>
              </div>
            ) : (
              <div className="text-center">
                <div className="text-6xl mb-4">🚪</div>
                <p className="text-xl font-rustic mb-2">
                  Drag & drop your data file here
                </p>
                <p className="text-sm opacity-90">
                  or click to select a file
                </p>
                <p className="text-xs mt-4 opacity-75">
                  Accepts .json and .json.gz files up to 150MB
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Hay Bales Decoration */}
        <div className="absolute -bottom-6 -left-6 w-16 h-12 hay-bale"></div>
        <div className="absolute -bottom-4 -right-8 w-20 h-14 hay-bale"></div>
      </div>

      {/* Load Mock Data Button */}
      <div className="mt-6 text-center">
        <div className="inline-flex items-center space-x-4">
          <span className="text-farm-soil">or</span>
          <button
            onClick={handleLoadMockData}
            disabled={isLoading}
            className="bg-farm-grass hover:bg-farm-grass-dark text-white px-6 py-3 rounded-lg font-rustic text-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg transform hover:scale-105"
          >
            <span className="mr-2">🌾</span>
            Load Sample Farm Data
          </button>
          <span className="text-farm-soil">to explore the app</span>
        </div>
        <p className="text-xs text-farm-soil-dark mt-2">
          250 mock anomalies from various farm operations
        </p>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mt-6 p-4 bg-red-50 border-2 border-red-200 rounded-lg">
          <div className="flex items-start space-x-2">
            <span className="text-2xl">🚨</span>
            <div>
              <h3 className="font-rustic text-red-800">Failed to load harvest</h3>
              <p className="text-red-600 text-sm mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Validation Errors */}
      {validationErrors.length > 0 && (
        <div className="mt-6 p-4 bg-yellow-50 border-2 border-yellow-200 rounded-lg">
          <div className="flex items-start space-x-2">
            <span className="text-2xl">⚠️</span>
            <div>
              <h3 className="font-rustic text-yellow-800">
                Crop Inspector found issues:
              </h3>
              <ul className="mt-2 space-y-1">
                {validationErrors.map((err, idx) => (
                  <li key={idx} className="text-yellow-700 text-sm">
                    • {err}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="mt-8 grid grid-cols-3 gap-4">
        <div className="farm-card text-center">
          <div className="text-3xl mb-2">🔒</div>
          <h3 className="font-rustic text-farm-barn mb-1">100% Private</h3>
          <p className="text-sm text-farm-soil">
            Your data never leaves your browser
          </p>
        </div>
        <div className="farm-card text-center">
          <div className="text-3xl mb-2">📊</div>
          <h3 className="font-rustic text-farm-barn mb-1">Rich Analytics</h3>
          <p className="text-sm text-farm-soil">
            Explore anomalies with farm-fresh visualizations
          </p>
        </div>
        <div className="farm-card text-center">
          <div className="text-3xl mb-2">📋</div>
          <h3 className="font-rustic text-farm-barn mb-1">Export Ready</h3>
          <p className="text-sm text-farm-soil">
            Generate reports and evidence packs
          </p>
        </div>
      </div>
    </div>
  );
}