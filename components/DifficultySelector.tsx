'use client';

import { useLang } from '@/lib/i18n';
import { DifficultyLevel } from '@/lib/difficulty';

const EMOJIS: Record<DifficultyLevel, string> = { 1: '\uD83D\uDC30', 2: '\uD83D\uDC31', 3: '\uD83E\uDD81' };
const COLORS: Record<DifficultyLevel, string> = {
  1: 'from-green-400 to-green-500',
  2: 'from-yellow-400 to-orange-400',
  3: 'from-red-400 to-red-500',
};

export default function DifficultySelector({
  value,
  onChange,
}: {
  value: DifficultyLevel;
  onChange: (level: DifficultyLevel) => void;
}) {
  const { t } = useLang();
  const labels: Record<DifficultyLevel, string> = { 1: t.level1, 2: t.level2, 3: t.level3 };

  return (
    <div className="flex gap-3 flex-wrap justify-center">
      {([1, 2, 3] as DifficultyLevel[]).map((level) => (
        <button
          key={level}
          onClick={() => onChange(level)}
          className={`px-4 py-3 rounded-2xl font-bold text-white shadow-lg transition-all transform
            ${value === level ? `bg-gradient-to-br ${COLORS[level]} scale-110 ring-4 ring-white/50` : 'bg-gray-300 hover:bg-gray-400 scale-100'}
          `}
        >
          <span className="text-2xl mr-2">{EMOJIS[level]}</span>
          {labels[level]}
        </button>
      ))}
    </div>
  );
}
