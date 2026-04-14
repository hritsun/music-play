'use client';

import { useState, ReactNode } from 'react';
import { Lang, LangContext, translations } from '@/lib/i18n';

export default function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>('ua');

  return (
    <LangContext.Provider value={{ lang, setLang, t: translations[lang] }}>
      {children}
    </LangContext.Provider>
  );
}
