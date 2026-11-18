/**
 * ВСЕ ДАННЫЕ НИЖЕ — ДЕМОНСТРАЦИОННЫЕ: адрес, телефон, часы, соцсети и имена мастеров вымышлены.
 * Замените их перед использованием в реальном проекте.
 */
export const site = {
  name: 'BLACKLINE',
  tagline: 'Независимый барбершоп',
  city: 'Москва',
  timeZone: 'Europe/Moscow',
  address: { street: 'Демонстрационный пер., 7, стр. 2', note: 'Адрес вымышленный', metro: 'м. Демонстрационная, 4 минуты пешком' },
  phone: { display: '+7 (495) 000-00-00', href: '+74950000000' },
  email: 'hello@blackline.example',
  /** Слоты в расписании: время в минутах от полуночи. Индекс — день недели (0 = воскресенье). */
  hours: [
    { open: 11 * 60, close: 19 * 60 }, // вс
    { open: 10 * 60, close: 21 * 60 }, // пн
    { open: 10 * 60, close: 21 * 60 },
    { open: 10 * 60, close: 21 * 60 },
    { open: 10 * 60, close: 21 * 60 },
    { open: 10 * 60, close: 21 * 60 },
    { open: 10 * 60, close: 21 * 60 }, // сб
  ] as const,
  hoursLabels: [
    { days: 'Пн–Сб', time: '10:00–21:00' },
    { days: 'Вс', time: '11:00–19:00' },
  ],
  // Ссылки ведут на главные страницы платформ — подставьте реальные аккаунты.
  socials: [
    { label: 'Telegram', href: 'https://telegram.org/' },
    { label: 'VK', href: 'https://vk.com/' },
    { label: 'YouTube', href: 'https://youtube.com/' },
  ],
  nav: [
    { id: 'manifesto', label: 'Манифест' },
    { id: 'services', label: 'Услуги' },
    { id: 'gallery', label: 'Галерея' },
    { id: 'barbers', label: 'Мастера' },
    { id: 'booking', label: 'Запись' },
    { id: 'location', label: 'Контакты' },
  ],
} as const;

export type SectionId = (typeof site.nav)[number]['id'];
