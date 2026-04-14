'use client';

import { useLang } from '@/lib/i18n';
import Header from '@/components/Header';
import Piano from '@/components/Piano';

export default function PianoPage() {
  const { t } = useLang();

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 flex flex-col items-center px-4 py-8">
        <h1 className="text-3xl font-bold text-white mb-2">&#x1F3B9; {t.piano}</h1>
        <p className="text-white/70 mb-6">{t.freePlay}</p>
        <div className="w-full max-w-4xl bg-white/10 backdrop-blur-md rounded-3xl p-6 shadow-xl">
          <Piano showLabels={true} />
        </div>
        <p className="text-white/50 text-sm mt-4 text-center">
          Z-M = {t.notesNames.C}4-{t.notesNames.B}4 | Q-U = {t.notesNames.C}5-{t.notesNames.B}5
        </p>
      </main>
    </div>
  );
}
