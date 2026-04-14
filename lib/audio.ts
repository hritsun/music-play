'use client';

import * as Tone from 'tone';

let synth: Tone.PolySynth | null = null;
let metronome: Tone.MembraneSynth | null = null;
let initialized = false;

export async function initAudio() {
  if (initialized) return;
  await Tone.start();
  synth = new Tone.PolySynth(Tone.Synth, {
    oscillator: { type: 'triangle' },
    envelope: {
      attack: 0.005,
      decay: 0.3,
      sustain: 0.4,
      release: 1.2,
    },
  }).toDestination();
  metronome = new Tone.MembraneSynth({
    pitchDecay: 0.01,
    octaves: 6,
    envelope: { attack: 0.001, decay: 0.2, sustain: 0, release: 0.1 },
  }).toDestination();
  initialized = true;
}

export function playNote(note: string, duration: string = '8n') {
  if (!synth) return;
  synth.triggerAttackRelease(note, duration);
}

export function playNotes(notes: string[], duration: string = '8n') {
  if (!synth) return;
  synth.triggerAttackRelease(notes, duration);
}

export function playClick() {
  if (!metronome) return;
  metronome.triggerAttackRelease('C2', '32n');
}

export async function playMelody(notes: string[], tempo: number = 120) {
  if (!synth) return;
  const interval = 60 / tempo;
  for (let i = 0; i < notes.length; i++) {
    synth.triggerAttackRelease(notes[i], '8n', Tone.now() + i * interval);
  }
  return new Promise<void>((resolve) => {
    setTimeout(resolve, notes.length * interval * 1000 + 500);
  });
}

export async function playRhythm(pattern: number[], tempo: number = 100) {
  if (!metronome) return;
  const beatDuration = 60 / tempo;
  let time = Tone.now();
  for (const beat of pattern) {
    metronome.triggerAttackRelease('C2', '32n', time);
    time += beat * beatDuration;
  }
  return new Promise<void>((resolve) => {
    const totalTime = pattern.reduce((a, b) => a + b, 0) * beatDuration;
    setTimeout(resolve, totalTime * 1000 + 300);
  });
}

export function isAudioInitialized() {
  return initialized;
}
