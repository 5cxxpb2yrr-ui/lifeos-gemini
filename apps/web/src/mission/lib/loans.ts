import { addMonths, iso, money, startOfDay } from './dates';
import type { Bill } from '../types';

export interface Plan { months: number; interest: number }
export interface Row { label: string; plan: Plan | null; payoff: string | null }

/** Month-by-month paydown. Returns null if the payment never covers the interest. */
export function simulate(balance: number, apr: number, payment: number): Plan | null {
  const i = apr / 1200;
  let b = balance, n = 0, t = 0;
  while (b > 0.005 && n < 600) {
    const it = b * i;
    if (payment <= it) return null;
    t += it; b = b + it - payment; n++;
  }
  return { months: n, interest: t };
}

export function projection(balance: number, apr: number, payment: number, now = new Date()): Row[] {
  return [0, 50, 100].map((extra) => {
    const plan = simulate(balance, apr, payment + extra);
    return { label: extra ? `+$${extra}` : `${money(payment)}/mo`, plan, payoff: plan ? addMonths(iso(startOfDay(now)), plan.months) : null };
  });
}

/** Balance before the first payment, then after each payment (works backward from the current balance). */
export function balanceSeries(bill: Bill) {
  const P = [...(bill.paymentHistory ?? [])].sort((a, b) => a.date.localeCompare(b.date));
  let bal = bill.remainingBalance;
  const after: number[] = [];
  for (let i = P.length - 1; i >= 0; i--) { after[i] = bal; bal += P[i].amount; }
  return { payments: P, values: P.length ? [bal, ...after] : [] };
}
