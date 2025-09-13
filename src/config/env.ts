// Environment configuration with validation
import { z } from 'zod';

// Define environment schema
const EnvSchema = z.object({
  MODE: z.enum(['development', 'production', 'test']).default('development'),
  DEV: z.boolean(),
  PROD: z.boolean(),
  BASE_URL: z.string().default('/'),
  // Add your environment variables here
  VITE_APP_NAME: z.string().default('NeedleFinder'),
  VITE_APP_VERSION: z.string().default('1.0.0'),
  VITE_MAX_FILE_SIZE_MB: z.string().optional().transform(val => Number(val || '100')).default(() => 100),
  VITE_MAX_ANOMALIES_DISPLAY: z.string().optional().transform(val => Number(val || '10000')).default(() => 10000),
  VITE_ENABLE_MOCK_DATA: z.string().optional().transform(val => val === 'true').default(() => true),
  VITE_LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info')
});

// Parse and validate environment
const parseEnv = () => {
  try {
    return EnvSchema.parse({
      MODE: import.meta.env.MODE,
      DEV: import.meta.env.DEV,
      PROD: import.meta.env.PROD,
      BASE_URL: import.meta.env.BASE_URL,
      VITE_APP_NAME: import.meta.env.VITE_APP_NAME,
      VITE_APP_VERSION: import.meta.env.VITE_APP_VERSION,
      VITE_MAX_FILE_SIZE_MB: import.meta.env.VITE_MAX_FILE_SIZE_MB,
      VITE_MAX_ANOMALIES_DISPLAY: import.meta.env.VITE_MAX_ANOMALIES_DISPLAY,
      VITE_ENABLE_MOCK_DATA: import.meta.env.VITE_ENABLE_MOCK_DATA,
      VITE_LOG_LEVEL: import.meta.env.VITE_LOG_LEVEL
    });
  } catch (error) {
    console.error('Environment validation failed:', error);
    // Return defaults if validation fails
    return EnvSchema.parse({});
  }
};

// Export validated environment
export const env = parseEnv();

// Type-safe environment config
export const config = {
  app: {
    name: env.VITE_APP_NAME,
    version: env.VITE_APP_VERSION,
    isDevelopment: env.DEV,
    isProduction: env.PROD,
    baseUrl: env.BASE_URL
  },
  features: {
    enableMockData: env.VITE_ENABLE_MOCK_DATA
  },
  limits: {
    maxFileSizeMB: env.VITE_MAX_FILE_SIZE_MB,
    maxFileSizeBytes: env.VITE_MAX_FILE_SIZE_MB * 1024 * 1024,
    maxAnomaliesDisplay: env.VITE_MAX_ANOMALIES_DISPLAY
  },
  logging: {
    level: env.VITE_LOG_LEVEL
  }
} as const;

// Export type for config
export type AppConfig = typeof config;