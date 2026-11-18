import { useCallback, useRef, useState } from 'react';
import { gallery } from '../data/gallery';
import { Photo } from './Photo';
import { Lightbox } from './Lightbox';
import styles from './Gallery.module.css';

const SIZES: Record<string, string> = {
  a: '(max-width: 760px) 92vw, 62vw',
  b: '(max-width: 760px) 70vw, 30vw',
  c: '(max-width: 760px) 92vw, 42vw',
  d: '(max-width: 760px) 92vw, 48vw',
  e: '(max-width: 760px) 70vw, 30vw',
  f: '(max-width: 760px) 92vw, 42vw',
  g: '(max-width: 760px) 70vw, 24vw',
  h: '100vw',
};

export function Gallery() {
  const [open, setOpen] = useState<number | null>(null);
  const origin = useRef<{ rect: DOMRect; el: HTMLElement } | null>(null);

  const show = (i: number) => (e: React.MouseEvent<HTMLButtonElement>) => {
    const img = e.currentTarget.querySelector('img');
    origin.current = { rect: (img ?? e.currentTarget).getBoundingClientRect(), el: e.currentTarget };
    setOpen(i);
  };
  const close = useCallback(() => {
    setOpen(null);
    origin.current?.el.focus({ preventScroll: true });
  }, []);

  return (
    <section id="gallery" className={styles.section} aria-labelledby="gallery-title">
      <header className={styles.head}>
        <p className={styles.intro}>
          Кадры из зала на Демонстрационном переулке. Это стоковые фотографии для демо — в боевом проекте здесь будет ваша съёмка.
        </p>
        <h2 id="gallery-title" className={`display ${styles.title}`} data-reveal="mask">
          <span className="mask-line"><span>Работы</span></span>
        </h2>
      </header>

      <ul className={styles.grid}>
        {gallery.map((g, i) => (
          <li key={g.photo} className={`${styles.item} ${styles[g.slot]}`}>
            <figure>
              <button
                type="button"
                className={styles.thumb}
                onClick={show(i)}
                aria-label={`Открыть кадр ${i + 1}: ${g.caption}`}
                aria-haspopup="dialog"
              >
                <Photo
                  name={g.photo}
                  alt={g.alt}
                  sizes={SIZES[g.slot]}
                  ratio={g.ratio}
                  position={g.position}
                  speed={g.speed}
                  className={styles.photo}
                />
                <span className={styles.marks} aria-hidden="true" />
                <span className={styles.zoom} aria-hidden="true">Увеличить</span>
              </button>
              <figcaption className={styles.caption}>
                <span className={styles.frameNo}>Кадр {String(i + 1).padStart(2, '0')}</span>
                <span>{g.caption}</span>
              </figcaption>
            </figure>
          </li>
        ))}
      </ul>

      {open !== null && <Lightbox items={gallery} index={open} onIndex={setOpen} onClose={close} origin={origin.current?.rect ?? null} />}
    </section>
  );
}
