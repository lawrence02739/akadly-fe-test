import type { Question } from '../../features/quizzes/types';

export type TestStatus = 'DRAFT' | 'PUBLISHED';

export interface Test {
  id: string;
  tenantId: string;
  title: string;
  tags?: string[];
  difficulty?: 'easy' | 'medium' | 'hard';
  subject?: string;
  timeLimitMinutes: number;
  languageSupport: boolean;
  language?: string;
  availableFrom: string;
  availableTill: string;
  instructions: 'none' | 'default' | 'custom';
  status: TestStatus;
  autoSubmitOnExpiry: boolean;
  shuffleQuestions: boolean;
  lockTabSwitching: boolean;
  questionCount: number;
  questionIds: string[];
  scheduleStatus?: 'draft' | 'scheduled' | 'live' | 'closed';
  createdAt: string;
  updatedAt: string;
  questions?: Question[];
}

export interface CreateTestDto {
  title: string;
  tags?: string[];
  difficulty?: 'easy' | 'medium' | 'hard';
  subject?: string;
  timeLimitMinutes: number;
  languageSupport?: boolean;
  language?: string;
  availableFrom: string;
  availableTill: string;
  instructions?: 'none' | 'default' | 'custom';
  status?: TestStatus;
  autoSubmitOnExpiry?: boolean;
  shuffleQuestions?: boolean;
  lockTabSwitching?: boolean;
}

export interface UpdateTestDto extends Partial<CreateTestDto> {}
