export type Todo = {
  id: string;
  text: string;
  done: boolean;
};

export type Todos = Todo[];

export type StreakData = {
  lastActiveDate: string; // "2026-09-25"
  streak: number;
};