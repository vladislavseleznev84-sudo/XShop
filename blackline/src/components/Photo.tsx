import { useRef, type CSSProperties } from 'react';
import manifest from '../data/images.manifest.json';
import { useParallax } from '../hooks/useParallax';
import styles from './Photo.module.css';

export type PhotoKey = keyof typeof manifest;

interface Props {
  name: PhotoKey;
  alt: string;
  /** атрибут sizes для srcset */
  sizes: string;
  eager?: boolean;
  /** соотношение ширины к высоте; по умолчанию — естественное */
  ratio?: number;
  position?: string;
  /** сила параллакса (0 — без) */
  speed?: number;
  /** «шторка» при появлении */
  reveal?: boolean;
  delay?: number;
  className?: string;
  style?: CSSProperties;
}

const base = import.meta.env.BASE_URL;
const srcSet = (name: PhotoKey, ext: 'avif' | 'webp') =>
  manifest[name].widths.map((w) => `${base}img/${name}-${w}.${ext} ${w}w`).join(', ');

export function Photo({ name, alt, sizes, eager, ratio, position, speed = 0, reveal = true, delay = 0, className, style }: Props) {
  const m = manifest[name];
  const inner = useRef<HTMLDivElement>(null);
  useParallax(inner, speed);
  const mid = m.widths.find((w) => w >= 800) ?? m.widths.at(-1)!;
  const parallax = speed > 0;
  return (
    <div
      className={`${styles.frame} ${className ?? ''}`}
      style={{ aspectRatio: ratio ?? m.w / m.h, ...style, ['--d' as string]: `${delay}s` }}
      data-reveal={reveal ? 'wipe' : undefined}
    >
      <div ref={inner} className={`${styles.inner} ${parallax ? styles.parallax : ''}`}>
        <picture>
          <source type="image/avif" srcSet={srcSet(name, 'avif')} sizes={sizes} />
          <source type="image/webp" srcSet={srcSet(name, 'webp')} sizes={sizes} />
          <img
            src={`${base}img/${name}-${mid}.webp`}
            width={m.w}
            height={m.h}
            alt={alt}
            sizes={sizes}
            loading={eager ? 'eager' : 'lazy'}
            decoding="async"
            fetchPriority={eager ? 'high' : undefined}
            style={{ backgroundImage: `url(${m.lqip})`, objectPosition: position }}
          />
        </picture>
      </div>
    </div>
  );
}
