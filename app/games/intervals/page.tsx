'use client';

import { useState, useCallback } from 'react';
import { useLang } from '@/lib/i18n';
import Header from '@/components/Header';
import DifficultySelector from '@/components/DifficultySelector';
import { DifficultyLevel } from '@/lib/difficulty';
import { generateRange, NoteInfo, getRandomNote, intervalToSemitones, NOTE_NAMES } from '@/lib/notes';
import { initAudio, playNote } from '@/lib/audio';

interface IntervalQuestion {
  note1: NoteInfo;
  note2: NoteInfo;
  interval: number; // 1-8
}

const INTERVALS_BY_DIFF: Record<DifficultyLevel, number[]> = {
  1: [3, 5, 8],           // tercia, kvinta, oktava
  2: [2, 3, 4, 5, 8],     // + sekunda, kvarta
  3: [2, 3, 4, 5, 6, 7, 8], // all
};

export default function IntervalsPage() {
  const { t } = useLang();
  const [difficulty, setDifficulty] = useState<DifficultyLevel>(2);
  const [started, setStarted] = useState(false);
  const [question, setQuestion] = useState<IntervalQuestion | null>(null);
  const [score, setScore] = useState(0);
  const [total, setTotal] = useState(0);
  const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);
  const [hints, setHints] = useState(3);
  const [showHint, setShowHint] = useState(false);

  const intervals = INTERVALS_BY_DIFF[difficulty];

  const generateQuestion = useCallback(() => {
    const notes = generateRange(4, 5).filter((n) => !n.isBlack);
    const interval = intervals[Math.floor(Math.random() * intervals.length)];
    const semitones = intervalToSemitones(interval);
    const note1 = getRandomNote(notes.filter((n) => n.midi + semitones <= notes[notes.length - 1].midi));
    const note2 = notes.find((n) => n.midi === note1.midi + semitones) ||
      generateRange(4, 5).find((n) => n.midi === note1.midi + semitones);

    if (!note2) {
      // Fallback
      setQuestion({ note1: notes[0], note2: notes[4], interval: 5 });
    } else {
      setQuestion({ note1, note2, interval });
    }
    setFeedback(null);
    setShowHint(false);
  }, [intervals]);

  const handleStart = async () => {
    await initAudio();
    setStarted(true);
    setScore(0);
    setTotal(0);
    setHints(difficulty === 1 ? 5 : difficulty === 2 ? 3 : 2);
    generateQuestion();
  };

  const playInterval = () => {
    if (!question) return;
    playNote(question.note1.note);
    setTimeout(() => playNote(question.note2.note), 600);
  };

  const handleAnswer = (interval: number) => {
    if (feedback || !question) return;
    setTotal((p) => p + 1);
    if (interval === question.interval) {
      setScore((p) => p + 1);
      setFeedback('correct');
      setTimeout(() => {
        generateQuestion();
        setTimeout(playInterval, 500);
      }, 1200);
    } else {
      setFeedback('incorrect');
      setTimeout(() => setFeedback(null), 800);
    }
  };

  const handleHint = () => {
    if (hints > 0) {
      setHints((h) => h - 1);
      setShowHint(true);
    }
  };

  const intervalNames = t.intervalNames as Record<number, string>;

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 flex flex-col items-center px-4 py-8">
        <h1 className="text-3xl font-bold text-white mb-4">&#x1F4CF; {t.intervals}</h1>

        {!started ? (
          <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 max-w-lg w-full text-center">
            <p className="text-white/80 mb-6">{t.whatInterval}</p>
            <DifficultySelector value={difficulty} onChange={setDifficulty} />
            <button
              onClick={handleStart}
              className="mt-6 px-8 py-3 bg-gradient-to-r from-purple-500 to-violet-500 text-white rounded-full font-bold text-lg shadow-lg hover:shadow-xl transition-all"
            >
              {t.start}
            </button>
          </div>
        ) : (
          <>
            <div className="flex gap-4 mb-4 text-white font-bold flex-wrap justify-center">
              <span>{t.score}: {score}/{total}</span>
              <button onClick={playInterval} className="px-4 py-1 bg-green-400/80 text-gray-800 rounded-full text-sm">
                &#x1F50A; {t.listen}
              </button>
              <button
                onClick={handleHint}
                disabled={hints === 0}
                className="px-4 py-1 bg-yellow-400/80 text-gray-800 rounded-full text-sm disabled:opacity-40"
              >
                &#x1F4A1; {t.hint} ({hints})
              </button>
            </div>

            {showHint && question && (
              <div className="text-yellow-200 mb-2 font-medium">
                {(t.notesNames as Record<string, string>)[question.note1.name]} &rarr; {(t.notesNames as Record<string, string>)[question.note2.name]}
              </div>
            )}

            <div className="bg-white/10 backdrop-blur-md rounded-3xl p-6 max-w-lg w-full">
              <p className="text-white text-center mb-4 font-medium">{t.whatInterval}</p>
              <div className="grid grid-cols-2 gap-3">
                {intervals.map((intv) => (
                  <button
                    key={intv}
                    onClick={() => handleAnswer(intv)}
                    className={`px-4 py-4 rounded-2xl font-bold text-lg transition-all ${
                      feedback === 'correct' && question?.interval === intv
                        ? 'bg-green-400 text-white animate-bounce-in'
                        : 'bg-white/90 text-gray-800 hover:bg-white shadow-md hover:shadow-lg'
                    }`}
                  >
                    {intervalNames[intv]}
                  </button>
                ))}
              </div>
              {feedback === 'correct' && (
                <div className="text-center mt-4 text-green-300 font-bold text-xl animate-bounce-in">&#x2B50; {t.correct}</div>
              )}
              {feedback === 'incorrect' && (
                <div className="text-center mt-4 text-red-300 font-bold text-xl animate-shake">{t.incorrect}</div>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
