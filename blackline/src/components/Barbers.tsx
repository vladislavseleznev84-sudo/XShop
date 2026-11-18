import { barbers, type Barber } from '../data/barbers';
import { Photo } from './Photo';
import { Button } from './Button';
import { bookingStore, scrollToSection } from '../lib/bookingStore';
import styles from './Barbers.module.css';

const book = (b: Barber) => () => {
  bookingStore.set({ barberId: b.id, barberChosen: true });
  scrollToSection('booking');
};

const [damir, ilya, mark] = barbers;
const years = (n: number) => `${n} ${n % 10 === 1 && n !== 11 ? 'год' : n % 10 >= 2 && n % 10 <= 4 && (n < 12 || n > 14) ? 'года' : 'лет'}`;

export function Barbers() {
  return (
    <section id="barbers" className={styles.section} aria-labelledby="barbers-title">
      <header className={styles.head}>
        <h2 id="barbers-title" className={`display ${styles.title}`} data-reveal="mask">
          <span className="mask-line"><span>Три мастера,</span></span>
          <span className="mask-line" style={{ ['--i' as string]: 1 }}><span>три почерка</span></span>
        </h2>
        <p className={styles.note}>Имена мастеров вымышлены, фотографии стоковые — это демонстрационные данные.</p>
      </header>

      {/* Дамир — фотографическая подача: портрет и имя, наложенное на кадр */}
      <article className={`${styles.chapter} ${styles.damir}`} aria-labelledby="b-damir">
        <Photo
          name="damir"
          alt="Дамир стрижет клиента машинкой в зале барбершопа"
          sizes="(max-width: 760px) 88vw, 40vw"
          speed={0.05}
          className={styles.damirPhoto}
          position="50% 20%"
        />
        <h3 id="b-damir" className={styles.damirName} data-reveal="mask">
          <span className="mask-line"><span>{damir.name}</span></span>
        </h3>
        <div className={styles.damirBody}>
          <p className={styles.role}>{damir.role}</p>
          <p className={styles.signature}>{damir.signature}</p>
          <dl className={styles.facts}>
            <div><dt>Стаж</dt><dd>{years(damir.years)}</dd></div>
            <div><dt>Принимает</dt><dd>{damir.daysLabel}</dd></div>
          </dl>
          <Button onClick={book(damir)}>Записаться к Дамиру</Button>
        </div>
      </article>

      {/* Илья — линейная подача: контурное имя за кадром, цитата */}
      <article className={`${styles.chapter} ${styles.ilya}`} aria-labelledby="b-ilya">
        <h3 id="b-ilya" className={styles.ilyaName} aria-label={ilya.name}>
          <span aria-hidden="true">{ilya.name}</span>
        </h3>
        <Photo
          name="ilya"
          alt="Илья в очках стрижёт клиента, вокруг — рабочее место барбершопа"
          sizes="(max-width: 760px) 92vw, 58vw"
          speed={0.05}
          className={styles.ilyaPhoto}
          position="72% 40%"
        />
        <div className={styles.ilyaBody}>
          <blockquote className={styles.quote}>«{ilya.quote}»</blockquote>
          <p className={styles.role}>{ilya.role}</p>
          <p className={styles.meta}>
            {years(ilya.years)} стажа. {ilya.signature}. Принимает: {ilya.daysLabel}.
          </p>
          <Button onClick={book(ilya)}>Записаться к Илье</Button>
        </div>
      </article>

      {/* Марк — типографическая подача: перечень умений крупным кеглем */}
      <article className={`${styles.chapter} ${styles.mark}`} aria-labelledby="b-mark">
        <div className={styles.markBody}>
          <h3 id="b-mark" className={`display ${styles.markName}`} data-reveal="mask">
            <span className="mask-line"><span>{mark.name}</span></span>
          </h3>
          <ul className={styles.skills}>
            <li>Форма под структуру волос</li>
            <li>Длина и объём</li>
            <li>Укладка на каждый день</li>
          </ul>
          <p className={styles.meta}>
            {years(mark.years)} стажа. Принимает: {mark.daysLabel}. {mark.quote}
          </p>
          <Button onClick={book(mark)}>Записаться к Марку</Button>
        </div>
        <Photo
          name="mark"
          alt="Марк сушит волосы клиенту феном в зале барбершопа"
          sizes="(max-width: 760px) 70vw, 28vw"
          speed={0.08}
          className={styles.markPhoto}
          position="60% 30%"
        />
      </article>
    </section>
  );
}
