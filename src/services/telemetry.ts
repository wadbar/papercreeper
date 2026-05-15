// src/services/telemetry.ts

export type MetricType = 'performance' | 'error' | 'interaction';

export const logMetric = (type: MetricType, name: string, data?: any) => {
  const timestamp = new Date().toISOString();
  console.log(`[TELEMETRY][${timestamp}][${type.toUpperCase()}] ${name}`, data || '');
  
  // Example: In a real production app, we would send this to an endpoint
  // fetch('/api/telemetry', { method: 'POST', body: JSON.stringify({ type, name, data, timestamp }) });
};

export const measurePerformance = <T>(name: string, fn: () => T): T => {
  const start = performance.now();
  const result = fn();
  const end = performance.now();
  logMetric('performance', name, { duration: `${(end - start).toFixed(2)}ms` });
  return result;
};

export const measurePerformanceAsync = async <T>(name: string, fn: () => Promise<T>): Promise<T> => {
  const start = performance.now();
  const result = await fn();
  const end = performance.now();
  logMetric('performance', name, { duration: `${(end - start).toFixed(2)}ms` });
  return result;
};
