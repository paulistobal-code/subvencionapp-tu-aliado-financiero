export function Logo({ size = 32, className = "" }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="SubvencionApp"
    >
      <rect x="2" y="2" width="36" height="36" rx="8" stroke="#C9A84C" strokeWidth="1.5" fill="transparent" />
      <path
        d="M27 13.5c-1.7-1.5-4-2.3-6.4-2.3-3.7 0-6.6 2-6.6 5 0 2.7 2 4 5.6 4.8l2 .5c2.4.6 3.6 1.2 3.6 2.5 0 1.4-1.6 2.4-4 2.4-2.4 0-4.4-.9-6-2.4"
        stroke="#C9A84C"
        strokeWidth="2.2"
        strokeLinecap="round"
        fill="none"
      />
      <line x1="11" y1="17" x2="22" y2="17" stroke="#C9A84C" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="11" y1="21" x2="20" y2="21" stroke="#C9A84C" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}
