'use client';

import { useState, useCallback } from 'react';
import { useLang } from '@/lib/i18n';
import Header from '@/components/Header';
import Piano from '@/components/Piano';
import DifficultySelector from '@/components/DifficultySelector';
import { DifficultyLevel, difficultyConfigs } from '@/lib/difficulty';
import { generateRange, NoteInfo, getRandomNote } from '@/lib/notes';
import { initAudio, playMelody } from '@/lib/audio';

export default function MelodyPage() {
  const { t } = useLang();
  const [difficulty, setDifficulty] = useState<DifficultyLevel>(1);
  const [started, setStarted] = useState(false);
  const [targetMelody, setTargetMelody] = useState<NoteInfo[]>([]);
  const [playerNotes, setPlayerNotes] = useState<string[]>([]);
  const [score, setScore] = useState(0);
  const [total, setTotal] = useState(0);
  const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const config = difficultyConfigs[difficulty];
  const melodyLength = difficulty === 1 ? 3 : difficulty === 2 ? 4 : 5;

  const generateMelody = useCallback(() => {
    const notes = generateRange(config.startOctave, config.endOctave).filter(
      (n) => config.includeBlackKeys || !n.isBlack
    );
    const melody: NoteInfo[] = [];
    for (let i = 0; i < melodyLength; i++) {
      melody.push(getRandomNote(notes));
    }
    setTargetMelody(melody);
    setPlayerNotes([]);
    setFeedback(null);
    return melody;
  }, [config, melodyLength]);

  const playCurrentMelody = async (melody: NoteInfo[]) => {
    setIsPlaying(true);
    await playMelody(melody.map((n) => n.note));
    setIsPlaying(false);
  };

  const handleStart = async () => {
    await initAudio();
    setStarted(true);
    setScore(0);
    setTotal(0);
    const melody = generateMelody();
    setTimeout(() => playCurrentMelody(melody), 500);
  };

  const handleNotePlay = (note: NoteInfo) => {
    if (feedback || isPlaying) return;
    const newNotes = [...playerNotes, note.note];
    setPlayerNotes(newNotes);

    // Check each note as it's played
    const idx = newNotes.length - 1;
    if (targetMelody[idx].note !== note.note) {
      setTotal((p) => p + 1);
      setFeedback('incorrect');
      setTimeout(() => {
        const melody = generateMelody();
        setTimeout(() => playCurrentMelody(melody), 300);
      }, 1000);
      return;
    }

    // All notes correct
    if (newNotes.length === targetMelody.length) {
      setTotal((p) => p + 1);
      setScore((p) => p + 1);
      setFeedback('correct');
      setTimeout(() => {
        const melody = generateMelody();
        setTimeout(() => playCurrentMelody(melody), 300);
      }, 1500);
    }
  };

  const handleReplay = () => {
    if (targetMelody.length > 0 && !isPlaying) {
      playCurrentMelody(targetMelody);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 flex flex-col items-center px-4 py-8">
        <h1 className="text-3xl font-bold text-white mb-4">&#x1F3B6; {t.melody}</h1>

        {!started ? (
          <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 max-w-lg w-full text-center">
            <p className="text-white/80 mb-6">{t.repeatMelody}</p>
            <DifficultySelector value={difficulty} onChange={setDifficulty} />
            <button
              onClick={handleStart}
              className="mt-6 px-8 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-full font-bold text-lg shadow-lg hover:shadow-xl transition-all"
            >
              {t.start}
            </button>
          </div>
        ) : (
          <>
            <div className="flex gap-6 mb-4 text-white font-bold">
              <span>{t.score}: {score}/{total}</span>
              <button
                onClick={handleReplay}
                disabled={isPlaying}
                className="px-4 py-1 bg-green-400/80 text-gray-800 rounded-full text-sm disabled:opacity-50"
              >
                &#x1F50A; {t.listen}
              </button>
            </div>

            {/* Progress dots */}
            <div className="flex gap-2 mb-4">
              {targetMelody.map((_, i) => (
                <div
                  key={i}
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-all ${
                    i < playerNotes.length
                      ? playerNotes[i] === targetMelody[i].note
                        ? 'bg-green-400 text-white'
                        : 'bg-red-400 text-white'
                      : 'bg-white/30 text-white/60'
                  }`}
                >
                  {i + 1}
                </div>
              ))}
            </div>

            {/* Fixed-height status area to prevent layout shift */}
            <div className="h-10 mb-4 flex items-center justify-center">
              {isPlaying && (
                <div className="text-yellow-300 font-bold text-lg animate-pulse">
                  &#x1F50A; {t.listen}...
                </div>
              )}
              {feedback === 'correct' && (
                <div className="text-green-300 font-bold text-2xl animate-bounce-in">&#x2B50; {t.correct}</div>
              )}
              {feedback === 'incorrect' && (
                <div className="text-red-300 font-bold text-xl animate-shake">{t.tryAgain}</div>
              )}
            </div>

            <div className="w-full max-w-4xl bg-white/10 backdrop-blur-md rounded-3xl p-6 shadow-xl">
              <Piano
                startOctave={config.startOctave}
                endOctave={config.endOctave}
                onNotePlay={handleNotePlay}
                disabled={isPlaying || !!feedback}
              />
            </div>
          </>
        )}
      </main>
    </div>
  );
}
