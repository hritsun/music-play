'use client';

import { useLang } from '@/lib/i18n';

export default function LanguageSwitcher() {
  const { lang, setLang } = useLang();

  return (
    <div className="flex gap-1 bg-white/20 rounded-full p-1">
      <button
        onClick={() => setLang('ua')}
        className={`px-3 py-1 rounded-full text-sm font-bold transition-all ${
          lang === 'ua' ? 'bg-white text-purple-600 shadow' : 'text-white hover:bg-white/20'
        }`}
      >
        UA
      </button>
      <button
        onClick={() => setLang('ru')}
        className={`px-3 py-1 rounded-full text-sm font-bold transition-all ${
          lang === 'ru' ? 'bg-white text-purple-600 shadow' : 'text-white hover:bg-white/20'
        }`}
      >
        RU
      </button>
    </div>
  );
}
