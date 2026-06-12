// MindSHED design tokens — the "original DNA, refined" language.
// See docs/REDESIGN.md §7. Light-first; dark mode is a v1.1 concern.

export const MS = {
  color: {
    cream: '#FFF9DA',
    ink: '#2B2B26',
    mint: '#B6FFB1',
    mintSoft: '#D6F7B8',
    yellow: '#FFDC75',
    orange: '#FFB173',
    red: '#FF8A7D',
    sky: '#C7E9F4',
    skyDeep: '#87CEEB',
    dusk: '#7FA8B8',
    white: '#FFFFFF',
    wood: '#8A6F4D',
    woodLight: '#B58557',
    hill: '#D6F7B8',
    grass: '#B6FFB1',
    mountain: '#AECFC0',
    muted: '#6E6C60',
    faint: '#8A887D',
    paper: '#F4E3C5',
    danger: '#A32D2D',
  },
  radius: { sm: 10, md: 12, lg: 16, xl: 20, pill: 24 },
  border: 2,
  space: { xs: 4, sm: 8, md: 12, lg: 16, xl: 24 },
  font: {
    display: 'HappyMonkey_400Regular',
    body: 'Nunito_400Regular',
    bodyBold: 'Nunito_600SemiBold',
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
