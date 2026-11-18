import { useMemo } from 'react';
import { dayOfMonth, formatDateLong, slotsFor, upcomingDays, weekdayShort, type ShopNow } from '../../lib/schedule';
import { minutesToTime } from '../../lib/format';
import styles from './Booking.module.css';

interface Props {
  now: ShopNow | null;
  barberId: string | null;
  minutes: number;
  date: string | null;
  time: number | null;
  onDate: (d: string) => void;
  onTime: (t: number) => void;
}

export function DateTimeStep({ now, barberId, minutes, date, time, onDate, onTime }: Props) {
  const days = useMemo(() => (now ? upcomingDays(14, barberId, minutes, now) : []), [now, barberId, minutes]);
  const slots = useMemo(() => (now && date ? slotsFor(date, barberId, minutes, now) : []), [now, date, barberId, minutes]);

  if (!now) return <p className={styles.hint}>Загружаем расписание…</p>;

  const freeCount = slots.filter((s) => s.free).length;

  return (
    <div className={styles.dateTime}>
      <fieldset className={styles.fieldset}>
        <legend className={styles.subLegend}>День</legend>
        <div className={styles.days}>
          {days.map((d) => (
            <label key={d.date} className={styles.day}>
              <input
                type="radio"
                name="date"
                value={d.date}
                checked={date === d.date}
                disabled={!d.available}
                onChange={() => onDate(d.date)}
                aria-label={`${formatDateLong(d.date)}${d.available ? '' : ', нет свободных окон'}`}
              />
              <span className={styles.dayBody} aria-hidden="true">
                <span className={styles.dayWeek}>{weekdayShort(d.weekday)}</span>
                <span className={styles.dayNum}>{dayOfMonth(d.date)}</span>
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset className={styles.fieldset} disabled={!date}>
        <legend className={styles.subLegend}>
          Время{date ? `, ${formatDateLong(date)}` : ''}
        </legend>
        {!date && <p className={styles.hint}>Сначала выберите день.</p>}
        {date && freeCount === 0 && <p className={styles.hint}>На этот день свободных окон нет — выберите другой.</p>}
        <div className={styles.times}>
          {slots.map((s) => (
            <label key={s.start} className={styles.time}>
              <input
                type="radio"
                name="time"
                value={s.start}
                checked={time === s.start}
                disabled={!s.free}
                onChange={() => onTime(s.start)}
                aria-label={`${minutesToTime(s.start)}${s.free ? '' : ', занято'}`}
              />
              <span aria-hidden="true">{minutesToTime(s.start)}</span>
            </label>
          ))}
        </div>
      </fieldset>
      {barberId === null && <p className={styles.hint}>Мастера назначим при подтверждении — с учётом свободных окон.</p>}
    </div>
  );
}
