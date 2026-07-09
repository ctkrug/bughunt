import { describe, expect, it } from "vitest";
import { createMemoryStore } from "../src/storage";
import { SoundEngine, loadMuted, saveMuted } from "../src/sound";

describe("SoundEngine", () => {
  it("defaults isMuted to the constructor argument", () => {
    expect(new SoundEngine(true).isMuted()).toBe(true);
    expect(new SoundEngine(false).isMuted()).toBe(false);
  });

  it("setMuted updates isMuted", () => {
    const engine = new SoundEngine(false);
    engine.setMuted(true);
    expect(engine.isMuted()).toBe(true);
  });

  it("play() never throws in an environment without WebAudio", () => {
    const engine = new SoundEngine(false);
    expect(() => engine.play("select")).not.toThrow();
    expect(() => engine.play("correct")).not.toThrow();
    expect(() => engine.play("incorrect")).not.toThrow();
    expect(() => engine.play("win")).not.toThrow();
  });

  it("play() is a no-op while muted and still never throws", () => {
    const engine = new SoundEngine(true);
    expect(() => engine.play("win")).not.toThrow();
  });
});

describe("mute persistence", () => {
  it("defaults to unmuted when nothing is stored", () => {
    const store = createMemoryStore();
    expect(loadMuted(store)).toBe(false);
  });

  it("round-trips true and false", () => {
    const store = createMemoryStore();
    saveMuted(store, true);
    expect(loadMuted(store)).toBe(true);
    saveMuted(store, false);
    expect(loadMuted(store)).toBe(false);
  });
});
