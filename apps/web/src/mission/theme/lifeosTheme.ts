import { lifeosTheme } from '@lifeos/shared';

/** Impact bands: 0-39 Low, 40-69 Moderate, 70-84 High, 85-100 Critical. Colors come from @lifeos/shared. */
export const impactColor = (v: number): string =>
  v >= 85 ? lifeosTheme.colors.danger : v >= 70 ? lifeosTheme.colors.warning : v >= 40 ? lifeosTheme.colors.electricBlue : lifeosTheme.colors.textMuted;
