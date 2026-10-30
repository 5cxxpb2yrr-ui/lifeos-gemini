import { renderToString } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { CaptureChips } from '../../src/mission/components/CaptureChips';
import { LinkSheet } from '../../src/mission/components/LinkSheet';
import { SyncCard } from '../../src/mission/components/SyncCard';
import { parseCap } from '../../src/mission/lib/capture';
import { Inbox } from '../../src/mission/screens/Inbox';
import { More } from '../../src/mission/screens/More';
import { SEED } from '../../src/mission/seed';

const nav = { open() {}, push() {}, pop() {}, close() {} };

describe('link and sync UI', () => {
  it('renders project and goal sheets', () => {
    expect(renderToString(<LinkSheet kind="goal" item={SEED.goals[4]} nav={nav} />)).toContain('Annual: Build a balanced life');
    expect(renderToString(<LinkSheet kind="project" item={SEED.projects[0]} nav={nav} />)).toContain('Front Suspension Refresh');
  });
  it('shows resolved and unknown tags differently', () => {
    const html = renderToString(<CaptureChips parsed={parseCap('x >refresh ^half >mystery')} people={SEED.people} projects={SEED.projects} goals={SEED.goals} onNewProject={() => {}} />).replace(/<!-- -->/g, '');
    expect(html).toContain('Front Suspension Refresh ✓');
    expect(html).toContain('Run a half marathon ✓');
    expect(html).toContain('mystery · add');
  });
  it('renders the sync card and keeps it in More and Inbox working', () => {
    expect(renderToString(<SyncCard />)).toContain('Sync between devices');
    expect(renderToString(<More onView={() => {}} />)).toContain('Sync between devices');
    expect(renderToString(<Inbox people={SEED.people} links={{ projects: SEED.projects, goals: SEED.goals }} />)).toContain('Inbox');
  });
});
