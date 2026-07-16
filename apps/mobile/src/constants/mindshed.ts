// MindSHED design tokens — the "original DNA, refined" language.
// See docs/REDESIGN.md §7. Light-first; dark mode is a v1.1 concern.

export const MS = {
  color: {
    cream: '#FFF9DA',
    ink: '#2B2B26',
    inkSoft: '#44443C',
    mint: '#B6FFB1',
    mintSoft: '#D6F7B8',
    sage: '#A8C9AC',
    sageSoft: '#E8F1E4',
    forest: '#315B45',
    forestMuted: '#66806E',
    yellow: '#FFDC75',
    orange: '#FFB173',
    red: '#FF8A7D',
    sky: '#C7E9F4',
    skyDeep: '#87CEEB',
    skyPale: '#E8F5F4',
    dusk: '#7FA8B8',
    white: '#FFFFFF',
    surface: '#FFFEF7',
    surfaceWarm: '#FBF4D9',
    wood: '#8A6F4D',
    woodLight: '#B58557',
    hill: '#D6F7B8',
    grass: '#B6FFB1',
    mountain: '#AECFC0',
    muted: '#6E6C60',
    faint: '#6F7168',
    paper: '#F4E3C5',
    danger: '#A32D2D',
    shadow: '#405344',
  },
  radius: { sm: 10, md: 14, lg: 18, xl: 24, pill: 999 },
  border: 1.5,
  space: { xs: 4, sm: 8, md: 12, lg: 16, xl: 24 },
  font: {
    display: 'HappyMonkey_400Regular',
    body: 'Nunito_400Regular',
    bodyBold: 'Nunito_600SemiBold',
    heading: 'Nunito_700Bold',
  },
} as const;

// Mood scale: 1 (rough) → 5 (great). Colours come from the pastel ramp.
export const MOODS = [
  { value: 1, color: MS.color.red, icon: 'emoticon-cry-outline' },
  { value: 2, color: MS.color.orange, icon: 'emoticon-sad-outline' },
  { value: 3, color: MS.color.yellow, icon: 'emoticon-neutral-outline' },
  { value: 4, color: MS.color.mintSoft, icon: 'emoticon-happy-outline' },
  { value: 5, color: MS.color.mint, icon: 'emoticon-excited-outline' },
] as const;
