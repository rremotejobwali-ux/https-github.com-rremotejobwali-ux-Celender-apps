export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  start: string; // ISO String
  end: string; // ISO String
  color: string; // Tailwind color class (e.g., 'bg-blue-500')
  location?: string;
}

export interface DayInfo {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  events: CalendarEvent[];
}

export enum CalendarView {
  MONTH = 'MONTH',
  WEEK = 'WEEK', // Placeholder for future expansion
  DAY = 'DAY'    // Placeholder for future expansion
}

export type AIParseResult = {
  title: string;
  start: string;
  end: string;
  description?: string;
  location?: string;
} | null;