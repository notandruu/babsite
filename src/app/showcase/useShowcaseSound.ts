"use client";

import { useCallback, useRef, useState } from "react";

interface SoundNodes {
  gain: GainNode;
  oscillators: OscillatorNode[];
  lfo: OscillatorNode;
}

/**
 * Lazily-created ambient drone, gated behind the first user gesture (browser
 * autoplay policy). Toggling crossfades the master gain rather than
 * starting/stopping oscillators, so re-enabling is instant.
 */
export function useShowcaseSound() {
  const [enabled, setEnabled] = useState(false);
  const ctxRef = useRef<AudioContext | null>(null);
  const nodesRef = useRef<SoundNodes | null>(null);

  const ensureContext = useCallback((): AudioContext => {
    if (ctxRef.current) return ctxRef.current;

    const ctx = new AudioContext();

    const masterGain = ctx.createGain();
    masterGain.gain.value = 0;
    masterGain.connect(ctx.destination);

    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 850;
    filter.Q.value = 0.4;
    filter.connect(masterGain);

    const baseFreqs = [110, 165.51, 220];
    const oscillators = baseFreqs.map((freq, i) => {
      const osc = ctx.createOscillator();
      osc.type = "sine";
      osc.frequency.value = freq;
      const voiceGain = ctx.createGain();
      voiceGain.gain.value = i === 0 ? 0.55 : 0.2;
      osc.connect(voiceGain);
      voiceGain.connect(filter);
      osc.start();
      return osc;
    });

    const lfo = ctx.createOscillator();
    lfo.type = "sine";
    lfo.frequency.value = 0.055;
    const lfoGain = ctx.createGain();
    lfoGain.gain.value = 240;
    lfo.connect(lfoGain);
    lfoGain.connect(filter.frequency);
    lfo.start();

    nodesRef.current = { gain: masterGain, oscillators, lfo };
    ctxRef.current = ctx;
    return ctx;
  }, []);

  const toggle = useCallback(() => {
    const ctx = ensureContext();
    if (ctx.state === "suspended") void ctx.resume();
    const nodes = nodesRef.current;
    if (!nodes) return;

    setEnabled((prev) => {
      const next = !prev;
      const now = ctx.currentTime;
      nodes.gain.gain.cancelScheduledValues(now);
      nodes.gain.gain.setValueAtTime(nodes.gain.gain.value, now);
      nodes.gain.gain.linearRampToValueAtTime(next ? 0.045 : 0, now + (next ? 1.4 : 0.5));
      return next;
    });
  }, [ensureContext]);

  return { enabled, toggle };
}
