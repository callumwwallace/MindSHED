import { router, type Href } from 'expo-router';

/**
 * Close a screen without assuming it was pushed from inside the app.
 * Direct links, restored navigation state and a completed modal dismissal can
 * all leave a route with no back entry; Expo warns if `back()` is dispatched
 * in that state.
 */
export function goBackOrReplace(fallback: Href): void {
  if (router.canGoBack()) router.back();
  else router.replace(fallback);
}
