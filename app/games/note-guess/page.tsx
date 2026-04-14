'use client';

import { useState, useCallback, useEffect } from 'react';
import { useLang } from '@/lib/i18n';
import Header from '@/components/Header';
import Piano from '@/components/Piano';
import Staff from '@/components/Staff';
import DifficultySelector from '@/components/DifficultySelector';
import { DifficultyLevel, difficultyConfigs } from '@/lib/difficulty';
import { generateRange, NoteInfo, getRandomNote } from '@/lib/notes';
import { initAudio, playNote } from '@/lib/audio';

export default function NoteGuessPage() {
  const { t } = useLang();
  const [difficulty, setDifficulty] = useState<DifficultyLevel>(1);
  const [started, setStarted] = useState(false);
  const [targetNote, setTargetNote] = useState<NoteInfo | null>(null);
  const [score, setScore] = useState(0);
  const [total, setTotal] = useState(0);
  const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);
  const [hints, setHints] = useState(difficultyConfigs[1].hintsAllowed);
  const [showHint, setShowHint] = useState(false);

  const config = difficultyConfigs[difficulty];
  const notes = generateRange(config.startOctave, config.endOctave).filter(
    (n) => config.includeBlackKeys || !n.isBlack
  );

  const pickNewNote = useCallback(() => {
    const available = generateRange(config.startOctave, config.endOctave).filter(
      (n) => config.includeBlackKeys || !n.isBlack
    );
    const note = getRandomNote(available);
    setTargetNote(note);
    setFeedback(null);
    setShowHint(false);
  }, [config]);

  const handleStart = async () => {
    await initAudio();
    setStarted(true);
    setScore(0);
    setTotal(0);
    setHints(config.hintsAllowed);
    pickNewNote();
  };

  const handleNotePlay = (note: NoteInfo) => {
    if (!targetNote || feedback) return;
    setTotal((p) => p + 1);
    if (note.note === targetNote.note) {
      setScore((p) => p + 1);
      setFeedback('correct');
      setTimeout(pickNewNote, 1200);
    } else {
      setFeedback('incorrect');
      setTimeout(() => setFeedback(null), 800);
    }
  };

  const handleHint = () => {
    if (hints > 0 && targetNote) {
      setHints((h) => h - 1);
      setShowHint(true);
      playNote(targetNote.note);
    }
  };

  const handleListen = () => {
    if (targetNote) {
      playNote(targetNote.note);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 flex flex-col items-center px-4 py-8">
        <h1 className="text-3xl font-bold text-white mb-4">&#x1F3BC; {t.noteGuess}</h1>

        {!started ? (
          <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 max-w-lg w-full text-center">
            <p className="text-white/80 mb-6">{t.whatNote}</p>
            <DifficultySelector value={difficulty} onChange={(d) => { setDifficulty(d); setHints(difficultyConfigs[d].hintsAllowed); }} />
            <button
              onClick={handleStart}
              className="mt-6 px-8 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-full font-bold text-lg shadow-lg hover:shadow-xl transition-all"
            >
              {t.start}
            </button>
          </div>
        ) : (
          <>
            {/* Score bar */}
            <div className="flex gap-6 mb-4 text-white font-bold">
              <span>{t.score}: {score}/{total}</span>
              <button
                onClick={handleHint}
                disabled={hints === 0}
                className="px-4 py-1 bg-yellow-400/80 text-gray-800 rounded-full text-sm disabled:opacity-40"
              >
                &#x1F4A1; {t.hint} ({hints})
              </button>
              <button
                onClick={handleListen}
                className="px-4 py-1 bg-green-400/80 text-gray-800 rounded-full text-sm"
              >
                &#x1F50A; {t.listen}
              </button>
            </div>

            {/* Staff display */}
            <div className="bg-white rounded-2xl p-4 shadow-xl mb-4 flex flex-col items-center">
              {targetNote && (
                <Staff note={targetNote.note} showName={showHint} />
              )}
              {feedback === 'correct' && (
                <div className="text-green-500 font-bold text-2xl animate-bounce-in">&#x2B50; {t.correct}</div>
              )}
              {feedback === 'incorrect' && (
                <div className="text-red-500 font-bold text-xl animate-shake">{t.incorrect}</div>
              )}
            </div>

            {/* Piano */}
            <div className="w-full max-w-4xl bg-white/10 backdrop-blur-md rounded-3xl p-6 shadow-xl">
              <Piano
                startOctave={config.startOctave}
                endOctave={config.endOctave}
                onNotePlay={handleNotePlay}
                highlightNotes={showHint && targetNote ? [targetNote.note] : []}
              />
            </div>
          </>
        )}
      </main>
    </div>
  );
}
