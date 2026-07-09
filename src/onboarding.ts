import type { KeyValueStore } from "./storage";

const DISMISSED_KEY = "bughunt:onboarding-dismissed:v1";

export function isOnboardingDismissed(store: KeyValueStore): boolean {
  return store.getItem(DISMISSED_KEY) === "1";
}

export function dismissOnboarding(store: KeyValueStore): void {
  store.setItem(DISMISSED_KEY, "1");
}

/**
 * Whether the how-to-play overlay should show: only for a visitor who has
 * never recorded a result AND hasn't already dismissed it. `hasPlayed`
 * comes from streak.hasStreakRecord so a returning player who lost their
 * streak isn't mistaken for a first-timer.
 */
export function shouldShowOnboarding(
  store: KeyValueStore,
  hasPlayed: boolean,
): boolean {
  return !hasPlayed && !isOnboardingDismissed(store);
}
