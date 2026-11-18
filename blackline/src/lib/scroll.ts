/**
 * Единый цикл прокрутки: один слушатель и один rAF на весь сайт.
 * Подписчики получают позицию, сглаженную скорость и высоту окна.
 */
export interface ScrollFrame {
  y: number;
  /** сглаженная скорость, px/кадр */
  vy: number;
  vh: number;
}
type Sub = (f: ScrollFrame) => void;

const subs = new Set<Sub>();
let raf = 0;
let y = 0;
let vy = 0;
let bound = false;

function frame() {
  raf = 0;
  const ny = window.scrollY;
  vy += (ny - y - vy) * 0.18;
  y = ny;
  const f: ScrollFrame = { y, vy, vh: window.innerHeight };
  subs.forEach((s) => s(f));
  if (Math.abs(vy) > 0.05) raf = requestAnimationFrame(frame);
}
const wake = () => {
  if (!raf) raf = requestAnimationFrame(frame);
};

export function subscribeScroll(sub: Sub): () => void {
  if (!bound) {
    y = window.scrollY;
    window.addEventListener('scroll', wake, { passive: true });
    window.addEventListener('resize', wake, { passive: true });
    bound = true;
  }
  subs.add(sub);
  sub({ y: window.scrollY, vy, vh: window.innerHeight });
  return () => {
    subs.delete(sub);
    if (!subs.size && bound) {
      window.removeEventListener('scroll', wake);
      window.removeEventListener('resize', wake);
      cancelAnimationFrame(raf);
      raf = 0;
      bound = false;
    }
  };
}

export const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
