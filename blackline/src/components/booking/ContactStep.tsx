import { useRef } from 'react';
import { formatPhone } from '../../lib/phone';
import type { BookingDraft, ContactErrors } from '../../lib/booking';
import styles from './Booking.module.css';

interface Props {
  draft: Pick<BookingDraft, 'name' | 'phone' | 'comment' | 'consent'>;
  errors: ContactErrors;
  onChange: (patch: Partial<BookingDraft>) => void;
  onBlurField: (f: 'name' | 'phone' | 'consent') => void;
  onNext: () => void;
}

const digits = (s: string) => s.replace(/\D/g, '');

export function ContactStep({ draft, errors, onChange, onBlurField, onNext }: Props) {
  const prev = useRef(draft.phone);

  const onPhone = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    let next = raw;
    // Если стёрли только знак форматирования — убираем и предыдущую цифру, иначе маска «не даёт» удалять
    if (raw.length < prev.current.length && digits(raw) === digits(prev.current)) next = digits(raw).slice(0, -1);
    const f = formatPhone(next);
    prev.current = f;
    onChange({ phone: f });
  };

  return (
    <form
      className={styles.form}
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        onNext();
      }}
    >
      <div className={styles.field}>
        <label htmlFor="b-name">Имя</label>
        <input
          id="b-name"
          name="name"
          autoComplete="given-name"
          value={draft.name}
          onChange={(e) => onChange({ name: e.target.value })}
          onBlur={() => onBlurField('name')}
          aria-invalid={!!errors.name}
          aria-describedby={errors.name ? 'b-name-err' : undefined}
          required
        />
        {errors.name && <p id="b-name-err" className={styles.error}>{errors.name}</p>}
      </div>

      <div className={styles.field}>
        <label htmlFor="b-phone">Телефон</label>
        <input
          id="b-phone"
          name="tel"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          placeholder="+7 (___) ___-__-__"
          value={draft.phone}
          onChange={onPhone}
          onBlur={() => onBlurField('phone')}
          aria-invalid={!!errors.phone}
          aria-describedby={errors.phone ? 'b-phone-err' : undefined}
          required
        />
        {errors.phone && <p id="b-phone-err" className={styles.error}>{errors.phone}</p>}
      </div>

      <div className={`${styles.field} ${styles.wide}`}>
        <label htmlFor="b-comment">Комментарий <span className={styles.optional}>— по желанию</span></label>
        <textarea
          id="b-comment"
          name="comment"
          rows={2}
          maxLength={300}
          value={draft.comment}
          onChange={(e) => onChange({ comment: e.target.value })}
        />
      </div>

      <div className={`${styles.field} ${styles.wide}`}>
        <label className={styles.check}>
          <input
            type="checkbox"
            checked={draft.consent}
            onChange={(e) => onChange({ consent: e.target.checked })}
            onBlur={() => onBlurField('consent')}
            aria-invalid={!!errors.consent}
            aria-describedby={errors.consent ? 'b-consent-err' : undefined}
          />
          <span>Согласен на обработку персональных данных для связи по записи.</span>
        </label>
        {errors.consent && <p id="b-consent-err" className={styles.error}>{errors.consent}</p>}
      </div>

      <div className={styles.wide}>
        <button type="submit" className={styles.next}>Проверить заявку</button>
      </div>
    </form>
  );
}
