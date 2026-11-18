import { useEffect, useState } from 'react';
import { site } from '../data/site';
import { scrollToSection } from '../lib/bookingStore';
import { subscribeScroll } from '../lib/scroll';
import styles from './Header.module.css';

function useActiveSection() {
  const [active, setActive] = useState<string>('');
  useEffect(() => {
    const els = site.nav.map((n) => document.getElementById(n.id)).filter((e): e is HTMLElement => !!e);
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setActive(e.target.id);
      },
      { rootMargin: '-45% 0px -50% 0px' },
    );
    els.forEach((e) => io.observe(e));
    return () => io.disconnect();
  }, []);
  return active;
}

export function Header() {
  const [open, setOpen] = useState(false);
  const [hidden, setHidden] = useState(false);
  const active = useActiveSection();

  // Скрываем шапку при прокрутке вниз (чтобы не наслаивалась на текст), показываем при прокрутке вверх
  useEffect(() => {
    let last = window.scrollY;
    return subscribeScroll(({ y }) => {
      const d = y - last;
      if (Math.abs(d) < 6) return;
      setHidden(y > 160 && d > 0);
      last = y;
    });
  }, []);

  useEffect(() => {
    document.documentElement.style.overflow = open ? 'hidden' : '';
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      document.documentElement.style.overflow = '';
    };
  }, [open]);

  const go = (id: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    setOpen(false);
    // дождёмся снятия блокировки прокрутки
    requestAnimationFrame(() => {
      scrollToSection(id);
      history.replaceState(null, '', `#${id}`);
    });
  };

  return (
    <header className={`${styles.header} ${open ? styles.open : ''} ${hidden && !open ? styles.hidden : ''}`}>
      <a href="#top" className={styles.logo} aria-label="BLACKLINE — на главный экран" onClick={go('top')}>
        BLACKLINE
      </a>
      <nav className={styles.nav} aria-label="Основная навигация">
        <ul>
          {site.nav.map((n) => (
            <li key={n.id}>
              <a href={`#${n.id}`} onClick={go(n.id)} aria-current={active === n.id ? 'true' : undefined}>
                {n.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>
      <a href="#booking" className={styles.cta} onClick={go('booking')}>
        Записаться
      </a>
      <button
        type="button"
        className={styles.burger}
        aria-expanded={open}
        aria-controls="menu"
        onClick={() => setOpen((o) => !o)}
      >
        <span>{open ? 'Закрыть' : 'Меню'}</span>
      </button>

      <div id="menu" className={styles.menu} hidden={!open}>
        <ul>
          {site.nav.map((n) => (
            <li key={n.id}>
              <a href={`#${n.id}`} onClick={go(n.id)}>
                {n.label}
              </a>
            </li>
          ))}
        </ul>
        <div className={styles.menuFoot}>
          <a href={`tel:${site.phone.href}`}>{site.phone.display}</a>
          <span>{site.address.street}</span>
        </div>
      </div>
    </header>
  );
}
