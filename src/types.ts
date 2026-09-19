export type Difficulty = "Easy" | "Medium" | "Hard" | "None";
export type Status =
  | "Not Started"
  | "Learning"
  | "Solved"
  | "Revising"
  | "Mastered";
export type ItemType = "Question" | "Concept" | "Todo" | "Article" | "Practice";
export interface Subject {
  id: string;
  name: string;
  icon?: string;
  createdAt: string;
}
export interface Topic {
  id: string;
  subjectId: string;
  parentTopicId: string | null;
  name: string;
  createdAt: string;
}
export interface StudyItem {
  id: string;
  subjectId: string;
  topicId: string | null;
  title: string;
  type: ItemType;
  difficulty: Difficulty;
  status: Status;
  platform: string;
  url: string;
  tags: string[];
  shortNote: string;
  articleNote?: string;
  solveCount: number;
  lastSolvedAt: string | null;
  nextRevisionAt: string | null;
  bookmarked: boolean;
  createdAt: string;
}
export interface SolveHistory {
  id: string;
  studyItemId: string;
  solvedAt: string;
}
export interface Settings {
  darkMode: boolean;
  sidebarCollapsed: boolean;
}
export type DailyTargetType =
  | "Solve"
  | "Revise"
  | "Learn"
  | "Read"
  | "Practice"
  | "Custom";
export type DailyPriority = "High" | "Medium" | "Low";
export type DailyTargetStatus = "To Do" | "In Progress" | "Completed";
export interface DailyTarget {
  id: string;
  date: string;
  studyItemId: string | null;
  subjectId: string | null;
  topicId: string | null;
  title: string;
  type: DailyTargetType;
  priority: DailyPriority;
  status: DailyTargetStatus;
  completedAt: string | null;
  completionKind?: "solve" | "revision" | "plain";
  createdAt: string;
}
export interface DailyRecord {
  date: string;
  targetCount: number;
  completedCount: number;
  questionsSolved: number;
  revisionCount: number;
  shortNote: string;
}
export interface DailyGoal {
  dailyItemGoal: number;
  enabled: boolean;
}
export interface AppData {
  subjects: Subject[];
  topics: Topic[];
  items: StudyItem[];
  history: SolveHistory[];
  settings: Settings;
  dailyTargets: DailyTarget[];
  dailyRecords: DailyRecord[];
  dailyGoal: DailyGoal;
}
