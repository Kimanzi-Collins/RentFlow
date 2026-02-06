import gsap from 'gsap';

// ═══════════════════════════════════════════════════════════════════════════
// RENTFLOW GSAP ANIMATION UTILITIES
// Premium, subtle animations for iOS 18 Liquid Glass design
// ═══════════════════════════════════════════════════════════════════════════

// ─── Easing Functions ───────────────────────────────────────────────────────

export const ease = {
  outExpo: 'expo.out',
  outBack: 'back.out(1.2)',
  outQuart: 'quart.out',
  inOutQuart: 'quart.inOut',
  spring: 'elastic.out(1, 0.5)',
};

// ─── Duration Constants ─────────────────────────────────────────────────────

export const duration = {
  fast: 0.15,
  normal: 0.25,
  slow: 0.4,
  slower: 0.6,
};

// ─── Page Transitions ───────────────────────────────────────────────────────

/**
 * Animate page entry
 */
export function animatePageEnter(element: HTMLElement | null): gsap.core.Tween | null {
  if (!element) return null;
  
  return gsap.fromTo(
    element,
    {
      opacity: 0,
      y: 12,
    },
    {
      opacity: 1,
      y: 0,
      duration: duration.slow,
      ease: ease.outExpo,
    }
  );
}

/**
 * Animate page exit
 */
export function animatePageExit(element: HTMLElement | null): gsap.core.Tween | null {
  if (!element) return null;
  
  return gsap.to(element, {
    opacity: 0,
    y: -8,
    duration: duration.normal,
    ease: ease.outQuart,
  });
}

// ─── Card Animations ────────────────────────────────────────────────────────

/**
 * Animate cards in with stagger
 */
export function animateCardsIn(
  elements: HTMLElement[] | NodeListOf<Element> | null,
  options: { delay?: number; stagger?: number } = {}
): gsap.core.Tween | null {
  if (!elements || (elements as HTMLElement[]).length === 0) return null;
  
  const { delay = 0, stagger = 0.05 } = options;
  
  return gsap.fromTo(
    elements,
    {
      opacity: 0,
      y: 16,
      scale: 0.98,
    },
    {
      opacity: 1,
      y: 0,
      scale: 1,
      duration: duration.slow,
      stagger,
      delay,
      ease: ease.outExpo,
    }
  );
}

/**
 * Card hover lift effect
 */
export function animateCardHover(element: HTMLElement | null, isHovering: boolean): void {
  if (!element) return;
  
  gsap.to(element, {
    y: isHovering ? -3 : 0,
    boxShadow: isHovering
      ? '0 12px 40px rgba(0, 0, 0, 0.1), 0 4px 12px rgba(0, 0, 0, 0.06)'
      : '0 8px 32px rgba(0, 0, 0, 0.06), inset 0 1px 0 rgba(255, 255, 255, 0.5)',
    duration: duration.normal,
    ease: ease.outQuart,
  });
}

// ─── List Animations ────────────────────────────────────────────────────────

/**
 * Animate list items in sequence
 */
export function animateListIn(
  elements: HTMLElement[] | NodeListOf<Element> | null,
  options: { delay?: number; stagger?: number } = {}
): gsap.core.Tween | null {
  if (!elements || (elements as HTMLElement[]).length === 0) return null;
  
  const { delay = 0.1, stagger = 0.04 } = options;
  
  return gsap.fromTo(
    elements,
    {
      opacity: 0,
      x: -12,
    },
    {
      opacity: 1,
      x: 0,
      duration: duration.slow,
      stagger,
      delay,
      ease: ease.outExpo,
    }
  );
}

/**
 * Animate table rows in
 */
export function animateTableRowsIn(
  elements: HTMLElement[] | NodeListOf<Element> | null
): gsap.core.Tween | null {
  if (!elements || (elements as HTMLElement[]).length === 0) return null;
  
  return gsap.fromTo(
    elements,
    {
      opacity: 0,
      y: 8,
    },
    {
      opacity: 1,
      y: 0,
      duration: duration.normal,
      stagger: 0.03,
      ease: ease.outQuart,
    }
  );
}

// ─── Sidebar Animations ─────────────────────────────────────────────────────

/**
 * Animate sidebar pill indicator
 */
export function animateSidebarPill(
  pill: HTMLElement | null,
  targetY: number
): gsap.core.Tween | null {
  if (!pill) return null;
  
  return gsap.to(pill, {
    y: targetY,
    duration: duration.slow,
    ease: ease.outBack,
  });
}

/**
 * Animate sidebar collapse/expand
 */
export function animateSidebarToggle(
  sidebar: HTMLElement | null,
  isCollapsed: boolean
): gsap.core.Tween | null {
  if (!sidebar) return null;
  
  return gsap.to(sidebar, {
    width: isCollapsed ? 72 : 260,
    duration: duration.slow,
    ease: ease.outExpo,
  });
}

// ─── Modal Animations ───────────────────────────────────────────────────────

/**
 * Animate modal open
 */
export function animateModalOpen(
  overlay: HTMLElement | null,
  content: HTMLElement | null
): gsap.core.Timeline | null {
  if (!overlay || !content) return null;
  
  const tl = gsap.timeline();
  
  tl.fromTo(
    overlay,
    { opacity: 0 },
    { opacity: 1, duration: duration.normal, ease: 'power2.out' }
  );
  
  tl.fromTo(
    content,
    {
      opacity: 0,
      scale: 0.95,
      y: 20,
    },
    {
      opacity: 1,
      scale: 1,
      y: 0,
      duration: duration.slow,
      ease: ease.outExpo,
    },
    '-=0.15'
  );
  
  return tl;
}

/**
 * Animate modal close
 */
export function animateModalClose(
  overlay: HTMLElement | null,
  content: HTMLElement | null
): gsap.core.Timeline | null {
  if (!overlay || !content) return null;
  
  const tl = gsap.timeline();
  
  tl.to(content, {
    opacity: 0,
    scale: 0.97,
    y: 10,
    duration: duration.normal,
    ease: ease.outQuart,
  });
  
  tl.to(
    overlay,
    { opacity: 0, duration: duration.fast, ease: 'power2.out' },
    '-=0.1'
  );
  
  return tl;
}

// ─── Button Animations ──────────────────────────────────────────────────────

/**
 * Button press animation
 */
export function animateButtonPress(element: HTMLElement | null): void {
  if (!element) return;
  
  gsap.to(element, {
    scale: 0.97,
    duration: 0.1,
    ease: 'power2.out',
    yoyo: true,
    repeat: 1,
  });
}

/**
 * Button ripple effect
 */
export function animateButtonRipple(
  element: HTMLElement | null,
  event: MouseEvent
): void {
  if (!element) return;
  
  const rect = element.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;
  
  const ripple = document.createElement('span');
  ripple.style.cssText = `
    position: absolute;
    left: ${x}px;
    top: ${y}px;
    width: 0;
    height: 0;
    background: rgba(255, 255, 255, 0.3);
    border-radius: 50%;
    transform: translate(-50%, -50%);
    pointer-events: none;
  `;
  
  element.style.position = 'relative';
  element.style.overflow = 'hidden';
  element.appendChild(ripple);
  
  gsap.to(ripple, {
    width: Math.max(rect.width, rect.height) * 2,
    height: Math.max(rect.width, rect.height) * 2,
    opacity: 0,
    duration: 0.6,
    ease: 'power2.out',
    onComplete: () => ripple.remove(),
  });
}

// ─── Counter Animations ─────────────────────────────────────────────────────

/**
 * Animate counter from start to end value
 */
export function animateCounter(
  element: HTMLElement | null,
  endValue: number,
  options: {
    startValue?: number;
    duration?: number;
    prefix?: string;
    suffix?: string;
    decimals?: number;
  } = {}
): gsap.core.Tween | null {
  if (!element) return null;
  
  const {
    startValue = 0,
    duration: dur = 1.2,
    prefix = '',
    suffix = '',
    decimals = 0,
  } = options;
  
  const obj = { value: startValue };
  
  return gsap.to(obj, {
    value: endValue,
    duration: dur,
    ease: ease.outExpo,
    onUpdate: () => {
      element.textContent = `${prefix}${obj.value.toFixed(decimals)}${suffix}`;
    },
  });
}

/**
 * Animate currency counter
 */
export function animateCurrencyCounter(
  element: HTMLElement | null,
  endValue: number,
  options: { startValue?: number; duration?: number } = {}
): gsap.core.Tween | null {
  if (!element) return null;
  
  const { startValue = 0, duration: dur = 1.2 } = options;
  const obj = { value: startValue };
  
  return gsap.to(obj, {
    value: endValue,
    duration: dur,
    ease: ease.outExpo,
    onUpdate: () => {
      element.textContent = new Intl.NumberFormat('en-KE', {
        style: 'currency',
        currency: 'KES',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(obj.value);
    },
  });
}

// ─── Progress Animations ────────────────────────────────────────────────────

/**
 * Animate progress bar
 */
export function animateProgressBar(
  element: HTMLElement | null,
  percentage: number
): gsap.core.Tween | null {
  if (!element) return null;
  
  return gsap.fromTo(
    element,
    { width: '0%' },
    {
      width: `${Math.min(100, Math.max(0, percentage))}%`,
      duration: duration.slower,
      ease: ease.outExpo,
      delay: 0.2,
    }
  );
}

// ─── Notification Animations ────────────────────────────────────────────────

/**
 * Animate notification slide in
 */
export function animateNotificationIn(element: HTMLElement | null): gsap.core.Tween | null {
  if (!element) return null;
  
  return gsap.fromTo(
    element,
    {
      opacity: 0,
      x: 50,
      scale: 0.95,
    },
    {
      opacity: 1,
      x: 0,
      scale: 1,
      duration: duration.slow,
      ease: ease.outBack,
    }
  );
}

/**
 * Animate notification slide out
 */
export function animateNotificationOut(element: HTMLElement | null): gsap.core.Tween | null {
  if (!element) return null;
  
  return gsap.to(element, {
    opacity: 0,
    x: 50,
    scale: 0.95,
    duration: duration.normal,
    ease: ease.outQuart,
  });
}

// ─── Skeleton Animations ────────────────────────────────────────────────────

/**
 * Animate skeleton loader
 */
export function animateSkeletonPulse(elements: HTMLElement[] | NodeListOf<Element> | null): void {
  if (!elements || (elements as HTMLElement[]).length === 0) return;
  
  gsap.to(elements, {
    opacity: 0.5,
    duration: 0.8,
    ease: 'power1.inOut',
    yoyo: true,
    repeat: -1,
  });
}

// ─── Chart Animations ───────────────────────────────────────────────────────

/**
 * Animate chart bars
 */
export function animateChartBars(
  elements: HTMLElement[] | NodeListOf<Element> | null
): gsap.core.Tween | null {
  if (!elements || (elements as HTMLElement[]).length === 0) return null;
  
  return gsap.fromTo(
    elements,
    { scaleY: 0, transformOrigin: 'bottom' },
    {
      scaleY: 1,
      duration: duration.slower,
      stagger: 0.05,
      ease: ease.outExpo,
      delay: 0.2,
    }
  );
}

/**
 * Animate chart line
 */
export function animateChartLine(element: SVGPathElement | null): gsap.core.Tween | null {
  if (!element) return null;
  
  const length = element.getTotalLength();
  
  gsap.set(element, {
    strokeDasharray: length,
    strokeDashoffset: length,
  });
  
  return gsap.to(element, {
    strokeDashoffset: 0,
    duration: 1.5,
    ease: ease.outExpo,
    delay: 0.2,
  });
}

// ─── Utility Functions ──────────────────────────────────────────────────────

/**
 * Kill all animations on element
 */
export function killAnimations(element: HTMLElement | null): void {
  if (!element) return;
  gsap.killTweensOf(element);
}

/**
 * Set initial state before animation
 */
export function setInitialState(
  element: HTMLElement | null,
  state: gsap.TweenVars
): void {
  if (!element) return;
  gsap.set(element, state);
}

/**
 * Create stagger delay for index
 */
export function getStaggerDelay(index: number, base = 0.05): number {
  return index * base;
}
