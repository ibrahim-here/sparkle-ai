// Color Palette
export const COLORS = {
  primary: '#8B5CF6',
  secondary: '#020617',
  accent: '#22D3EE',
  neutral: '#0F172A',
  glow: 'rgba(139, 92, 246, 0.4)',
  text: {
    primary: '#FFFFFF',
    secondary: '#94A3B8',
    tertiary: '#64748B',
    muted: '#475569',
  },
} as const;

// Typography
export const TYPOGRAPHY = {
  fontFamily: {
    logo: 'Inter',
    heading: 'Playfair Display',
    body: 'Inter',
    button: 'Inter',
  },
  fontSize: {
    logo: '24px',
    heroTitle: { desktop: '72px', mobile: '48px' },
    sectionTitle: '48px',
    cardTitle: '24px',
    featureTitle: '22px',
    body: '18px',
    bodySmall: '16px',
    button: '18px',
  },
  fontWeight: {
    logo: 700,
    heading: 600,
    body: 400,
    bodyMedium: 500,
    button: 500,
  },
  lineHeight: {
    tight: 1.2,
    normal: 1.4,
    relaxed: 1.5,
    loose: 1.6,
  },
} as const;

// Spacing
export const SPACING = {
  section: {
    vertical: '120px',
    horizontal: '80px',
  },
  card: {
    padding: '32px',
    gap: '32px',
  },
} as const;

// Breakpoints
export const BREAKPOINTS = {
  mobile: 768,
  tablet: 1024,
  desktop: 1440,
} as const;
