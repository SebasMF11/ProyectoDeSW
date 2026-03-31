//Esto define la forma de los objetos Esto ayuda a garantizar que los datos se manejen de manera consistente en toda la aplicación.
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
}
