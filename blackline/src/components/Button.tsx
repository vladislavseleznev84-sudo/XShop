import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from 'react';
import styles from './Button.module.css';

type Common = { tone?: 'light' | 'dark'; size?: 'md' | 'lg'; children: ReactNode; className?: string };
type AsLink = Common & { href: string } & Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'className' | 'children'>;
type AsButton = Common & { href?: undefined } & Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'className' | 'children'>;

/** tone — цвет заливки: light — светлая кнопка на тёмном фоне, dark — тёмная на светлом. */
export function Button(props: AsLink | AsButton) {
  const { tone = 'light', size = 'md', className, children, ...rest } = props;
  const cls = `${styles.btn} ${styles[tone]} ${styles[size]} ${className ?? ''}`;
  if ('href' in rest && rest.href !== undefined) {
    return (
      <a className={cls} {...(rest as AnchorHTMLAttributes<HTMLAnchorElement>)}>
        <span className={styles.label}>{children}</span>
      </a>
    );
  }
  return (
    <button className={cls} type="button" {...(rest as ButtonHTMLAttributes<HTMLButtonElement>)}>
      <span className={styles.label}>{children}</span>
    </button>
  );
}
