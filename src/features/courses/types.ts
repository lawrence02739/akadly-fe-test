export type CourseNodeType =
  | 'MODULE'
  | 'VIDEO'
  | 'PDF'
  | 'AUDIO'
  | 'FILE'
  | 'TEXT'
  | 'HEADING'
  | 'LINK'
  | 'QUIZ'
  | 'TEST'
  | 'CODING'
  | 'ASSIGNMENT'
  | 'FORM'
  | 'LIVE_CLASS';

export interface CourseNode {
  id: string;
  tenantId: string;
  courseId: string;
  type: CourseNodeType;
  title: string;
  sequence: number;
  depth: number;
  parentId?: string;
  ancestors: string[];
  content?: any;
  createdAt: string;
  updatedAt: string;
}

export interface CourseNodeTree extends CourseNode {
  children: CourseNodeTree[];
}

export interface CreateCourseNodeDto {
  type: CourseNodeType;
  title: string;
  parentId?: string;
}

export interface UpdateCourseNodeDto {
  title?: string;
  content?: any;
}
