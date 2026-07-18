"use client";

/**
 * Lightweight procedural sound effects via the Web Audio API — no external
 * audio assets required. Each effect is a short synthesized tone/sweep.
 */

type EffectName = "click" | "bet" | "win" | "bigWin" | "lose" | "coin" | "cardFlip" | "spin" | "notify" | "levelUp";

class SoundEngine {
  private ctx: AudioContext | null = null;

  private getCtx(): AudioContext | null {
    if (typeof window === "undefined") return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === "suspended") this.ctx.resume();
    return this.ctx;
  }

  private tone(freq: number, duration: number, type: OscillatorType = "sine", startGain = 0.15, delay = 0) {
    const ctx = this.getCtx();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime + delay);
    gain.gain.setValueAtTime(startGain, ctx.currentTime + delay);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(ctx.currentTime + delay);
    osc.stop(ctx.currentTime + delay + duration);
  }

  private sweep(freqStart: number, freqEnd: number, duration: number, type: OscillatorType = "sine", gainAmount = 0.15) {
    const ctx = this.getCtx();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freqStart, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(freqEnd, ctx.currentTime + duration);
    gain.gain.setValueAtTime(gainAmount, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + duration);
  }

  play(effect: EffectName) {
    switch (effect) {
      case "click":
        this.tone(760, 0.05, "triangle", 0.08);
        break;
      case "bet":
        this.tone(320, 0.08, "sine", 0.12);
        break;
      case "spin":
        this.sweep(220, 440, 0.35, "sawtooth", 0.06);
        break;
      case "cardFlip":
        this.tone(500, 0.06, "square", 0.05);
        break;
      case "coin":
        this.tone(1200, 0.08, "sine", 0.12);
        this.tone(1600, 0.1, "sine", 0.1, 0.05);
        break;
      case "win":
        this.tone(523, 0.12, "sine", 0.14);
        this.tone(659, 0.12, "sine", 0.14, 0.1);
        this.tone(784, 0.2, "sine", 0.14, 0.2);
        break;
      case "bigWin":
        [523, 659, 784, 988, 1175].forEach((f, i) => this.tone(f, 0.2, "triangle", 0.16, i * 0.09));
        break;
      case "lose":
        this.sweep(400, 120, 0.3, "sawtooth", 0.1);
        break;
      case "levelUp":
        [392, 523, 659, 784, 1046].forEach((f, i) => this.tone(f, 0.18, "sine", 0.15, i * 0.08));
        break;
      case "notify":
        this.tone(880, 0.08, "sine", 0.1);
        this.tone(1108, 0.1, "sine", 0.08, 0.08);
        break;
    }
  }
}

export const soundEngine = new SoundEngine();
