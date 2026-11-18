import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import manifest from '../data/images.manifest.json';
import type { GalleryItem } from '../data/gallery';
import styles from './Lightbox.module.css';

interface Props {
  items: readonly GalleryItem[];
  index: number;
  onIndex: (i: number) => void;
  onClose: () => void;
  /** прямоугольник превью — для анимации раскрытия */
  origin: DOMRect | null;
}

const base = import.meta.env.BASE_URL;
const ZOOM = 2.4;

export function Lightbox({ items, index, onIndex, onClose, origin }: Props) {
  const item = items[index];
  const m = manifest[item.photo];
  const [zoomed, setZoomed] = useState(false);
  const dialog = useRef<HTMLDivElement>(null);
  const figure = useRef<HTMLDivElement>(null);
  const img = useRef<HTMLImageElement>(null);
  const first = useRef(true);
  const touch = useRef<{ x: number; y: number } | null>(null);

  const go = (d: number) => {
    setZoomed(false);
    onIndex((index + d + items.length) % items.length);
  };

  // Блокировка прокрутки страницы, возврат фокуса — в родителе
  useEffect(() => {
    const html = document.documentElement;
    const prev = html.style.overflow;
    html.style.overflow = 'hidden';
    dialog.current?.querySelector<HTMLElement>('[data-autofocus]')?.focus();
    return () => {
      html.style.overflow = prev;
    };
  }, []);

  // Клавиатура + ловушка фокуса
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      else if (e.key === 'ArrowRight') go(1);
      else if (e.key === 'ArrowLeft') go(-1);
      else if (e.key === 'Tab') {
        const f = dialog.current?.querySelectorAll<HTMLElement>('button');
        if (!f?.length) return;
        const a = f[0];
        const z = f[f.length - 1];
        if (e.shiftKey && document.activeElement === a) { e.preventDefault(); z.focus(); }
        else if (!e.shiftKey && document.activeElement === z) { e.preventDefault(); a.focus(); }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  // Раскрытие кадра из превью (FLIP) и «шторка» при листании
  useEffect(() => {
    const el = figure.current;
    if (!el || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (first.current && origin) {
      first.current = false;
      const t = el.getBoundingClientRect();
      const s = Math.max(origin.width / t.width, origin.height / t.height);
      const dx = origin.left + origin.width / 2 - (t.left + t.width / 2);
      const dy = origin.top + origin.height / 2 - (t.top + t.height / 2);
      const insetY = Math.max(0, (t.height - origin.height / s) / 2);
      const insetX = Math.max(0, (t.width - origin.width / s) / 2);
      el.animate(
        [
          { transform: `translate(${dx}px, ${dy}px) scale(${s})`, clipPath: `inset(${insetY}px ${insetX}px)` },
          { transform: 'none', clipPath: 'inset(0px 0px)' },
        ],
        { duration: 720, easing: 'cubic-bezier(.77,0,.18,1)' },
      );
    } else {
      first.current = false;
      el.animate([{ clipPath: 'inset(0 0 0 100%)' }, { clipPath: 'inset(0 0 0 0)' }], { duration: 650, easing: 'cubic-bezier(.77,0,.18,1)' });
    }
  }, [index, origin]);

  // Прогрев соседних кадров
  useEffect(() => {
    for (const d of [-1, 1]) {
      const n = items[(index + d + items.length) % items.length];
      new Image().src = `${base}img/${n.photo}-1280.webp`;
    }
  }, [index, items]);

  const pan = (e: React.PointerEvent) => {
    if (!zoomed || !img.current) return;
    const r = img.current.getBoundingClientRect();
    // при зуме rect уже увеличен — считаем позицию курсора относительно неувеличенной области
    const w = r.width / ZOOM;
    const h = r.height / ZOOM;
    const cx = r.left + r.width / 2;
    const cy = r.top + r.height / 2;
    const px = Math.max(0, Math.min(1, (e.clientX - (cx - w / 2)) / w));
    const py = Math.max(0, Math.min(1, (e.clientY - (cy - h / 2)) / h));
    img.current.style.transformOrigin = `${px * 100}% ${py * 100}%`;
  };

  const toggleZoom = (e: React.MouseEvent) => {
    if (!img.current) return;
    if (!zoomed) {
      const r = img.current.getBoundingClientRect();
      img.current.style.transformOrigin = `${((e.clientX - r.left) / r.width) * 100}% ${((e.clientY - r.top) / r.height) * 100}%`;
    }
    setZoomed((z) => !z);
  };

  const widths = m.widths;
  const srcSet = (ext: string) => widths.map((w) => `${base}img/${item.photo}-${w}.${ext} ${w}w`).join(', ');

  return createPortal(
    <div
      ref={dialog}
      className={styles.overlay}
      role="dialog"
      aria-modal="true"
      aria-label={`Просмотр фотографии ${index + 1} из ${items.length}`}
      onTouchStart={(e) => (touch.current = { x: e.touches[0].clientX, y: e.touches[0].clientY })}
      onTouchEnd={(e) => {
        const s = touch.current;
        touch.current = null;
        if (!s || zoomed) return;
        const dx = e.changedTouches[0].clientX - s.x;
        const dy = e.changedTouches[0].clientY - s.y;
        if (Math.abs(dx) > 56 && Math.abs(dx) > Math.abs(dy) * 1.4) go(dx < 0 ? 1 : -1);
        else if (dy > 90 && Math.abs(dy) > Math.abs(dx) * 1.4) onClose();
      }}
    >
      <div className={styles.bar}>
        <p className={styles.count} aria-live="polite">
          {String(index + 1).padStart(2, '0')} / {String(items.length).padStart(2, '0')}
        </p>
        <p className={styles.cap}>{item.caption}</p>
        <button type="button" className={styles.close} onClick={onClose} data-autofocus>
          Закрыть
        </button>
      </div>

      <div className={styles.stage} onPointerMove={pan}>
        <div ref={figure} className={styles.figure}>
          <picture>
            <source type="image/avif" srcSet={srcSet('avif')} sizes="100vw" />
            <source type="image/webp" srcSet={srcSet('webp')} sizes="100vw" />
            <img
              ref={img}
              key={item.photo}
              className={`${styles.img} ${zoomed ? styles.zoomed : ''}`}
              src={`${base}img/${item.photo}-1280.webp`}
              width={m.w}
              height={m.h}
              alt={item.alt}
              sizes="100vw"
              draggable={false}
              onClick={toggleZoom}
              style={{ backgroundImage: `url(${m.lqip})` }}
            />
          </picture>
        </div>
      </div>

      <div className={styles.nav}>
        <button type="button" onClick={() => go(-1)}>Назад</button>
        <span className={styles.hint}>{zoomed ? 'Двигайте курсор или палец, чтобы смотреть детали' : 'Нажмите на кадр, чтобы увеличить'}</span>
        <button type="button" onClick={() => go(1)}>Дальше</button>
      </div>
    </div>,
    document.body,
  );
}
