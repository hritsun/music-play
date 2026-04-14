'use client';

import { useState, useCallback, useEffect } from 'react';
import { useLang } from '@/lib/i18n';
import { generateRange, NoteInfo } from '@/lib/notes';
import { initAudio, playNote } from '@/lib/audio';

interface PianoProps {
  startOctave?: number;
  endOctave?: number;
  highlightNotes?: string[];
  onNotePlay?: (note: NoteInfo) => void;
  showLabels?: boolean;
  disabled?: boolean;
}

export default function Piano({
  startOctave = 4,
  endOctave = 5,
  highlightNotes = [],
  onNotePlay,
  showLabels = true,
  disabled = false,
}: PianoProps) {
  const { t } = useLang();
  const [activeNotes, setActiveNotes] = useState<Set<string>>(new Set());
  const [audioReady, setAudioReady] = useState(false);

  const notes = generateRange(startOctave, endOctave);
  const whiteKeys = notes.filter((n) => !n.isBlack);
  const blackKeys = notes.filter((n) => n.isBlack);

  const handleInit = useCallback(async () => {
    if (!audioReady) {
      await initAudio();
      setAudioReady(true);
    }
  }, [audioReady]);

  const handleNoteDown = useCallback(
    async (note: NoteInfo) => {
      if (disabled) return;
      await handleInit();
      playNote(note.note);
      setActiveNotes((prev) => new Set(prev).add(note.note));
      onNotePlay?.(note);
    },
    [disabled, handleInit, onNotePlay]
  );

  const handleNoteUp = useCallback((note: NoteInfo) => {
    setActiveNotes((prev) => {
      const next = new Set(prev);
      next.delete(note.note);
      return next;
    });
  }, []);

  // Keyboard mapping: Z-M for white keys bottom octave, Q-U for upper
  useEffect(() => {
    const lowerRow = 'zsxdcvgbhnjm';
    const upperRow = 'q2w3er5t6y7u';

    const keyMap = new Map<string, NoteInfo>();
    const whiteKeysLower = notes.filter(n => !n.isBlack && n.octave === startOctave);
    const blackKeysLower = notes.filter(n => n.isBlack && n.octave === startOctave);
    const whiteKeysUpper = notes.filter(n => !n.isBlack && n.octave === endOctave);
    const blackKeysUpper = notes.filter(n => n.isBlack && n.octave === endOctave);

    // Map lower row: z=C, s=C#, x=D, d=D#, c=E, v=F, g=F#, b=G, h=G#, n=A, j=A#, m=B
    const allLower = [...whiteKeysLower];
    blackKeysLower.forEach((bk) => {
      const idx = allLower.findIndex(wk => wk.midi > bk.midi);
      if (idx >= 0) allLower.splice(idx, 0, bk);
      else allLower.push(bk);
    });
    const sortedLower = notes.filter(n => n.octave === startOctave).sort((a, b) => a.midi - b.midi);
    sortedLower.forEach((note, i) => {
      if (i < lowerRow.length) keyMap.set(lowerRow[i], note);
    });

    const sortedUpper = notes.filter(n => n.octave === endOctave).sort((a, b) => a.midi - b.midi);
    sortedUpper.forEach((note, i) => {
      if (i < upperRow.length) keyMap.set(upperRow[i], note);
    });

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.repeat) return;
      const note = keyMap.get(e.key.toLowerCase());
      if (note) handleNoteDown(note);
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      const note = keyMap.get(e.key.toLowerCase());
      if (note) handleNoteUp(note);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [notes, startOctave, endOctave, handleNoteDown, handleNoteUp]);

  const getNoteName = (note: NoteInfo) => {
    const names = t.notesNames as Record<string, string>;
    return names[note.name] || note.name;
  };

  const isHighlighted = (note: NoteInfo) => highlightNotes.includes(note.note) || highlightNotes.includes(note.name);

  // Calculate black key positions relative to white keys
  const blackKeyPositions: { note: NoteInfo; leftPercent: number }[] = [];
  const whiteKeyWidth = 100 / whiteKeys.length;

  blackKeys.forEach((bk) => {
    // Find the white key just before this black key
    const whiteIndex = whiteKeys.findIndex((wk) => wk.midi > bk.midi) - 1;
    if (whiteIndex >= 0) {
      blackKeyPositions.push({
        note: bk,
        leftPercent: (whiteIndex + 1) * whiteKeyWidth - whiteKeyWidth * 0.3,
      });
    }
  });

  return (
    <div className="w-full max-w-4xl mx-auto select-none">
      {!audioReady && (
        <button
          onClick={handleInit}
          className="mb-4 mx-auto block px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full font-bold text-lg shadow-lg hover:shadow-xl transition-all animate-pulse"
        >
          {t.pressKey}
        </button>
      )}
      <div className="relative" style={{ height: '220px' }}>
        {/* White keys */}
        <div className="flex h-full">
          {whiteKeys.map((note) => (
            <button
              key={note.note}
              onPointerDown={() => handleNoteDown(note)}
              onPointerUp={() => handleNoteUp(note)}
              onPointerLeave={() => handleNoteUp(note)}
              className={`relative flex-1 border border-gray-300 rounded-b-lg transition-all duration-75
                ${activeNotes.has(note.note)
                  ? 'bg-purple-200 shadow-inner translate-y-0.5'
                  : isHighlighted(note)
                  ? 'bg-yellow-200 shadow-md'
                  : 'bg-white hover:bg-gray-50 shadow-md'
                }
              `}
            >
              {showLabels && (
                <span className="absolute bottom-3 left-1/2 -translate-x-1/2 text-xs font-bold text-gray-500">
                  {getNoteName(note)}
                </span>
              )}
            </button>
          ))}
        </div>
        {/* Black keys */}
        {blackKeyPositions.map(({ note, leftPercent }) => (
          <button
            key={note.note}
            onPointerDown={(e) => { e.stopPropagation(); handleNoteDown(note); }}
            onPointerUp={() => handleNoteUp(note)}
            onPointerLeave={() => handleNoteUp(note)}
            className={`absolute top-0 rounded-b-lg transition-all duration-75 z-10
              ${activeNotes.has(note.note)
                ? 'bg-purple-700 shadow-inner translate-y-0.5'
                : isHighlighted(note)
                ? 'bg-yellow-600 shadow-md'
                : 'bg-gray-900 hover:bg-gray-800 shadow-lg'
              }
            `}
            style={{
              left: `${leftPercent}%`,
              width: `${whiteKeyWidth * 0.6}%`,
              height: '60%',
            }}
          >
            {showLabels && (
              <span className="absolute bottom-2 left-1/2 -translate-x-1/2 text-[10px] font-bold text-gray-300">
                {getNoteName(note)}
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
