export type Difficulty = 'easy' | 'medium' | 'hard';

export type QuestionType = 'multiple_choice' | 'fill_blank' | 'matching';

export interface MatchingPair {
  id: string;
  left: string;
  right: string;
}

export interface Question {
  id: string;
  type: QuestionType;
  difficulty: Difficulty;
  prompt: string;
  context?: string;
  options?: string[]; // For multiple_choice
  correctAnswer: string; // For multiple_choice (option text) or fill_blank (keyword or comma separated keywords)
  matchingPairs?: MatchingPair[]; // For matching
  explanation: string;
  points?: number;
}

export interface KeyConcept {
  id: string;
  title: string;
  definition: string;
  examples: string[];
  note?: string;
  iconName?: string;
  level?: 'medium' | 'hard' | 'all'; // Tùy chọn mức độ kiến thức
}

export interface ComparisonRow {
  concept: string;
  nature: string;
  role: string;
  example: string;
}

export interface Lesson {
  id: string;
  grade: number; // 6, 7, 8, 9
  chapter?: string; // Tên chương / Chủ đề (ví dụ: 'Chương 1: Máy tính và cộng đồng')
  subjectId: string;
  subjectName: string;
  title: string;
  subtitle: string;
  objectives: string[];
  keyConcepts: KeyConcept[];
  comparisonTable?: {
    headers: string[];
    rows: ComparisonRow[];
  };
  practicalSituations?: {
    title: string;
    scenario: string;
    insight: string;
  }[];
  questions: Question[];
  isCustom?: boolean;
  updatedAt?: number;
}

export interface Subject {
  id: string;
  name: string;
  grade: number;
  icon: string;
  color: string;
  description: string;
}

export interface QuizAttemptRecord {
  lessonId: string;
  studentClass?: string;
  studentName?: string;
  score: number; // e.g. 8.5 / 10
  correctCount: number;
  totalQuestions: number;
  percentage: number;
  stars: number; // 1, 2, or 3
  timestamp: number;
  wrongQuestionIds: string[];
}

export interface UserStats {
  totalQuizzesTaken: number;
  totalStars: number;
  currentStreakDays: number;
  lastActiveDate: string;
  lessonBestScores: Record<string, number>; // lessonId -> best score out of 10
}
