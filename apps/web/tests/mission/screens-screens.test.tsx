import { renderToString } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { BillSheet } from '../../src/mission/components/BillSheet';
import { ItemDetail } from '../../src/mission/components/ItemDetail';
import { PersonSheet } from '../../src/mission/components/PersonSheet';
import { resolve } from '../../src/mission/lib/resolve';
import { SEED } from '../../src/mission/seed';
import App from '../../src/mission/MissionApp';
import { Entities } from '../../src/mission/screens/Entities';
import { Inbox } from '../../src/mission/screens/Inbox';
import { More } from '../../src/mission/screens/More';
import { Search } from '../../src/mission/screens/Search';
import { Agenda, Memory, People, SystemCheck } from '../../src/mission/screens/Views';

const nav = { open() {}, push() {}, pop() {}, close() {} };
const noop = () => {};

describe('screens render', () => {
  it('renders every tab', () => {
    expect(renderToString(<Inbox people={[{ id: '1', name: 'Marcus Chen' }]} />)).toContain('Inbox is clear');
    expect(renderToString(<Entities entities={[{ id: 'a', name: 'Vehicle', type: 'Asset', open: 1 }]} />)).toContain('Vehicle');
    expect(renderToString(<Search items={[{ id: 'a', title: 'Pay bill' }]} />)).toContain('Pay bill');
    expect(renderToString(<More onView={noop} />)).toContain('Scoring weights');
    const app = renderToString(<App />);
    expect(app).toContain('NEXT BEST ACTION');
    expect(app).toContain('Pay HVAC Repair');
  });
  it('renders the secondary views', () => {
    expect(renderToString(<SystemCheck data={SEED} inboxCount={0} go={noop} onBack={noop} />)).toContain('System check');
    expect(renderToString(<Agenda data={SEED} open={noop} onBack={noop} />)).toContain('Overdue');
    expect(renderToString(<People data={SEED} open={noop} onAdd={noop} onBack={noop} />)).toContain('Marcus Chen');
    expect(renderToString(<Memory data={SEED} archive={[]} open={noop} onBack={noop} />)).toContain('Payments');
  });
  it('renders the sheets', () => {
    const bill = { ...SEED.bills[3], apr: 6.9, minimum: 412.5, remainingBalance: 3000 };
    const html = renderToString(<BillSheet bill={bill} nav={nav} now={new Date('2026-10-24T12:00:00')} />);
    expect(html).toContain('Payoff projection');
    expect(html).toContain('Balance over time');
    const dec = resolve(SEED).items.find((i) => i.kind === 'decision')!;
    expect(renderToString(<ItemDetail rec={dec} data={SEED} nav={nav} onAct={noop} />)).toContain('Add option');
    expect(renderToString(<PersonSheet person={SEED.people[0]} nav={nav} />)).toContain('Log contact today');
  });
});
