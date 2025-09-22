import { onCLS, onFID, onLCP, onFCP, onTTFB, Metric } from 'web-vitals';

const vitalsUrl = 'https://vitals.vercel-analytics.com/v1/vitals';

function getConnectionSpeed() {
  const nav = navigator as any;
  return nav?.connection?.effectiveType || 'unknown';
}

function sendToAnalytics(metric: Metric) {
  const body = {
    dsn: process.env.VITE_VERCEL_ANALYTICS_ID,
    id: metric.id,
    page: window.location.pathname,
    href: window.location.href,
    event_name: metric.name,
    value: metric.value.toString(),
    speed: getConnectionSpeed(),
  };

  if (process.env.NODE_ENV === 'production' && body.dsn) {
    const blob = new Blob([JSON.stringify(body)], { type: 'application/json' });
    if (navigator.sendBeacon) {
      navigator.sendBeacon(vitalsUrl, blob);
    } else {
      fetch(vitalsUrl, {
        body: JSON.stringify(body),
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        keepalive: true,
      });
    }
  } else {
    console.log('[Web Vitals]', metric.name, metric.value, metric);
  }
}

export function initPerformanceMonitoring() {
  try {
    onCLS(sendToAnalytics);
    onFID(sendToAnalytics);
    onLCP(sendToAnalytics);
    onFCP(sendToAnalytics);
    onTTFB(sendToAnalytics);
  } catch (err) {
    console.error('Failed to initialize performance monitoring:', err);
  }
}