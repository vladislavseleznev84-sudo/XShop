import { barbers } from '../../data/barbers';
import styles from './Booking.module.css';

interface Props {
  /** undefined-состояние: мастер ещё не выбран; null — «любой» */
  chosen: boolean;
  value: string | null;
  onChange: (id: string | null) => void;
}

export function BarberStep({ chosen, value, onChange }: Props) {
  return (
    <fieldset className={styles.fieldset}>
      <legend className="sr-only">Мастер</legend>
      <div className={styles.options}>
        <label className={styles.option}>
          <input type="radio" name="barber" value="any" checked={chosen && value === null} onChange={() => onChange(null)} />
          <span className={styles.optionBody}>
            <span className={styles.optionTitle}>Любой свободный</span>
            <span className={styles.optionMeta}>Больше свободных окон</span>
          </span>
        </label>
        {barbers.map((b) => (
          <label key={b.id} className={styles.option}>
            <input type="radio" name="barber" value={b.id} checked={chosen && value === b.id} onChange={() => onChange(b.id)} />
            <span className={styles.optionBody}>
              <span className={styles.optionTitle}>{b.name}</span>
              <span className={styles.optionMeta}>{b.role}</span>
              <span className={styles.optionNote}>{b.daysLabel}</span>
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
