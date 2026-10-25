import { impactColor } from '../theme/lifeosTheme';

export function ScoreRing({ label, value, suffix = '', color }: { label: string; value: number; suffix?: string; color?: string }) {
  const c = color ?? impactColor(value);
  return (
    <div className="text-[11px] text-[var(--text-2)]">
      {label}
      <div className="flex items-center gap-1.5 text-base font-semibold text-[var(--text)]">
        <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden>
          <circle cx="12" cy="12" r="9" fill="none" stroke="#26334f" strokeWidth="3" />
          <circle cx="12" cy="12" r="9" fill="none" stroke={c} strokeWidth="3" strokeLinecap="round"
            strokeDasharray={`${value * 0.5655} 100`} transform="rotate(-90 12 12)" />
        </svg>
        {value}{suffix}
      </div>
    </div>
  );
}
