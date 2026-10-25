import { useState } from 'react';
import { money } from '../lib/dates';
import type { Nav } from '../nav';
import { useStore } from '../store';
import type { Bill } from '../types';
import { btn, btnP, field, lbl } from '../ui';

export function PayForm({ bill, nav }: { bill: Bill; nav: Nav }) {
  const pay = useStore((s) => s.pay);
  const [amt, setAmt] = useState(String(bill.minimum || bill.remainingBalance));
  const n = Number(amt);
  return (
    <div>
      <h2 className="text-xl font-semibold">Record payment</h2>
      <p className="text-sm text-[var(--text-2)]">{bill.title} · remaining {money(bill.remainingBalance)}</p>
      <input className={`${field} mt-3`} type="number" inputMode="decimal" value={amt} onChange={(e) => setAmt(e.target.value)} aria-label="Amount" />
      <div className="mt-3 flex gap-2">
        <button disabled={!(n > 0)} onClick={() => { pay(bill.id, n); nav.pop(); }} className={`${btnP} flex-1 disabled:opacity-50`}>Save payment</button>
        <button onClick={nav.pop} className={`${btn} flex-1`}>‹ Back</button>
      </div>
    </div>
  );
}

export function TermsForm({ bill, nav }: { bill: Bill; nav: Nav }) {
  const terms = useStore((s) => s.terms);
  const last = bill.paymentHistory?.[(bill.paymentHistory?.length ?? 0) - 1]?.amount;
  const [apr, setApr] = useState(bill.apr === undefined ? '' : String(bill.apr));
  const [min, setMin] = useState(String(bill.minimum ?? last ?? ''));
  return (
    <div>
      <h2 className="text-xl font-semibold">Loan terms</h2>
      <p className="text-sm text-[var(--text-2)]">{bill.title} · remaining {money(bill.remainingBalance)}</p>
      <h4 className={lbl}>APR (%)</h4><input className={field} type="number" inputMode="decimal" step="0.01" value={apr} onChange={(e) => setApr(e.target.value)} placeholder="e.g. 6.9" />
      <h4 className={lbl}>Monthly payment</h4><input className={field} type="number" inputMode="decimal" value={min} onChange={(e) => setMin(e.target.value)} />
      <div className="mt-3 flex gap-2">
        <button onClick={() => { terms(bill.id, { apr: apr === '' ? undefined : Number(apr), minimum: Number(min) || undefined }); nav.pop(); }} className={`${btnP} flex-1`}>Save terms</button>
        <button onClick={nav.pop} className={`${btn} flex-1`}>‹ Back</button>
      </div>
    </div>
  );
}
