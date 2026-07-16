export interface GardenMilestone {
  id: string;
  at: number;
  title: string;
  shortTitle: string;
  description: string;
  icon: string;
  zone: 'meadow' | 'path' | 'grove' | 'pond' | 'light' | 'kitchen' | 'studio';
}

// Each milestone changes one large, named garden zone. The thresholds remain
// compatible with existing local progress while the visual system is rebuilt.
export const GARDEN_MILESTONES: GardenMilestone[] = [
  { id: 'meadow-awakens', at: 1, title: 'The meadow edge awakened', shortTitle: 'Meadow edge', description: 'Soft seed heads and clover now frame Bramble’s resting place.', icon: 'wind', zone: 'meadow' },
  { id: 'stepping-stones', at: 3, title: 'The stepping-stone trail appeared', shortTitle: 'Stone trail', description: 'A clear curved route now leads from the gate to the studio.', icon: 'navigation', zone: 'path' },
  { id: 'young-grove', at: 5, title: 'The young grove found its place', shortTitle: 'Young grove', description: 'A small tree and hanging feeder make a sheltered corner for visitors.', icon: 'feather', zone: 'grove' },
  { id: 'pond-awakens', at: 7, title: 'The pond awakened', shortTitle: 'Living pond', description: 'Reeds, water leaves and widening ripples now make the pond feel alive.', icon: 'droplet', zone: 'pond' },
  { id: 'evening-glow', at: 10, title: 'The evening glow arrived', shortTitle: 'Evening glow', description: 'Low lanterns and firefly-like lights make the route feel safe after dusk.', icon: 'sun', zone: 'light' },
  { id: 'kitchen-garden', at: 14, title: 'The kitchen garden took root', shortTitle: 'Kitchen garden', description: 'Rosemary, mint and thyme now fill a generous raised bed.', icon: 'coffee', zone: 'kitchen' },
  { id: 'garden-sanctuary', at: 18, title: 'The garden became a sanctuary', shortTitle: 'Garden sanctuary', description: 'A living roof, climbing leaves and habitat wall bring every garden zone together.', icon: 'home', zone: 'studio' },
];

export type GardenRestStateId = 'waiting' | 'bright' | 'quiet' | 'resting';

export interface GardenRestState {
  id: GardenRestStateId;
  title: string;
  description: string;
  daysSinceLastCheckin?: number;
}

export const GARDEN_REST_STATES: Record<GardenRestStateId, Omit<GardenRestState, 'daysSinceLastCheckin'>> = {
  waiting: { id: 'waiting', title: 'Waiting with you', description: 'Nothing is wilting. The first check-in will bring a little movement to the garden.' },
  bright: { id: 'bright', title: 'Bright and awake', description: 'The garden is carrying the warmth of your recent visit.' },
  quiet: { id: 'quiet', title: 'A quiet few days', description: 'The light has softened while the habitat rests. Everything you unlocked is still here.' },
  resting: { id: 'resting', title: 'Resting season', description: 'The garden has settled into a calm season. Your next visit will brighten it, with nothing lost.' },
};

function dateOrdinal(dateKey: string) {
  const [year, month, day] = dateKey.split('-').map(Number);
  if (!year || !month || !day) return undefined;
  return Math.floor(Date.UTC(year, month - 1, day) / 86_400_000);
}

function localDateKey(date = new Date()) {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Time away changes ambience only. It never reduces `gardenGrowth`, removes an
 * unlocked milestone or creates a streak-repair obligation.
 */
export function getGardenRestState(checkinDates: string[], today = localDateKey()): GardenRestState {
  const todayOrdinal = dateOrdinal(today);
  const latestOrdinal = checkinDates.map(dateOrdinal).filter((value): value is number => value !== undefined).sort((a, b) => b - a)[0];
  if (todayOrdinal === undefined || latestOrdinal === undefined) {
    return GARDEN_REST_STATES.waiting;
  }

  const days = Math.max(0, todayOrdinal - latestOrdinal);
  if (days <= 2) return { ...GARDEN_REST_STATES.bright, daysSinceLastCheckin: days };
  if (days <= 6) return { ...GARDEN_REST_STATES.quiet, daysSinceLastCheckin: days };
  return { ...GARDEN_REST_STATES.resting, daysSinceLastCheckin: days };
}

export function getGardenProgress(growth: number) {
  const safeGrowth = Math.max(0, Math.floor(growth));
  const unlocked = GARDEN_MILESTONES.filter((milestone) => safeGrowth >= milestone.at);
  const current = unlocked.at(-1);
  const next = GARDEN_MILESTONES.find((milestone) => safeGrowth < milestone.at);
  const previousAt = current?.at ?? 0;
  const span = next ? next.at - previousAt : 1;
  const progressToNext = next ? Math.min(1, Math.max(0, (safeGrowth - previousAt) / span)) : 1;
  const justUnlocked = GARDEN_MILESTONES.find((milestone) => milestone.at === safeGrowth);

  return {
    growth: safeGrowth,
    unlocked,
    current,
    next,
    justUnlocked,
    progressToNext,
    remaining: next ? Math.max(0, next.at - safeGrowth) : 0,
  };
}

export function gardenGrowthSummary(growth: number) {
  const progress = getGardenProgress(growth);
  if (progress.justUnlocked) return { eyebrow: 'A NEW GARDEN CHAPTER', title: progress.justUnlocked.title, detail: progress.justUnlocked.description };
  if (progress.next) {
    return {
      eyebrow: 'THE HABITAT IS SETTLING IN',
      title: progress.current?.shortTitle ?? 'The meadow is nearly awake',
      detail: `${progress.remaining} more ${progress.remaining === 1 ? 'check-in' : 'check-ins'} until ${progress.next.shortTitle.toLowerCase()} appears.`,
    };
  }
  return { eyebrow: 'THE HABITAT IS COMPLETE', title: 'A complete garden sanctuary', detail: 'Every garden zone is here. Quiet seasons can change the atmosphere, but never remove what you built.' };
}
