export interface Barber {
  id: string;
  name: string;
  role: string;
  /** Дни недели, когда мастер принимает (0 = воскресенье). */
  days: readonly number[];
  daysLabel: string;
  years: number;
  /** Что мастер делает лучше всего — короткая подпись */
  signature: string;
  quote: string;
}

// Имена и данные вымышлены; фотографии — стоковые.
export const barbers: readonly Barber[] = [
  { id: 'damir', name: 'Дамир', role: 'Фейды и текстура', days: [2, 3, 4, 5, 6], daysLabel: 'вторник — суббота', years: 9, signature: 'Фейд, у которого не видно границы', quote: 'Если вы заметили, где закончилась машинка, я сделал плохо.' },
  { id: 'ilya', name: 'Илья', role: 'Классика и борода', days: [1, 3, 4, 5, 0], daysLabel: 'понедельник, среда — пятница, воскресенье', years: 14, signature: 'Горячее бритьё опасной бритвой', quote: 'Бритва прощает только тех, кто никуда не спешит.' },
  { id: 'mark', name: 'Марк', role: 'Форма и укладка', days: [1, 2, 5, 6, 0], daysLabel: 'понедельник, вторник, пятница — воскресенье', years: 6, signature: 'Форма под структуру волос', quote: 'Стрижка должна работать без укладки — укладка только добавляет.' },
] as const;

export const barberById = (id: string | null) => barbers.find((b) => b.id === id) ?? null;
