'use client';

import { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { useLang } from '@/lib/i18n';
import Header from '@/components/Header';
import DifficultySelector from '@/components/DifficultySelector';
import { DifficultyLevel } from '@/lib/difficulty';
import { QuizConfig, QuestionType, generateQuizUrl } from '@/lib/quiz-engine';

export default function CreateQuizPage() {
  const { t } = useLang();
  const [title, setTitle] = useState('');
  const [difficulty, setDifficulty] = useState<DifficultyLevel>(1);
  const [questionTypes, setQuestionTypes] = useState<QuestionType[]>(['note']);
  const [questionCount, setQuestionCount] = useState(10);
  const [timePerQuestion, setTimePerQuestion] = useState(20);
  const [generatedUrl, setGeneratedUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const allTypes: { type: QuestionType; label: string; emoji: string }[] = [
    { type: 'note', label: t.noteGuess, emoji: '\uD83C\uDFBC' },
    { type: 'rhythm', label: t.rhythm, emoji: '\uD83E\uDD41' },
    { type: 'melody', label: t.melody, emoji: '\uD83C\uDFB6' },
    { type: 'interval', label: t.intervals, emoji: '\uD83D\uDCCF' },
  ];

  const toggleType = (type: QuestionType) => {
    setQuestionTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  const handleGenerate = () => {
    const config: QuizConfig = {
      title: title || 'Music Quiz',
      difficulty,
      questionTypes,
      questionCount,
      timePerQuestion,
      hintsAllowed: difficulty === 1 ? 5 : difficulty === 2 ? 3 : 2,
    };
    const url = generateQuizUrl(config);
    const fullUrl = typeof window !== 'undefined' ? `${window.location.origin}${url}` : url;
    setGeneratedUrl(fullUrl);
    setCopied(false);
  };

  const handleCopy = async () => {
    if (generatedUrl) {
      await navigator.clipboard.writeText(generatedUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const closeModal = () => {
    setGeneratedUrl(null);
    setCopied(false);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 flex flex-col items-center px-4 py-8">
        <h1 className="text-3xl font-bold text-white mb-6">&#x1F4DD; {t.createQuiz}</h1>

        <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 max-w-lg w-full">
          {/* Title */}
          <label className="block text-white font-bold mb-2">Quiz Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Music Quiz"
            className="w-full px-4 py-3 rounded-xl bg-white/90 text-gray-800 font-medium mb-6 outline-none focus:ring-2 focus:ring-purple-400"
          />

          {/* Difficulty */}
          <label className="block text-white font-bold mb-2">{t.difficulty}</label>
          <div className="mb-6">
            <DifficultySelector value={difficulty} onChange={setDifficulty} />
          </div>

          {/* Question types */}
          <label className="block text-white font-bold mb-2">&#x1F3AF;</label>
          <div className="flex flex-wrap gap-2 mb-6">
            {allTypes.map(({ type, label, emoji }) => (
              <button
                key={type}
                onClick={() => toggleType(type)}
                className={`px-4 py-2 rounded-full font-bold text-sm transition-all ${
                  questionTypes.includes(type)
                    ? 'bg-white text-purple-600 shadow'
                    : 'bg-white/20 text-white hover:bg-white/30'
                }`}
              >
                {emoji} {label}
              </button>
            ))}
          </div>

          {/* Question count */}
          <label className="block text-white font-bold mb-2">{t.questionCount}</label>
          <input
            type="range"
            min={5}
            max={20}
            value={questionCount}
            onChange={(e) => setQuestionCount(Number(e.target.value))}
            className="w-full mb-1"
          />
          <p className="text-white/70 text-sm mb-6">{questionCount}</p>

          {/* Time per question */}
          <label className="block text-white font-bold mb-2">{t.timePerQuestion}</label>
          <input
            type="range"
            min={10}
            max={60}
            step={5}
            value={timePerQuestion}
            onChange={(e) => setTimePerQuestion(Number(e.target.value))}
            className="w-full mb-1"
          />
          <p className="text-white/70 text-sm mb-6">{timePerQuestion}s</p>

          {/* Generate button */}
          <button
            onClick={handleGenerate}
            disabled={questionTypes.length === 0}
            className="w-full px-8 py-3 bg-gradient-to-r from-yellow-400 to-amber-500 text-gray-800 rounded-full font-bold text-lg shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
          >
            {t.generate}
          </button>
        </div>
      </main>

      {/* QR Code Modal */}
      {generatedUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={closeModal}>
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          {/* Modal */}
          <div
            className="relative bg-white rounded-3xl p-8 max-w-md w-full text-center shadow-2xl animate-bounce-in"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 font-bold transition"
            >
              &times;
            </button>

            <h2 className="text-xl font-bold text-gray-800 mb-4">{t.scanQR}</h2>
            <div className="flex justify-center mb-4">
              <QRCodeSVG value={generatedUrl} size={220} level="M" />
            </div>
            <p className="text-gray-400 text-xs mb-4 break-all px-4">{generatedUrl}</p>
            <button
              onClick={handleCopy}
              className="px-6 py-3 bg-purple-500 text-white rounded-full font-bold hover:bg-purple-600 transition text-lg"
            >
              {copied ? '\u2705 Copied!' : t.copyLink}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
