export function Illustration({ compact = false }: { compact?: boolean }) {
  return (
    <svg
      viewBox="0 0 640 520"
      className={compact ? "article-art" : "hero-art"}
      role="img"
      aria-label="窗邊的綠色植物、書本與一杯溫茶，象徵日常健康生活"
    >
      <defs>
        <linearGradient id="window-light" x1="0" y1="0" x2="1" y2="1">
          <stop stopColor="#ecf2e9" />
          <stop offset="1" stopColor="#d9e6d9" />
        </linearGradient>
        <linearGradient id="leaf-light">
          <stop stopColor="#9bb89d" />
          <stop offset="1" stopColor="#6b917c" />
        </linearGradient>
      </defs>
      <path
        fill="#edf2ed"
        d="M78 425V235C78 116 166 48 282 48h67c120 0 211 87 211 202v175Z"
      />
      <path
        fill="url(#window-light)"
        d="M127 385V233c0-98 68-151 151-151h55c99 0 173 68 173 159v144Z"
      />
      <path d="M314 84v302M129 242h377" stroke="#fff" strokeWidth="8" />
      <circle cx="420" cy="160" r="39" fill="#f9fbf3" />
      <path
        d="M128 333c90-66 126 9 191-20s104-48 187-6v80H128Z"
        fill="#bdceba"
        opacity=".65"
      />
      <path
        d="M158 388c40-69 126-66 185-14s117-20 163-20v37Z"
        fill="#96b399"
        opacity=".4"
      />
      <ellipse
        cx="327"
        cy="444"
        rx="254"
        ry="20"
        fill="#ccdacd"
        opacity=".35"
      />
      <path d="M80 419h483" stroke="#9bafa0" strokeWidth="3" />
      <path d="m177 328 12 96h71l13-96Z" fill="#e4e8dd" />
      <ellipse cx="225" cy="328" rx="48" ry="10" fill="#bac9b5" />
      <path
        d="M224 329c-6-60-7-116 15-174m-17 151-49-70m50 36 43-67m-39 14-42-54"
        fill="none"
        stroke="#5a7c62"
        strokeWidth="3"
      />
      <path
        d="M237 202c-32-26-25-58 10-75 9 33 6 55-10 75Z"
        fill="url(#leaf-light)"
      />
      <path d="M205 222c-35 1-56-26-54-54 35 3 50 18 54 54Z" fill="#92ac8c" />
      <path d="M229 268c-1-41 27-64 56-65-2 34-20 56-56 65Z" fill="#668f75" />
      <path d="M197 280c-33-2-59-26-59-55 34-2 58 23 59 55Z" fill="#799b7d" />
      <path d="M222 311c16-36 43-47 69-37-10 29-34 39-69 37Z" fill="#9ab298" />
      <path
        d="m307 406 86-9 98 12-80 19Z"
        fill="#f8f8ee"
        stroke="#a4b3a2"
        strokeWidth="2"
      />
      <path
        d="M307 406v12l105 18 79-17v-10m-79 19v8"
        fill="#e2e8d9"
        stroke="#a4b3a2"
        strokeWidth="2"
      />
      <path
        d="m327 394 65-15 79 14-58 20Z"
        fill="#fdfdf4"
        stroke="#bac4b2"
        strokeWidth="2"
      />
      <path
        d="M392 379v14l21 20m-68-17 44 8m28-5 35-7"
        fill="none"
        stroke="#c3cbb8"
        strokeWidth="2"
      />
      <path
        d="M443 334h53v40c0 26-53 26-53 0Z"
        fill="#fafbf4"
        stroke="#a6b8a5"
        strokeWidth="2"
      />
      <path
        d="M496 342h9c24 0 19 32-9 32"
        fill="none"
        stroke="#a6b8a5"
        strokeWidth="4"
      />
      <ellipse cx="470" cy="334" rx="26" ry="6" fill="#c3b79a" />
      <path
        d="M461 315c-12-15 13-18 1-34m17 33c-12-15 13-18 1-34"
        fill="none"
        stroke="#afc2ab"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M97 123h20m-10-10v20M540 296h17m-8-8v16"
        stroke="#b2c4ac"
        strokeWidth="2"
      />
    </svg>
  );
}
