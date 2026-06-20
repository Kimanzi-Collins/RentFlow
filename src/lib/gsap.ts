import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Register ScrollTrigger plugin
gsap.registerPlugin(ScrollTrigger);

/**
 * Call once at app root to ensure plugins are registered.
 */
export function initGSAP(): void {
  gsap.registerPlugin(ScrollTrigger);
}

/**
 * Reveals a single element from opacity:0, y:40 to its natural position.
 * Uses expo-out easing (0.16,1,0.3,1) for a premium feel.
 */
export function revealUp(el: Element | null, delay = 0): gsap.core.Tween | null {
  if (!el) return null;
  return gsap.fromTo(
    el,
    { opacity: 0, y: 40 },
    {
      opacity: 1,
      y: 0,
      duration: 0.8,
      delay,
      ease: 'cubic-bezier(0.16, 1, 0.3, 1)',
      clearProps: 'transform',
    }
  );
}

/**
 * Staggers a NodeList or array of elements using revealUp mechanics.
 */
export function revealStagger(
  els: NodeListOf<Element> | Element[],
  stagger = 0.08,
  delay = 0
): gsap.core.Tween | null {
  const arr = Array.from(els);
  if (!arr.length) return null;
  return gsap.fromTo(
    arr,
    { opacity: 0, y: 40 },
    {
      opacity: 1,
      y: 0,
      duration: 0.8,
      stagger,
      delay,
      ease: 'cubic-bezier(0.16, 1, 0.3, 1)',
      clearProps: 'transform',
    }
  );
}

/**
 * Creates a ScrollTrigger that fires revealUp when el enters the viewport.
 */
export function scrollReveal(el: Element | null): ScrollTrigger | null {
  if (!el) return null;

  // Set initial hidden state
  gsap.set(el, { opacity: 0, y: 40 });

  return ScrollTrigger.create({
    trigger: el,
    start: 'top 88%',
    once: true,
    onEnter: () => revealUp(el),
  });
}

/**
 * Batch-reveals all elements matching `selector` on scroll with stagger.
 */
export function createScrollRevealBatch(selector: string): void {
  const els = document.querySelectorAll(selector);
  if (!els.length) return;

  // Set initial hidden state for all
  gsap.set(els, { opacity: 0, y: 40 });

  ScrollTrigger.batch(selector, {
    start: 'top 88%',
    once: true,
    onEnter: (batch) => {
      gsap.to(batch, {
        opacity: 1,
        y: 0,
        duration: 0.8,
        stagger: 0.1,
        ease: 'cubic-bezier(0.16, 1, 0.3, 1)',
        clearProps: 'transform',
      });
    },
  });
}

/**
 * Adds a magnetic mouse-follow effect to a button/element.
 * Strength controls how far the element follows the cursor (0–1).
 */
export function magneticEffect(el: HTMLElement | null, strength = 0.35): (() => void) | null {
  if (!el) return null;

  const handleMouseMove = (e: MouseEvent) => {
    const rect = el.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = (e.clientX - cx) * strength;
    const dy = (e.clientY - cy) * strength;
    gsap.to(el, {
      x: dx,
      y: dy,
      duration: 0.4,
      ease: 'cubic-bezier(0.16, 1, 0.3, 1)',
    });
  };

  const handleMouseLeave = () => {
    gsap.to(el, {
      x: 0,
      y: 0,
      duration: 0.6,
      ease: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
    });
  };

  el.addEventListener('mousemove', handleMouseMove);
  el.addEventListener('mouseleave', handleMouseLeave);

  // Return cleanup fn
  return () => {
    el.removeEventListener('mousemove', handleMouseMove);
    el.removeEventListener('mouseleave', handleMouseLeave);
  };
}

/**
 * Animates a numeric counter from 0 to `target` using GSAP's ticker.
 * Triggers once when el enters the viewport.
 */
export function counterAnimation(
  el: HTMLElement | null,
  target: number,
  duration = 2,
  prefix = '',
  suffix = ''
): void {
  if (!el) return;

  const obj = { val: 0 };

  ScrollTrigger.create({
    trigger: el,
    start: 'top 85%',
    once: true,
    onEnter: () => {
      gsap.to(obj, {
        val: target,
        duration,
        ease: 'power2.out',
        onUpdate: () => {
          const display = Number.isInteger(target)
            ? Math.round(obj.val).toLocaleString()
            : obj.val.toLocaleString(undefined, {
                minimumFractionDigits: 1,
                maximumFractionDigits: 1,
              });
          el.textContent = `${prefix}${display}${suffix}`;
        },
      });
    },
  });
}

/**
 * Orchestrated page entrance animation sequence:
 * 1. Container structure fades in (0ms)
 * 2. Title words stagger up (200ms)
 * 3. Subtitle appears (480ms)
 * 4. Supporting elements cascade (640ms+)
 */
export function pageEnter(container: Element | null): void {
  if (!container) return;

  const title = container.querySelectorAll('[data-enter="title"]');
  const subtitle = container.querySelector('[data-enter="subtitle"]');
  const supporting = container.querySelectorAll('[data-enter="support"]');
  const nav = container.querySelector('[data-enter="nav"]');

  const tl = gsap.timeline({ defaults: { ease: 'cubic-bezier(0.16, 1, 0.3, 1)' } });

  // 1. Nav
  if (nav) {
    tl.fromTo(nav, { opacity: 0, y: -16 }, { opacity: 1, y: 0, duration: 0.6 }, 0);
  }

  // 2. Title words
  if (title.length) {
    tl.fromTo(
      title,
      { opacity: 0, y: 48, rotateX: -8 },
      { opacity: 1, y: 0, rotateX: 0, duration: 0.9, stagger: 0.08 },
      0.2
    );
  }

  // 3. Subtitle
  if (subtitle) {
    tl.fromTo(subtitle, { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.7 }, 0.48);
  }

  // 4. Supporting elements
  if (supporting.length) {
    tl.fromTo(
      supporting,
      { opacity: 0, y: 32 },
      { opacity: 1, y: 0, duration: 0.7, stagger: 0.1 },
      0.64
    );
  }
}

export { gsap, ScrollTrigger };
