const paths: Record<string, React.ReactNode> = {
  brain: (
    <>
      <path d="M9 4a3 3 0 0 0-5 3 4 4 0 0 0-1 7 4 4 0 0 0 6 5V4Zm6 0a3 3 0 0 1 5 3 4 4 0 0 1 1 7 4 4 0 0 1-6 5V4Z" />
      <path d="M6 9h3m-4 5h4m6-5h3m-3 5h4" />
    </>
  ),
  person: (
    <>
      <circle cx="12" cy="4" r="2" />
      <path d="m4 8 8 3 8-3m-8 3v5m0 0-4 6m4-6 4 6" />
    </>
  ),
  plane: (
    <path d="m3 10 7 1 6-7c2-2 4 0 2 2l-6 8 1 7-3-3-1-3-4 2-2-2 4-3-4-2Z" />
  ),
  leaf: (
    <>
      <path d="M20 4C9 2 3 7 5 14c2 7 13 6 15-10Z" />
      <path d="m4 21 12-12M10 15v-5m0 5h5" />
    </>
  ),
  moon: <path d="M20 15A8 8 0 0 1 9 4a8 8 0 1 0 11 11Z" />,
  heart: (
    <>
      <path d="M20 5c-3-3-7-1-8 1-2-3-6-4-9-1-5 6 9 15 9 15S25 11 20 5Z" />
      <path d="M4 12h4l2-4 3 7 2-3h5" />
    </>
  ),
  clipboard: (
    <>
      <rect x="5" y="5" width="14" height="16" rx="2" />
      <rect x="9" y="3" width="6" height="4" rx="1" />
      <path d="M9 11h6M9 15h6" />
    </>
  ),
  scale: (
    <>
      <rect x="4" y="4" width="16" height="16" rx="4" />
      <path d="M8 10a5 5 0 0 1 8 0M12 8v4" />
    </>
  ),
  activity: <path d="M2 12h5l3-8 4 16 3-8h5" />,
  sun: (
    <>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1 1m12 12 1 1M5 19l1-1M18 6l1-1" />
    </>
  ),
  shield: (
    <>
      <path d="m12 3 8 3v6c0 5-8 9-8 9s-8-4-8-9V6Z" />
      <path d="m8 12 3 3 5-6" />
    </>
  ),
  pill: (
    <>
      <path d="m8 4-4 4a5 5 0 0 0 7 7l4-4a5 5 0 0 0-7-7Z" />
      <path d="m6 6 7 7m1 4 4 4m0-4-4 4" />
    </>
  ),
  search: (
    <>
      <circle cx="10" cy="10" r="6" />
      <path d="m15 15 5 5" />
    </>
  ),
  book: (
    <>
      <path d="M12 5C8 2 3 4 3 4v15s5-2 9 1c4-3 9-1 9-1V4s-5-2-9 1v15" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </>
  ),
  check: <path d="m5 12 4 4L19 6" />,
  plus: <path d="M12 4v16M4 12h16" />,
};
export function Icon({
  name,
  className = "",
}: {
  name: string;
  className?: string;
}) {
  return (
    <svg
      className={className}
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths[name] || paths.leaf}
    </svg>
  );
}
