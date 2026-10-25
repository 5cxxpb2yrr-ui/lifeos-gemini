export interface Weights { urgency: number; exposure: number; consequence: number; completeness: number; freshness: number }
export const DEFAULT_WEIGHTS: Weights = { urgency: 0.5, exposure: 0.3, consequence: 0.2, completeness: 0.6, freshness: 0.4 };

export interface Inputs { urgency: number; exposure: number; consequence: number; completeness: number; freshness: number }
export interface Score { impact: number; confidence: number; factors: [string, number][] }
export interface Option { name: string; value: number; safety: number; fit: number }

export const band = (v: number) => (v >= 85 ? 'Critical' : v >= 70 ? 'High' : v >= 40 ? 'Moderate' : 'Low');

/** Days until due (negative = overdue) -> 0..1 */
export const urgency = (days: number) => (days < 0 ? 1 : days <= 3 ? 0.9 : days <= 7 ? 0.75 : days <= 14 ? 0.5 : days <= 30 ? 0.3 : 0.1);
/** Dollars at stake -> 0..1 (about $10k saturates) */
export const exposure = (amount: number) => Math.min(1, Math.log10(1 + Math.max(0, amount)) / 4);
/** Days since last update -> 0..1 (unknown is treated as 90 days) */
export const freshness = (daysSinceUpdate: number | null) => {
  const d = daysSinceUpdate ?? 90;
  return d <= 30 ? 1 : d <= 90 ? 0.7 : 0.5;
};
export const completeness = (o: Record<string, unknown>, keys: string[]) =>
  keys.filter((k) => o[k] !== undefined && o[k] !== null && o[k] !== '').length / keys.length;

export function score(i: Inputs, w: Weights = DEFAULT_WEIGHTS): Score {
  const si = w.urgency + w.exposure + w.consequence || 1;
  const sf = w.completeness + w.freshness || 1;
  return {
    impact: Math.round((100 * (w.urgency * i.urgency + w.exposure * i.exposure + w.consequence * i.consequence)) / si),
    confidence: Math.round((100 * (w.completeness * i.completeness + w.freshness * i.freshness)) / sf),
    factors: [
      ['Urgency', i.urgency], ['Exposure', i.exposure], ['Consequence', i.consequence],
      ['Data completeness', i.completeness], ['Freshness', i.freshness],
    ],
  };
}

export const optionScore = (o: Option) => Number(((o.value + o.safety + o.fit) / 3).toFixed(1));
export const rankOptions = (os: Option[] = []) => [...os].sort((a, b) => optionScore(b) - optionScore(a));
export const recommend = (os: Option[] = []) => rankOptions(os)[0];

/** Share of a weight within its group (impact group or confidence group), in whole percent. */
export const share = (w: Weights, k: keyof Weights) => {
  const g = k === 'completeness' || k === 'freshness' ? w.completeness + w.freshness : w.urgency + w.exposure + w.consequence;
  return Math.round((100 * w[k]) / (g || 1));
};
