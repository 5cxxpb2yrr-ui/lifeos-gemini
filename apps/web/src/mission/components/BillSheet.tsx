import { BalanceChart } from './BalanceChart';
import { money } from '../lib/dates';
import { projection } from '../lib/loans';
import type { Nav } from '../nav';
import type { Bill } from '../types';
import { btn, btnP, lbl, row } from '../ui';

export function BillSheet({ bill, nav, now = new Date() }: { bill: Bill; nav: Nav; now?: Date }) {
  const paid = bill.originalBalance ? Math.max(0, Math.min(100, ((bill.originalBalance - bill.remainingBalance) / bill.originalBalance) * 100)) : 0;
  const rows = bill.minimum && bill.remainingBalance > 0 ? projection(bill.remainingBalance, bill.apr ?? 0, bill.minimum, now) : null;
  const history = [...(bill.paymentHistory ?? [])].reverse();
  const stat = (l: string, v: string) => <div><p className="text-[11px] text-[var(--text-2)]">{l}</p><b>{v}</b></div>;
  return (
    <div>
      <h2 className="text-xl font-semibold">{bill.title}</h2>
      <p className="text-sm text-[var(--text-2)]">{[bill.payee, bill.category, bill.isRecurring ? 'Recurring' : ''].filter(Boolean).join(' · ')}</p>
      <div className="mt-3 flex gap-6">{stat('Remaining', money(bill.remainingBalance))}{stat('Original', money(bill.originalBalance))}{stat('Due', bill.dueDate ?? '—')}</div>
      <div className="mt-3 h-2 overflow-hidden rounded bg-[#26334f]"><i className="block h-full bg-[var(--opp)]" style={{ width: `${paid}%` }} /></div>
      <p className="mt-1 text-xs text-[var(--text-2)]">{Math.round(paid)}% paid{bill.apr ? ` · APR ${bill.apr}%` : ''}{bill.minimum ? ` · Minimum ${money(bill.minimum)}` : ''}</p>
      <BalanceChart bill={bill} />
      {bill.remainingBalance > 0 && (
        <div>
          <h4 className={lbl}>Payoff projection</h4>
          {rows ? (
            <table className="w-full text-[13px]"><thead><tr className="text-[var(--text-2)]"><th className="p-1 text-left font-medium" /><th className="p-1 text-right font-medium">Time</th><th className="p-1 text-right font-medium">Paid off</th><th className="p-1 text-right font-medium">Interest</th></tr></thead>
              <tbody>{rows.map((r) => (
                <tr key={r.label} className="border-t border-[var(--line)]"><td className="p-1">{r.label}</td><td className="p-1 text-right">{r.plan ? `${r.plan.months} mo` : 'Never'}</td>
                  <td className="p-1 text-right">{r.payoff ? new Date(r.payoff + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : '—'}</td><td className="p-1 text-right">{r.plan ? money(r.plan.interest) : '—'}</td></tr>
              ))}</tbody></table>
          ) : <p className="text-sm text-[var(--text-2)]">Add an APR and monthly payment to see a payoff date.</p>}
          <button onClick={() => nav.push({ kind: 'terms', id: bill.id })} className={`${btn} mt-2 w-full`}>{rows ? 'Edit terms' : 'Add terms'}</button>
        </div>
      )}
      <h4 className={lbl}>Payment history</h4>
      {history.length ? history.map((p, i) => <div key={i} className={row}><span>{p.date.slice(0, 10)}<span className="block text-xs text-[var(--text-2)]">{p.note}</span></span><b>{money(p.amount)}</b></div>) : <p className="text-sm text-[var(--text-2)]">No payments recorded yet.</p>}
      <div className="mt-3 flex gap-2"><button onClick={() => nav.push({ kind: 'pay', id: bill.id })} className={`${btnP} flex-1`}>Record payment</button><button onClick={nav.pop} className={`${btn} flex-1`}>‹ Back</button></div>
    </div>
  );
}
