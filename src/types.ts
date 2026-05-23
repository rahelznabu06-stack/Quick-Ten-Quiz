export interface Question {
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

export type QuizState = 'idle' | 'loading' | 'quiz' | 'results';
