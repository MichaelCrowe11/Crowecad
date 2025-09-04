/**
 * Accessibility utilities and configuration for CroweCad
 * Implements WCAG 2.2 AA standards
 */

// Color contrast checker
export function checkColorContrast(foreground: string, background: string): number {
  const getLuminance = (color: string): number => {
    const rgb = parseInt(color.slice(1), 16);
    const r = (rgb >> 16) & 0xff;
    const g = (rgb >> 8) & 0xff;
    const b = (rgb >> 0) & 0xff;
    
    const [rs, gs, bs] = [r, g, b].map(c => {
      c = c / 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
  };
  
  const l1 = getLuminance(foreground);
  const l2 = getLuminance(background);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  
  return (lighter + 0.05) / (darker + 0.05);
}

// WCAG 2.2 Success Criteria
export const WCAG_STANDARDS = {
  // Minimum contrast ratios
  CONTRAST: {
    NORMAL_TEXT: 4.5,
    LARGE_TEXT: 3.0,
    UI_COMPONENTS: 3.0
  },
  // Minimum target sizes (in pixels)
  TARGET_SIZE: {
    MINIMUM: 44, // 44x44 pixels for touch targets
    PREFERRED: 48
  },
  // Focus indicators
  FOCUS: {
    MIN_CONTRAST: 3.0,
    MIN_WIDTH: 2
  },
  // Animation and motion
  ANIMATION: {
    MAX_DURATION_MS: 5000,
    REDUCED_MOTION_QUERY: '(prefers-reduced-motion: reduce)'
  }
};

// Keyboard navigation keys
export const KEYBOARD_KEYS = {
  ENTER: 'Enter',
  SPACE: ' ',
  ESCAPE: 'Escape',
  TAB: 'Tab',
  ARROW_UP: 'ArrowUp',
  ARROW_DOWN: 'ArrowDown',
  ARROW_LEFT: 'ArrowLeft',
  ARROW_RIGHT: 'ArrowRight',
  HOME: 'Home',
  END: 'End',
  PAGE_UP: 'PageUp',
  PAGE_DOWN: 'PageDown'
};

// Focus trap utility for modals
export class FocusTrap {
  private element: HTMLElement;
  private firstFocusable: HTMLElement | null = null;
  private lastFocusable: HTMLElement | null = null;
  
  constructor(element: HTMLElement) {
    this.element = element;
    this.updateFocusableElements();
  }
  
  private updateFocusableElements() {
    const focusableSelectors = [
      'a[href]',
      'button:not([disabled])',
      'textarea:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      '[tabindex]:not([tabindex="-1"])'
    ].join(',');
    
    const focusables = this.element.querySelectorAll<HTMLElement>(focusableSelectors);
    this.firstFocusable = focusables[0] || null;
    this.lastFocusable = focusables[focusables.length - 1] || null;
  }
  
  activate() {
    this.element.addEventListener('keydown', this.handleKeyDown);
    this.firstFocusable?.focus();
  }
  
  deactivate() {
    this.element.removeEventListener('keydown', this.handleKeyDown);
  }
  
  private handleKeyDown = (e: KeyboardEvent) => {
    if (e.key !== KEYBOARD_KEYS.TAB) return;
    
    if (e.shiftKey) {
      if (document.activeElement === this.firstFocusable) {
        this.lastFocusable?.focus();
        e.preventDefault();
      }
    } else {
      if (document.activeElement === this.lastFocusable) {
        this.firstFocusable?.focus();
        e.preventDefault();
      }
    }
  };
}

// Screen reader announcements
export class ScreenReaderAnnouncer {
  private container: HTMLElement;
  
  constructor() {
    this.container = document.createElement('div');
    this.container.setAttribute('role', 'status');
    this.container.setAttribute('aria-live', 'polite');
    this.container.setAttribute('aria-atomic', 'true');
    this.container.className = 'sr-only';
    document.body.appendChild(this.container);
  }
  
  announce(message: string, priority: 'polite' | 'assertive' = 'polite') {
    this.container.setAttribute('aria-live', priority);
    this.container.textContent = message;
    
    // Clear after announcement
    setTimeout(() => {
      this.container.textContent = '';
    }, 1000);
  }
  
  destroy() {
    this.container.remove();
  }
}

// Accessible tooltips
export function setupAccessibleTooltip(trigger: HTMLElement, tooltip: HTMLElement) {
  const tooltipId = `tooltip-${Math.random().toString(36).substr(2, 9)}`;
  tooltip.id = tooltipId;
  trigger.setAttribute('aria-describedby', tooltipId);
  
  trigger.addEventListener('mouseenter', () => {
    tooltip.style.display = 'block';
  });
  
  trigger.addEventListener('mouseleave', () => {
    tooltip.style.display = 'none';
  });
  
  trigger.addEventListener('focus', () => {
    tooltip.style.display = 'block';
  });
  
  trigger.addEventListener('blur', () => {
    tooltip.style.display = 'none';
  });
}

// Check if user prefers reduced motion
export function prefersReducedMotion(): boolean {
  return window.matchMedia(WCAG_STANDARDS.ANIMATION.REDUCED_MOTION_QUERY).matches;
}

// Semantic heading level tracker
export class HeadingLevelTracker {
  private levels: number[] = [];
  
  enterLevel(level: number) {
    this.levels.push(level);
  }
  
  exitLevel() {
    this.levels.pop();
  }
  
  getCurrentLevel(): number {
    return this.levels[this.levels.length - 1] || 1;
  }
  
  validateHeading(level: number): boolean {
    const current = this.getCurrentLevel();
    // Headings should only increase by 1 level at a time
    return level <= current + 1;
  }
}

// ARIA roles and properties
export const ARIA_ROLES = {
  NAVIGATION: 'navigation',
  MAIN: 'main',
  COMPLEMENTARY: 'complementary',
  BANNER: 'banner',
  CONTENTINFO: 'contentinfo',
  SEARCH: 'search',
  FORM: 'form',
  REGION: 'region',
  ALERT: 'alert',
  STATUS: 'status',
  DIALOG: 'dialog',
  BUTTON: 'button',
  LINK: 'link',
  MENU: 'menu',
  MENUITEM: 'menuitem',
  TAB: 'tab',
  TABPANEL: 'tabpanel',
  TABLIST: 'tablist'
};

// Common ARIA properties for components
export const ARIA_PROPS = {
  button: (props: { pressed?: boolean; expanded?: boolean; label?: string }) => ({
    role: 'button',
    'aria-pressed': props.pressed,
    'aria-expanded': props.expanded,
    'aria-label': props.label
  }),
  
  link: (props: { label?: string; current?: boolean }) => ({
    role: 'link',
    'aria-label': props.label,
    'aria-current': props.current ? 'page' : undefined
  }),
  
  navigation: (props: { label: string }) => ({
    role: 'navigation',
    'aria-label': props.label
  }),
  
  dialog: (props: { label: string; describedBy?: string }) => ({
    role: 'dialog',
    'aria-label': props.label,
    'aria-describedby': props.describedBy,
    'aria-modal': true
  }),
  
  alert: (props: { label?: string }) => ({
    role: 'alert',
    'aria-label': props.label
  })
};

// Skip links for keyboard navigation
export function createSkipLink(target: string, text: string = 'Skip to main content'): HTMLAnchorElement {
  const link = document.createElement('a');
  link.href = `#${target}`;
  link.className = 'skip-link';
  link.textContent = text;
  link.addEventListener('click', (e) => {
    e.preventDefault();
    const element = document.getElementById(target);
    if (element) {
      element.tabIndex = -1;
      element.focus();
    }
  });
  return link;
}

// Accessible form validation
export function setupAccessibleFormValidation(form: HTMLFormElement) {
  const errors: Map<string, string> = new Map();
  
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData(form);
    
    // Clear previous errors
    form.querySelectorAll('[role="alert"]').forEach(el => el.remove());
    
    // Validate fields
    formData.forEach((value, key) => {
      const field = form.querySelector(`[name="${key}"]`) as HTMLInputElement;
      if (field?.required && !value) {
        errors.set(key, `${field.labels?.[0]?.textContent || key} is required`);
      }
    });
    
    // Display errors accessibly
    errors.forEach((message, fieldName) => {
      const field = form.querySelector(`[name="${fieldName}"]`);
      if (field) {
        const errorId = `error-${fieldName}`;
        const errorElement = document.createElement('div');
        errorElement.id = errorId;
        errorElement.role = 'alert';
        errorElement.className = 'field-error';
        errorElement.textContent = message;
        
        field.setAttribute('aria-invalid', 'true');
        field.setAttribute('aria-describedby', errorId);
        field.parentElement?.appendChild(errorElement);
      }
    });
    
    // Announce errors to screen readers
    if (errors.size > 0) {
      const announcer = new ScreenReaderAnnouncer();
      announcer.announce(`Form has ${errors.size} error(s)`, 'assertive');
    }
  });
}

export default {
  checkColorContrast,
  WCAG_STANDARDS,
  KEYBOARD_KEYS,
  FocusTrap,
  ScreenReaderAnnouncer,
  setupAccessibleTooltip,
  prefersReducedMotion,
  HeadingLevelTracker,
  ARIA_ROLES,
  ARIA_PROPS,
  createSkipLink,
  setupAccessibleFormValidation
};