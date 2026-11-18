import { barberById } from '../../data/barbers';
import { serviceById } from '../../data/services';
import { formatDuration, formatPrice, minutesToTime } from '../../lib/format';
import { formatDateLong } from '../../lib/schedule';
import type { BookingDraft, BookingReceipt } from '../../lib/booking';
import styles from './Booking.module.css';

interface Props {
  draft: BookingDraft;
  receipt: BookingReceipt | null;
}

/** «Чек»: живая сводка выбора. После отправки получает номер демо-заявки. */
export function Receipt({ draft, receipt }: Props) {
  const service = serviceById(draft.serviceId);
  const barber = barberById(draft.barberId);
  const row = (label: string, value: string | null) => (
    <div className={styles.rRow}>
      <dt>{label}</dt>
      <dd className={value ? undefined : styles.empty}>{value ?? 'не выбрано'}</dd>
    </div>
  );
  return (
    <aside className={styles.receipt} aria-label="Сводка заявки">
      <p className={styles.rHead}>
        <span>BLACKLINE</span>
        <span>{receipt ? receipt.id : 'черновик'}</span>
      </p>
      <dl>
        {row('Услуга', service?.name ?? null)}
        {row('Мастер', draft.barberChosen ? (barber?.name ?? 'Любой свободный') : null)}
        {row('Дата', draft.date ? formatDateLong(draft.date) : null)}
        {row('Время', draft.time !== null ? minutesToTime(draft.time) : null)}
        {row('Длительность', service ? formatDuration(service.minutes) : null)}
      </dl>
      <p className={styles.rTotal}>
        <span>Итого к оплате в салоне</span>
        <strong>{service ? formatPrice(service.price) : '—'}</strong>
      </p>
      <p className={styles.rNote}>
        {receipt
          ? 'Демо-заявка сохранена только в вашем браузере. В систему записи она не передавалась.'
          : 'Демо-режим: после отправки заявка не уйдёт в реальную систему записи.'}
      </p>
    </aside>
  );
}
