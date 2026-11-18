import { useEffect, useState } from 'react';
import { site } from '../data/site';
import { openStatus, type OpenStatus } from '../lib/schedule';
import { SchematicMap } from './SchematicMap';
import styles from './Location.module.css';

export function Location() {
  const [status, setStatus] = useState<OpenStatus | null>(null);
  useEffect(() => {
    setStatus(openStatus());
    const t = setInterval(() => setStatus(openStatus()), 60_000);
    return () => clearInterval(t);
  }, []);

  return (
    <section id="location" className={styles.section} aria-labelledby="location-title">
      <div className={styles.info}>
        <h2 id="location-title" className={`display ${styles.title}`} data-reveal="mask">
          <span className="mask-line"><span>Как нас</span></span>
          <span className="mask-line" style={{ ['--i' as string]: 1 }}><span>найти</span></span>
        </h2>
        <p className={styles.warn}>Адрес, телефон и почта вымышлены — это демонстрационные данные.</p>

        <dl className={styles.list}>
          <div>
            <dt>Адрес</dt>
            <dd>{site.city}, {site.address.street}</dd>
          </div>
          <div>
            <dt>Как дойти</dt>
            <dd>{site.address.metro}</dd>
          </div>
          <div>
            <dt>Телефон</dt>
            <dd><a href={`tel:${site.phone.href}`}>{site.phone.display}</a></dd>
          </div>
          <div>
            <dt>Почта</dt>
            <dd><a href={`mailto:${site.email}`}>{site.email}</a></dd>
          </div>
          <div>
            <dt>Часы работы</dt>
            <dd>
              {site.hoursLabels.map((h) => (
                <span key={h.days} className={styles.hours}>
                  <span>{h.days}</span>
                  <span>{h.time}</span>
                </span>
              ))}
              <span className={styles.status} aria-live="polite">{status ? status.label : ' '}</span>
            </dd>
          </div>
        </dl>
      </div>

      <figure className={styles.map} data-reveal="fade">
        <SchematicMap />
        <figcaption>Схема, не для навигации. Стрелка севера — вверху.</figcaption>
      </figure>
    </section>
  );
}
