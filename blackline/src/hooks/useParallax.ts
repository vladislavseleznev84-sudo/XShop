import { useEffect, type RefObject } from 'react';
import { prefersReducedMotion, subscribeScroll } from '../lib/scroll';

/**
 * Сдвигает элемент по Y относительно центра окна.
 * speed 0.1 → на каждые 100px от центра элемент смещается на 10px.
 */
export function useParallax(ref: RefObject<HTMLElement | null>, speed: number) {
  useEffect(() => {
    const el = ref.current;
    if (!el || !speed || prefersReducedMotion()) return;
    const parent = el.parentElement!;
    return subscribeScroll(({ vh }) => {
      const r = parent.getBoundingClientRect();
      if (r.bottom < -200 || r.top > vh + 200) return;
      const offset = r.top + r.height / 2 - vh / 2;
      // запас рамки — 14% высоты (см. Photo.module.css); не даём сдвигу его превысить
      const max = r.height * 0.14;
      const dy = Math.max(-max, Math.min(max, -offset * speed));
      el.style.transform = `translate3d(0, ${dy.toFixed(1)}px, 0)`;
    });
  }, [ref, speed]);
}
