import { useEffect, useRef, useCallback } from 'react';
import { PerformanceOptimizer } from '@/lib/performance-optimizer';

/**
 * Hook for optimizing component performance
 */
export function usePerformance() {
  const debounceCache = useRef<Map<string, any>>(new Map());
  const throttleCache = useRef<Map<string, any>>(new Map());

  // Clean up on unmount
  useEffect(() => {
    return () => {
      PerformanceOptimizer.cleanup();
    };
  }, []);

  /**
   * Debounced callback
   */
  const debounce = useCallback(<T extends (...args: any[]) => any>(
    func: T,
    wait: number,
    id: string
  ): ((...args: Parameters<T>) => void) => {
    if (!debounceCache.current.has(id)) {
      const debouncedFunc = PerformanceOptimizer.debounce(func, wait, id);
      debounceCache.current.set(id, debouncedFunc);
    }
    return debounceCache.current.get(id);
  }, []);

  /**
   * Throttled callback
   */
  const throttle = useCallback(<T extends (...args: any[]) => any>(
    func: T,
    limit: number,
    id: string
  ): ((...args: Parameters<T>) => void) => {
    if (!throttleCache.current.has(id)) {
      const throttledFunc = PerformanceOptimizer.throttle(func, limit, id);
      throttleCache.current.set(id, throttledFunc);
    }
    return throttleCache.current.get(id);
  }, []);

  /**
   * Request animation frame wrapper
   */
  const requestAnimationFrame = useCallback((id: string, callback: () => void) => {
    PerformanceOptimizer.requestAnimationFrame(id, callback);
  }, []);

  /**
   * Memoized computation
   */
  const memoize = useCallback(<T extends (...args: any[]) => any>(
    func: T,
    resolver?: (...args: Parameters<T>) => string
  ): T => {
    return PerformanceOptimizer.memoize(func, resolver);
  }, []);

  /**
   * Enable GPU acceleration
   */
  const enableGPUAcceleration = useCallback((element: HTMLElement | null) => {
    if (element) {
      PerformanceOptimizer.enableGPUAcceleration(element);
    }
  }, []);

  /**
   * Optimize SVG
   */
  const optimizeSVG = useCallback((svg: SVGElement | null) => {
    if (svg) {
      PerformanceOptimizer.optimizeSVG(svg);
    }
  }, []);

  return {
    debounce,
    throttle,
    requestAnimationFrame,
    memoize,
    enableGPUAcceleration,
    optimizeSVG,
  };
}

export default usePerformance;