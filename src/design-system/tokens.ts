/**
 * Playful Trust: Retail Edition - Typed Design Tokens
 */

export const RETAIL_TOKENS = {
  colors: {
    bg: '#FBFAF7',
    surface: '#FFFFFF',
    ink: '#1E293B',
    textMain: '#0F172A',
    textMuted: '#64748B',
    primary: '#4F46E5', // Indigo 600
    secondary: '#7C3AED', // Violet 600
    border: '#E2E8F0',
    confetti: {
      pink: '#F472B6',
      amber: '#FBBF24',
      mint: '#34D399',
    },
    status: {
      healthy: { text: '#059669', bg: '#ECFDF5', border: '#A7F3D0' },
      risk: { text: '#B45309', bg: '#FFFBEB', border: '#FDE68A' },
      critical: { text: '#B91C1C', bg: '#FEF2F2', border: '#FECACA' },
      info: { text: '#4338CA', bg: '#EEF2FF', border: '#C7D2FE' },
    },
    chart: ['#4F46E5', '#7C3AED', '#0EA5E9', '#14B8A6', '#F59E0B', '#94A3B8'],
  },
  shadows: {
    trust: '0 4px 20px -2px rgba(79,70,229,0.10)',
    trustHover: '0 10px 25px -5px rgba(79,70,229,0.15), 0 8px 10px -6px rgba(79,70,229,0.10)',
    pop: '4px 4px 0 0 #1E293B',
    popHover: '6px 6px 0 0 #1E293B',
    popActive: '2px 2px 0 0 #1E293B',
  },
  typography: {
    heading: "'Outfit', system-ui, sans-serif",
    body: "'Plus Jakarta Sans', system-ui, sans-serif",
    mono: "'JetBrains Mono', monospace",
  },
  easing: {
    bounce: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
  },
};
