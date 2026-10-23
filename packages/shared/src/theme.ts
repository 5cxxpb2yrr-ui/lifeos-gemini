export const lifeosTheme = {
  colors: {
    // Canvas & Surfaces
    bgCanvas: '#0A0B0D',
    bgSurface1: '#111318',
    bgSurface2: '#151820',
    bgSurface3: '#1A1F29',

    // Core Brand Dual-Glow
    electricBlue: '#3B82F6',
    electricBlueGlow: '#2563EB',
    fireAmber: '#F59E0B',
    fireRed: '#EF4444',
    phoenixGradient: 'linear-gradient(135deg, #F59E0B 0%, #EF4444 50%, #3B82F6 100%)',

    // Status Colors
    success: '#22C55E',
    warning: '#F59E0B',
    danger: '#EF4444',

    // Typography
    textPrimary: '#F8FAFC',
    textSecondary: '#A1AAB8',
    textMuted: '#6B7280',
  },

  glows: {
    hero: '0 0 45px rgba(59, 130, 246, 0.25)',
    risk: '0 0 35px rgba(245, 158, 11, 0.20)',
    icon: '0 0 20px rgba(59, 130, 246, 0.40)',
  },

  radii: {
    card: '28px',
    button: '20px',
    badge: '12px',
  },
};

export type LifeosTheme = typeof lifeosTheme;

// Motion durations (ms), carried over from the original scaffold tokens
export const motion = { fast: 120, normal: 180, slow: 240 };
