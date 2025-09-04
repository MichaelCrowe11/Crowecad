/**
 * Accessibility hooks for CroweCad platform
 * Provides reusable hooks for common accessibility patterns
 */

import { useEffect, useRef, useState } from 'react';
import { KEYBOARD_KEYS } from '@/lib/accessibility';

/**
 * Hook for managing focus trap within a container
 * Useful for modals, dialogs, and dropdown menus
 */
export function useFocusTrap(isActive: boolean) {
  const containerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (!isActive || !containerRef.current) return;
    
    const container = containerRef.current;
    const focusableSelectors = [
      'a[href]',
      'button:not([disabled])',
      'textarea:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      '[tabindex]:not([tabindex="-1"])'
    ].join(',');
    
    const focusableElements = container.querySelectorAll<HTMLElement>(focusableSelectors);
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];
    
    firstElement?.focus();
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== KEYBOARD_KEYS.TAB) return;
      
      if (e.shiftKey && document.activeElement === firstElement) {
        e.preventDefault();
        lastElement?.focus();
      } else if (!e.shiftKey && document.activeElement === lastElement) {
        e.preventDefault();
        firstElement?.focus();
      }
    };
    
    container.addEventListener('keydown', handleKeyDown);
    
    return () => {
      container.removeEventListener('keydown', handleKeyDown);
    };
  }, [isActive]);
  
  return containerRef;
}

/**
 * Hook for managing keyboard navigation
 * Provides arrow key navigation, enter/space selection
 */
export function useKeyboardNavigation<T extends HTMLElement>(
  items: T[],
  options?: {
    onSelect?: (index: number) => void;
    orientation?: 'horizontal' | 'vertical' | 'both';
    wrap?: boolean;
  }
) {
  const [focusedIndex, setFocusedIndex] = useState(0);
  const { onSelect, orientation = 'vertical', wrap = true } = options || {};
  
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key;
      let newIndex = focusedIndex;
      
      switch (key) {
        case KEYBOARD_KEYS.ARROW_UP:
          if (orientation !== 'horizontal') {
            e.preventDefault();
            newIndex = focusedIndex - 1;
          }
          break;
        case KEYBOARD_KEYS.ARROW_DOWN:
          if (orientation !== 'horizontal') {
            e.preventDefault();
            newIndex = focusedIndex + 1;
          }
          break;
        case KEYBOARD_KEYS.ARROW_LEFT:
          if (orientation !== 'vertical') {
            e.preventDefault();
            newIndex = focusedIndex - 1;
          }
          break;
        case KEYBOARD_KEYS.ARROW_RIGHT:
          if (orientation !== 'vertical') {
            e.preventDefault();
            newIndex = focusedIndex + 1;
          }
          break;
        case KEYBOARD_KEYS.HOME:
          e.preventDefault();
          newIndex = 0;
          break;
        case KEYBOARD_KEYS.END:
          e.preventDefault();
          newIndex = items.length - 1;
          break;
        case KEYBOARD_KEYS.ENTER:
        case KEYBOARD_KEYS.SPACE:
          e.preventDefault();
          onSelect?.(focusedIndex);
          break;
        default:
          return;
      }
      
      // Handle wrapping
      if (wrap) {
        if (newIndex < 0) newIndex = items.length - 1;
        if (newIndex >= items.length) newIndex = 0;
      } else {
        newIndex = Math.max(0, Math.min(items.length - 1, newIndex));
      }
      
      if (newIndex !== focusedIndex) {
        setFocusedIndex(newIndex);
        items[newIndex]?.focus();
      }
    };
    
    // Add event listener to the focused element
    const currentItem = items[focusedIndex];
    if (currentItem) {
      currentItem.addEventListener('keydown', handleKeyDown);
      return () => {
        currentItem.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [focusedIndex, items, onSelect, orientation, wrap]);
  
  return { focusedIndex, setFocusedIndex };
}

/**
 * Hook for screen reader announcements
 * Provides a way to announce messages to screen readers
 */
export function useAnnounce() {
  const announcerRef = useRef<HTMLDivElement | null>(null);
  
  useEffect(() => {
    const announcer = document.createElement('div');
    announcer.setAttribute('role', 'status');
    announcer.setAttribute('aria-live', 'polite');
    announcer.setAttribute('aria-atomic', 'true');
    announcer.className = 'sr-only';
    document.body.appendChild(announcer);
    announcerRef.current = announcer;
    
    return () => {
      announcer.remove();
    };
  }, []);
  
  const announce = (message: string, priority: 'polite' | 'assertive' = 'polite') => {
    if (announcerRef.current) {
      announcerRef.current.setAttribute('aria-live', priority);
      announcerRef.current.textContent = message;
      
      setTimeout(() => {
        if (announcerRef.current) {
          announcerRef.current.textContent = '';
        }
      }, 1000);
    }
  };
  
  return { announce };
}

/**
 * Hook for managing reduced motion preferences
 * Returns true if user prefers reduced motion
 */
export function usePrefersReducedMotion() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(
    () => window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
  
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    
    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };
    
    mediaQuery.addEventListener('change', handleChange);
    
    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, []);
  
  return prefersReducedMotion;
}

/**
 * Hook for managing high contrast preferences
 * Returns true if user prefers high contrast
 */
export function usePrefersHighContrast() {
  const [prefersHighContrast, setPrefersHighContrast] = useState(
    () => window.matchMedia('(prefers-contrast: high)').matches
  );
  
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-contrast: high)');
    
    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersHighContrast(e.matches);
    };
    
    mediaQuery.addEventListener('change', handleChange);
    
    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, []);
  
  return prefersHighContrast;
}

/**
 * Hook for managing ARIA live regions
 * Useful for dynamic content updates
 */
export function useLiveRegion(initialMessage = '') {
  const [message, setMessage] = useState(initialMessage);
  const [priority, setPriority] = useState<'polite' | 'assertive'>('polite');
  
  const updateRegion = (newMessage: string, newPriority: 'polite' | 'assertive' = 'polite') => {
    setPriority(newPriority);
    setMessage(newMessage);
    
    // Clear message after announcement
    setTimeout(() => {
      setMessage('');
    }, 1000);
  };
  
  return {
    liveRegionProps: {
      role: 'status',
      'aria-live': priority,
      'aria-atomic': true,
      className: 'sr-only'
    },
    message,
    updateRegion
  };
}