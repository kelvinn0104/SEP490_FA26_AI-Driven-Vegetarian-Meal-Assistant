export function BrandArt({ className = "" }) {
  return (
    <svg
      className={`vp-brand-art ${className}`}
      viewBox="0 0 520 520"
      fill="none"
      aria-hidden="true"
    >
      <circle
        className="vp-art-orbit"
        cx="260"
        cy="260"
        r="228"
        stroke="currentColor"
        strokeOpacity=".14"
      />
      <circle
        cx="260"
        cy="260"
        r="184"
        fill="currentColor"
        fillOpacity=".055"
      />
      <circle
        cx="260"
        cy="260"
        r="148"
        stroke="currentColor"
        strokeOpacity=".15"
        strokeWidth="2"
      />
      <path
        className="vp-art-stem"
        d="M88 418C132 364 152 323 168 248M166 253C194 215 227 186 280 170"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <g className="vp-art-leaves" fill="currentColor">
        <path d="M165 281c-52-3-76-30-77-70 44 0 75 21 77 70Z" />
        <path d="M172 246c-2-46 21-73 63-81 5 41-16 71-63 81Z" />
        <path d="M142 333c-43-2-66-21-70-58 41-2 65 17 70 58Z" />
        <path d="M125 368c0-40 23-64 59-68 1 39-19 62-59 68Z" />
      </g>
      <path
        d="M352 90c34 14 52 42 44 78-33-12-50-37-44-78Z"
        fill="currentColor"
        fillOpacity=".65"
      />
      <path
        d="M397 378c30-22 62-20 88 7-28 23-60 22-88-7Z"
        fill="currentColor"
        fillOpacity=".8"
      />
      <path
        d="M401 378c22-9 48-8 71 3M354 95c7 27 18 47 35 64"
        stroke="var(--paper)"
        strokeWidth="1.3"
      />
      <g fill="currentColor" fillOpacity=".25">
        <circle cx="100" cy="125" r="3" />
        <circle cx="115" cy="125" r="3" />
        <circle cx="130" cy="125" r="3" />
        <circle cx="100" cy="140" r="3" />
        <circle cx="115" cy="140" r="3" />
        <circle cx="130" cy="140" r="3" />
      </g>
    </svg>
  );
}
