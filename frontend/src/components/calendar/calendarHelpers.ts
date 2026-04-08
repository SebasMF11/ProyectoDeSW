import { isSameDay, isWithinInterval } from "date-fns";
import type { ExamWeek } from "./calendarTypes";
//Este componente contiene funciones para ayudar a manejar la logica del calendario//

//Definicion de semana de examenes (ejemplo)
export const EXAM_WEEKS: ExamWeek[] = [
  { start: new Date(2025, 1, 17), end: new Date(2025, 1, 23) },
];

//Definicion de eventos (ejemplo)
export const ASSESSMENTS: Record<string, string[]> = {
  "2025-02-03": ["#e53935"],
  "2025-02-12": ["#1976d2"],
  "2025-02-14": ["#7b1fa2"],
  "2025-02-20": ["#2e7d32"],
  "2025-02-26": ["#f9a825"],
};

//Clases para resaltar las semanas de examenes
export const highlightClasses: Record<string, string> = {
  start: "before:left-2 before:right-0 before:rounded-l-full before:border-r-0",
  mid: "before:left-0 before:right-0 before:rounded-none before:border-x-0",
  end: "before:left-0 before:right-2 before:rounded-r-full before:border-l-0",
  full: "before:left-2 before:right-2 before:rounded-full",
};

//Funcion para obtener si la fecha esta dentro de una semana de examenes
export function getExamWeek(date: Date): ExamWeek | null {
  return (
    EXAM_WEEKS.find((w) =>
      isWithinInterval(date, { start: w.start, end: w.end }),
    ) ?? null
  );
}

//Funcion para obtener la posicion de la fecha dentro de la semana de examenes para ponerle el estilo correcto
export function getExamPosition(
  date: Date,
  week: ExamWeek | null,
): "start" | "mid" | "end" | "full" | null {
  if (!week) return null;
  const isStart = isSameDay(date, week.start);
  const isEnd = isSameDay(date, week.end);
  if (isStart && isEnd) return "full";
  if (isStart) return "start";
  if (isEnd) return "end";
  return "mid";
}

//Funcion para obtener la clase de resaltado segun la posicion en la semana de examenes
export function getHighlightClass(pos: string | null): string {
  if (!pos) return "";
  return `before:absolute before:inset-y-[2px] before:content-[''] before:bg-green-50 before:border before:border-green-600 before:z-0 ${highlightClasses[pos]}`;
}
