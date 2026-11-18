import { services } from '../../data/services';
import { formatDuration, formatPrice } from '../../lib/format';
import styles from './Booking.module.css';

interface Props {
  value: string | null;
  onChange: (id: string) => void;
}

export function ServiceStep({ value, onChange }: Props) {
  return (
    <fieldset className={styles.fieldset}>
      <legend className="sr-only">Услуга</legend>
      <div className={styles.options}>
        {services.map((s) => (
          <label key={s.id} className={styles.option}>
            <input type="radio" name="service" value={s.id} checked={value === s.id} onChange={() => onChange(s.id)} />
            <span className={styles.optionBody}>
              <span className={styles.optionTitle}>{s.name}</span>
              <span className={styles.optionMeta}>{formatDuration(s.minutes)}</span>
              <span className={styles.optionPrice}>{formatPrice(s.price)}</span>
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
