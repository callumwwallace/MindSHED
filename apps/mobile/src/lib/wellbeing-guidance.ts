import type { Checkin } from '@/store/wellness';

export interface CareSuggestion {
  title: string;
  detail: string;
  action: string;
  route: '/grounding' | '/journal' | '/breathe' | '/activities';
  icon: string;
  tone: string;
}

export function getCareSuggestion(checkin?: Checkin): CareSuggestion {
  if (!checkin) return { title: 'Pause and notice', detail: 'A short check-in can help the rest of the app meet you where you are.', action: 'Check in', route: '/activities', icon: 'compass', tone: '#E8F1E4' };
  if (checkin.mood <= 2 || checkin.stress >= 8 || checkin.needs?.includes('Grounding')) {
    return { title: 'Find the room around you', detail: 'A slow, untimed 5–4–3–2–1 grounding exercise. Stop whenever you want.', action: 'Ground with Bramble', route: '/grounding', icon: 'anchor', tone: '#DDECEF' };
  }
  if (checkin.energy <= 3 || checkin.needs?.includes('Rest')) {
    return { title: 'Make the plan smaller', detail: 'Put one thing down in the shed. A few words—or none—are enough.', action: 'Go inside the shed', route: '/journal', icon: 'book-open', tone: '#F2D7B8' };
  }
  if (checkin.stress >= 6 || checkin.needs?.includes('Calm')) {
    return { title: 'Let the pace soften', detail: 'Breathe at the bench for two minutes, with a visible rhythm and no score.', action: 'Visit the bench', route: '/breathe', icon: 'wind', tone: '#D9E8E2' };
  }
  return { title: 'Keep it gently moving', detail: 'Choose one small action that fits the capacity you have today.', action: 'Choose one gentle thing', route: '/activities', icon: 'compass', tone: '#E8F1E4' };
}
