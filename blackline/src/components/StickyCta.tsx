import { useEffect, useState } from 'react';
import { scrollToSection } from '../lib/bookingStore';
import styles from './StickyCta.module.css';

/** Мобильная кнопка записи: появляется после главного экрана и прячется у самой формы. */
export function StickyCta() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const hide = new Set<string>(['top']); // пока в окне главный экран — кнопка не нужна
    const sync = () => setVisible(hide.size === 0);
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (e.isIntersecting) hide.add(e.target.id);
        else hide.delete(e.target.id);
      }
      sync();
    });
    for (const id of ['top', 'booking', 'footer']) {
      const el = document.getElementById(id);
      if (el) io.observe(el);
    }
    return () => io.disconnect();
  }, []);

  return (
    <div className={`${styles.bar} ${visible ? styles.on : ''}`} aria-hidden={!visible}>
      <button type="button" tabIndex={visible ? 0 : -1} onClick={() => scrollToSection('booking')}>
        Записаться
      </button>
    </div>
  );
}
