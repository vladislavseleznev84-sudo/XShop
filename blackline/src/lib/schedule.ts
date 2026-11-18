import { site } from '../data/site';
import { barbers, type Barber } from '../data/barbers';

export interface ShopNow {
  /** YYYY-MM-DD в часовом поясе салона */
  date: string;
  /** минуты от полуночи в часовом поясе салона */
  minutes: number;
  weekday: number;
}

const WEEKDAY_INDEX: Record<string, number> = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };

/** Текущее время салона, независимо от часового пояса посетителя. */
export function shopNow(now: Date = new Date(), timeZone: string = site.timeZone): ShopNow {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    weekday: 'short',
    hourCycle: 'h23',
  }).formatToParts(now);
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? '';
  return {
    date: `${get('year')}-${get('month')}-${get('day')}`,
    minutes: Number(get('hour')) * 60 + Number(get('minute')),
    weekday: WEEKDAY_INDEX[get('weekday')] ?? 0,
  };
}

export function weekdayOf(date: string): number {
  const [y, m, d] = date.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d)).getUTCDay();
}

export function addDays(date: string, n: number): string {
  const [y, m, d] = date.split('-').map(Number);
  const t = new Date(Date.UTC(y, m - 1, d + n));
  return t.toISOString().slice(0, 10);
}

export interface OpenStatus {
  open: boolean;
  /** Строка вида «Открыто до 21:00» / «Откроется завтра в 10:00» */
  label: string;
}

export function openStatus(now: Date = new Date()): OpenStatus {
  const n = shopNow(now);
  const today = site.hours[n.weekday];
  const t = (m: number) => `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
  if (n.minutes >= today.open && n.minutes < today.close) return { open: true, label: `Открыто до ${t(today.close)}` };
  if (n.minutes < today.open) return { open: false, label: `Откроется сегодня в ${t(today.open)}` };
  const tomorrow = site.hours[(n.weekday + 1) % 7];
  return { open: false, label: `Откроется завтра в ${t(tomorrow.open)}` };
}

/** Детерминированный «хэш» для демонстрационной занятости слотов. */
function hash(str: string): number {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0) % 100;
}

export const SLOT_STEP = 30;
/** За сколько минут до начала ещё можно записаться. */
export const LEAD_MINUTES = 60;

export interface Slot {
  start: number;
  free: boolean;
}

function barberSlotTaken(date: string, barberId: string, start: number): boolean {
  // ДЕМО: занятость выдумана и повторяется для одной и той же даты.
  return hash(`${date}|${barberId}|${start}`) < 38;
}

/**
 * Слоты на день. barberId = null — «любой свободный мастер».
 * Слот свободен, если услуга успевает до закрытия, время не прошло и мастер (хотя бы один) свободен.
 */
export function slotsFor(date: string, barberId: string | null, minutes: number, now: ShopNow): Slot[] {
  const weekday = weekdayOf(date);
  const { open, close } = site.hours[weekday];
  const candidates: Barber[] = barberId ? barbers.filter((b) => b.id === barberId) : [...barbers];
  const working = candidates.filter((b) => b.days.includes(weekday));
  const out: Slot[] = [];
  for (let start = open; start + minutes <= close; start += SLOT_STEP) {
    const past = date < now.date || (date === now.date && start < now.minutes + LEAD_MINUTES);
    const free = !past && working.some((b) => !barberSlotTaken(date, b.id, start));
    out.push({ start, free });
  }
  return out;
}

export interface DayInfo {
  date: string;
  weekday: number;
  /** Есть ли хотя бы один свободный слот */
  available: boolean;
}

export function upcomingDays(count: number, barberId: string | null, minutes: number, now: ShopNow): DayInfo[] {
  return Array.from({ length: count }, (_, i) => {
    const date = addDays(now.date, i);
    return {
      date,
      weekday: weekdayOf(date),
      available: slotsFor(date, barberId, minutes, now).some((s) => s.free),
    };
  });
}

const WEEKDAYS_SHORT = ['вс', 'пн', 'вт', 'ср', 'чт', 'пт', 'сб'];
const WEEKDAYS_LONG = ['воскресенье', 'понедельник', 'вторник', 'среда', 'четверг', 'пятница', 'суббота'];
const MONTHS_GEN = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'];

export const weekdayShort = (d: number) => WEEKDAYS_SHORT[d];
export function formatDateLong(date: string): string {
  const [, m, d] = date.split('-').map(Number);
  return `${d} ${MONTHS_GEN[m - 1]}, ${WEEKDAYS_LONG[weekdayOf(date)]}`;
}
export const dayOfMonth = (date: string) => Number(date.split('-')[2]);
