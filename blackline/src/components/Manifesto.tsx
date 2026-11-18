import { useEffect, useRef, type CSSProperties } from 'react';
import { Photo } from './Photo';
import { prefersReducedMotion, subscribeScroll } from '../lib/scroll';
import styles from './Manifesto.module.css';

const STATEMENT =
  'Хорошая стрижка — это одна точная линия: там, где заканчивается волос и начинается лицо. Её нельзя переделать, поэтому мы никуда не торопимся.';

const words = STATEMENT.split(' ');

const principles = [
  'Одно кресло — один клиент. Двоих сразу мы не берём.',
  'Мастер ведёт вас от разговора до укладки сам, без передачи по цепочке.',
  'Закончили тогда, когда вы увидели результат в зеркале и согласились с ним.',
];

export function Manifesto() {
  const text = useRef<HTMLParagraphElement>(null);

  // Кинетика: текст «проявляется» по мере прокрутки. Один CSS-параметр --p на весь абзац.
  useEffect(() => {
    const el = text.current;
    if (!el || prefersReducedMotion()) return;
    return subscribeScroll(({ vh }) => {
      const r = el.getBoundingClientRect();
      const p = (vh * 0.85 - r.top) / (r.height + vh * 0.25);
      el.style.setProperty('--p', Math.max(0, Math.min(1, p)).toFixed(3));
    });
  }, []);

  return (
    <section id="manifesto" className={styles.section} aria-labelledby="manifesto-title">
      <h2 id="manifesto-title" className="sr-only">Манифест</h2>
      <p ref={text} className={`display ${styles.statement}`}>
        {words.map((w, i) => (
          <span key={i} className={styles.word} style={{ ['--w' as string]: (i / words.length) * 0.9 } as CSSProperties}>
            {w}{' '}
          </span>
        ))}
      </p>

      <div className={styles.lower}>
        <Photo
          name="tools"
          alt="Машинки, ножницы и расчёска на деревянной столешнице, вид сверху"
          sizes="(max-width: 760px) 92vw, 40vw"
          speed={0.06}
          className={styles.photo}
        />
        <ul className={styles.principles}>
          {principles.map((p) => (
            <li key={p} data-reveal="fade">
              {p}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
