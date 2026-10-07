import { createContext, useContext } from 'react';

/** Null means this component is outside a tenant workspace. */
export const WorkspaceModulesContext = createContext<string[] | null>(null);

export function useWorkspaceModules(): string[] | null {
  return useContext(WorkspaceModulesContext);
}

export function moduleForPartnerPath(path: string): string | null {
  if (/^\/partner\/courses\/[^/]+\/structure(?:\/|$)/.test(path)) return 'curriculum';
  const section = path.replace(/^\/partner\//, '').split('/')[0];
  const modules: Record<string, string> = {
    home: 'dashboard',
    students: 'student',
    courses: 'course',
    batches: 'course',
    forms: 'form',
    books: 'book',
    orders: 'order',
    'returns-issues': 'return',
    'courier-partners': 'courier',
    users: 'member',
    tasks: 'task',
    calendar: 'calendar',
    'quiz-studio': 'quiz',
    'test-studio': 'test',
    'question-bank': 'question-bank',
    analytics: 'analytics',
    reports: 'analytics',
    messages: 'message',
    search: 'search',
    'ai-assistant': 'ai',
    settings: 'settings',
    tickets: 'ticket',
    'feature-requests': 'ticket',
    profile: 'account',
    subscriptions: 'account',
    payments: 'account',
  };
  return modules[section] ?? null;
}
