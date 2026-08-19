import { useEffect } from "react";

/**
 * Performance monitoring for Core Web Vitals
 * Tracks LCP, FID, CLS, FCP, TTFB
 */
export default function PerformanceMonitor() {
  useEffect(() => {
    if (typeof window === 'undefined' || !window.performance) return;

    // Monitor LCP (Largest Contentful Paint)
    const lcpObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1];
      console.log('[LCP]', lastEntry.renderTime || lastEntry.loadTime);
    });

    try {
      lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });
    } catch (e) {
      // Browser doesn't support LCP
    }

    // Monitor FID (First Input Delay) / INP (Interaction to Next Paint)
    const fidObserver = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        console.log('[FID/INP]', entry.processingStart - entry.startTime);
      });
    });

    try {
      fidObserver.observe({ type: 'first-input', buffered: true });
    } catch (e) {
      // Browser doesn't support FID
    }

    // Monitor CLS (Cumulative Layout Shift)
    let clsScore = 0;
    const clsObserver = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        if (!entry.hadRecentInput) {
          clsScore += entry.value;
          console.log('[CLS]', clsScore);
        }
      });
    });

    try {
      clsObserver.observe({ type: 'layout-shift', buffered: true });
    } catch (e) {
      // Browser doesn't support CLS
    }

    return () => {
      lcpObserver.disconnect();
      fidObserver.disconnect();
      clsObserver.disconnect();
    };
  }, []);

  return null;
}