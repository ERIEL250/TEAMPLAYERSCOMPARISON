import * as Sentry from '@sentry/react';
import { BrowserTracing } from '@sentry/tracing';

// Initialize Sentry only in production
export const initMonitoring = () => {
  if (
    process.env.NODE_ENV === 'production' &&
    process.env.REACT_APP_SENTRY_DSN
  ) {
    Sentry.init({
      dsn: process.env.REACT_APP_SENTRY_DSN,
      integrations: [new BrowserTracing()],
      tracesSampleRate: 0.1, // Sample 10% of transactions for performance monitoring
      environment: process.env.NODE_ENV,
      release: process.env.REACT_APP_VERSION || '1.0.0',
      // Ignore common errors that don't need reporting
      ignoreErrors: [
        'ResizeObserver loop limit exceeded',
        'Network request failed',
        'Failed to fetch',
      ],
    });
    console.log('Sentry monitoring initialized');
  }
};

// Track user actions for analytics
export const trackEvent = (eventName, properties = {}) => {
  if (process.env.NODE_ENV === 'production') {
    // In production, send to your analytics service (e.g., Mixpanel, Posthog, etc.)
    console.log('Event tracked:', eventName, properties);
  } else {
    console.log('Event tracked (dev):', eventName, properties);
  }
};

// Track performance metrics
export const trackPerformance = (metricName, value) => {
  if (process.env.NODE_ENV === 'production') {
    // Send performance metrics to your monitoring service
    console.log('Performance metric:', metricName, value);
  } else {
    console.log('Performance metric (dev):', metricName, value);
  }
};

// Error boundary fallback component
export const ErrorFallback = ({ error, resetErrorBoundary }) => {
  return (
    <div className="error-boundary">
      <h2>Something went wrong</h2>
      <p>{error.message}</p>
      <button onClick={resetErrorBoundary}>Try again</button>
    </div>
  );
};
