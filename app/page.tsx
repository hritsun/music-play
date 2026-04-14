'use client';

import Link from 'next/link';
import { useLang } from '@/lib/i18n';
import Header from '@/components/Header';

const GAMES = [
  { href: '/piano', icon: '\uD83C\uDFB9', colorFrom: 'from-pink-400', colorTo: 'to-rose-500', key: 'piano' as const, descKey: 'pianoDesc' as const },
  { href: '/games/note-guess', icon: '\uD83C\uDFBC', colorFrom: 'from-blue-400', colorTo: 'to-indigo-500', key: 'noteGuess' as const, descKey: 'noteGuessDesc' as const },
  { href: '/games/rhythm', icon: '\uD83E\uDD41', colorFrom: 'from-orange-400', colorTo: 'to-red-500', key: 'rhythm' as const, descKey: 'rhythmDesc' as const },
  { href: '/games/melody', icon: '\uD83C\uDFB6', colorFrom: 'from-green-400', colorTo: 'to-emerald-500', key: 'melody' as const, descKey: 'melodyDesc' as const },
  { href: '/games/intervals', icon: '\uD83D\uDCCF', colorFrom: 'from-purple-400', colorTo: 'to-violet-500', key: 'intervals' as const, descKey: 'intervalsDesc' as const },
  { href: '/quiz/create', icon: '\uD83D\uDCDD', colorFrom: 'from-yellow-400', colorTo: 'to-amber-500', key: 'quiz' as const, descKey: 'quizDesc' as const },
];

export default function Home() {
  const { t } = useLang();

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 flex flex-col items-center px-4 py-8">
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-2 text-center drop-shadow-lg">
          &#x1F3B5; {t.siteName}
        </h1>
        <p className="text-white/80 text-lg mb-8 text-center">{t.siteTagline}</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl w-full">
          {GAMES.map((game, i) => (
            <Link
              key={game.key}
              href={game.href}
              className={`group relative bg-gradient-to-br ${game.colorFrom} ${game.colorTo} rounded-3xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 animate-bounce-in`}
              style={{ animationDelay: `${i * 100}ms`, animationFillMode: 'both' }}
            >
              <div className="text-6xl mb-3">{game.icon}</div>
              <h2 className="text-2xl font-bold text-white mb-1">{t[game.key]}</h2>
              <p className="text-white/80 text-sm">{t[game.descKey]}</p>
              <div className="absolute top-4 right-4 w-8 h-8 bg-white/20 rounded-full flex items-center justify-center group-hover:bg-white/40 transition">
                <span className="text-white text-lg">&rarr;</span>
              </div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
