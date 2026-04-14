'use client';

import { useState, useCallback, useRef } from 'react';
import { useLang } from '@/lib/i18n';
import Header from '@/components/Header';
import DifficultySelector from '@/components/DifficultySelector';
import RhythmDisplay from '@/components/RhythmDisplay';
import { DifficultyLevel } from '@/lib/difficulty';
import { initAudio, playRhythm, playClick } from '@/lib/audio';

// Rhythm patterns: each number = beat duration (1 = quarter note, 0.5 = eighth, 2 = half)
const PATTERNS: Record<string, { pattern: number[] }[]> = {
  simple: [
    { pattern: [1, 1, 1, 1] },
    { pattern: [2, 2] },
    { pattern: [2, 1, 1] },
    { pattern: [1, 1, 2] },
  ],
  medium: [
    { pattern: [1, 0.5, 0.5, 1, 1] },
    { pattern: [0.5, 0.5, 1, 0.5, 0.5, 1] },
    { pattern: [1, 1, 0.5, 0.5, 1] },
    { pattern: [2, 0.5, 0.5, 1] },
  ],
  complex: [
    { pattern: [0.5, 0.5, 0.5, 0.5, 1, 1] },
    { pattern: [1, 0.5, 0.5, 0.5, 0.5, 1] },
    { pattern: [0.5, 0.5, 1, 0.5, 0.5, 0.5, 0.5] },
    { pattern: [1.5, 0.5, 1, 1] },
  ],
};

const COMPLEXITY_MAP: Record<DifficultyLevel, string> = { 1: 'simple', 2: 'medium', 3: 'complex' };

function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function RhythmPage() {
  const { t } = useLang();
  const [difficulty, setDifficulty] = useState<DifficultyLevel>(1);
  const [started, setStarted] = useState(false);
  const [mode, setMode] = useState<'listen' | 'tap'>('listen');

  // Listen mode state
  const [correctIndex, setCorrectIndex] = useState(0);
  const [options, setOptions] = useState<{ pattern: number[] }[]>([]);
  const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);
  const [score, setScore] = useState(0);
  const [total, setTotal] = useState(0);

  // Tap mode state
  const [tapTarget, setTapTarget] = useState<number[]>([]);
  const [tapTimes, setTapTimes] = useState<number[]>([]);
  const [tapStarted, setTapStarted] = useState(false);
  const [tapResult, setTapResult] = useState<'correct' | 'incorrect' | null>(null);
  const lastTapRef = useRef<number>(0);

  const generateQuestion = useCallback(() => {
    const complexity = COMPLEXITY_MAP[difficulty];
    const pool = PATTERNS[complexity];
    const shuffled = shuffleArray(pool);
    const correct = Math.floor(Math.random() * 3);
    const opts = shuffled.slice(0, 3);
    setOptions(opts);
    setCorrectIndex(correct);
    setFeedback(null);
    setTimeout(() => {
      playRhythm(opts[correct].pattern);
    }, 300);
  }, [difficulty]);

  const generateTapQuestion = useCallback(() => {
    const complexity = COMPLEXITY_MAP[difficulty];
    const pool = PATTERNS[complexity];
    const item = pool[Math.floor(Math.random() * pool.length)];
    setTapTarget(item.pattern);
    setTapTimes([]);
    setTapStarted(false);
    setTapResult(null);
    setTimeout(() => {
      playRhythm(item.pattern);
    }, 300);
  }, [difficulty]);

  const handleStart = async () => {
    await initAudio();
    setStarted(true);
    setScore(0);
    setTotal(0);
    if (mode === 'listen') {
      generateQuestion();
    } else {
      generateTapQuestion();
    }
  };

  const handleAnswer = (index: number) => {
    if (feedback) return;
    setTotal((p) => p + 1);
    if (index === correctIndex) {
      setScore((p) => p + 1);
      setFeedback('correct');
      setTimeout(generateQuestion, 1200);
    } else {
      setFeedback('incorrect');
      setTimeout(() => setFeedback(null), 800);
    }
  };

  const handleTap = () => {
    const now = performance.now();
    playClick();
    if (!tapStarted) {
      setTapStarted(true);
      lastTapRef.current = now;
      setTapTimes([]);
      return;
    }
    const interval = (now - lastTapRef.current) / 1000;
    lastTapRef.current = now;
    const newTimes = [...tapTimes, interval];
    setTapTimes(newTimes);

    if (newTimes.length >= tapTarget.length - 1) {
      const normalize = (arr: number[]) => {
        const sum = arr.reduce((a, b) => a + b, 0);
        return arr.map((v) => v / sum);
      };
      const targetNorm = normalize(tapTarget);
      const playerNorm = normalize([tapTarget[0], ...newTimes]);
      const tolerance = difficulty === 1 ? 0.25 : difficulty === 2 ? 0.18 : 0.12;
      const isCorrect = targetNorm.every((v, i) => Math.abs(v - playerNorm[i]) < tolerance);
      setTotal((p) => p + 1);
      if (isCorrect) {
        setScore((p) => p + 1);
        setTapResult('correct');
      } else {
        setTapResult('incorrect');
      }
      setTimeout(generateTapQuestion, 1500);
    }
  };

  const handleReplay = () => {
    if (mode === 'listen' && options[correctIndex]) {
      playRhythm(options[correctIndex].pattern);
    } else if (tapTarget.length > 0) {
      playRhythm(tapTarget);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 flex flex-col items-center px-4 py-8">
        <h1 className="text-3xl font-bold text-white mb-4">&#x1F941; {t.rhythm}</h1>

        {!started ? (
          <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 max-w-lg w-full text-center">
            <DifficultySelector value={difficulty} onChange={setDifficulty} />

            <div className="flex gap-3 justify-center mt-6 mb-4">
              <button
                onClick={() => setMode('listen')}
                className={`px-4 py-2 rounded-full font-bold transition ${
                  mode === 'listen' ? 'bg-white text-purple-600' : 'bg-white/20 text-white'
                }`}
              >
                &#x1F50A; {t.whichRhythm}
              </button>
              <button
                onClick={() => setMode('tap')}
                className={`px-4 py-2 rounded-full font-bold transition ${
                  mode === 'tap' ? 'bg-white text-purple-600' : 'bg-white/20 text-white'
                }`}
              >
                &#x1F44F; {t.tapRhythm}
              </button>
            </div>

            <button
              onClick={handleStart}
              className="px-8 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-full font-bold text-lg shadow-lg hover:shadow-xl transition-all"
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
                className="px-4 py-1 bg-green-400/80 text-gray-800 rounded-full text-sm"
              >
                &#x1F50A; {t.listen}
              </button>
            </div>

            {mode === 'listen' ? (
              <div className="bg-white/10 backdrop-blur-md rounded-3xl p-6 max-w-lg w-full">
                <p className="text-white text-center mb-4 font-medium">{t.whichRhythm}</p>
                <div className="flex flex-col gap-3">
                  {options.map((opt, i) => (
                    <button
                      key={i}
                      onClick={() => handleAnswer(i)}
                      className={`px-6 py-4 rounded-2xl transition-all ${
                        feedback === 'correct' && i === correctIndex
                          ? 'bg-green-400 text-white animate-bounce-in'
                          : feedback === 'incorrect' && i === correctIndex
                          ? 'bg-green-400/50 text-white'
                          : 'bg-white/90 text-gray-800 hover:bg-white shadow-md hover:shadow-lg'
                      }`}
                    >
                      <RhythmDisplay pattern={opt.pattern} />
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
            ) : (
              <div className="bg-white/10 backdrop-blur-md rounded-3xl p-6 max-w-lg w-full text-center">
                <p className="text-white mb-4 font-medium">{t.tapRhythm}</p>
                <div className="bg-white/10 rounded-2xl p-4 mb-4">
                  <RhythmDisplay pattern={tapTarget} />
                </div>
                <button
                  onClick={handleTap}
                  className="w-48 h-48 rounded-full bg-gradient-to-br from-orange-400 to-red-500 text-white text-6xl shadow-2xl hover:shadow-3xl active:scale-95 transition-all mx-auto block"
                >
                  &#x1F44F;
                </button>
                <p className="text-white/60 mt-4 text-sm">
                  {tapStarted ? `${tapTimes.length + 1}/${tapTarget.length}` : t.start}
                </p>
                {tapResult === 'correct' && (
                  <div className="mt-4 text-green-300 font-bold text-xl animate-bounce-in">&#x2B50; {t.correct}</div>
                )}
                {tapResult === 'incorrect' && (
                  <div className="mt-4 text-red-300 font-bold text-xl animate-shake">{t.tryAgain}</div>
                )}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
