import { site } from '../data/site';
import { scrollToSection } from '../lib/bookingStore';
import styles from './Footer.module.css';

export function Footer() {
  const go = (id: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    scrollToSection(id);
    history.replaceState(null, '', id === 'top' ? '#' : `#${id}`);
  };
  return (
    <footer id="footer" className={styles.footer}>
      <div className={styles.cols}>
        <nav aria-label="Навигация в подвале">
          <ul>
            {site.nav.map((n) => (
              <li key={n.id}>
                <a href={`#${n.id}`} onClick={go(n.id)}>{n.label}</a>
              </li>
            ))}
          </ul>
        </nav>
        <ul aria-label="Социальные сети">
          {site.socials.map((s) => (
            <li key={s.label}>
              <a href={s.href} target="_blank" rel="noopener noreferrer nofollow">{s.label}</a>
            </li>
          ))}
        </ul>
        <div>
          {site.hoursLabels.map((h) => (
            <p key={h.days} className={styles.hours}>
              <span>{h.days}</span> <span>{h.time}</span>
            </p>
          ))}
          <p className={styles.addr}>{site.address.street}</p>
        </div>
        <a className={styles.up} href="#top" onClick={go('top')}>Наверх</a>
      </div>

      {/* верхняя половина слова — тот же срез, что и на главном экране */}
      <p className={styles.mark} aria-hidden="true">BLACKLINE</p>

      <p className={styles.legal}>
        © 2026 BLACKLINE. Демонстрационный проект: данные вымышлены, фотографии — Unsplash.
      </p>
    </footer>
  );
}
