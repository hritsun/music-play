export interface NoteInfo {
  note: string;      // e.g. 'C4', 'D#4'
  name: string;      // e.g. 'C', 'D#'
  octave: number;
  isBlack: boolean;
  midi: number;
  frequency: number;
}

const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const WHITE_NOTES = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];

export function midiToFrequency(midi: number): number {
  return 440 * Math.pow(2, (midi - 69) / 12);
}

export function noteToMidi(note: string, octave: number): number {
  const index = NOTE_NAMES.indexOf(note);
  return (octave + 1) * 12 + index;
}

export function generateOctave(octave: number): NoteInfo[] {
  return NOTE_NAMES.map((name) => {
    const midi = noteToMidi(name, octave);
    return {
      note: `${name}${octave}`,
      name,
      octave,
      isBlack: name.includes('#'),
      midi,
      frequency: midiToFrequency(midi),
    };
  });
}

export function generateRange(startOctave: number, endOctave: number): NoteInfo[] {
  const notes: NoteInfo[] = [];
  for (let oct = startOctave; oct <= endOctave; oct++) {
    notes.push(...generateOctave(oct));
  }
  return notes;
}

export function getWhiteKeys(notes: NoteInfo[]): NoteInfo[] {
  return notes.filter((n) => !n.isBlack);
}

export function getBlackKeys(notes: NoteInfo[]): NoteInfo[] {
  return notes.filter((n) => n.isBlack);
}

export function getRandomNote(notes: NoteInfo[]): NoteInfo {
  return notes[Math.floor(Math.random() * notes.length)];
}

export function getRandomWhiteNote(octave: number): NoteInfo {
  const whiteNotes = generateOctave(octave).filter((n) => !n.isBlack);
  return whiteNotes[Math.floor(Math.random() * whiteNotes.length)];
}

export function getSemitoneDistance(note1: string, oct1: number, note2: string, oct2: number): number {
  return Math.abs(noteToMidi(note2, oct2) - noteToMidi(note1, oct1));
}

export function intervalToSemitones(interval: number): number {
  const map: Record<number, number> = {
    1: 0, 2: 2, 3: 4, 4: 5, 5: 7, 6: 9, 7: 11, 8: 12,
  };
  return map[interval] ?? 0;
}

export { NOTE_NAMES, WHITE_NOTES };
