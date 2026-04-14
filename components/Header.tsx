'use client';

import Link from 'next/link';
import { useLang } from '@/lib/i18n';
import LanguageSwitcher from './LanguageSwitcher';

export default function Header() {
  const { t } = useLang();

  return (
    <header className="bg-white/10 backdrop-blur-md border-b border-white/20">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 text-white font-bold text-lg sm:text-xl hover:opacity-80 transition">
          <span className="text-2xl sm:text-3xl">&#x1F3B5;</span>
          <span className="hidden sm:inline">{t.siteName}</span>
        </Link>
        <div className="flex items-center gap-2 sm:gap-4">
          <Link href="/" className="text-white/80 hover:text-white text-xs sm:text-sm font-medium transition">
            {t.home}
          </Link>
          <Link href="/quiz/create" className="text-white/80 hover:text-white text-xs sm:text-sm font-medium transition hidden sm:inline">
            {t.createQuiz}
          </Link>
          <LanguageSwitcher />
        </div>
      </div>
    </header>
  );
}
