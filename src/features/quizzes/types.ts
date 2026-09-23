export type QuestionType =
  // Basic Types
  | 'SINGLE' | 'MULTIPLE' | 'NUMERIC' | 'TRUE_FALSE' | 'FILL_BLANK'
  // Advanced Types
  | 'SHORT_ANSWER' | 'SUBJECTIVE' | 'MATCH' | 'ASSERTION_REASON' | 'ARRANGEMENT'
  // Specialized Types
  | 'MAP_BASED' | 'DRAG_DROP' | 'CODING' | 'LINKED_COMPREHENSION' | 'VIVA_ORAL';


export type QuizStatus = 'DRAFT' | 'PUBLISHED';
export type QuestionDifficulty = 'EASY' | 'MEDIUM' | 'HARD';

export interface Quiz {
  id: string;
  tenantId: string;
  title: string;
  tags: string[];
  timeLimitMinutes: number;
  retakeAttempts: number;
  instructions: 'none' | 'default' | 'custom';
  status: QuizStatus;
  randomizeQuestions: boolean;
  showCorrectAnswers: boolean;
  passScore: number;
  languageSupport?: boolean;
  language?: string;
  questionCount: number;
  createdAt: string;
  updatedAt: string;
  questions?: Question[];
}

export interface Question {
  id: string;
  quizId: string;
  tenantId: string;
  type: QuestionType;
  subject: string;
  topic: string;
  tags: string[];
  difficulty: QuestionDifficulty;
  group: boolean;
  text: string;
  explanation: string;
  order: number;
  mark: number;
  penalty: number;
  // Optional shared settings
  categoryId?: string;
  negativeMarking?: number;
  completionTimeMinutes?: number;
  // Legacy flat fields
  options?: any[];
  answer?: number;
  range?: number;
  colI?: any[];
  colII?: any[];
  // Type-specific content bag
  content?: Record<string, any>;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateQuizDto {
  title: string;
  tags?: string[];
  timeLimitMinutes?: number;
  retakeAttempts?: number;
  instructions?: 'none' | 'default' | 'custom';
  randomizeQuestions?: boolean;
  showCorrectAnswers?: boolean;
  passScore?: number;
  languageSupport?: boolean;
  language?: string;
}

export interface UpdateQuizDto extends Partial<CreateQuizDto> {
  status?: QuizStatus;
}

export interface CreateQuestionDto {
  type: QuestionType;
  subject?: string;
  topic?: string;
  tags?: string[];
  difficulty?: QuestionDifficulty;
  group?: boolean;
  text: string;
  explanation?: string;
  order?: number;
  mark?: number;
  penalty?: number;
  // Optional shared settings
  categoryId?: string;
  negativeMarking?: number;
  completionTimeMinutes?: number;
  // Legacy flat fields
  options?: any[];
  answer?: number;
  range?: number;
  colI?: any[];
  colII?: any[];
  // Type-specific content bag
  content?: Record<string, any>;
}

export type UpdateQuestionDto = Partial<CreateQuestionDto>;
