export function Logo({ size = 34 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      role="img"
      aria-label="Ghostflame logo: a ghost-blue sphere inside a thin ember ring"
      className="logo"
    >
      <circle cx="20" cy="20" r="18.1" fill="none" stroke="var(--ember)" strokeWidth="1.5" />
      <circle cx="20" cy="20" r="10.4" fill="var(--ghost)" fillOpacity="0.88" />
      <circle cx="16.4" cy="16.2" r="3.4" fill="var(--bone)" fillOpacity="0.18" />
    </svg>
  );
}
