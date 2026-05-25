export interface ExamWeek {
  start: Date;
  end: Date;
}

export interface CalendarProps {
  onSelectDate?: (date: Date) => void;
}

export interface DayCellProps {
  day: Date;
  selected: Date;
  currentMonth: Date;
  onSelect: (day: Date) => void;
  assessments?: Record<string, Array<{ color: string; hasGrade: boolean }>>;
  isLoading?: boolean;
}
