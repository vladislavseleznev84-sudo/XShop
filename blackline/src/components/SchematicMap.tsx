import styles from './SchematicMap.module.css';

/** Схематичная карта района: вымышленные улицы, маршрут от метро до входа. */
export function SchematicMap() {
  return (
    <svg
      className={styles.svg}
      viewBox="0 0 800 640"
      role="img"
      aria-label="Схема района: от станции метро «Демонстрационная» к входу в BLACKLINE четыре минуты пешком"
    >
      <defs>
        <pattern id="hatch" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <line x1="0" y1="0" x2="0" y2="8" stroke="#777" strokeWidth="1" opacity="0.55" />
        </pattern>
      </defs>
      <rect width="800" height="640" className={styles.bg} />

      {/* кварталы */}
      <g className={styles.blocks}>
        <rect x="40" y="40" width="200" height="150" />
        <rect x="290" y="40" width="190" height="150" />
        <rect x="530" y="40" width="230" height="150" />
        <rect x="40" y="240" width="200" height="170" />
        <rect x="530" y="240" width="230" height="170" />
        <rect x="40" y="460" width="200" height="140" />
        <rect x="290" y="460" width="190" height="140" />
        <rect x="530" y="460" width="230" height="140" />
      </g>
      {/* сквер */}
      <rect x="290" y="240" width="190" height="170" fill="url(#hatch)" className={styles.park} />
      {/* наш квартал */}
      <rect x="530" y="240" width="230" height="170" className={styles.target} />

      {/* улицы */}
      <g className={styles.streets}>
        <path d="M0 215H800" />
        <path d="M0 435H800" />
        <path d="M265 0V640" />
        <path d="M505 0V640" />
        <path d="M0 600L190 440" className={styles.diag} />
      </g>

      {/* подписи улиц */}
      <g className={styles.labels}>
        <text x="300" y="209">ул. Образцовая</text>
        <text x="560" y="429">Демонстрационный пер.</text>
        <text x="272" y="175" transform="rotate(-90 272 175)">пр. Примерный</text>
      </g>

      {/* маршрут */}
      <path className={styles.route} d="M150 520 L150 435 L505 435 L505 340 L560 340" />

      {/* метро */}
      <g transform="translate(150 520)">
        <rect x="-14" y="-14" width="28" height="28" className={styles.metro} />
        <text className={styles.metroText} x="0" y="6" textAnchor="middle">М</text>
      </g>
      <text className={styles.caption} x="172" y="548">м. Демонстрационная</text>
      <text className={styles.caption} x="330" y="425">4 мин пешком</text>

      {/* вход */}
      <g transform="translate(560 340)">
        <circle r="26" className={styles.pulse} />
        <circle r="9" className={styles.pin} />
      </g>
      <text className={styles.brand} x="584" y="334">BLACKLINE</text>

      {/* север */}
      <g transform="translate(740 590)" className={styles.north}>
        <path d="M0 -20V12M-7 -8L0 -20L7 -8" />
        <text x="0" y="28" textAnchor="middle">С</text>
      </g>
    </svg>
  );
}
