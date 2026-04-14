export type DifficultyLevel = 1 | 2 | 3;

export interface DifficultyConfig {
  level: DifficultyLevel;
  startOctave: number;
  endOctave: number;
  includeBlackKeys: boolean;
  maxNotes: number;
  rhythmComplexity: 'simple' | 'medium' | 'complex';
  includeIntervals: boolean;
  hintsAllowed: number;
  timePerQuestion: number;
}

export const difficultyConfigs: Record<DifficultyLevel, DifficultyConfig> = {
  1: {
    level: 1,
    startOctave: 4,
    endOctave: 4,
    includeBlackKeys: false,
    maxNotes: 5,
    rhythmComplexity: 'simple',
    includeIntervals: false,
    hintsAllowed: 5,
    timePerQuestion: 30,
  },
  2: {
    level: 2,
    startOctave: 4,
    endOctave: 5,
    includeBlackKeys: false,
    maxNotes: 8,
    rhythmComplexity: 'medium',
    includeIntervals: false,
    hintsAllowed: 3,
    timePerQuestion: 20,
  },
  3: {
    level: 3,
    startOctave: 4,
    endOctave: 5,
    includeBlackKeys: true,
    maxNotes: 12,
    rhythmComplexity: 'complex',
    includeIntervals: true,
    hintsAllowed: 2,
    timePerQuestion: 15,
  },
};

export function getNotesForDifficulty(level: DifficultyLevel) {
  const config = difficultyConfigs[level];
  // Import dynamically to avoid circular dependency — use from notes.ts directly in components
  return config;
}
