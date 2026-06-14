export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: number;
}

export interface ChatSession {
  id: string;
  title: string;
  language: 'en' | 'fr' | 'ko' | 'mixed';
  messages: Message[];
  createdAt: number;
  updatedAt: number;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  category: 'grammar' | 'vocabulary' | 'expression' | 'mistake';
  sourceSessionId?: string;
  createdAt: number;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  category: 'grammar' | 'vocabulary' | 'expression';
  language: 'en' | 'fr';
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface QuizResult {
  id: string;
  quizId: string;
  userAnswer: number;
  isCorrect: boolean;
  answeredAt: number;
}

export interface WrongAnswer {
  id: string;
  quiz: QuizQuestion;
  userAnswer: number;
  answeredAt: number;
}

export interface Weakness {
  id: string;
  topic: string;
  description: string;
  language: 'en' | 'fr';
  count: number;
  lastSeenAt: number;
}

export interface ThemePreset {
  name: string;
  nameKo: string;
  milkyH: number;
  milkyS: number;
  accentH: number;
  accentS: number;
}

export interface UserSettings {
  milkyH: number;
  milkyS: number;
  accentH: number;
  accentS: number;
  aiIcon: string;
  fontSize: 'small' | 'medium' | 'large';
  languages: ('en' | 'fr')[];
}

export interface GrammarRule {
  id: string;
  language: 'en' | 'fr';
  category: string;
  title: string;
  titleKo: string;
  explanation: string;
  explanationKo: string;
  examples: { sentence: string; translation: string }[];
  commonMistakes: { wrong: string; correct: string; note: string }[];
  relatedConcepts: string[];
  keywords: string[];
}

export type TabType = 'history' | 'notes' | 'chat' | 'quiz' | 'profile';
