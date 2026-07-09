import { describe, expect, it } from "vitest";
import { createMemoryStore } from "../src/storage";
import {
  dismissOnboarding,
  isOnboardingDismissed,
  shouldShowOnboarding,
} from "../src/onboarding";

describe("isOnboardingDismissed / dismissOnboarding", () => {
  it("is false before dismissal", () => {
    const store = createMemoryStore();
    expect(isOnboardingDismissed(store)).toBe(false);
  });

  it("is true after dismissal", () => {
    const store = createMemoryStore();
    dismissOnboarding(store);
    expect(isOnboardingDismissed(store)).toBe(true);
  });

  it("persists across separate reads of the same store", () => {
    const store = createMemoryStore();
    dismissOnboarding(store);
    expect(isOnboardingDismissed(store)).toBe(true);
    expect(isOnboardingDismissed(store)).toBe(true);
  });
});

describe("shouldShowOnboarding", () => {
  it("shows for a first-time visitor who hasn't dismissed it", () => {
    const store = createMemoryStore();
    expect(shouldShowOnboarding(store, false)).toBe(true);
  });

  it("hides once dismissed, even for a first-time visitor", () => {
    const store = createMemoryStore();
    dismissOnboarding(store);
    expect(shouldShowOnboarding(store, false)).toBe(false);
  });

  it("hides for anyone who has already played, dismissed or not", () => {
    const store = createMemoryStore();
    expect(shouldShowOnboarding(store, true)).toBe(false);
  });
});
