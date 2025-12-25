
export type GradeType = 'participation' | 'homework' | 'exam' | 'behavior';

export interface GradeEntry {
  id: string;
  type: GradeType;
  score: number;
  date: string;
  comment?: string;
}

export interface Student {
  id: string;
  name: string;
  avatar: string;
  grades: GradeEntry[];
  performanceTrend: 'up' | 'down' | 'stable';
}

export interface ClassRoom {
  id: string;
  name: string;
  subject: string;
  students: Student[];
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success';
  date: string;
  read: boolean;
}
