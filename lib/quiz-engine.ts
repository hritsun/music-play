import { DifficultyLevel } from './difficulty';

export type QuestionType = 'note' | 'rhythm' | 'interval' | 'melody';

export interface QuizQuestion {
  type: QuestionType;
  data: Record<string, unknown>;
  options: string[];
  correctIndex: number;
}

export interface QuizConfig {
  title: string;
  difficulty: DifficultyLevel;
  questionTypes: QuestionType[];
  questionCount: number;
  timePerQuestion: number;
  hintsAllowed: number;
}

export interface QuizResult {
  total: number;
  correct: number;
  answers: { questionIndex: number; correct: boolean; timeSpent: number }[];
}

export function encodeQuiz(config: QuizConfig): string {
  const json = JSON.stringify(config);
  if (typeof window !== 'undefined') {
    return btoa(unescape(encodeURIComponent(json)));
  }
  return Buffer.from(json).toString('base64');
}

export function decodeQuiz(encoded: string): QuizConfig | null {
  try {
    let json: string;
    if (typeof window !== 'undefined') {
      json = decodeURIComponent(escape(atob(encoded)));
    } else {
      json = Buffer.from(encoded, 'base64').toString('utf-8');
    }
    return JSON.parse(json) as QuizConfig;
  } catch {
    return null;
  }
}

export function generateQuizUrl(config: QuizConfig): string {
  const encoded = encodeQuiz(config);
  return `/quiz/play?d=${encoded}`;
}

export function calculateScore(result: QuizResult): { percentage: number; grade: 'excellent' | 'good' | 'keepTrying' } {
  const percentage = Math.round((result.correct / result.total) * 100);
  if (percentage >= 80) return { percentage, grade: 'excellent' };
  if (percentage >= 50) return { percentage, grade: 'good' };
  return { percentage, grade: 'keepTrying' };
}
