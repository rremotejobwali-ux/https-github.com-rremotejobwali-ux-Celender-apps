import { CalendarEvent, DayInfo } from '../types';

export const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

export const WEEK_DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export const getDaysInMonth = (year: number, month: number): number => {
  return new Date(year, month + 1, 0).getDate();
};

export const getFirstDayOfMonth = (year: number, month: number): number => {
  return new Date(year, month, 1).getDay();
};

export const isSameDate = (date1: Date, date2: Date): boolean => {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
};

export const formatTime = (isoString: string): string => {
  const date = new Date(isoString);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

export const formatDateFull = (date: Date): string => {
  return date.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' });
};

export const generateCalendarGrid = (year: number, month: number, events: CalendarEvent[]): DayInfo[] => {
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);
  const today = new Date();
  
  const days: DayInfo[] = [];

  // Previous month filler
  const prevMonthYear = month === 0 ? year - 1 : year;
  const prevMonth = month === 0 ? 11 : month - 1;
  const prevMonthDays = getDaysInMonth(prevMonthYear, prevMonth);

  for (let i = 0; i < firstDay; i++) {
    const dayVal = prevMonthDays - firstDay + 1 + i;
    const date = new Date(prevMonthYear, prevMonth, dayVal);
    days.push({
      date,
      isCurrentMonth: false,
      isToday: isSameDate(date, today),
      events: events.filter(e => isSameDate(new Date(e.start), date))
    });
  }

  // Current month
  for (let i = 1; i <= daysInMonth; i++) {
    const date = new Date(year, month, i);
    days.push({
      date,
      isCurrentMonth: true,
      isToday: isSameDate(date, today),
      events: events.filter(e => isSameDate(new Date(e.start), date))
    });
  }

  // Next month filler
  const remainingSlots = 42 - days.length; // 6 rows * 7 cols
  const nextMonthYear = month === 11 ? year + 1 : year;
  const nextMonth = month === 11 ? 0 : month + 1;

  for (let i = 1; i <= remainingSlots; i++) {
    const date = new Date(nextMonthYear, nextMonth, i);
    days.push({
      date,
      isCurrentMonth: false,
      isToday: isSameDate(date, today),
      events: events.filter(e => isSameDate(new Date(e.start), date))
    });
  }

  return days;
};

export const formatIsoDateTime = (date: Date): string => {
  // Returns YYYY-MM-DDTHH:mm format for input[type="datetime-local"]
  const offset = date.getTimezoneOffset() * 60000;
  const localIso = new Date(date.getTime() - offset).toISOString().slice(0, 16);
  return localIso;
};