// Performance optimization utilities for the facility design application

export class PerformanceOptimizer {
  private static rafCallbacks: Map<string, number> = new Map();
  private static debouncedFunctions: Map<string, any> = new Map();
  private static throttledFunctions: Map<string, any> = new Map();

  /**
   * Request Animation Frame wrapper for smooth animations
   */
  static requestAnimationFrame(id: string, callback: () => void): void {
    // Cancel any existing animation frame for this ID
    const existingId = this.rafCallbacks.get(id);
    if (existingId) {
      cancelAnimationFrame(existingId);
    }

    // Schedule new animation frame
    const rafId = requestAnimationFrame(() => {
      callback();
      this.rafCallbacks.delete(id);
    });

    this.rafCallbacks.set(id, rafId);
  }

  /**
   * Debounce function calls for performance
   */
  static debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number,
    id: string
  ): (...args: Parameters<T>) => void {
    let timeoutId: NodeJS.Timeout;

    const debouncedFunc = (...args: Parameters<T>) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func(...args), wait);
    };

    this.debouncedFunctions.set(id, debouncedFunc);
    return debouncedFunc;
  }

  /**
   * Throttle function calls for performance
   */
  static throttle<T extends (...args: any[]) => any>(
    func: T,
    limit: number,
    id: string
  ): (...args: Parameters<T>) => void {
    let inThrottle: boolean = false;

    const throttledFunc = (...args: Parameters<T>) => {
      if (!inThrottle) {
        func(...args);
        inThrottle = true;
        setTimeout(() => {
          inThrottle = false;
        }, limit);
      }
    };

    this.throttledFunctions.set(id, throttledFunc);
    return throttledFunc;
  }

  /**
   * Lazy load images with intersection observer
   */
  static lazyLoadImages(selector: string = 'img[data-lazy]'): void {
    const images = document.querySelectorAll(selector);
    
    const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target as HTMLImageElement;
          const src = img.dataset.src;
          if (src) {
            img.src = src;
            img.removeAttribute('data-lazy');
            img.removeAttribute('data-src');
            observer.unobserve(img);
          }
        }
      });
    });

    images.forEach(img => imageObserver.observe(img));
  }

  /**
   * Memoize expensive computations
   */
  static memoize<T extends (...args: any[]) => any>(
    func: T,
    resolver?: (...args: Parameters<T>) => string
  ): T {
    const cache = new Map<string, ReturnType<T>>();

    return ((...args: Parameters<T>) => {
      const key = resolver ? resolver(...args) : JSON.stringify(args);
      
      if (cache.has(key)) {
        return cache.get(key);
      }

      const result = func(...args);
      cache.set(key, result);
      
      // Limit cache size to prevent memory leaks
      if (cache.size > 100) {
        const firstKey = cache.keys().next().value;
        if (firstKey !== undefined) {
          cache.delete(firstKey);
        }
      }

      return result;
    }) as T;
  }

  /**
   * Virtual scrolling for large lists
   */
  static virtualScroll(
    container: HTMLElement,
    items: any[],
    itemHeight: number,
    renderItem: (item: any, index: number) => HTMLElement
  ): void {
    const visibleHeight = container.clientHeight;
    const totalHeight = items.length * itemHeight;
    const visibleItems = Math.ceil(visibleHeight / itemHeight);
    const bufferItems = 5; // Extra items to render for smooth scrolling

    // Create virtual container
    const virtualContainer = document.createElement('div');
    virtualContainer.style.height = `${totalHeight}px`;
    virtualContainer.style.position = 'relative';
    container.appendChild(virtualContainer);

    const renderVisibleItems = () => {
      const scrollTop = container.scrollTop;
      const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - bufferItems);
      const endIndex = Math.min(
        items.length,
        startIndex + visibleItems + bufferItems * 2
      );

      // Clear existing items
      virtualContainer.innerHTML = '';

      // Render visible items
      for (let i = startIndex; i < endIndex; i++) {
        const itemElement = renderItem(items[i], i);
        itemElement.style.position = 'absolute';
        itemElement.style.top = `${i * itemHeight}px`;
        itemElement.style.left = '0';
        itemElement.style.right = '0';
        virtualContainer.appendChild(itemElement);
      }
    };

    // Initial render
    renderVisibleItems();

    // Re-render on scroll
    container.addEventListener(
      'scroll',
      this.throttle(renderVisibleItems, 16, 'virtual-scroll')
    );
  }

  /**
   * Batch DOM updates for better performance
   */
  static batchDOMUpdates(updates: (() => void)[]): void {
    requestAnimationFrame(() => {
      const fragment = document.createDocumentFragment();
      updates.forEach(update => update());
    });
  }

  /**
   * Optimize SVG rendering
   */
  static optimizeSVG(svg: SVGElement): void {
    // Remove unnecessary attributes
    const unnecessaryAttrs = ['xmlns:xlink', 'version', 'xml:space'];
    unnecessaryAttrs.forEach(attr => svg.removeAttribute(attr));

    // Round path coordinates to reduce size
    const paths = svg.querySelectorAll('path');
    paths.forEach(path => {
      const d = path.getAttribute('d');
      if (d) {
        const optimizedD = d.replace(/(\d+\.\d{3})\d+/g, '$1');
        path.setAttribute('d', optimizedD);
      }
    });

    // Remove empty groups
    const groups = svg.querySelectorAll('g');
    groups.forEach(group => {
      if (!group.hasChildNodes()) {
        group.remove();
      }
    });
  }

  /**
   * Web Worker for heavy computations
   */
  static runInWorker<T>(func: () => T): Promise<T> {
    return new Promise((resolve, reject) => {
      const workerCode = `
        self.onmessage = function(e) {
          const func = ${func.toString()};
          const result = func();
          self.postMessage(result);
        }
      `;

      const blob = new Blob([workerCode], { type: 'application/javascript' });
      const worker = new Worker(URL.createObjectURL(blob));

      worker.onmessage = (e) => {
        resolve(e.data);
        worker.terminate();
      };

      worker.onerror = (error) => {
        reject(error);
        worker.terminate();
      };

      worker.postMessage({});
    });
  }

  /**
   * Preload critical resources
   */
  static preloadResources(urls: string[]): void {
    urls.forEach(url => {
      const link = document.createElement('link');
      link.rel = 'preload';
      
      // Determine resource type
      if (url.endsWith('.css')) {
        link.as = 'style';
      } else if (url.endsWith('.js')) {
        link.as = 'script';
      } else if (url.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
        link.as = 'image';
      } else if (url.match(/\.(woff|woff2|ttf|otf)$/i)) {
        link.as = 'font';
        link.crossOrigin = 'anonymous';
      }

      link.href = url;
      document.head.appendChild(link);
    });
  }

  /**
   * Enable GPU acceleration for animations
   */
  static enableGPUAcceleration(element: HTMLElement): void {
    element.style.transform = 'translateZ(0)';
    element.style.willChange = 'transform';
  }

  /**
   * Clean up resources
   */
  static cleanup(): void {
    this.rafCallbacks.forEach(id => cancelAnimationFrame(id));
    this.rafCallbacks.clear();
    this.debouncedFunctions.clear();
    this.throttledFunctions.clear();
  }
}

export default PerformanceOptimizer;