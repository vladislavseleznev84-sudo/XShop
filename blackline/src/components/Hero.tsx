import { useEffect, useRef, useState } from 'react';
import { Photo } from './Photo';
import { Button } from './Button';
import { subscribeScroll, prefersReducedMotion } from '../lib/scroll';
import { openStatus, type OpenStatus } from '../lib/schedule';
import { scrollToSection } from '../lib/bookingStore';
import styles from './Hero.module.css';

export function Hero() {
  const mark = useRef<HTMLHeadingElement>(null);
  const content = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<OpenStatus | null>(null);

  useEffect(() => {
    setStatus(openStatus());
    if (prefersReducedMotion()) return;
    const el = mark.current;
    return subscribeScroll(({ y, vy, vh }) => {
      if (!el || y > vh * 1.4) return;
      // Кинетика: скорость прокрутки «сдвигает» срез; в покое половины сходятся.
      const shift = Math.max(-1, Math.min(1, vy / 28)) * 3.2;
      el.style.setProperty('--sx', `${shift.toFixed(2)}vw`);
      if (content.current) content.current.style.opacity = String(Math.max(0, 1 - y / (vh * 0.7)));
    });
  }, []);

  return (
    <section className={styles.hero} id="top" aria-labelledby="hero-title">
      <Photo
        name="hero"
        alt="Мастер оформляет бороду клиента ножницами, чёрно-белый кадр"
        sizes="(max-width: 760px) 100vw, 34vw"
        eager
        speed={0.07}
        delay={0.7}
        className={styles.photo}
        style={{ aspectRatio: 'auto' }}
        position="50% 18%"
      />

      <div ref={content} className={styles.content}>
        <p className={styles.lede}>Три кресла и три мастера. Приходите по записи — ждать не придётся.</p>
        <div className={styles.actions}>
          <Button href="#booking" size="lg" onClick={(e) => { e.preventDefault(); scrollToSection('booking'); }}>
            Записаться
          </Button>
          <p className={styles.status} aria-live="polite">
            {status && (
              <>
                <i className={status.open ? styles.dotOpen : styles.dot} aria-hidden="true" />
                {status.label}
              </>
            )}
          </p>
        </div>
      </div>

      <a className={styles.scroll} href="#manifesto" aria-label="Прокрутить к манифесту">
        <span className={styles.scrollText}>Прокрутите</span>
        <span className={styles.scrollLine} aria-hidden="true" />
      </a>

      <h1 id="hero-title" ref={mark} className={styles.mark}>
        <span className="sr-only">BLACKLINE — независимый барбершоп</span>
        <span className={`${styles.layer} ${styles.top}`} aria-hidden="true">
          <span className={styles.word}>
            <span>BLACK</span>
            <span>LINE</span>
          </span>
        </span>
        <span className={`${styles.layer} ${styles.bottom}`} aria-hidden="true">
          <span className={styles.word}>
            <span>BLACK</span>
            <span>LINE</span>
          </span>
        </span>
        <span className={styles.cut} aria-hidden="true" />
      </h1>
    </section>
  );
}
