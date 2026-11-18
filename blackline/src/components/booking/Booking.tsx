import { useEffect, useMemo, useRef, useState } from 'react';
import { barberById, barbers } from '../../data/barbers';
import { serviceById } from '../../data/services';
import { bookingStore, useBooking } from '../../lib/bookingStore';
import { submitBooking, validateContacts, type BookingDraft, type BookingReceipt, type ContactErrors } from '../../lib/booking';
import { formatDateLong, shopNow, slotsFor, upcomingDays, type ShopNow } from '../../lib/schedule';
import { formatDuration, formatPrice, minutesToTime } from '../../lib/format';
import { Button } from '../Button';
import { ServiceStep } from './ServiceStep';
import { BarberStep } from './BarberStep';
import { DateTimeStep } from './DateTimeStep';
import { ContactStep } from './ContactStep';
import { Receipt } from './Receipt';
import styles from './Booking.module.css';

const STEPS = ['Услуга', 'Мастер', 'Дата и время', 'Контакты', 'Подтверждение'] as const;

function stepValue(n: number, d: BookingDraft): string | null {
  switch (n) {
    case 1: {
      const s = serviceById(d.serviceId);
      return s ? `${s.name}, ${formatPrice(s.price)}` : null;
    }
    case 2:
      return d.barberChosen ? (barberById(d.barberId)?.name ?? 'Любой свободный') : null;
    case 3:
      return d.date && d.time !== null ? `${formatDateLong(d.date)}, ${minutesToTime(d.time)}` : null;
    case 4:
      return d.name.trim() && d.phone ? `${d.name.trim()}, ${d.phone}` : null;
    default:
      return null;
  }
}

export function Booking() {
  const { draft, step } = useBooking();
  const [now, setNow] = useState<ShopNow | null>(null);
  const [touched, setTouched] = useState<Partial<Record<'name' | 'phone' | 'consent', boolean>>>({});
  const [attempted, setAttempted] = useState(false);
  const [sending, setSending] = useState(false);
  const [failed, setFailed] = useState(false);
  const [receipt, setReceipt] = useState<BookingReceipt | null>(null);
  const [announce, setAnnounce] = useState('');
  /** Дальше всего дошедший шаг — к нему можно вернуться из любого другого */
  const [maxStep, setMaxStep] = useState(1);
  const panels = useRef<(HTMLDivElement | null)[]>([]);
  const prevStep = useRef(step);

  useEffect(() => setNow(shopNow()), []);
  useEffect(() => setMaxStep((m) => Math.max(m, step)), [step]);

  const service = serviceById(draft.serviceId);
  const minutes = service?.minutes ?? 60;

  const errors: ContactErrors = useMemo(() => {
    const all = validateContacts(draft);
    const out: ContactErrors = {};
    (Object.keys(all) as (keyof ContactErrors)[]).forEach((k) => {
      if (attempted || touched[k]) out[k] = all[k];
    });
    return out;
  }, [draft, touched, attempted]);

  // При смене шага: объявляем его, переносим фокус на панель, при необходимости подводим экран
  useEffect(() => {
    // только при реальной смене шага: иначе фокус «убегал» бы из поля при каждом символе
    if (prevStep.current === step) return;
    prevStep.current = step;
    setAnnounce(`Шаг ${step} из 5: ${STEPS[step - 1]}`);
    const panel = panels.current[step - 1];
    panel?.focus({ preventScroll: true });
    const head = panel?.parentElement;
    if (head) {
      const top = head.getBoundingClientRect().top;
      if (top < 80 || top > window.innerHeight * 0.6) {
        const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        window.scrollTo({ top: window.scrollY + top - 96, behavior: reduce ? 'auto' : 'smooth' });
      }
    }
  }, [step]);

  // На шаге «Дата и время» сразу предлагаем ближайший день с окнами
  useEffect(() => {
    if (step !== 3 || !now || draft.date) return;
    const first = upcomingDays(14, draft.barberId, minutes, now).find((d) => d.available);
    if (first) bookingStore.set({ date: first.date }, 3);
  }, [step, now, draft.date, draft.barberId, minutes]);

  /** После смены услуги/мастера выбранное время может стать недоступным — тогда сбрасываем его. */
  const keepTimeIfFree = (next: Partial<BookingDraft>) => {
    const merged = { ...draft, ...next };
    const mins = serviceById(merged.serviceId)?.minutes ?? 60;
    let patch = next;
    if (merged.date && merged.time !== null && now) {
      const ok = slotsFor(merged.date, merged.barberId, mins, now).some((s) => s.start === merged.time && s.free);
      if (!ok) patch = { ...next, time: null };
    }
    bookingStore.set(patch);
  };

  const goTo = (n: number) => {
    if (receipt) return;
    bookingStore.setStep(n);
  };

  const toReview = () => {
    setAttempted(true);
    if (Object.keys(validateContacts(draft)).length) return;
    bookingStore.setStep(5);
  };

  const send = async () => {
    setSending(true);
    setFailed(false);
    try {
      setReceipt(await submitBooking(draft));
    } catch {
      setFailed(true);
    } finally {
      setSending(false);
    }
  };

  const reset = () => {
    setReceipt(null);
    setMaxStep(1);
    setTouched({});
    setAttempted(false);
    bookingStore.reset();
  };

  const barber = barberById(draft.barberId);
  const reachable = (n: number) => !receipt && n <= maxStep;

  return (
    <section id="booking" className={styles.section} aria-labelledby="booking-title">
      <header className={styles.head}>
        <h2 id="booking-title" className={`display ${styles.title}`} data-reveal="mask">
          <span className="mask-line"><span>Запись</span></span>
        </h2>
        <p className={styles.demo}>
          <strong>Демо-режим.</strong> Форма работает: проверяет данные и формирует заявку. Но в реальную систему записи она не
          передаётся — данные остаются в вашем браузере. Свободные окна тоже условные.
        </p>
      </header>

      <div className={styles.layout}>
        <div className={styles.steps}>
          {receipt ? (
            <div className={styles.done} role="status">
              <h3 className={`display ${styles.doneTitle}`}>Заявка сформирована</h3>
              <p>
                Номер {receipt.id}. {draft.name.trim()}, мы бы позвонили вам по номеру {draft.phone}, чтобы подтвердить визит
                {draft.date && draft.time !== null ? ` — ${formatDateLong(draft.date)}, ${minutesToTime(draft.time)}` : ''}. Но это
                демонстрационный сайт: реальной записи не создано, никто не позвонит.
              </p>
              <Button tone="dark" onClick={reset}>Оформить новую заявку</Button>
            </div>
          ) : (
            STEPS.map((label, i) => {
              const n = i + 1;
              const value = stepValue(n, draft);
              const state = n === step ? 'active' : n <= maxStep && value ? 'done' : 'todo';
              return (
                <div key={label} className={styles.step} data-state={state}>
                  <h3 className={styles.stepTitle}>
                    <button
                      type="button"
                      className={styles.stepHead}
                      onClick={() => goTo(n)}
                      disabled={!reachable(n) || n === step}
                      aria-expanded={n === step}
                      aria-controls={`step-panel-${n}`}
                    >
                      <span className={styles.num} aria-hidden="true">{n}</span>
                      <span className={styles.label}>{label}</span>
                      {n !== step && value && <span className={styles.value}>{value}</span>}
                      {state === 'done' && <span className={styles.edit}>Изменить</span>}
                    </button>
                  </h3>
                  <div className={styles.panelWrap} data-open={n === step}>
                    <div
                      id={`step-panel-${n}`}
                      ref={(el) => { panels.current[i] = el; }}
                      className={styles.panel}
                      tabIndex={-1}
                      inert={n !== step}
                      role="group"
                      aria-label={label}
                    >
                      {n === 1 && <ServiceStep value={draft.serviceId} onChange={(id) => keepTimeIfFree({ serviceId: id })} />}
                      {n === 2 && (
                        <BarberStep
                          chosen={draft.barberChosen}
                          value={draft.barberId}
                          onChange={(id) => keepTimeIfFree({ barberId: id, barberChosen: true })}
                        />
                      )}
                      {n === 3 && (
                        <>
                          <DateTimeStep
                            now={now}
                            barberId={draft.barberId}
                            minutes={minutes}
                            date={draft.date}
                            time={draft.time}
                            onDate={(d) => bookingStore.set({ date: d, time: null }, 3)}
                            onTime={(t) => bookingStore.set({ time: t })}
                          />
                        </>
                      )}
                      {n === 4 && (
                        <ContactStep
                          draft={draft}
                          errors={errors}
                          onChange={(p) => bookingStore.set(p, 4)}
                          onBlurField={(f) => setTouched((t) => ({ ...t, [f]: true }))}
                          onNext={toReview}
                        />
                      )}
                      {n === 5 && (
                        <div className={styles.review}>
                          <dl className={styles.reviewList}>
                            <div><dt>Услуга</dt><dd>{service?.name}, {service && formatDuration(service.minutes)}</dd></div>
                            <div><dt>Мастер</dt><dd>{barber?.name ?? 'Любой свободный'}</dd></div>
                            <div><dt>Когда</dt><dd>{draft.date && draft.time !== null ? `${formatDateLong(draft.date)}, ${minutesToTime(draft.time)}` : ''}</dd></div>
                            <div><dt>Контакты</dt><dd>{draft.name.trim()}, {draft.phone}</dd></div>
                            {draft.comment.trim() && <div><dt>Комментарий</dt><dd>{draft.comment.trim()}</dd></div>}
                          </dl>
                          {failed && <p className={styles.error} role="alert">Не удалось сохранить заявку. Попробуйте ещё раз.</p>}
                          <Button tone="dark" size="lg" onClick={send} disabled={sending} aria-busy={sending}>
                            {sending ? 'Отправляем…' : 'Отправить заявку'}
                          </Button>
                          <p className={styles.fine}>Нажимая кнопку, вы создаёте демонстрационную заявку — реальной записи не будет.</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className={styles.side}>
          <Receipt draft={draft} receipt={receipt} />
        </div>
      </div>

      <p className="sr-only" aria-live="polite">{announce}</p>
      <p className="sr-only">{barbers.length} мастера доступны для выбора</p>
    </section>
  );
}
