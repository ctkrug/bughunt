import type { KeyValueStore } from "./storage";

const MUTE_KEY = "bughunt:muted:v1";

export function loadMuted(store: KeyValueStore): boolean {
  return store.getItem(MUTE_KEY) === "1";
}

export function saveMuted(store: KeyValueStore, muted: boolean): void {
  store.setItem(MUTE_KEY, muted ? "1" : "0");
}

export type SfxName = "select" | "correct" | "incorrect" | "win";

interface Note {
  frequency: number;
  delay: number;
  duration: number;
  type: OscillatorType;
}

/** Short synthesized blips per effect — no audio files, generated at runtime. */
const SFX: Record<SfxName, Note[]> = {
  select: [{ frequency: 440, delay: 0, duration: 0.05, type: "square" }],
  incorrect: [{ frequency: 180, delay: 0, duration: 0.16, type: "sawtooth" }],
  correct: [
    { frequency: 660, delay: 0, duration: 0.09, type: "sine" },
    { frequency: 880, delay: 0.08, duration: 0.12, type: "sine" },
  ],
  win: [
    { frequency: 523, delay: 0, duration: 0.1, type: "triangle" },
    { frequency: 659, delay: 0.1, duration: 0.1, type: "triangle" },
    { frequency: 784, delay: 0.2, duration: 0.18, type: "triangle" },
  ],
};

type AudioContextCtor = new () => AudioContext;

function getAudioContextCtor(): AudioContextCtor | undefined {
  if (typeof window === "undefined") return undefined;
  const withWebkit = window as typeof window & {
    webkitAudioContext?: AudioContextCtor;
  };
  return withWebkit.AudioContext ?? withWebkit.webkitAudioContext;
}

/**
 * Plays short synthesized SFX. The AudioContext is created lazily (browsers
 * block autoplay before a user gesture) and every call is guarded so a
 * missing/broken WebAudio implementation — including test environments —
 * never throws.
 */
export class SoundEngine {
  private ctx: AudioContext | null = null;
  private muted: boolean;

  constructor(initialMuted: boolean) {
    this.muted = initialMuted;
  }

  isMuted(): boolean {
    return this.muted;
  }

  setMuted(muted: boolean): void {
    this.muted = muted;
  }

  private ensureContext(): AudioContext | null {
    if (this.muted) return null;
    if (this.ctx) return this.ctx;
    const Ctor = getAudioContextCtor();
    if (!Ctor) return null;
    try {
      this.ctx = new Ctor();
      return this.ctx;
    } catch {
      return null;
    }
  }

  play(name: SfxName): void {
    const ctx = this.ensureContext();
    if (!ctx) return;
    try {
      for (const note of SFX[name]) {
        const oscillator = ctx.createOscillator();
        const gain = ctx.createGain();
        oscillator.type = note.type;
        oscillator.frequency.value = note.frequency;
        gain.gain.setValueAtTime(0.0001, ctx.currentTime + note.delay);
        gain.gain.exponentialRampToValueAtTime(
          0.15,
          ctx.currentTime + note.delay + 0.01,
        );
        gain.gain.exponentialRampToValueAtTime(
          0.0001,
          ctx.currentTime + note.delay + note.duration,
        );
        oscillator.connect(gain);
        gain.connect(ctx.destination);
        oscillator.start(ctx.currentTime + note.delay);
        oscillator.stop(ctx.currentTime + note.delay + note.duration + 0.02);
      }
    } catch {
      // Never let a synth glitch break gameplay.
    }
  }
}
