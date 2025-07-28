export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
  createdAt: Date;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  startDate: Date;
  endDate: Date;
  assignedUserId: string;
  completed: boolean;
  subtasks: Subtask[];
  createdAt: Date;
  updatedAt: Date;
  color?: string;
}

export interface RoadmapData {
  tasks: Task[];
  users: User[];
}

export type ViewMode = 'list' | 'calendar-week' | 'calendar-month' | 'calendar-quarter';

export interface DateRange {
  start: Date;
  end: Date;
}