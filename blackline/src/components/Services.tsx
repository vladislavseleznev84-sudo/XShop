import { useEffect, useRef, useState } from 'react';
import { services } from '../data/services';
import { formatDuration, formatPrice } from '../lib/format';
import { bookingStore, scrollToSection } from '../lib/bookingStore';
import manifest from '../data/images.manifest.json';
import styles from './Services.module.css';

const base = import.meta.env.BASE_URL;

export function Services() {
  const [active, setActive] = useState<string | null>(null);
  const preview = useRef<HTMLDivElement>(null);
  const target = useRef({ x: 0, y: 0 });
  const pos = useRef({ x: 0, y: 0 });

  // Превью следует за курсором с инерцией (только там, где есть hover)
  useEffect(() => {
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let raf = 0;
    const tick = () => {
      pos.current.x += (target.current.x - pos.current.x) * 0.14;
      pos.current.y += (target.current.y - pos.current.y) * 0.14;
      if (preview.current) preview.current.style.transform = `translate3d(${pos.current.x}px, ${pos.current.y}px, 0)`;
      raf = requestAnimationFrame(tick);
    };
    const move = (e: PointerEvent) => {
      target.current.x = e.clientX + 28;
      target.current.y = e.clientY - 150;
    };
    window.addEventListener('pointermove', move, { passive: true });
    raf = requestAnimationFrame(tick);
    return () => {
      window.removeEventListener('pointermove', move);
      cancelAnimationFrame(raf);
    };
  }, []);

  const choose = (id: string) => {
    bookingStore.set({ serviceId: id });
    scrollToSection('booking');
  };

  return (
    <section id="services" className={styles.section} aria-labelledby="services-title">
      <div className={styles.head}>
        <h2 id="services-title" className={`display ${styles.title}`} data-reveal="mask">
          <span className="mask-line"><span>Услуги</span></span>
          <span className="mask-line" style={{ ['--i' as string]: 1 }}><span>и цены</span></span>
        </h2>
        <p className={styles.note}>
          Каждый визит включает консультацию, мытьё головы и укладку. Цены и длительность — демонстрационные.
        </p>
      </div>

      <ul className={styles.list} onPointerLeave={() => setActive(null)}>
        {services.map((s) => (
          <li key={s.id}>
            <button
              type="button"
              className={styles.row}
              onClick={() => choose(s.id)}
              onPointerEnter={() => setActive(s.id)}
              onFocus={() => setActive(s.id)}
              onBlur={() => setActive(null)}
              aria-label={`${s.name}, ${formatPrice(s.price)}, ${formatDuration(s.minutes)}. Выбрать и перейти к записи`}
            >
              <span className={styles.name}>{s.name}</span>
              <span className={styles.desc}>{s.description}</span>
              <span className={styles.time}>{formatDuration(s.minutes)}</span>
              <span className={styles.price}>{formatPrice(s.price)}</span>
              <span className={styles.go} aria-hidden="true">Выбрать</span>
            </button>
          </li>
        ))}
      </ul>

      <div ref={preview} className={styles.preview} aria-hidden="true">
        {services.map((s) => (
          <img
            key={s.id}
            className={active === s.id ? styles.on : undefined}
            src={`${base}img/${s.preview}-480.webp`}
            width={manifest[s.preview].w}
            height={manifest[s.preview].h}
            alt=""
            loading="lazy"
            decoding="async"
          />
        ))}
      </div>
    </section>
  );
}
