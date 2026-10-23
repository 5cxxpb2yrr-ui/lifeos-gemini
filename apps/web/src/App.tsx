import type { Recommendation } from '@lifeos/domain';
import { lifeosTheme as t } from '@lifeos/shared';
import { NextBestActionCard } from './components/NextBestActionCard';

// Sample data until the API/graph layer exists
const nba: Recommendation = {
  id: 'rec-1',
  entityId: 'property-1',
  title: 'Contact Georgia Power',
  category: 'execute_now',
  recommendation: 'regarding service transfer.',
  whyThisMatters: 'Your move date is in 6 days. No transfer request is currently open.',
  expectedOutcome: 'Prevent utility interruption for your upcoming move and avoid late fees.',
  impactScore: 92,
  confidenceScore: 88,
  urgencyScore: 90,
  actions: ['Call Now', 'Start Online'],
};

export default function App() {
  const today = new Date().toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

  return (
    <div
      className="min-h-screen px-4 pb-8 pt-[max(1rem,env(safe-area-inset-top))]"
      style={{ background: t.colors.bgCanvas, color: t.colors.textPrimary }}
    >
      <div className="mx-auto max-w-md">
        <header className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">LifeOS</h1>
            <p className="text-xs" style={{ color: t.colors.textSecondary }}>
              Mission Control
            </p>
          </div>
          <div className="text-right">
            <p className="flex items-center justify-end gap-1.5 text-sm font-medium">
              <span className="h-2 w-2 rounded-full" style={{ background: t.colors.success }} />
              You’re on track
            </p>
            <p className="text-xs" style={{ color: t.colors.textMuted }}>
              {today}
            </p>
          </div>
        </header>

        <NextBestActionCard recommendation={nba} onAction={(a) => console.log(a)} />
      </div>
    </div>
  );
}
