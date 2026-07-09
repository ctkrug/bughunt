import { afterEach, describe, expect, it, vi } from "vitest";
import { createMemoryStore } from "../src/storage";
import { SoundEngine, loadMuted, saveMuted } from "../src/sound";

class MockGain {
  gain = {
    setValueAtTime: vi.fn(),
    exponentialRampToValueAtTime: vi.fn(),
  };
  connect = vi.fn();
}

class MockOscillator {
  type = "";
  frequency = { value: 0 };
  connect = vi.fn();
  start = vi.fn();
  stop = vi.fn();
}

class MockAudioContext {
  static instances: MockAudioContext[] = [];
  currentTime = 0;
  destination = {};
  oscillators: MockOscillator[] = [];
  constructor() {
    MockAudioContext.instances.push(this);
  }
  createOscillator() {
    const osc = new MockOscillator();
    this.oscillators.push(osc);
    return osc;
  }
  createGain() {
    return new MockGain();
  }
}

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

describe("SoundEngine with a WebAudio implementation available", () => {
  afterEach(() => {
    delete (globalThis as { window?: unknown }).window;
    MockAudioContext.instances = [];
  });

  it("plays one oscillator per note in the effect, connected and started", () => {
    (globalThis as { window?: unknown }).window = {
      AudioContext: MockAudioContext,
    };
    const engine = new SoundEngine(false);
    engine.play("win");
    expect(MockAudioContext.instances).toHaveLength(1);
    const ctx = MockAudioContext.instances[0]!;
    // "win" has 3 notes (see SFX table in src/sound.ts)
    expect(ctx.oscillators).toHaveLength(3);
    for (const osc of ctx.oscillators) {
      expect(osc.connect).toHaveBeenCalledTimes(1);
      expect(osc.start).toHaveBeenCalledTimes(1);
      expect(osc.stop).toHaveBeenCalledTimes(1);
    }
  });

  it("lazily creates the AudioContext once and reuses it across plays", () => {
    (globalThis as { window?: unknown }).window = {
      AudioContext: MockAudioContext,
    };
    const engine = new SoundEngine(false);
    expect(MockAudioContext.instances).toHaveLength(0);
    engine.play("select");
    expect(MockAudioContext.instances).toHaveLength(1);
    engine.play("correct");
    expect(MockAudioContext.instances).toHaveLength(1);
  });

  it("falls back to webkitAudioContext when AudioContext is unavailable", () => {
    (globalThis as { window?: unknown }).window = {
      webkitAudioContext: MockAudioContext,
    };
    const engine = new SoundEngine(false);
    engine.play("select");
    expect(MockAudioContext.instances).toHaveLength(1);
  });

  it("never throws and stays unmuted-but-silent if the constructor throws", () => {
    class ThrowingAudioContext {
      constructor() {
        throw new Error("no audio hardware");
      }
    }
    (globalThis as { window?: unknown }).window = {
      AudioContext: ThrowingAudioContext,
    };
    const engine = new SoundEngine(false);
    expect(() => engine.play("select")).not.toThrow();
  });

  it("never throws if oscillator.start throws mid-playback", () => {
    class ExplodingOscillator extends MockOscillator {
      constructor() {
        super();
        this.start = vi.fn(() => {
          throw new Error("boom");
        });
      }
    }
    class ExplodingAudioContext extends MockAudioContext {
      override createOscillator() {
        const osc = new ExplodingOscillator();
        this.oscillators.push(osc);
        return osc;
      }
    }
    (globalThis as { window?: unknown }).window = {
      AudioContext: ExplodingAudioContext,
    };
    const engine = new SoundEngine(false);
    expect(() => engine.play("select")).not.toThrow();
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
