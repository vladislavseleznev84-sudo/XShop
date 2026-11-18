import { describe, expect, it } from 'vitest';
import { formatPrice, formatDuration, minutesToTime } from './format';
import { formatPhone, isValidPhone } from './phone';
import { addDays, openStatus, shopNow, slotsFor, upcomingDays, weekdayOf, formatDateLong } from './schedule';
import { validateContacts, emptyDraft, submitBooking } from './booking';
import { services } from '../data/services';

describe('format', () => {
  it('форматирует цены с неразрывным пробелом и ₽', () => {
    expect(formatPrice(1800)).toBe('1 800 ₽');
    expect(formatPrice(2700)).toBe('2 700 ₽');
    expect(formatPrice(900)).toBe('900 ₽');
  });
  it('форматирует длительность', () => {
    expect(formatDuration(40)).toBe('40 мин');
    expect(formatDuration(60)).toBe('1 ч');
    expect(formatDuration(90)).toBe('1 ч 30 мин');
  });
  it('форматирует время', () => expect(minutesToTime(9 * 60 + 5)).toBe('09:05'));
  it('цены из задания', () => {
    expect(Object.fromEntries(services.map((s) => [s.name, s.price]))).toEqual({
      'Classic Haircut': 1800,
      'Skin Fade': 2000,
      'Beard Design': 1200,
      'Haircut + Beard': 2700,
    });
  });
});

describe('phone', () => {
  it('маскирует ввод', () => {
    expect(formatPhone('9991234567')).toBe('+7 (999) 123-45-67');
    expect(formatPhone('89991234567')).toBe('+7 (999) 123-45-67');
    expect(formatPhone('+7 999')).toBe('+7 (999)');
    expect(formatPhone('')).toBe('');
  });
  it('валидирует только полный номер', () => {
    expect(isValidPhone('+7 (999) 123-45-67')).toBe(true);
    expect(isValidPhone('+7 (999) 123-45')).toBe(false);
  });
});

describe('schedule', () => {
  // Среда, 2026-11-18, 12:00 по Москве (09:00 UTC)
  const now = shopNow(new Date('2026-11-18T09:00:00Z'));

  it('определяет время салона независимо от пояса посетителя', () => {
    expect(now).toEqual({ date: '2026-11-18', minutes: 720, weekday: 3 });
    expect(shopNow(new Date('2026-11-18T22:30:00Z')).date).toBe('2026-11-19'); // уже ночь по Москве
  });
  it('считает дни недели и сдвиг дат', () => {
    expect(weekdayOf('2026-11-18')).toBe(3);
    expect(addDays('2026-11-30', 1)).toBe('2026-12-01');
    expect(formatDateLong('2026-11-18')).toBe('18 ноября, среда');
  });
  it('не предлагает прошедшие слоты и учитывает запас по времени', () => {
    const slots = slotsFor('2026-11-18', null, 60, now);
    const firstFree = slots.find((s) => s.free)!;
    expect(firstFree.start).toBeGreaterThanOrEqual(720 + 60);
    expect(slots.filter((s) => s.start < 720 + 60).every((s) => !s.free)).toBe(true);
  });
  it('услуга обязана успеть до закрытия', () => {
    const slots = slotsFor('2026-11-23', null, 90, now); // понедельник, закрытие 21:00
    expect(Math.max(...slots.map((s) => s.start)) + 90).toBeLessThanOrEqual(21 * 60);
  });
  it('мастер в выходной не принимает', () => {
    // 2026-11-23 — понедельник, Дамир не работает
    expect(slotsFor('2026-11-23', 'damir', 60, now).some((s) => s.free)).toBe(false);
    expect(slotsFor('2026-11-23', 'ilya', 60, now).some((s) => s.free)).toBe(true);
  });
  it('детерминирован', () => {
    expect(slotsFor('2026-11-20', 'mark', 60, now)).toEqual(slotsFor('2026-11-20', 'mark', 60, now));
  });
  it('возвращает ровно N дней начиная с сегодняшнего', () => {
    const days = upcomingDays(14, null, 60, now);
    expect(days).toHaveLength(14);
    expect(days[0].date).toBe('2026-11-18');
  });
  it('статус «открыто»', () => {
    expect(openStatus(new Date('2026-11-18T09:00:00Z'))).toEqual({ open: true, label: 'Открыто до 21:00' });
    expect(openStatus(new Date('2026-11-18T19:00:00Z')).open).toBe(false); // 22:00 МСК
    expect(openStatus(new Date('2026-11-18T19:00:00Z')).label).toBe('Откроется завтра в 10:00');
    expect(openStatus(new Date('2026-11-18T05:00:00Z')).label).toBe('Откроется сегодня в 10:00'); // 08:00 МСК
  });
});

describe('booking', () => {
  it('валидирует контакты', () => {
    expect(Object.keys(validateContacts(emptyDraft)).sort()).toEqual(['consent', 'name', 'phone']);
    expect(validateContacts({ name: 'Иван', phone: '+7 (999) 123-45-67', consent: true })).toEqual({});
  });
  it('демо-отправка возвращает квитанцию в режиме demo', async () => {
    const r = await submitBooking(emptyDraft);
    expect(r.mode).toBe('demo');
    expect(r.id).toMatch(/^BL-/);
  });
});
