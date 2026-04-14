'use client';

import { useState, useEffect, useCallback, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useLang } from '@/lib/i18n';
import Header from '@/components/Header';
import Piano from '@/components/Piano';
import Staff from '@/components/Staff';
import { decodeQuiz, QuizConfig, QuizResult, calculateScore } from '@/lib/quiz-engine';
import { DifficultyLevel, difficultyConfigs } from '@/lib/difficulty';
import { generateRange, NoteInfo, getRandomNote, intervalToSemitones } from '@/lib/notes';
import { initAudio, playNote, playRhythm } from '@/lib/audio';

interface Question {
  type: 'note' | 'rhythm' | 'interval';
  prompt: string;
  data: Record<string, unknown>;
  options: string[];
  correctIndex: number;
}

const RHYTHM_PATTERNS = [
  { pattern: [1, 1, 1, 1], label: '♩ ♩ ♩ ♩' },
  { pattern: [2, 1, 1], label: '𝅗𝅥 ♩ ♩' },
  { pattern: [1, 0.5, 0.5, 1, 1], label: '♩ ♪♪ ♩ ♩' },
  { pattern: [0.5, 0.5, 1, 0.5, 0.5, 1], label: '♪♪ ♩ ♪♪ ♩' },
];

function QuizContent() {
  const { t } = useLang();
  const searchParams = useSearchParams();
  const [config, setConfig] = useState<QuizConfig | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [finished, setFinished] = useState(false);
  const [hints, setHints] = useState(0);
  const [answers, setAnswers] = useState<{ correct: boolean; timeSpent: number }[]>([]);
  const [audioReady, setAudioReady] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);

  useEffect(() => {
    const data = searchParams.get('d');
    if (data) {
      const decoded = decodeQuiz(data);
      if (decoded) {
        setConfig(decoded);
        setHints(decoded.hintsAllowed);
        generateQuestions(decoded);
      }
    }
  }, [searchParams]);

  function generateQuestions(cfg: QuizConfig) {
    const qs: Question[] = [];
    const diffConfig = difficultyConfigs[cfg.difficulty];
    const notes = generateRange(diffConfig.startOctave, diffConfig.endOctave).filter(
      (n) => diffConfig.includeBlackKeys || !n.isBlack
    );

    for (let i = 0; i < cfg.questionCount; i++) {
      const typePool = cfg.questionTypes;
      const type = typePool[Math.floor(Math.random() * typePool.length)];

      if (type === 'note') {
        const target = getRandomNote(notes);
        const wrongNotes = notes.filter((n) => n.note !== target.note);
        const shuffled = wrongNotes.sort(() => Math.random() - 0.5).slice(0, 3);
        const options = [target, ...shuffled].sort(() => Math.random() - 0.5);
        qs.push({
          type: 'note',
          prompt: '',
          data: { targetNote: target.note },
          options: options.map((n) => n.name),
          correctIndex: options.findIndex((n) => n.note === target.note),
        });
      } else if (type === 'rhythm') {
        const patterns = RHYTHM_PATTERNS.sort(() => Math.random() - 0.5).slice(0, 3);
        const correct = Math.floor(Math.random() * 3);
        qs.push({
          type: 'rhythm',
          prompt: '',
          data: { pattern: patterns[correct].pattern },
          options: patterns.map((p) => p.label),
          correctIndex: correct,
        });
      } else if (type === 'interval') {
        const intervals = [2, 3, 4, 5, 8];
        const interval = intervals[Math.floor(Math.random() * intervals.length)];
        const semitones = intervalToSemitones(interval);
        const whiteNotes = notes.filter((n) => !n.isBlack);
        const note1 = getRandomNote(whiteNotes.filter((n) => n.midi + semitones <= whiteNotes[whiteNotes.length - 1].midi));
        const options = intervals.sort(() => Math.random() - 0.5).slice(0, 4);
        if (!options.includes(interval)) options[0] = interval;
        const shuffled = options.sort(() => Math.random() - 0.5);
        qs.push({
          type: 'interval',
          prompt: '',
          data: { note1: note1.note, semitones, interval },
          options: shuffled.map((i) => String(i)),
          correctIndex: shuffled.indexOf(interval),
        });
      } else {
        // melody — treat as note question
        const target = getRandomNote(notes);
        const wrongNotes = notes.filter((n) => n.note !== target.note).sort(() => Math.random() - 0.5).slice(0, 3);
        const options = [target, ...wrongNotes].sort(() => Math.random() - 0.5);
        qs.push({
          type: 'note',
          prompt: '',
          data: { targetNote: target.note },
          options: options.map((n) => n.name),
          correctIndex: options.findIndex((n) => n.note === target.note),
        });
      }
    }
    setQuestions(qs);
  }

  const startTimer = useCallback(() => {
    if (!config) return;
    setTimeLeft(config.timePerQuestion);
    startTimeRef.current = Date.now();
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [config]);

  useEffect(() => {
    if (audioReady && questions.length > 0 && currentQ < questions.length) {
      startTimer();
      // Auto-play sound for the question
      const q = questions[currentQ];
      if (q.type === 'note') {
        setTimeout(() => playNote(q.data.targetNote as string), 300);
      } else if (q.type === 'rhythm') {
        setTimeout(() => playRhythm(q.data.pattern as number[]), 300);
      } else if (q.type === 'interval') {
        setTimeout(() => {
          playNote(q.data.note1 as string);
          const midi = generateRange(4, 5).find((n) => n.note === q.data.note1)?.midi;
          if (midi) {
            const note2 = generateRange(4, 5).find((n) => n.midi === midi + (q.data.semitones as number));
            if (note2) setTimeout(() => playNote(note2.note), 600);
          }
        }, 300);
      }
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [audioReady, currentQ, questions, startTimer]);

  // Time-out handling
  useEffect(() => {
    if (timeLeft === 0 && audioReady && questions.length > 0 && currentQ < questions.length && !feedback) {
      handleAnswer(-1);
    }
  }, [timeLeft]);

  const handleAnswer = (index: number) => {
    if (feedback) return;
    if (timerRef.current) clearInterval(timerRef.current);
    const timeSpent = (Date.now() - startTimeRef.current) / 1000;
    const correct = index === questions[currentQ].correctIndex;
    if (correct) setScore((p) => p + 1);
    setFeedback(correct ? 'correct' : 'incorrect');
    setAnswers((prev) => [...prev, { correct, timeSpent }]);

    setTimeout(() => {
      setFeedback(null);
      if (currentQ + 1 >= questions.length) {
        setFinished(true);
      } else {
        setCurrentQ((p) => p + 1);
      }
    }, 1000);
  };

  const handleStartQuiz = async () => {
    await initAudio();
    setAudioReady(true);
  };

  const intervalNames = t.intervalNames as Record<number, string>;
  const noteNames = t.notesNames as Record<string, string>;

  if (!config) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <p className="text-white text-xl">Loading quiz...</p>
        </main>
      </div>
    );
  }

  if (!audioReady) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 flex flex-col items-center justify-center px-4">
          <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 max-w-md text-center">
            <h2 className="text-2xl font-bold text-white mb-2">{config.title}</h2>
            <p className="text-white/70 mb-4">{config.questionCount} {t.questionCount.toLowerCase()}</p>
            <button
              onClick={handleStartQuiz}
              className="px-8 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-full font-bold text-lg shadow-lg hover:shadow-xl transition-all"
            >
              {t.start}
            </button>
          </div>
        </main>
      </div>
    );
  }

  if (finished) {
    const result: QuizResult = { total: questions.length, correct: score, answers: answers.map((a, i) => ({ questionIndex: i, ...a })) };
    const { percentage, grade } = calculateScore(result);
    const gradeEmoji = grade === 'excellent' ? '\uD83C\uDF1F' : grade === 'good' ? '\uD83D\uDC4D' : '\uD83D\uDCAA';

    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 flex flex-col items-center justify-center px-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full text-center shadow-xl animate-bounce-in">
            <div className="text-6xl mb-4">{gradeEmoji}</div>
            <h2 className="text-3xl font-bold text-gray-800 mb-2">{t[grade]}</h2>
            <p className="text-5xl font-bold text-purple-600 mb-2">{percentage}%</p>
            <p className="text-gray-500 mb-6">{score}/{questions.length} {t.correct.toLowerCase()}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full font-bold shadow-lg"
            >
              {t.playAgain}
            </button>
          </div>
        </main>
      </div>
    );
  }

  const q = questions[currentQ];

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 flex flex-col items-center px-4 py-6">
        {/* Progress bar */}
        <div className="w-full max-w-lg mb-4">
          <div className="flex justify-between text-white text-sm mb-1">
            <span>{currentQ + 1}/{questions.length}</span>
            <span>{t.score}: {score}</span>
            <span>{timeLeft}s</span>
          </div>
          <div className="h-2 bg-white/20 rounded-full">
            <div
              className="h-full bg-gradient-to-r from-green-400 to-blue-400 rounded-full transition-all"
              style={{ width: `${((currentQ) / questions.length) * 100}%` }}
            />
          </div>
          {/* Timer bar */}
          <div className="h-1 bg-white/10 rounded-full mt-1">
            <div
              className={`h-full rounded-full transition-all ${timeLeft <= 5 ? 'bg-red-400' : 'bg-yellow-400'}`}
              style={{ width: `${(timeLeft / (config?.timePerQuestion || 20)) * 100}%` }}
            />
          </div>
        </div>

        {/* Question */}
        <div className="bg-white/10 backdrop-blur-md rounded-3xl p-6 max-w-lg w-full">
          {q.type === 'note' && (
            <div className="flex flex-col items-center">
              <Staff note={q.data.targetNote as string} />
              <p className="text-white mt-2 font-medium">{t.whatNote}</p>
            </div>
          )}
          {q.type === 'rhythm' && (
            <p className="text-white text-center font-medium">{t.whichRhythm}</p>
          )}
          {q.type === 'interval' && (
            <p className="text-white text-center font-medium">{t.whatInterval}</p>
          )}

          <div className="grid grid-cols-2 gap-3 mt-4">
            {q.options.map((opt, i) => (
              <button
                key={i}
                onClick={() => handleAnswer(i)}
                className={`px-4 py-4 rounded-2xl font-bold text-lg transition-all ${
                  feedback === 'correct' && i === q.correctIndex
                    ? 'bg-green-400 text-white'
                    : feedback === 'incorrect' && i === q.correctIndex
                    ? 'bg-green-400/50 text-white'
                    : 'bg-white/90 text-gray-800 hover:bg-white shadow-md'
                }`}
              >
                {q.type === 'interval' ? intervalNames[Number(opt)] || opt : noteNames[opt] || opt}
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
      </main>
    </div>
  );
}

export default function QuizPlayPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen text-white text-xl">Loading...</div>}>
      <QuizContent />
    </Suspense>
  );
}
