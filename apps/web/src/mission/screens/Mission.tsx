import { NextBestActionCard } from '../components/NextBestActionCard';
import { RecommendationCard } from '../components/RecommendationCard';
import { ReviewQueue } from '../components/ReviewQueue';
import { Section } from '../components/Section';
import { pickHero, type QueueItem } from '../lib/resolve';
import type { Kind, Rec } from '../types';

export function Mission({ items, queue, onAction, onMore }: { items: Rec[]; queue: QueueItem[]; onAction: (r: Rec, a: string) => void; onMore: (k: Kind) => void }) {
  const hero = pickHero(items);
  if (!hero) return <p className="rounded-[28px] border border-[#22C55E55] p-6 text-center text-[var(--opp)]">Everything is handled. Enjoy the calm.</p>;
  const rest = items.filter((i) => i !== hero);
  const by = (k: Kind) => rest.filter((i) => i.kind === k);
  const label = (text: string, k: Kind) => text + (by(k).length > 1 ? ` · +${by(k).length - 1} more` : '');
  const card = (r: Rec | undefined, k: Kind, text: string, variant: 'default' | 'decision' | 'risk' | 'relationship' = 'default', max = 1) =>
    r && <RecommendationCard key={r.id} rec={r} variant={variant} label={label(text, k)} maxActions={max} onLabel={by(k).length > 1 ? () => onMore(k) : undefined} onAction={(_, a) => onAction(r, a)} />;
  return (
    <>
      <div className="mb-3"><NextBestActionCard rec={hero} onAction={(_, a) => onAction(hero, a)} /></div>
      <Section>{[card(by('execute')[0], 'execute', '⚡ EXECUTE NOW'), card(by('decision')[0], 'decision', 'DECISIONS REQUIRED', 'decision')]}</Section>
      {by('risk')[0] && <Section full>{card(by('risk')[0], 'risk', '⚠ AT RISK', 'risk', 2)}</Section>}
      {by('waiting')[0] && <Section>{card(by('waiting')[0], 'waiting', '⏳ WAITING')}</Section>}
      {by('relationship')[0] && <Section full>{card(by('relationship')[0], 'relationship', '♥ RELATIONSHIP REPAIRS', 'relationship', 3)}</Section>}
      <ReviewQueue items={queue.map((q) => ({ id: q.id, title: q.title, note: q.note }))} />
    </>
  );
}
